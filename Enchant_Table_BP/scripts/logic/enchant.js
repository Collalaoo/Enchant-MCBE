import { EnchantmentTypes } from '@minecraft/server';
import { config } from '../config.js';
import { ENCHANTMENTS, getIncompatibleEnchantments, ENCHANT_TRANSLATIONS as T } from '../enchantment_db.js';
import { showEnchantForm, showWarningIncompatible, showConfirmation } from '../ui.js';

export async function openEnchantMenu(player, slot, stack) {
  const enchComp = stack.getComponent('enchantable');
  if (!enchComp) {
    player.sendMessage('§cЦей предмет не можна зачарувати!');
    return;
  }

  const currentEnchants = {};
  const existing = enchComp.getEnchantments();
  for (const e of existing) {
    currentEnchants[e.type.id] = e.level;
  }

  const allEnchantmentTypes = EnchantmentTypes.getAll();
  const typeMap = {};
  for (const t of allEnchantmentTypes) {
    typeMap[t.id] = t;
  }

  const available = [];

  for (const enchType of allEnchantmentTypes) {
    const id = enchType.id;
    const info = ENCHANTMENTS[id];
    if (!info) continue;

    const canAdd = enchComp.canAddEnchantment({ type: enchType, level: 1 });
    const maxLvl = enchType.maxLevel;
    const currentLvl = currentEnchants[id] || 0;

    if (info.group) {
      available.push({
        id,
        maxLevel: maxLvl,
        canAdd: canAdd || currentLvl > 0,
        group: info.group,
        type: enchType,
      });
    } else {
      if (!canAdd && currentLvl === 0) continue;
      available.push({
        id,
        maxLevel: maxLvl,
        canAdd: canAdd || currentLvl > 0,
        group: null,
        type: enchType,
      });
    }
  }

  if (!available.length) {
    player.sendMessage('§cНемає доступних зачарувань для цього предмета!');
    return;
  }

  let selected = {};

  while (true) {
    const values = await showEnchantForm(player, currentEnchants, available, enchComp.slots);
    if (!values) return;

    const conflicts = [];
    for (const enchId of Object.keys(values)) {
      const incompatible = getIncompatibleEnchantments(enchId);
      for (const otherId of Object.keys(values)) {
        if (otherId !== enchId && incompatible.includes(otherId)) {
          conflicts.push({ ench1: enchId, ench2: otherId });
        }
      }
      for (const existingId of Object.keys(currentEnchants)) {
        if (incompatible.includes(existingId) && !values[existingId]) {
          conflicts.push({ ench1: enchId, ench2: existingId, existing: true });
        }
      }
    }

    if (conflicts.length > 0) {
      const fix = await showWarningIncompatible(player, conflicts);
      if (!fix) return;

      const conflictIds = new Set();
      for (const c of conflicts) {
        if (c.existing) {
          conflictIds.add(c.ench1);
        } else {
          conflictIds.add(c.ench2);
        }
      }
      for (const id of conflictIds) {
        delete values[id];
      }

      if (!Object.keys(values).length) {
        player.sendMessage('§cУсі вибрані зачарування конфліктують! Оберіть інші.');
        return;
      }
    }

    selected = values;
    break;
  }

  const totalXp = calculateXpCost(selected, currentEnchants);

  if (config.xp.state) {
    const confirmed = await showConfirmation(player, selected, totalXp);
    if (!confirmed) return;

    const xpComp = player.getComponent('player.xp');
    if (xpComp && xpComp.xpLevel < totalXp) {
      player.sendMessage(T.not_enough_xp);
      return;
    }
    if (xpComp) {
      xpComp.xpLevel -= totalXp;
    }
  }

  try {
    const enchCompNew = stack.getComponent('enchantable');

    for (const [id, level] of Object.entries(selected)) {
      if (currentEnchants[id] && currentEnchants[id] >= level) continue;
      try {
        const enchType = typeMap[id];
        if (enchType) enchCompNew.addEnchantment({ type: enchType, level });
      } catch (e) {
        player.sendMessage(`§cПомилка: ${e.message}`);
      }
    }

    setItemStack(player, slot, stack);
    player.sendMessage(T.enchant_success);
  } catch (e) {
    player.sendMessage(`§cПомилка зачарування: ${e.message}`);
  }
}

function calculateXpCost(selected, currentEnchants) {
  if (!config.xp.state) return 0;
  let total = 0;
  for (const [id, level] of Object.entries(selected)) {
    const current = currentEnchants[id] || 0;
    if (level > current) {
      total += (level - current) * config.xp.xp_remove;
    }
  }
  return total;
}

function setItemStack(player, slot, stack) {
  const inv = player.getComponent('inventory');
  if (!inv || !inv.container) return;
  inv.container.setItem(slot, stack);
}

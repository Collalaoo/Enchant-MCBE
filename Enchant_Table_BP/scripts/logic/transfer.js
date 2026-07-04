import { EnchantmentTypes, ItemStack } from '@minecraft/server';
import { config } from '../config.js';
import { ENCHANTMENTS, ENCHANT_TRANSLATIONS as T, INCOMPATIBLE_GROUPS } from '../enchantment_db.js';
import { showItemSelectionSimple, showConfirmation } from '../ui.js';

export async function openTransferMenu(player, sourceSlot, sourceStack, allItems) {
  const sourceEnch = sourceStack.getComponent('enchantable');
  if (!sourceEnch || !sourceEnch.getEnchantments().length) {
    player.sendMessage('§cНа предметі-джерелі немає чарів!');
    return;
  }

  const targets = allItems.filter((i) => i.slot !== sourceSlot);
  if (!targets.length) {
    player.sendMessage('§cНемає цільових предметів!');
    return;
  }

  const target = await showItemSelectionSimple(player, T.select_target, targets);
  if (!target) return;

  const targetStack = getItemStack(player, target.slot);
  if (!targetStack) {
    player.sendMessage('§cЦільовий предмет недоступний!');
    return;
  }

  const targetEnch = targetStack.getComponent('enchantable');
  if (!targetEnch) {
    player.sendMessage('§cЦільовий предмет не можна зачарувати!');
    return;
  }

  const sourceEnchants = sourceEnch.getEnchantments();
  const targetEnchants = targetEnch.getEnchantments();
  const targetExisting = {};
  for (const e of targetEnchants) {
    targetExisting[e.type.id] = e.level;
  }

  const transferable = [];
  for (const e of sourceEnchants) {
    const canAdd = targetEnch.canAddEnchantment({ type: e.type, level: e.level });
    const isCompatible = !isIncompatibleWithExisting(e.type.id, targetExisting, sourceEnchants);
    if (canAdd && isCompatible) {
      transferable.push(e);
    }
  }

  if (!transferable.length) {
    player.sendMessage('§cЖодне зачарування не можна перенести на цей предмет!');
    return;
  }

  const xpCost = transferable.length * config.xp.xp_remove;
  const confirmed = await showConfirmation(player,
    Object.fromEntries(transferable.map((e) => [e.type.id, e.level])),
    xpCost
  );

  if (!confirmed) return;

  const xpComp = player.getComponent('player.xp');
  if (config.xp.state && xpComp && xpComp.xpLevel < xpCost) {
    player.sendMessage(T.not_enough_xp);
    return;
  }

  try {
    if (config.xp.state && xpComp) {
      xpComp.xpLevel -= xpCost;
    }

    for (const e of transferable) {
      sourceEnch.removeEnchantment(e.type.id);
      targetEnch.addEnchantment({ type: e.type, level: e.level });
    }

    setItemStack(player, sourceSlot, sourceStack);
    setItemStack(player, target.slot, targetStack);

    player.sendMessage(`§aПеренесено ${transferable.length} зачарувань!`);
  } catch (err) {
    player.sendMessage(`§cПомилка перенесення: ${err.message}`);
  }
}

function isIncompatibleWithExisting(enchId, existingEnchants) {
  const info = ENCHANTMENTS[enchId];
  if (!info || !info.group) return false;

  const group = INCOMPATIBLE_GROUPS[info.group];
  if (!group) return false;

  return group.some((other) => other !== enchId && (existingEnchants[other] !== undefined));
}

function getItemStack(player, slot) {
  const inv = player.getComponent('inventory');
  if (!inv || !inv.container) return null;
  return inv.container.getItem(slot);
}

function setItemStack(player, slot, stack) {
  const inv = player.getComponent('inventory');
  if (!inv || !inv.container) return;
  inv.container.setItem(slot, stack);
}

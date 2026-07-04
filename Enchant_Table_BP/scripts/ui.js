import { ActionFormData, ModalFormData, MessageFormData } from '@minecraft/server-ui';
import { ENCHANTMENTS, getIncompatibleEnchantments, INCOMPATIBLE_GROUPS, ENCHANT_TRANSLATIONS as T } from './enchantment_db.js';

export function showItemSelection(player, items) {
  return new Promise((resolve) => {
    const form = new ActionFormData()
      .title(T.ui_title)
      .body(T.select_item);

    for (const item of items) {
      form.button(`§l${item.name}§r\n§7Слот: ${item.slot}`, null);
    }

    form.show(player).then((r) => {
      if (r.canceled) return resolve(null);
      resolve(items[r.selection]);
    });
  });
}

export function showActionMenu(player, itemName) {
  return new Promise((resolve) => {
    const form = new ActionFormData()
      .title(T.ui_title)
      .body(`§lПредмет: §r${itemName}\n\nОберіть дію:`)
      .button(`§l✦ ${T.enchant}§r\n§7Накласти чари на предмет`, null)
      .button(`§l✧ ${T.disenchant}§r\n§7Зняти чари з предмета`, null)
      .button(`§l⇄ ${T.transfer}§r\n§7Перенести чари на інший предмет`, null);

    form.show(player).then((r) => {
      if (r.canceled) return resolve(null);
      resolve(r.selection);
    });
  });
}

export function showEnchantForm(player, currentEnchants, availableEnchants, itemSlots) {
  return new Promise((resolve) => {
    const form = new ModalFormData().title(T.select_enchantments);

    const alreadyHas = (id) => currentEnchants[id] !== undefined;
    const isInGroup = (id, group) => {
      const info = ENCHANTMENTS[id];
      return info && info.group === group;
    };

    const groupedEnchants = {};
    const standaloneEnchants = [];

    for (const ench of availableEnchants) {
      const info = ENCHANTMENTS[ench.id];
      if (info && info.group) {
        if (!groupedEnchants[info.group]) groupedEnchants[info.group] = [];
        groupedEnchants[info.group].push(ench);
      } else {
        standaloneEnchants.push(ench);
      }
    }

    const groupOrder = ['armor_protection', 'boots_movement', 'weapon_damage', 'tool_harvest', 'crossbow_shot', 'trident_throw', 'repair'];
    const groupNames = {
      armor_protection: '§l§6Тип захисту§r',
      boots_movement: '§l§6Пересування§r',
      weapon_damage: '§l§6Тип зброї§r',
      tool_harvest: '§l§6Режим інструмента§r',
      crossbow_shot: '§l§6Тип стрільби§r',
      trident_throw: '§l§6Кидок тризуба§r',
      repair: '§l§6Спосіб лагодження§r',
    };

    const dropDownResults = {};
    const sliderResults = [];

    for (const groupId of groupOrder) {
      const group = groupedEnchants[groupId];
      if (!group || !group.length) continue;

      const existing = group.find((e) => alreadyHas(e.id));

      const items = [];
      items.push('§7--- Немає ---§r');
      const itemIds = [null];

      for (const ench of group) {
        const info = ENCHANTMENTS[ench.id];
        const hasIt = alreadyHas(ench.id);
        const canAdd = ench.canAdd;
        const label = hasIt
          ? `§a${info.name} ${currentEnchants[ench.id]}§r (вже є)`
          : canAdd
            ? `§f${info.name}§r`
            : `§7§m${info.name}§r ${T.incompatible_hint}`;
        items.push(label);
        itemIds.push(ench.id);
      }

      let defaultIdx = 0;
      if (existing) {
        const idx = itemIds.indexOf(existing.id);
        if (idx !== -1) defaultIdx = idx;
      }

      form.dropdown(groupNames[groupId] || groupId, items, defaultIdx);
      dropDownResults[groupId] = itemIds;
    }

    for (const ench of standaloneEnchants) {
      const info = ENCHANTMENTS[ench.id];
      if (!info) continue;

      const maxLvl = ench.canAdd ? ench.maxLevel : 0;
      const currentLvl = currentEnchants[ench.id] || 0;
      const label = ench.canAdd
        ? `${info.name} (0-${maxLvl})`
        : `§7§m${info.name}§r ${T.incompatible_hint}`;

      form.slider(label, 0, ench.canAdd ? maxLvl : 0, 1, currentLvl > 0 ? currentLvl : 0);
      sliderResults.push({ id: ench.id, canAdd: ench.canAdd });
    }

    form.submitButton(`§l${T.confirm}`);

    form.show(player).then((r) => {
      if (r.canceled) return resolve(null);

      const values = {};
      let idx = 0;

      for (const groupId of groupOrder) {
        const group = groupedEnchants[groupId];
        if (!group || !group.length) continue;

        const selectedIdx = r.formValues[idx];
        const itemIds = dropDownResults[groupId];
        const selectedId = itemIds[selectedIdx];
        if (selectedId) {
          values[selectedId] = currentEnchants[selectedId] || 1;
        }
        idx++;
      }

      for (const slider of sliderResults) {
        const val = r.formValues[idx];
        if (typeof val === 'number' && val > 0) {
          values[slider.id] = val;
        }
        idx++;
      }

      resolve(values);
    });
  });
}

export function showWarningIncompatible(player, conflicts) {
  return new Promise((resolve) => {
    const lines = conflicts.map(
      (c) => `§c❌ ${ENCHANTMENTS[c.ench1]?.name || c.ench1} ⇔ ${ENCHANTMENTS[c.ench2]?.name || c.ench2}§r`
    );

    const form = new MessageFormData()
      .title('§l§cНесумісні зачарування!')
      .body(
        `§7Наступні зачарування несумісні між собою:\n\n${lines.join('\n')}\n\n§eБажаєте автоматично виправити? (несумісні будуть вимкнені)`
      )
      .button1('§aВиправити')
      .button2('§cСкасувати');

    form.show(player).then((r) => {
      resolve(r.selection === 0);
    });
  });
}

export function showConfirmation(player, enchantValues, totalXpCost) {
  return new Promise((resolve) => {
    const lines = Object.entries(enchantValues)
      .map(([id, lvl]) => `§a+ ${ENCHANTMENTS[id]?.name || id} ${lvl}§r`)
      .join('\n');

    const form = new MessageFormData()
      .title(T.confirm_enchant)
      .body(
        `§lНові чари:§r\n${lines || '§7(немає)'}\n\n§l${T.xp_cost}:§r §e${totalXpCost} рів.§r`
      )
      .button1('§aПідтвердити')
      .button2('§cСкасувати');

    form.show(player).then((r) => {
      resolve(r.selection === 0);
    });
  });
}

export function showDisenchantOptions(player, enchantments) {
  return new Promise((resolve) => {
    const form = new ActionFormData()
      .title(T.disenchant)
      .body('Оберіть спосіб зняття чарів:')
      .button(`§l${T.remove_all}§r\n§7Зняти всі чари з предмета`, null);

    for (const ench of enchantments) {
      const info = ENCHANTMENTS[ench.type.id] || {};
      form.button(
        `§l${info.name || ench.type.id} ${ench.level}§r\n§7Зняти лише це зачарування`,
        null
      );
    }

    form.show(player).then((r) => {
      if (r.canceled) return resolve(null);
      resolve(r.selection);
    });
  });
}

export function showItemSelectionSimple(player, title, items) {
  return new Promise((resolve) => {
    if (!items.length) {
      player.sendMessage('§cНемає доступних предметів!');
      return resolve(null);
    }

    const form = new ActionFormData()
      .title(T.ui_title)
      .body(title);

    for (const item of items) {
      form.button(`§l${item.name}§r\n§7x${item.count || 1} | Слот: ${item.slot}`, null);
    }

    form.show(player).then((r) => {
      if (r.canceled) return resolve(null);
      resolve(items[r.selection]);
    });
  });
}

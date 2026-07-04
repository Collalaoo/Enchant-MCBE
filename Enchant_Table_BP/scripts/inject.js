import { world } from '@minecraft/server';
import { ENCHANT_TRANSLATIONS as T } from './enchantment_db.js';
import { showItemSelection, showActionMenu } from './ui.js';
import { openEnchantMenu } from './logic/enchant.js';
import { openDisenchantMenu } from './logic/disenchant.js';
import { openTransferMenu } from './logic/transfer.js';

const BLOCK_ID = 'da:enchant_table_plus';

function getEnchantableItems(player) {
  const items = [];
  const inv = player.getComponent('inventory');
  if (!inv || !inv.container) return items;

  for (let i = 0; i < inv.container.size; i++) {
    const stack = inv.container.getItem(i);
    if (!stack) continue;
    const enchComp = stack.getComponent('enchantable');
    if (!enchComp) continue;

    let name;
    try {
      const id = stack.typeId.split(':').pop().replace(/_/g, ' ');
      name = id.charAt(0).toUpperCase() + id.slice(1);
    } catch {
      name = '§7?';
    }

    items.push({ slot: i, stack, name });
  }
  return items;
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

function main(event) {
  try {
    if (event.block.typeId !== BLOCK_ID) return;
    const handEmpty = !event.hand || !event.hand.typeId || event.hand.typeId === 'minecraft:air';
    if (!handEmpty) return;

    const player = event.player;
    const items = getEnchantableItems(player);
    if (!items.length) {
      player.sendMessage(T.no_enchantable_items);
      return;
    }

    showItemSelection(player, items).then((selected) => {
      if (!selected) return;
      showActionMenu(player, selected.name).then((action) => {
        if (action === null) return;
        const stack = getItemStack(player, selected.slot);
        if (!stack) {
          player.sendMessage('§cПредмет більше недоступний!');
          return;
        }
        switch (action) {
          case 0: openEnchantMenu(player, selected.slot, stack); break;
          case 1: openDisenchantMenu(player, selected.slot, stack); break;
          case 2: openTransferMenu(player, selected.slot, stack, items); break;
        }
      });
    });
  } catch (e) {
    event.player?.sendMessage?.('§cПомилка: ' + e.message);
  }
}

world.afterEvents.playerInteractWithBlock.subscribe(main);

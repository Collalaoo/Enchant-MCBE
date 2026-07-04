import { world, system } from '@minecraft/server';
import { ENCHANT_TRANSLATIONS as T } from './enchantment_db.js';
import { showItemSelection, showActionMenu } from './ui.js';
import { openEnchantMenu } from './logic/enchant.js';
import { openDisenchantMenu } from './logic/disenchant.js';
import { openTransferMenu } from './logic/transfer.js';

const BLOCK_ID = 'da:enchant_table_plus';
const THROTTLE_MS = 500;
let lastInteraction = 0;

function getMainHandItem(player) {
  try {
    const inv = player.getComponent('minecraft:inventory');
    if (!inv || !inv.container) return null;
    return inv.container.getItem(player.selectedSlotIndex);
  } catch {
    return null;
  }
}

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.block.typeId !== BLOCK_ID) return;

  const hand = getMainHandItem(event.player);
  if (hand) return;

  event.cancel = true;
  const now = Date.now();
  if (now - lastInteraction < THROTTLE_MS) return;
  lastInteraction = now;

  const player = event.player;
  system.run(() => {
    try {
      const items = [];
      const inv = player.getComponent('minecraft:inventory');
      if (inv && inv.container) {
        for (let i = 0; i < inv.container.size; i++) {
          const stack = inv.container.getItem(i);
          if (!stack) continue;
          const comp = stack.getComponent('enchantable');
          if (!comp) continue;
          const id = stack.typeId.split(':').pop().replace(/_/g, ' ');
          items.push({
            slot: i,
            stack,
            name: id.charAt(0).toUpperCase() + id.slice(1),
          });
        }
      }

      if (!items.length) {
        player.sendMessage(T.no_enchantable_items);
        return;
      }

      showItemSelection(player, items).then((selected) => {
        if (!selected) return;
        showActionMenu(player, selected.name).then((action) => {
          if (action === null) return;
          const stack = inv.container.getItem(selected.slot);
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
      player.sendMessage('§cПомилка: ' + e.message);
    }
  });
});

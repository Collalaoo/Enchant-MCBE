import { world, system, ItemStack } from '@minecraft/server';
import { config } from './config.js';
import { ENCHANTMENTS, ENCHANT_TRANSLATIONS as T } from './enchantment_db.js';
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
    const nameTag = stack.nameTag || stack.typeId.split(':').pop().replace(/_/g, ' ');
    items.push({
      slot: i,
      stack,
      name: nameTag.charAt(0).toUpperCase() + nameTag.slice(1),
      getComponent: (id) => stack.getComponent(id),
    });
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

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.block.typeId !== BLOCK_ID) return;
  if (event.hand?.typeId && event.hand.typeId !== 'minecraft:air') return;

  const player = event.player;
  system.run(async () => {
    const items = getEnchantableItems(player);
    if (!items.length) {
      player.sendMessage(T.no_enchantable_items);
      return;
    }

    const selected = await showItemSelection(player, items);
    if (!selected) return;

    const action = await showActionMenu(player, selected.name);
    if (action === null) return;

    const stack = getItemStack(player, selected.slot);
    if (!stack) {
      player.sendMessage('§cПредмет більше недоступний!');
      return;
    }

    switch (action) {
      case 0:
        await openEnchantMenu(player, selected.slot, stack);
        break;
      case 1:
        await openDisenchantMenu(player, selected.slot, stack);
        break;
      case 2:
        await openTransferMenu(player, selected.slot, stack, items);
        break;
    }
  });
});

import { EnchantmentTypes, ItemStack } from '@minecraft/server';
import { config } from '../config.js';
import { ENCHANTMENTS, ENCHANT_TRANSLATIONS as T } from '../enchantment_db.js';
import { showDisenchantOptions } from '../ui.js';

export async function openDisenchantMenu(player, slot, stack) {
  const enchComp = stack.getComponent('enchantable');
  if (!enchComp) {
    player.sendMessage('§cЦей предмет не можна зачарувати!');
    return;
  }

  const enchantments = enchComp.getEnchantments();
  if (!enchantments.length) {
    player.sendMessage('§cНа цьому предметі немає чарів!');
    return;
  }

  const option = await showDisenchantOptions(player, enchantments);
  if (option === null) return;

  try {
    const xpComp = player.getComponent('player.xp');
    let refundXp = 0;

    if (option === 0) {
      enchComp.removeAllEnchantments();
      for (const e of enchantments) {
        refundXp += (e.level * config.xp.xp_remove) * config.xp.refund;
      }
      player.sendMessage('§aУсі чари знято!');
    } else {
      const idx = option - 1;
      if (idx < 0 || idx >= enchantments.length) return;
      const target = enchantments[idx];
      refundXp = (target.level * config.xp.xp_remove) * config.xp.refund;
      enchComp.removeEnchantment(target.type.id);
      player.sendMessage(`§aЧари ${ENCHANTMENTS[target.type.id]?.name || target.type.id} знято!`);
    }

    if (config.xp.state && xpComp && refundXp > 0) {
      xpComp.xpLevel += Math.floor(refundXp);
      player.sendMessage(`§7Повернено §e${Math.floor(refundXp)}§7 рів. досвіду`);
    }

    setItemStack(player, slot, stack);
  } catch (e) {
    player.sendMessage(`§cПомилка зняття чарів: ${e.message}`);
  }
}

function setItemStack(player, slot, stack) {
  const inv = player.getComponent('inventory');
  if (!inv || !inv.container) return;
  inv.container.setItem(slot, stack);
}

export const ENCHANTMENTS = {
  protection: {
    name: 'Захист',
    maxLevel: 4,
    group: 'armor_protection',
    slots: ['armor'],
  },
  fire_protection: {
    name: 'Захист від вогню',
    maxLevel: 4,
    group: 'armor_protection',
    slots: ['armor'],
  },
  blast_protection: {
    name: 'Захист від вибухів',
    maxLevel: 4,
    group: 'armor_protection',
    slots: ['armor'],
  },
  projectile_protection: {
    name: 'Захист від снарядів',
    maxLevel: 4,
    group: 'armor_protection',
    slots: ['armor'],
  },
  feather_falling: {
    name: 'Невагомість',
    maxLevel: 4,
    group: null,
    slots: ['feet'],
  },
  thorns: {
    name: 'Шипи',
    maxLevel: 3,
    group: null,
    slots: ['armor'],
  },
  respiration: {
    name: 'Дихання',
    maxLevel: 3,
    group: null,
    slots: ['head'],
  },
  depth_strider: {
    name: 'Глибинний біг',
    maxLevel: 3,
    group: 'boots_movement',
    slots: ['feet'],
  },
  frost_walker: {
    name: 'Крижаний ходак',
    maxLevel: 2,
    group: 'boots_movement',
    slots: ['feet'],
  },
  soul_speed: {
    name: 'Швидкість душ',
    maxLevel: 3,
    group: null,
    slots: ['feet'],
  },
  swift_sneak: {
    name: 'Швидке крадіння',
    maxLevel: 3,
    group: null,
    slots: ['feet'],
  },
  sharpness: {
    name: 'Г гострота',
    maxLevel: 5,
    group: 'weapon_damage',
    slots: ['sword'],
  },
  smite: {
    name: 'Небесна кара',
    maxLevel: 5,
    group: 'weapon_damage',
    slots: ['sword'],
  },
  bane_of_arthropods: {
    name: 'Пошесть членистоногих',
    maxLevel: 5,
    group: 'weapon_damage',
    slots: ['sword'],
  },
  density: {
    name: 'Щільність',
    maxLevel: 5,
    group: 'weapon_damage',
    slots: ['mace'],
  },
  breach: {
    name: 'Пролом',
    maxLevel: 4,
    group: 'weapon_damage',
    slots: ['mace'],
  },
  wind_burst: {
    name: 'Порив вітру',
    maxLevel: 3,
    group: null,
    slots: ['mace'],
  },
  looting: {
    name: 'Збагачення',
    maxLevel: 3,
    group: null,
    slots: ['sword'],
  },
  fire_aspect: {
    name: 'Сила вогню',
    maxLevel: 2,
    group: null,
    slots: ['sword'],
  },
  knockback: {
    name: 'Відкидання',
    maxLevel: 2,
    group: null,
    slots: ['sword'],
  },
  silk_touch: {
    name: 'Шовковий дотик',
    maxLevel: 1,
    group: 'tool_harvest',
    slots: ['tool'],
  },
  fortune: {
    name: 'Удача',
    maxLevel: 3,
    group: 'tool_harvest',
    slots: ['tool'],
  },
  efficiency: {
    name: 'Ефективність',
    maxLevel: 5,
    group: null,
    slots: ['tool'],
  },
  unbreaking: {
    name: 'Незламність',
    maxLevel: 3,
    group: null,
    slots: ['all'],
  },
  mending: {
    name: 'Лагодження',
    maxLevel: 1,
    group: 'repair',
    slots: ['all'],
  },
  infinity: {
    name: 'Нескінченність',
    maxLevel: 1,
    group: 'repair',
    slots: ['bow'],
  },
  power: {
    name: 'Сила',
    maxLevel: 5,
    group: null,
    slots: ['bow'],
  },
  flame: {
    name: 'Полум\'я',
    maxLevel: 1,
    group: null,
    slots: ['bow'],
  },
  punch: {
    name: 'Удар',
    maxLevel: 2,
    group: null,
    slots: ['bow'],
  },
  multishot: {
    name: 'Потрійний постріл',
    maxLevel: 1,
    group: 'crossbow_shot',
    slots: ['crossbow'],
  },
  piercing: {
    name: 'Пронизування',
    maxLevel: 4,
    group: 'crossbow_shot',
    slots: ['crossbow'],
  },
  quick_charge: {
    name: 'Швидке зарядження',
    maxLevel: 3,
    group: null,
    slots: ['crossbow'],
  },
  loyalty: {
    name: 'Вірність',
    maxLevel: 3,
    group: null,
    slots: ['trident'],
  },
  impaling: {
    name: 'Гарпун',
    maxLevel: 5,
    group: null,
    slots: ['trident'],
  },
  riptide: {
    name: 'Течія',
    maxLevel: 3,
    group: 'trident_throw',
    slots: ['trident'],
  },
  channeling: {
    name: 'Блискавка',
    maxLevel: 1,
    group: 'trident_throw',
    slots: ['trident'],
  },
  aqua_affinity: {
    name: 'Водна спорідненість',
    maxLevel: 1,
    group: null,
    slots: ['head'],
  },
  luck_of_the_sea: {
    name: 'Морська удача',
    maxLevel: 3,
    group: null,
    slots: ['fishing_rod'],
  },
  lure: {
    name: 'Приманка',
    maxLevel: 3,
    group: null,
    slots: ['fishing_rod'],
  },
  sweeping_edge: {
    name: 'Розсікаючий край',
    maxLevel: 3,
    group: null,
    slots: ['sword'],
  },
  lunge: {
    name: 'Випад',
    maxLevel: 3,
    group: null,
    slots: ['spear'],
  },
};

export const INCOMPATIBLE_GROUPS = {
  armor_protection: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection'],
  boots_movement: ['depth_strider', 'frost_walker'],
  weapon_damage: ['sharpness', 'smite', 'bane_of_arthropods', 'density', 'breach'],
  tool_harvest: ['silk_touch', 'fortune'],
  crossbow_shot: ['multishot', 'piercing'],
  trident_throw: ['riptide', 'channeling'],
  repair: ['mending', 'infinity'],
};

export function getIncompatibleEnchantments(enchantId) {
  const info = ENCHANTMENTS[enchantId];
  if (!info || !info.group) return [];
  const group = INCOMPATIBLE_GROUPS[info.group];
  if (!group) return [];
  return group.filter((e) => e !== enchantId);
}

export function isIncompatibleWithAny(currentEnchants, candidateId) {
  const incompatible = getIncompatibleEnchantments(candidateId);
  return incompatible.some((e) => currentEnchants.includes(e));
}

export function filterCompatible(currentEnchants, allIds) {
  return allIds.filter((id) => !isIncompatibleWithAny(currentEnchants, id));
}

export const ENCHANT_TRANSLATIONS = {
  ui_title: 'Стіл Зачарувань+',
  select_item: 'Оберіть предмет для зачарування',
  enchant: 'Зачарувати',
  disenchant: 'Зняти чари',
  transfer: 'Перенести',
  confirm: 'Підтвердити',
  cancel: 'Скасувати',
  back: 'Назад',
  cost: 'Вартість',
  xp_cost: 'Вартість досвіду',
  level: 'Рівень',
  incompatible_warning: '§c§lНЕСУМІСНО!§r',
  incompatible_hint: '§7(несумісно з вибраним)§r',
  no_enchantable_items: '§cУ вас немає предметів, які можна зачарувати!',
  select_enchantments: 'Оберіть зачарування',
  confirm_enchant: 'Підтвердження зачарування',
  enchant_success: '§aПредмет успішно зачаровано!',
  not_enough_xp: '§cНедостатньо досвіду!',
  not_enough_essence: '§cНедостатньо ресурсів!',
  remove_all: 'Зняти всі',
  remove_single: 'Зняти одне',
  select_source: 'Виберіть джерело',
  select_target: 'Виберіть ціль',
  transfer_summary: 'Перенесення зачарувань',
  transfer_success: '§aЗачарування перенесено!',
};

import { ITEM_META } from './buildings'
import type {
  GearBlueprintDef,
  GearBuildingDef,
  GearBuildingId,
  GearInstance,
  GearQuality,
  GearSlot,
  ItemId,
  MaterialId,
  RecruitedNpc,
} from '../types'
import { npcTotalStats, recruitBaseStats } from './recruits'

export const GEAR_BUILDINGS: Record<GearBuildingId, GearBuildingDef> = {
  smithy: {
    id: 'smithy',
    name: 'Smithy',
    emoji: '⚒️',
    blurb: 'Swords, axes, daggers, and metal helms.',
    queueSize: 2,
    slotFocus: 'weapon',
    workerName: 'Wallace',
    profession: 'Blacksmith',
    tier: 'standard',
  },
  tailor_workshop: {
    id: 'tailor_workshop',
    name: 'Tailor Workshop',
    emoji: '🧵',
    blurb: 'Light armor, clothes, gloves, and hats.',
    queueSize: 2,
    slotFocus: 'armor',
    workerName: 'Julia',
    profession: 'Tailor',
    tier: 'standard',
  },
  wood_workshop: {
    id: 'wood_workshop',
    name: 'Wood Workshop',
    emoji: '🪵',
    blurb: 'Bows, staves, spears, and wooden shields.',
    queueSize: 2,
    slotFocus: 'offhand',
    workerName: 'Allan',
    profession: 'Carpenter',
    tier: 'standard',
  },
  apothecary: {
    id: 'apothecary',
    name: 'Apothecary',
    emoji: '🌿',
    blurb: 'Herbal charms and potion trinkets.',
    queueSize: 2,
    slotFocus: 'accessory',
    workerName: 'Maribel',
    profession: 'Herbalist',
    tier: 'standard',
  },
  wizard_tower: {
    id: 'wizard_tower',
    name: 'Wizard Tower',
    emoji: '🗼',
    blurb: 'Wands and runestones for off-hand magic.',
    queueSize: 2,
    slotFocus: 'offhand',
    workerName: 'Grimar',
    profession: 'Wizard',
    tier: 'standard',
  },
  jewel_workshop: {
    id: 'jewel_workshop',
    name: 'Jewel Workshop',
    emoji: '💍',
    blurb: 'Rings, amulets, and fine jewelry.',
    queueSize: 2,
    slotFocus: 'accessory',
    workerName: 'Katarina',
    profession: 'Jeweler',
    tier: 'standard',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    emoji: '⛪',
    blurb: 'Holy armor and blessed helmets.',
    queueSize: 2,
    slotFocus: 'armor',
    workerName: 'Freyja',
    profession: 'Priestess',
    tier: 'standard',
  },
  master_lodge: {
    id: 'master_lodge',
    name: 'Master Lodge',
    emoji: '🏛️',
    blurb: 'High-tier masterwork gear across all slots.',
    queueSize: 2,
    slotFocus: 'weapon',
    workerName: 'Theodore',
    profession: 'Master',
    tier: 'standard',
  },
  engineer_bench: {
    id: 'engineer_bench',
    name: "Engineer's Bench",
    emoji: '🔧',
    blurb: 'Crossbows, pellet guns, and ranged weapons.',
    queueSize: 2,
    slotFocus: 'weapon',
    workerName: 'Roxanne',
    profession: 'Engineer',
    tier: 'premium',
  },
  scholars_study: {
    id: 'scholars_study',
    name: "Scholar's Study",
    emoji: '📚',
    blurb: 'Advanced runestones and enchanted wands.',
    queueSize: 2,
    slotFocus: 'offhand',
    workerName: 'Evelyn',
    profession: 'Scholar',
    tier: 'premium',
  },
  summoner_sanctum: {
    id: 'summoner_sanctum',
    name: 'Summoner Sanctum',
    emoji: '🌙',
    blurb: 'Enchanted cloaks and spirit familiars.',
    queueSize: 2,
    slotFocus: 'armor',
    workerName: 'Yolanda',
    profession: 'Summoner',
    tier: 'premium',
  },
  bards_stage: {
    id: 'bards_stage',
    name: "Bard's Stage",
    emoji: '🎵',
    blurb: 'Instruments that boost party skill.',
    queueSize: 2,
    slotFocus: 'accessory',
    workerName: 'Yohan',
    profession: 'Bard',
    tier: 'premium',
  },
  veterans_quarter: {
    id: 'veterans_quarter',
    name: "Veteran's Quarter",
    emoji: '🎖️',
    blurb: 'Dual-wield weapons and quivers.',
    queueSize: 2,
    slotFocus: 'weapon',
    workerName: 'Roland',
    profession: 'Veteran',
    tier: 'premium',
  },
  storm_shrine: {
    id: 'storm_shrine',
    name: 'Storm Shrine',
    emoji: '⚡',
    blurb: 'Storm catalysts and elemental idols.',
    queueSize: 2,
    slotFocus: 'accessory',
    workerName: 'Zephyr',
    profession: 'Storm Elemental',
    tier: 'premium',
  },
}

export const GEAR_BUILDING_LIST = Object.values(GEAR_BUILDINGS)

export const GEAR_BUILDINGS_STANDARD = GEAR_BUILDING_LIST.filter(
  (b) => b.tier === 'standard',
)

export const GEAR_BUILDINGS_PREMIUM = GEAR_BUILDING_LIST.filter(
  (b) => b.tier === 'premium',
)

export const QUALITY_LABEL: Record<GearQuality, string> = {
  rustic: 'Rustic',
  valley: 'Valley',
  masterwork: 'Masterwork',
}

export const QUALITY_MULT: Record<GearQuality, number> = {
  rustic: 1,
  valley: 1.5,
  masterwork: 2,
}

export const GEAR_BLUEPRINTS: GearBlueprintDef[] = [
  // Smithy — Wallace
  {
    id: 'bp_wood_pitchfork',
    buildingId: 'smithy',
    name: 'Wood Pitchfork',
    emoji: '🍴',
    slot: 'weapon',
    quality: 'rustic',
    stats: { attack: 4, defense: 0, hp: 0, skillBonus: 1 },
    inputs: { wheat: 4, rope: 1 },
    craftMs: 12_000,
    xp: 12,
    unlockLevel: 15,
  },
  {
    id: 'bp_copper_sickle',
    buildingId: 'smithy',
    name: 'Copper Sickle',
    emoji: '🌾',
    slot: 'weapon',
    quality: 'valley',
    stats: { attack: 10, defense: 0, hp: 0, skillBonus: 2 },
    inputs: { flour: 2, iron_ore: 2, rope: 1 },
    craftMs: 20_000,
    xp: 22,
    unlockLevel: 16,
  },
  {
    id: 'bp_valley_blade',
    buildingId: 'smithy',
    name: 'Valley Blade',
    emoji: '⚔️',
    slot: 'weapon',
    quality: 'masterwork',
    stats: { attack: 22, defense: 0, hp: 0, skillBonus: 4 },
    inputs: { iron_ore: 4, cloth: 2, magic_essence: 1 },
    craftMs: 35_000,
    xp: 40,
    unlockLevel: 18,
  },
  {
    id: 'bp_iron_cap',
    buildingId: 'smithy',
    name: 'Iron Cap',
    emoji: '🪖',
    slot: 'helmet',
    quality: 'valley',
    stats: { attack: 0, defense: 7, hp: 6, skillBonus: 1 },
    inputs: { iron_ore: 3, cow_hide: 1 },
    craftMs: 18_000,
    xp: 20,
    unlockLevel: 17,
  },
  // Tailor Workshop — Julia
  {
    id: 'bp_straw_hat',
    buildingId: 'tailor_workshop',
    name: 'Straw Sun Hat',
    emoji: '👒',
    slot: 'helmet',
    quality: 'rustic',
    stats: { attack: 0, defense: 3, hp: 5, skillBonus: 1 },
    inputs: { wheat: 3, sunflower: 1 },
    craftMs: 10_000,
    xp: 10,
    unlockLevel: 16,
  },
  {
    id: 'bp_wool_cloak',
    buildingId: 'tailor_workshop',
    name: 'Wool Cloak',
    emoji: '🧥',
    slot: 'armor',
    quality: 'valley',
    stats: { attack: 0, defense: 9, hp: 12, skillBonus: 2 },
    inputs: { wool: 3, cloth: 2, rabbit_pelt: 1 },
    craftMs: 22_000,
    xp: 24,
    unlockLevel: 17,
  },
  {
    id: 'bp_quilted_vest',
    buildingId: 'tailor_workshop',
    name: 'Quilted Vest',
    emoji: '🦺',
    slot: 'armor',
    quality: 'masterwork',
    stats: { attack: 0, defense: 18, hp: 28, skillBonus: 3 },
    inputs: { cloth: 3, wool: 4, sheep_leather: 2, magic_essence: 1 },
    craftMs: 38_000,
    xp: 42,
    unlockLevel: 19,
  },
  // Wood Workshop — Allan
  {
    id: 'bp_wooden_bucket',
    buildingId: 'wood_workshop',
    name: 'Wooden Bucket',
    emoji: '🪣',
    slot: 'offhand',
    quality: 'rustic',
    stats: { attack: 0, defense: 2, hp: 4, skillBonus: 1 },
    inputs: { timber: 2, rope: 1 },
    craftMs: 10_000,
    xp: 10,
    unlockLevel: 17,
  },
  {
    id: 'bp_iron_buckler',
    buildingId: 'wood_workshop',
    name: 'Iron Buckler',
    emoji: '🛡️',
    slot: 'offhand',
    quality: 'valley',
    stats: { attack: 0, defense: 8, hp: 10, skillBonus: 2 },
    inputs: { iron_ore: 3, boar_leather: 1 },
    craftMs: 22_000,
    xp: 22,
    unlockLevel: 18,
  },
  {
    id: 'bp_valley_bow',
    buildingId: 'wood_workshop',
    name: 'Valley Bow',
    emoji: '🏹',
    slot: 'weapon',
    quality: 'valley',
    stats: { attack: 12, defense: 0, hp: 0, skillBonus: 2 },
    inputs: { timber: 3, rope: 2, rabbit_pelt: 1 },
    craftMs: 24_000,
    xp: 26,
    unlockLevel: 19,
  },
  // Apothecary — Maribel
  {
    id: 'bp_lucky_button',
    buildingId: 'apothecary',
    name: 'Lucky Button',
    emoji: '🔘',
    slot: 'accessory',
    quality: 'rustic',
    stats: { attack: 0, defense: 0, hp: 0, skillBonus: 2 },
    inputs: { berry: 2, egg: 1 },
    craftMs: 8_000,
    xp: 10,
    unlockLevel: 18,
  },
  {
    id: 'bp_honey_charm',
    buildingId: 'apothecary',
    name: 'Honey Charm',
    emoji: '🍯',
    slot: 'accessory',
    quality: 'valley',
    stats: { attack: 2, defense: 2, hp: 8, skillBonus: 3 },
    inputs: { honey: 2, sugar: 1, sunstone: 1 },
    craftMs: 18_000,
    xp: 20,
    unlockLevel: 19,
  },
  {
    id: 'bp_mint_tonic',
    buildingId: 'apothecary',
    name: 'Mint Tonic Vial',
    emoji: '🧪',
    slot: 'accessory',
    quality: 'rustic',
    stats: { attack: 0, defense: 0, hp: 10, skillBonus: 2 },
    inputs: { mint: 3, honey: 1 },
    craftMs: 12_000,
    xp: 14,
    unlockLevel: 18,
  },
  // Jewel Workshop — Katarina
  {
    id: 'bp_iron_ring',
    buildingId: 'jewel_workshop',
    name: 'Iron Ring',
    emoji: '💍',
    slot: 'accessory',
    quality: 'rustic',
    stats: { attack: 1, defense: 1, hp: 0, skillBonus: 2 },
    inputs: { iron_ore: 2 },
    craftMs: 10_000,
    xp: 12,
    unlockLevel: 19,
  },
  {
    id: 'bp_sun_amulet',
    buildingId: 'jewel_workshop',
    name: 'Sun Amulet',
    emoji: '☀️',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 5, defense: 5, hp: 15, skillBonus: 5 },
    inputs: { sunflower: 2, magic_essence: 2, sunstone: 2 },
    craftMs: 32_000,
    xp: 38,
    unlockLevel: 21,
  },
  {
    id: 'bp_ruby_loop',
    buildingId: 'jewel_workshop',
    name: 'Ruby Loop',
    emoji: '🔴',
    slot: 'accessory',
    quality: 'valley',
    stats: { attack: 3, defense: 2, hp: 6, skillBonus: 3 },
    inputs: { berry: 4, sugar: 2, sunstone: 1 },
    craftMs: 20_000,
    xp: 22,
    unlockLevel: 20,
  },
  // Wizard Tower — Grimar
  {
    id: 'bp_spark_wand',
    buildingId: 'wizard_tower',
    name: 'Spark Wand',
    emoji: '🪄',
    slot: 'offhand',
    quality: 'rustic',
    stats: { attack: 2, defense: 0, hp: 0, skillBonus: 3 },
    inputs: { wheat: 2, magic_essence: 1 },
    craftMs: 14_000,
    xp: 16,
    unlockLevel: 20,
  },
  {
    id: 'bp_runestone',
    buildingId: 'wizard_tower',
    name: 'Chipped Runestone',
    emoji: '🪨',
    slot: 'offhand',
    quality: 'valley',
    stats: { attack: 0, defense: 4, hp: 0, skillBonus: 4 },
    inputs: { sunstone: 2, magic_essence: 2 },
    craftMs: 24_000,
    xp: 28,
    unlockLevel: 21,
  },
  {
    id: 'bp_arcane_staff',
    buildingId: 'wizard_tower',
    name: 'Arcane Staff',
    emoji: '📜',
    slot: 'weapon',
    quality: 'masterwork',
    stats: { attack: 14, defense: 0, hp: 0, skillBonus: 6 },
    inputs: { magic_essence: 3, cloth: 2, sunstone: 1 },
    craftMs: 36_000,
    xp: 40,
    unlockLevel: 23,
  },
  // Temple — Freyja
  {
    id: 'bp_wool_hood',
    buildingId: 'temple',
    name: 'Blessed Wool Hood',
    emoji: '🧣',
    slot: 'helmet',
    quality: 'valley',
    stats: { attack: 0, defense: 6, hp: 8, skillBonus: 2 },
    inputs: { wool: 2, cloth: 1 },
    craftMs: 16_000,
    xp: 18,
    unlockLevel: 21,
  },
  {
    id: 'bp_holy_vestments',
    buildingId: 'temple',
    name: 'Holy Vestments',
    emoji: '✨',
    slot: 'armor',
    quality: 'valley',
    stats: { attack: 0, defense: 12, hp: 16, skillBonus: 3 },
    inputs: { cloth: 3, wool: 2, magic_essence: 1 },
    craftMs: 26_000,
    xp: 30,
    unlockLevel: 22,
  },
  {
    id: 'bp_master_hood',
    buildingId: 'temple',
    name: 'Masterwork Hood',
    emoji: '🪖',
    slot: 'helmet',
    quality: 'masterwork',
    stats: { attack: 0, defense: 12, hp: 18, skillBonus: 3 },
    inputs: { wool: 3, cloth: 2, magic_essence: 1 },
    craftMs: 34_000,
    xp: 36,
    unlockLevel: 23,
  },
  // Master Lodge — Theodore
  {
    id: 'bp_valley_aegis',
    buildingId: 'master_lodge',
    name: 'Valley Aegis',
    emoji: '🛡️',
    slot: 'offhand',
    quality: 'masterwork',
    stats: { attack: 0, defense: 16, hp: 24, skillBonus: 4 },
    inputs: { iron_ore: 4, cloth: 2, sunstone: 1 },
    craftMs: 36_000,
    xp: 38,
    unlockLevel: 22,
  },
  {
    id: 'bp_master_blade',
    buildingId: 'master_lodge',
    name: 'Masterwork Blade',
    emoji: '🗡️',
    slot: 'weapon',
    quality: 'masterwork',
    stats: { attack: 26, defense: 0, hp: 0, skillBonus: 5 },
    inputs: { iron_ore: 5, magic_essence: 2, sunstone: 2 },
    craftMs: 40_000,
    xp: 45,
    unlockLevel: 24,
  },
  {
    id: 'bp_master_signet',
    buildingId: 'master_lodge',
    name: 'Master Signet',
    emoji: '👑',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 4, defense: 4, hp: 12, skillBonus: 6 },
    inputs: { iron_ore: 2, magic_essence: 2, sunstone: 2 },
    craftMs: 38_000,
    xp: 42,
    unlockLevel: 24,
  },
  // Engineer's Bench — Roxanne
  {
    id: 'bp_light_crossbow',
    buildingId: 'engineer_bench',
    name: 'Light Crossbow',
    emoji: '🎯',
    slot: 'weapon',
    quality: 'valley',
    stats: { attack: 16, defense: 0, hp: 0, skillBonus: 3 },
    inputs: { iron_ore: 3, rope: 3, pig_leather: 2 },
    craftMs: 28_000,
    xp: 32,
    unlockLevel: 25,
  },
  {
    id: 'bp_pellet_gun',
    buildingId: 'engineer_bench',
    name: 'Pellet Gun',
    emoji: '🔫',
    slot: 'weapon',
    quality: 'masterwork',
    stats: { attack: 24, defense: 0, hp: 0, skillBonus: 4 },
    inputs: { iron_ore: 5, magic_essence: 1, sunstone: 2 },
    craftMs: 38_000,
    xp: 44,
    unlockLevel: 27,
  },
  // Scholar's Study — Evelyn
  {
    id: 'bp_scholar_wand',
    buildingId: 'scholars_study',
    name: "Scholar's Wand",
    emoji: '📖',
    slot: 'offhand',
    quality: 'valley',
    stats: { attack: 0, defense: 2, hp: 0, skillBonus: 5 },
    inputs: { magic_essence: 3, cloth: 2 },
    craftMs: 26_000,
    xp: 30,
    unlockLevel: 28,
  },
  {
    id: 'bp_ancient_runestone',
    buildingId: 'scholars_study',
    name: 'Ancient Runestone',
    emoji: '🔮',
    slot: 'offhand',
    quality: 'masterwork',
    stats: { attack: 0, defense: 6, hp: 0, skillBonus: 7 },
    inputs: { magic_essence: 4, sunstone: 3 },
    craftMs: 40_000,
    xp: 46,
    unlockLevel: 30,
  },
  // Summoner Sanctum — Yolanda
  {
    id: 'bp_spirit_cloak',
    buildingId: 'summoner_sanctum',
    name: 'Spirit Cloak',
    emoji: '👻',
    slot: 'armor',
    quality: 'valley',
    stats: { attack: 0, defense: 14, hp: 20, skillBonus: 4 },
    inputs: { cloth: 4, magic_essence: 2, wool: 2 },
    craftMs: 30_000,
    xp: 34,
    unlockLevel: 30,
  },
  {
    id: 'bp_familiar_charm',
    buildingId: 'summoner_sanctum',
    name: 'Familiar Charm',
    emoji: '🐾',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 3, defense: 3, hp: 10, skillBonus: 6 },
    inputs: { egg: 2, honey: 2, magic_essence: 2 },
    craftMs: 34_000,
    xp: 40,
    unlockLevel: 32,
  },
  // Bard's Stage — Yohan
  {
    id: 'bp_valley_lute',
    buildingId: 'bards_stage',
    name: 'Valley Lute',
    emoji: '🎸',
    slot: 'accessory',
    quality: 'valley',
    stats: { attack: 0, defense: 0, hp: 0, skillBonus: 5 },
    inputs: { wheat: 3, rope: 2, cloth: 1 },
    craftMs: 22_000,
    xp: 26,
    unlockLevel: 32,
  },
  {
    id: 'bp_aurasong_harp',
    buildingId: 'bards_stage',
    name: 'Aurasong Harp',
    emoji: '🎻',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 2, defense: 2, hp: 8, skillBonus: 7 },
    inputs: { magic_essence: 2, sunstone: 2, cloth: 3 },
    craftMs: 36_000,
    xp: 42,
    unlockLevel: 34,
  },
  // Veteran's Quarter — Roland
  {
    id: 'bp_twin_blades',
    buildingId: 'veterans_quarter',
    name: 'Twin Valley Blades',
    emoji: '⚔️',
    slot: 'weapon',
    quality: 'masterwork',
    stats: { attack: 28, defense: 0, hp: 0, skillBonus: 4 },
    inputs: { iron_ore: 6, boar_leather: 2, magic_essence: 1 },
    craftMs: 42_000,
    xp: 48,
    unlockLevel: 35,
  },
  {
    id: 'bp_quiver',
    buildingId: 'veterans_quarter',
    name: 'Hunter Quiver',
    emoji: '🏹',
    slot: 'offhand',
    quality: 'valley',
    stats: { attack: 4, defense: 0, hp: 0, skillBonus: 4 },
    inputs: { pig_leather: 3, rope: 2, wool: 1 },
    craftMs: 24_000,
    xp: 28,
    unlockLevel: 35,
  },
  // Storm Shrine — Zephyr
  {
    id: 'bp_storm_catalyst',
    buildingId: 'storm_shrine',
    name: 'Storm Catalyst',
    emoji: '🌩️',
    slot: 'accessory',
    quality: 'valley',
    stats: { attack: 6, defense: 0, hp: 0, skillBonus: 5 },
    inputs: { magic_essence: 3, sunstone: 2 },
    craftMs: 28_000,
    xp: 32,
    unlockLevel: 38,
  },
  {
    id: 'bp_storm_idol',
    buildingId: 'storm_shrine',
    name: 'Storm Idol',
    emoji: '⚡',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 8, defense: 4, hp: 12, skillBonus: 8 },
    inputs: { magic_essence: 4, sunstone: 4, iron_ore: 2 },
    craftMs: 44_000,
    xp: 50,
    unlockLevel: 40,
  },
]

export const GEAR_BLUEPRINT_BY_ID = Object.fromEntries(
  GEAR_BLUEPRINTS.map((b) => [b.id, b]),
)

export const MATERIAL_META: Record<
  MaterialId,
  { name: string; emoji: string }
> = {
  iron_ore: { name: 'Iron Ore', emoji: '⛏️' },
  timber: { name: 'Timber', emoji: '🪵' },
  leather_scrap: { name: 'Leather Scrap', emoji: '🟤' },
  rabbit_pelt: { name: 'Rabbit Pelt', emoji: '🐰' },
  cow_hide: { name: 'Cow Hide', emoji: '🐂' },
  pig_leather: { name: 'Pig Leather', emoji: '🐷' },
  sheep_leather: { name: 'Sheep Leather', emoji: '🐑' },
  boar_leather: { name: 'Boar Leather', emoji: '🐗' },
  magic_essence: { name: 'Magic Essence', emoji: '✨' },
  sunstone: { name: 'Sunstone', emoji: '💛' },
}

export const GEAR_SLOT_LABEL: Record<GearSlot, string> = {
  helmet: 'Helmet',
  armor: 'Armor',
  weapon: 'Weapon',
  offhand: 'Off-hand',
  accessory: 'Accessory',
}

export function blueprintsForBuilding(
  buildingId: GearBuildingId,
  playerLevel: number,
): GearBlueprintDef[] {
  return GEAR_BLUEPRINTS.filter(
    (b) => b.buildingId === buildingId && b.unlockLevel <= playerLevel,
  )
}

export function scaledStats(blueprint: GearBlueprintDef) {
  const m = QUALITY_MULT[blueprint.quality]
  return {
    attack: Math.round(blueprint.stats.attack * m),
    defense: Math.round(blueprint.stats.defense * m),
    hp: Math.round(blueprint.stats.hp * m),
    skillBonus: Math.round(blueprint.stats.skillBonus * m),
  }
}

export function gearInstanceStats(instance: GearInstance) {
  const bp = GEAR_BLUEPRINT_BY_ID[instance.blueprintId]
  if (!bp) return { attack: 0, defense: 0, hp: 0, skillBonus: 0 }
  const base = scaledStats(bp)
  const lvl = Math.max(1, instance.level ?? 1)
  const mult = 1 + (lvl - 1) * 0.12
  return {
    attack: Math.round(base.attack * mult),
    defense: Math.round(base.defense * mult),
    hp: Math.round(base.hp * mult),
    skillBonus: Math.round(base.skillBonus * mult),
  }
}

export function gearForNpc(
  npcInstanceId: string,
  gearInventory: GearInstance[],
): GearInstance[] {
  return gearInventory.filter((g) => g.equippedBy === npcInstanceId)
}

export function npcEffectiveSkill(
  npc: RecruitedNpc,
  _baseSkill: number,
  gearInventory: GearInstance[],
): number {
  return npcTotalStats(npc, gearInventory).skill
}

export function npcCombatStats(
  npc: RecruitedNpc,
  gearInventory: GearInstance[],
) {
  const total = npcTotalStats(npc, gearInventory)
  const base = recruitBaseStats(npc)
  return {
    attack: total.attack,
    defense: total.defense,
    hp: total.hp,
    skillBonus: total.skill - base.skill,
  }
}

export function partyEffectiveSkill(
  npcInstanceIds: string[],
  recruited: RecruitedNpc[],
  gearInventory: GearInstance[],
  _getBaseSkill: (npcId: string) => number,
): number {
  return npcInstanceIds.reduce((sum, id) => {
    const npc = recruited.find((n) => n.id === id)
    if (!npc) return sum
    return sum + npcTotalStats(npc, gearInventory).skill
  }, 0)
}

export function craftInputLabel(id: string): { emoji: string; name: string } {
  return resourceMeta(id)
}

export function resourceMeta(id: string): { emoji: string; name: string } {
  if (id in MATERIAL_META) {
    return MATERIAL_META[id as MaterialId]
  }
  if (id in ITEM_META) {
    return ITEM_META[id as ItemId]
  }
  return { emoji: '📦', name: id }
}

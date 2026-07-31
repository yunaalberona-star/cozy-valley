import { ITEM_META } from './buildings'
import { GEAR_BLUEPRINTS, GEAR_BLUEPRINT_BY_ID } from './gearBlueprints'
import {
  allBlueprintsForBuilding,
  isGearRecipeUnlocked,
  starStatMultiplier,
} from './gearRecipeProgress'
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

export const GEAR_QUALITY_ORDER: GearQuality[] = [
  'rustic',
  'valley',
  'masterwork',
]

export type GearQualitySource = 'craft' | 'drop'

export function rollGearQuality(
  base: GearQuality,
  source: GearQualitySource,
  playerLevel = 1,
  craftStar = 0,
): GearQuality {
  const tier = GEAR_QUALITY_ORDER.indexOf(base)
  const levelBonus = Math.min(0.1, Math.max(0, playerLevel * 0.002))
  const starBonus = craftStar * 0.025
  const r = Math.random()

  if (source === 'craft') {
    if (tier === 0) {
      if (r < 0.08 + levelBonus + starBonus) return 'masterwork'
      if (r < 0.38 + levelBonus + starBonus) return 'valley'
      return 'rustic'
    }
    if (tier === 1) {
      if (r < 0.45 + levelBonus + starBonus) return 'masterwork'
      if (r < 0.52) return 'rustic'
      return 'valley'
    }
    if (r < 0.2 + levelBonus * 0.5 + starBonus) return 'valley'
    return 'masterwork'
  }

  if (tier === 0) {
    if (r < 0.05 + levelBonus * 0.5) return 'masterwork'
    if (r < 0.28 + levelBonus * 0.5) return 'valley'
    return 'rustic'
  }
  if (tier === 1) {
    if (r < 0.32 + levelBonus * 0.5) return 'masterwork'
    if (r < 0.4) return 'rustic'
    return 'valley'
  }
  if (r < 0.18 + levelBonus * 0.3) return 'valley'
  return 'masterwork'
}

export function gearInstanceQuality(instance: GearInstance): GearQuality {
  if (instance.quality) return instance.quality
  const bp = GEAR_BLUEPRINT_BY_ID[instance.blueprintId]
  return bp?.quality ?? 'rustic'
}

export function isQualityUpgrade(
  base: GearQuality,
  rolled: GearQuality,
): boolean {
  return (
    GEAR_QUALITY_ORDER.indexOf(rolled) > GEAR_QUALITY_ORDER.indexOf(base)
  )
}

export function createGearInstance(
  blueprintId: string,
  level: number,
  source: GearQualitySource,
  playerLevel: number,
  createId: () => string,
  craftStar = 0,
): GearInstance {
  const bp = GEAR_BLUEPRINT_BY_ID[blueprintId]
  const quality = bp
    ? rollGearQuality(bp.quality, source, playerLevel, craftStar)
    : 'rustic'
  return {
    id: createId(),
    blueprintId,
    equippedBy: null,
    level,
    quality,
  }
}

export { GEAR_BLUEPRINTS, GEAR_BLUEPRINT_BY_ID }

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
  craftCounts: Record<string, number>,
): GearBlueprintDef[] {
  return allBlueprintsForBuilding(buildingId).filter((b) =>
    isGearRecipeUnlocked(b, craftCounts),
  )
}

export function scaledStats(
  blueprint: GearBlueprintDef,
  quality?: GearQuality,
  star = 0,
) {
  const q = quality ?? blueprint.quality
  const m = QUALITY_MULT[q] * starStatMultiplier(star)
  return {
    attack: Math.round(blueprint.stats.attack * m),
    defense: Math.round(blueprint.stats.defense * m),
    hp: Math.round(blueprint.stats.hp * m),
    skillBonus: Math.round(blueprint.stats.skillBonus * m),
  }
}

export {
  allBlueprintsForBuilding,
  formatRecipeStars,
  isGearRecipeUnlocked,
  recipeStar,
  recipeUnlockProgress,
  starCraftMsMultiplier,
} from './gearRecipeProgress'

export function gearInstanceStats(instance: GearInstance) {
  const bp = GEAR_BLUEPRINT_BY_ID[instance.blueprintId]
  if (!bp) return { attack: 0, defense: 0, hp: 0, skillBonus: 0 }
  const base = scaledStats(bp, gearInstanceQuality(instance))
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

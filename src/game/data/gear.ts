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

export const GEAR_BUILDINGS: Record<GearBuildingId, GearBuildingDef> = {
  valley_forge: {
    id: 'valley_forge',
    name: 'Valley Forge',
    emoji: '⚒️',
    blurb: 'Hammer weapons for your adventurers.',
    queueSize: 2,
    slotFocus: 'weapon',
  },
  weavers_hut: {
    id: 'weavers_hut',
    name: "Weaver's Hut",
    emoji: '🧥',
    blurb: 'Stitch armor from valley cloth and wool.',
    queueSize: 2,
    slotFocus: 'armor',
  },
  tinker_shed: {
    id: 'tinker_shed',
    name: 'Tinker Shed',
    emoji: '💎',
    blurb: 'Craft trinkets, charms, and lucky odds.',
    queueSize: 2,
    slotFocus: 'accessory',
  },
}

export const GEAR_BUILDING_LIST = Object.values(GEAR_BUILDINGS)

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
  // Forge — weapons
  {
    id: 'bp_wood_pitchfork',
    buildingId: 'valley_forge',
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
    buildingId: 'valley_forge',
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
    buildingId: 'valley_forge',
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
  // Weaver — armor
  {
    id: 'bp_straw_hat',
    buildingId: 'weavers_hut',
    name: 'Straw Sun Hat',
    emoji: '👒',
    slot: 'armor',
    quality: 'rustic',
    stats: { attack: 0, defense: 3, hp: 5, skillBonus: 1 },
    inputs: { wheat: 3, sunflower: 1 },
    craftMs: 10_000,
    xp: 10,
    unlockLevel: 15,
  },
  {
    id: 'bp_wool_cloak',
    buildingId: 'weavers_hut',
    name: 'Wool Cloak',
    emoji: '🧥',
    slot: 'armor',
    quality: 'valley',
    stats: { attack: 0, defense: 9, hp: 12, skillBonus: 2 },
    inputs: { wool: 3, cloth: 2, leather_scrap: 1 },
    craftMs: 22_000,
    xp: 24,
    unlockLevel: 16,
  },
  {
    id: 'bp_quilted_vest',
    buildingId: 'weavers_hut',
    name: 'Quilted Vest',
    emoji: '🦺',
    slot: 'armor',
    quality: 'masterwork',
    stats: { attack: 0, defense: 18, hp: 28, skillBonus: 3 },
    inputs: { cloth: 3, wool: 4, leather_scrap: 2, magic_essence: 1 },
    craftMs: 38_000,
    xp: 42,
    unlockLevel: 18,
  },
  // Tinker — accessories
  {
    id: 'bp_lucky_button',
    buildingId: 'tinker_shed',
    name: 'Lucky Button',
    emoji: '🔘',
    slot: 'accessory',
    quality: 'rustic',
    stats: { attack: 0, defense: 0, hp: 0, skillBonus: 2 },
    inputs: { berry: 2, egg: 1 },
    craftMs: 8_000,
    xp: 10,
    unlockLevel: 15,
  },
  {
    id: 'bp_honey_charm',
    buildingId: 'tinker_shed',
    name: 'Honey Charm',
    emoji: '🍯',
    slot: 'accessory',
    quality: 'valley',
    stats: { attack: 2, defense: 2, hp: 8, skillBonus: 3 },
    inputs: { honey: 2, sugar: 1, sunstone: 1 },
    craftMs: 18_000,
    xp: 20,
    unlockLevel: 16,
  },
  {
    id: 'bp_sun_amulet',
    buildingId: 'tinker_shed',
    name: 'Sun Amulet',
    emoji: '☀️',
    slot: 'accessory',
    quality: 'masterwork',
    stats: { attack: 5, defense: 5, hp: 15, skillBonus: 5 },
    inputs: { sunflower: 2, magic_essence: 2, sunstone: 2 },
    craftMs: 32_000,
    xp: 38,
    unlockLevel: 18,
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
  leather_scrap: { name: 'Leather Scrap', emoji: '🟤' },
  magic_essence: { name: 'Magic Essence', emoji: '✨' },
  sunstone: { name: 'Sunstone', emoji: '💛' },
}

export const GEAR_SLOT_LABEL: Record<GearSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
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
  return scaledStats(bp)
}

export function gearForNpc(
  npcInstanceId: string,
  gearInventory: GearInstance[],
): GearInstance[] {
  return gearInventory.filter((g) => g.equippedBy === npcInstanceId)
}

export function npcEffectiveSkill(
  npc: RecruitedNpc,
  baseSkill: number,
  gearInventory: GearInstance[],
): number {
  const gear = gearForNpc(npc.id, gearInventory)
  const bonus = gear.reduce(
    (sum, g) => sum + gearInstanceStats(g).skillBonus,
    0,
  )
  return baseSkill + bonus
}

export function npcCombatStats(
  npc: RecruitedNpc,
  gearInventory: GearInstance[],
) {
  const gear = gearForNpc(npc.id, gearInventory)
  return gear.reduce(
    (acc, g) => {
      const s = gearInstanceStats(g)
      acc.attack += s.attack
      acc.defense += s.defense
      acc.hp += s.hp
      acc.skillBonus += s.skillBonus
      return acc
    },
    { attack: 0, defense: 0, hp: 0, skillBonus: 0 },
  )
}

export function partyEffectiveSkill(
  npcInstanceIds: string[],
  recruited: RecruitedNpc[],
  gearInventory: GearInstance[],
  getBaseSkill: (npcId: string) => number,
): number {
  return npcInstanceIds.reduce((sum, id) => {
    const npc = recruited.find((n) => n.id === id)
    if (!npc) return sum
    return sum + npcEffectiveSkill(npc, getBaseSkill(npc.npcId), gearInventory)
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

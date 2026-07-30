import type { AdventureDef } from '../types'

export const TAVERN_UNLOCK_LEVEL = 15

export const MAX_ADVENTURE_PARTY = 4

/** Expeditions in Adventure Land — scale harder as your player level rises. */
export const ADVENTURES: AdventureDef[] = [
  {
    id: 'adv_meadow',
    name: 'Sunny Meadow',
    emoji: '🌼',
    blurb: 'A gentle stroll for fresh recruits.',
    durationMs: 2 * 60_000,
    minNpcs: 1,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 10,
    rewardCoins: 45,
    rewardXp: 25,
    recruitXp: 20,
    rewardMaterials: { leather_scrap: 1 },
    unlockLevel: 15,
  },
  {
    id: 'adv_forest',
    name: 'Whispering Forest',
    emoji: '🌲',
    blurb: 'Gather berries and lost supplies.',
    durationMs: 5 * 60_000,
    minNpcs: 1,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 18,
    rewardCoins: 90,
    rewardXp: 45,
    recruitXp: 35,
    rewardItems: { berry: 3 },
    rewardMaterials: { leather_scrap: 2 },
    unlockLevel: 15,
  },
  {
    id: 'adv_caves',
    name: 'Misty Caves',
    emoji: '🪨',
    blurb: 'Dark tunnels hide ore and old coins.',
    durationMs: 8 * 60_000,
    minNpcs: 2,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 30,
    rewardCoins: 140,
    rewardXp: 70,
    recruitXp: 50,
    rewardItems: { flour: 2, sugar: 1 },
    rewardMaterials: { iron_ore: 2 },
    unlockLevel: 16,
  },
  {
    id: 'adv_ruins',
    name: 'Valley Ruins',
    emoji: '🏛️',
    blurb: 'Ancient walls still hold treasure.',
    durationMs: 12 * 60_000,
    minNpcs: 2,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 45,
    rewardCoins: 220,
    rewardXp: 110,
    recruitXp: 70,
    rewardItems: { wine: 1, honey: 2 },
    rewardMaterials: { magic_essence: 1 },
    unlockLevel: 17,
  },
  {
    id: 'adv_ridge',
    name: "Dragon's Ridge",
    emoji: '🐉',
    blurb: 'Only the bravest parties return rich.',
    durationMs: 20 * 60_000,
    minNpcs: 2,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 65,
    rewardCoins: 400,
    rewardXp: 200,
    recruitXp: 100,
    rewardItems: { cake: 1, cloth: 2 },
    rewardMaterials: { iron_ore: 2, sunstone: 1 },
    unlockLevel: 18,
  },
  {
    id: 'adv_swamp',
    name: 'Gloom Swamp',
    emoji: '🌫️',
    blurb: 'Mire witches guard rare reagents.',
    durationMs: 25 * 60_000,
    minNpcs: 2,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 85,
    rewardCoins: 520,
    rewardXp: 260,
    recruitXp: 120,
    rewardMaterials: { magic_essence: 2, leather_scrap: 3 },
    unlockLevel: 20,
  },
  {
    id: 'adv_peak',
    name: 'Frost Peak',
    emoji: '🏔️',
    blurb: 'Ice caves glitter with sunstone.',
    durationMs: 30 * 60_000,
    minNpcs: 3,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 110,
    rewardCoins: 680,
    rewardXp: 340,
    recruitXp: 145,
    rewardMaterials: { sunstone: 2, iron_ore: 3 },
    unlockLevel: 25,
  },
  {
    id: 'adv_depths',
    name: 'Crystal Depths',
    emoji: '💎',
    blurb: 'Deep veins of magic essence await.',
    durationMs: 35 * 60_000,
    minNpcs: 3,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 140,
    rewardCoins: 850,
    rewardXp: 420,
    recruitXp: 175,
    rewardMaterials: { magic_essence: 3, sunstone: 2 },
    unlockLevel: 30,
  },
  {
    id: 'adv_void',
    name: 'Void Hollow',
    emoji: '🕳️',
    blurb: 'Reality thins; only strong parties survive.',
    durationMs: 40 * 60_000,
    minNpcs: 3,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 175,
    rewardCoins: 1050,
    rewardXp: 520,
    recruitXp: 210,
    rewardMaterials: { magic_essence: 4, sunstone: 3 },
    unlockLevel: 35,
  },
  {
    id: 'adv_sky',
    name: 'Skyreach Spire',
    emoji: '☁️',
    blurb: 'Storm elementals hoard ancient gear.',
    durationMs: 45 * 60_000,
    minNpcs: 4,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 215,
    rewardCoins: 1300,
    rewardXp: 650,
    recruitXp: 250,
    rewardMaterials: { sunstone: 4, magic_essence: 3, iron_ore: 4 },
    unlockLevel: 40,
  },
  {
    id: 'adv_crown',
    name: 'Crown of the Valley',
    emoji: '👑',
    blurb: 'The ultimate expedition for master parties.',
    durationMs: 60 * 60_000,
    minNpcs: 4,
    maxNpcs: MAX_ADVENTURE_PARTY,
    minPower: 260,
    rewardCoins: 1800,
    rewardXp: 900,
    recruitXp: 320,
    rewardMaterials: { magic_essence: 5, sunstone: 5, iron_ore: 5 },
    unlockLevel: 45,
  },
]

export const ADVENTURE_BY_ID = Object.fromEntries(
  ADVENTURES.map((a) => [a.id, a]),
)

export interface ScaledAdventure {
  minPower: number
  rewardCoins: number
  rewardXp: number
  recruitXp: number
}

/** Scale requirements and rewards based on how far above unlock level the player is. */
export function scaledAdventure(
  adventure: AdventureDef,
  playerLevel: number,
): ScaledAdventure {
  const tier = Math.max(0, playerLevel - adventure.unlockLevel)
  const mult = 1 + tier * 0.12
  const powerBump = tier * 5
  return {
    minPower: adventure.minPower + powerBump,
    rewardCoins: Math.round(adventure.rewardCoins * mult),
    rewardXp: Math.round(adventure.rewardXp * mult),
    recruitXp: Math.round(adventure.recruitXp * mult),
  }
}

export function adventuresForLevel(level: number): AdventureDef[] {
  return ADVENTURES.filter((a) => a.unlockLevel <= level)
}

import type { AdventureDef } from '../types'

export const TAVERN_UNLOCK_LEVEL = 15

/** Expeditions in Adventure Land — send tavern recruits here. */
export const ADVENTURES: AdventureDef[] = [
  {
    id: 'adv_meadow',
    name: 'Sunny Meadow',
    emoji: '🌼',
    blurb: 'A gentle stroll for fresh recruits.',
    durationMs: 2 * 60_000,
    minNpcs: 1,
    maxNpcs: 2,
    minSkill: 2,
    rewardCoins: 45,
    rewardXp: 25,
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
    maxNpcs: 3,
    minSkill: 4,
    rewardCoins: 90,
    rewardXp: 45,
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
    maxNpcs: 3,
    minSkill: 7,
    rewardCoins: 140,
    rewardXp: 70,
    rewardItems: { flour: 2, sugar: 1 },
    rewardMaterials: { iron_ore: 3 },
    unlockLevel: 16,
  },
  {
    id: 'adv_ruins',
    name: 'Valley Ruins',
    emoji: '🏛️',
    blurb: 'Ancient walls still hold treasure.',
    durationMs: 12 * 60_000,
    minNpcs: 2,
    maxNpcs: 4,
    minSkill: 10,
    rewardCoins: 220,
    rewardXp: 110,
    rewardItems: { wine: 1, honey: 2 },
    rewardMaterials: { magic_essence: 1, sunstone: 1 },
    unlockLevel: 17,
  },
  {
    id: 'adv_ridge',
    name: "Dragon's Ridge",
    emoji: '🐉',
    blurb: 'Only the bravest parties return rich.',
    durationMs: 20 * 60_000,
    minNpcs: 3,
    maxNpcs: 4,
    minSkill: 14,
    rewardCoins: 400,
    rewardXp: 200,
    rewardItems: { cake: 1, cloth: 2 },
    rewardMaterials: { iron_ore: 2, magic_essence: 2, sunstone: 2 },
    unlockLevel: 18,
  },
]

export const ADVENTURE_BY_ID = Object.fromEntries(
  ADVENTURES.map((a) => [a.id, a]),
)

export function adventuresForLevel(level: number): AdventureDef[] {
  return ADVENTURES.filter((a) => a.unlockLevel <= level)
}

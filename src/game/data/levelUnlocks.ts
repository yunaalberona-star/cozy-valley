import { MARKET_UNLOCK_LEVEL } from './market'
import { ORDERS_UNLOCK_LEVEL } from './buildings'
import { TAVERN_UNLOCK_LEVEL } from './adventures'
import type { UnlockId } from '../types'

/** Machines & animal buildings unlock by player level (not missions). */
export const BUILDING_LEVEL_UNLOCKS: { level: number; ids: UnlockId[] }[] = [
  { level: 1, ids: ['mill'] },
  { level: 2, ids: ['chicken_coop'] },
  { level: 3, ids: ['feed_mill'] },
  { level: 4, ids: ['bakery'] },
  { level: 5, ids: ['cow_barn'] },
  { level: 6, ids: ['dairy'] },
  { level: 8, ids: ['juice_press'] },
  { level: 10, ids: ['jam_maker'] },
  { level: 11, ids: ['sheep_pasture'] },
  { level: 12, ids: ['sugar_mill'] },
  { level: 13, ids: ['bee_apiary'] },
  { level: 14, ids: ['grill'] },
  { level: 16, ids: ['kitchen'] },
  { level: 17, ids: ['duck_pond'] },
  { level: 18, ids: ['loom'] },
  { level: 19, ids: ['goat_pen'] },
  { level: 20, ids: ['sewing'] },
  { level: 21, ids: ['pig_sty'] },
  { level: 22, ids: ['winery'] },
  { level: 24, ids: ['candy_machine'] },
  { level: 26, ids: ['cake_machine'] },
]

export const FEATURE_LEVEL_UNLOCKS: { level: number; ids: UnlockId[] }[] = [
  { level: ORDERS_UNLOCK_LEVEL, ids: ['orders_board'] },
  { level: MARKET_UNLOCK_LEVEL, ids: ['market_board'] },
  {
    level: TAVERN_UNLOCK_LEVEL,
    ids: [
      'tavern',
      'adventure_land',
      'valley_forge',
      'weavers_hut',
      'tinker_shed',
    ],
  },
]

export const ALL_LEVEL_UNLOCKS: { level: number; ids: UnlockId[] }[] = [
  ...BUILDING_LEVEL_UNLOCKS,
  ...FEATURE_LEVEL_UNLOCKS,
].sort((a, b) => a.level - b.level)

export function unlocksForLevel(level: number): UnlockId[] {
  const ids: UnlockId[] = []
  for (const entry of ALL_LEVEL_UNLOCKS) {
    if (level >= entry.level) ids.push(...entry.ids)
  }
  return [...new Set(ids)]
}

export function unlocksCrossingLevels(
  oldLevel: number,
  newLevel: number,
): UnlockId[] {
  if (newLevel <= oldLevel) return []
  const ids: UnlockId[] = []
  for (const entry of ALL_LEVEL_UNLOCKS) {
    if (oldLevel < entry.level && newLevel >= entry.level) {
      ids.push(...entry.ids)
    }
  }
  return ids
}

export function buildingUnlockLevel(id: UnlockId): number {
  for (const entry of ALL_LEVEL_UNLOCKS) {
    if (entry.ids.includes(id)) return entry.level
  }
  return 99
}

import { ANIMAL_BUILDINGS } from './data/animalBuildings'
import { BUILDINGS } from './data/buildings'
import { GEAR_BUILDINGS } from './data/gear'
import type { UnlockId } from './types'

export function unlockMeta(id: UnlockId | string): { name: string; emoji: string } {
  if (id in BUILDINGS) {
    const b = BUILDINGS[id as keyof typeof BUILDINGS]
    return { name: b.name, emoji: b.emoji }
  }
  if (id in ANIMAL_BUILDINGS) {
    const b = ANIMAL_BUILDINGS[id as keyof typeof ANIMAL_BUILDINGS]
    return { name: b.name, emoji: b.emoji }
  }
  if (id === 'orders_board') return { name: 'Orders Board', emoji: '📦' }
  if (id === 'market_board') return { name: 'Market Board', emoji: '🏪' }
  if (id === 'tavern') return { name: 'Tavern', emoji: '🍺' }
  if (id === 'adventure_land') return { name: 'Adventure Land', emoji: '🗺️' }
  if (id in GEAR_BUILDINGS) {
    const b = GEAR_BUILDINGS[id as keyof typeof GEAR_BUILDINGS]
    return { name: b.name, emoji: b.emoji }
  }
  const legacy: Record<string, { name: string; emoji: string }> = {
    animal_chicken: { name: 'Chicken Coop', emoji: '🐔' },
    animal_cow: { name: 'Cow Barn', emoji: '🐄' },
    animal_sheep: { name: 'Sheep Pasture', emoji: '🐑' },
    animal_bee: { name: 'Bee Apiary', emoji: '🐝' },
    animal_pig: { name: 'Pig Sty', emoji: '🐷' },
    animal_goat: { name: 'Goat Pen', emoji: '🐐' },
    animal_duck: { name: 'Duck Pond', emoji: '🦆' },
  }
  return legacy[id] ?? { name: id, emoji: '✨' }
}

export function unlockLabel(id: UnlockId | string): string {
  return unlockMeta(id).name
}

/** Map old save unlock flags to building IDs. */
export function migrateUnlockId(id: string): UnlockId | string {
  const map: Record<string, UnlockId> = {
    animal_chicken: 'chicken_coop',
    animal_cow: 'cow_barn',
    animal_sheep: 'sheep_pasture',
    animal_bee: 'bee_apiary',
    animal_pig: 'pig_sty',
    animal_goat: 'goat_pen',
    animal_duck: 'duck_pond',
  }
  return map[id] ?? id
}

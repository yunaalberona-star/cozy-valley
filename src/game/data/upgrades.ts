import type { AnimalTypeId, BuildingId } from '../types'
import { ANIMALS } from './animals'
import { BUILDINGS } from './buildings'

/** Max timer speed tiers per machine, animal type, and farm. */
export const MAX_SPEED_LEVEL = 5

/** Each level shaves 12% off the remaining wait time (multiplicative). */
const SPEED_FACTOR_PER_LEVEL = 0.88

export function speedMultiplier(level: number): number {
  const clamped = Math.max(0, Math.min(level, MAX_SPEED_LEVEL))
  return Math.pow(SPEED_FACTOR_PER_LEVEL, clamped)
}

export function effectiveMs(baseMs: number, speedLevel: number): number {
  return Math.max(1_000, Math.floor(baseMs * speedMultiplier(speedLevel)))
}

export function speedLevelLabel(level: number): string {
  if (level <= 0) return 'Base speed'
  const pct = Math.round((1 - speedMultiplier(level)) * 100)
  return `${pct}% faster`
}

export function farmSpeedUpgradeCost(currentLevel: number): number {
  return Math.floor(900 * Math.pow(currentLevel + 1, 2.2))
}

export function machineSpeedUpgradeCost(
  buildingId: BuildingId,
  currentLevel: number,
): number {
  const building = BUILDINGS[buildingId]
  return Math.floor(building.buyCost * 3 * Math.pow(currentLevel + 1, 2))
}

export function animalSpeedUpgradeCost(
  typeId: AnimalTypeId,
  currentLevel: number,
): number {
  const animal = ANIMALS[typeId]
  return Math.floor(animal.buyCost * 4 * Math.pow(currentLevel + 1, 2))
}

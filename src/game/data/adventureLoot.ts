import {
  createGearInstance,
  GEAR_BLUEPRINTS,
} from './gear'
import type { GearInstance, MaterialId } from '../types'

export function rollGearDropCount(): number {
  return 2 + Math.floor(Math.random() * 2)
}

const RARE_MATERIALS: MaterialId[] = [
  'magic_essence',
  'sunstone',
  'iron_ore',
  'timber',
  'leather_scrap',
  'rabbit_pelt',
  'cow_hide',
  'pig_leather',
  'sheep_leather',
  'boar_leather',
]

export function rollAdventureGear(
  playerLevel: number,
  count: number,
  createId: () => string,
): GearInstance[] {
  const pool = GEAR_BLUEPRINTS.filter((b) => b.unlockLevel <= playerLevel)
  if (pool.length === 0) return []
  const drops: GearInstance[] = []
  for (let i = 0; i < count; i++) {
    const bp = pool[Math.floor(Math.random() * pool.length)]!
    const minLvl = bp.unlockLevel
    const maxLvl = Math.max(minLvl, playerLevel)
    const span = maxLvl - minLvl + 1
    const level = minLvl + Math.floor(Math.random() * span)
    drops.push(
      createGearInstance(bp.id, level, 'drop', playerLevel, createId),
    )
  }
  return drops
}

export function rollRareMaterialDrops(
  playerLevel: number,
  base: Partial<Record<MaterialId, number>> = {},
): Partial<Record<MaterialId, number>> {
  const out: Partial<Record<MaterialId, number>> = { ...base }
  const rolls = 1 + Math.floor(Math.random() * 2)
  const bonus = 1 + Math.floor(playerLevel / 12)
  for (let i = 0; i < rolls; i++) {
    const mat =
      RARE_MATERIALS[Math.floor(Math.random() * RARE_MATERIALS.length)]!
    out[mat] = (out[mat] ?? 0) + bonus
  }
  return out
}

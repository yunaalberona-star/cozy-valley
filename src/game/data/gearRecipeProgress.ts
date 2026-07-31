import type { GearBlueprintDef } from '../types'
import { GEAR_BLUEPRINT_BY_ID } from './gearBlueprints'

/** Crafts needed to reach stars 1–5 for a recipe */
export const RECIPE_STAR_THRESHOLDS = [1, 5, 15, 40, 100] as const

/** Crafts of the previous recipe needed to unlock the next (recipes 2–10) */
export const RECIPE_CHAIN_UNLOCK_CRAFTS = [3, 5, 8, 12, 15, 18, 22, 26, 30] as const

export function recipeStar(craftCount: number): number {
  let star = 0
  for (const threshold of RECIPE_STAR_THRESHOLDS) {
    if (craftCount >= threshold) star += 1
  }
  return Math.min(5, star)
}

export function formatRecipeStars(star: number): string {
  const s = Math.max(0, Math.min(5, star))
  return `${'★'.repeat(s)}${'☆'.repeat(5 - s)}`
}

export function starStatMultiplier(star: number): number {
  return 1 + Math.max(0, Math.min(5, star)) * 0.06
}

export function starCraftMsMultiplier(star: number): number {
  return Math.max(0.55, 1 - Math.max(0, Math.min(5, star)) * 0.08)
}

export function isGearRecipeUnlocked(
  blueprint: GearBlueprintDef,
  craftCounts: Record<string, number>,
): boolean {
  if (blueprint.unlock.starter) return true
  const requires = blueprint.unlock.requires ?? []
  return requires.every(
    (req) => (craftCounts[req.blueprintId] ?? 0) >= req.craftsRequired,
  )
}

export interface RecipeUnlockProgress {
  current: number
  required: number
  prevBlueprintId: string
  prevName: string
}

export function recipeUnlockProgress(
  blueprint: GearBlueprintDef,
  craftCounts: Record<string, number>,
): RecipeUnlockProgress | null {
  if (isGearRecipeUnlocked(blueprint, craftCounts)) return null
  const req = blueprint.unlock.requires?.[0]
  if (!req) return null
  const prev = GEAR_BLUEPRINT_BY_ID[req.blueprintId]
  return {
    current: craftCounts[req.blueprintId] ?? 0,
    required: req.craftsRequired,
    prevBlueprintId: req.blueprintId,
    prevName: prev?.name ?? req.blueprintId,
  }
}

export function allBlueprintsForBuilding(
  buildingId: GearBlueprintDef['buildingId'],
): GearBlueprintDef[] {
  return Object.values(GEAR_BLUEPRINT_BY_ID)
    .filter((b) => b.buildingId === buildingId)
    .sort((a, b) => a.tier - b.tier)
}

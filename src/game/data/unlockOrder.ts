import { ANIMAL_BUILDINGS } from './animalBuildings'
import { BUILDINGS, RECIPES } from './buildings'
import type { AnimalBuildingDef, BuildingDef, BuildingId, ItemId, RecipeDef } from '../types'
import { CROPS } from './crops'
import { BUILDING_LEVEL_UNLOCKS } from './levelUnlocks'

const ANIMAL_PRODUCT_LEVEL: Partial<Record<ItemId, number>> = {
  egg: 2,
  milk: 3,
  goat_milk: 4,
  wool: 5,
  honey: 5,
  bacon: 5,
}

function inputItemLevel(
  id: ItemId,
  craftedLevels: Partial<Record<ItemId, number>>,
): number {
  if (id in CROPS) return CROPS[id as keyof typeof CROPS].unlockLevel
  if (ANIMAL_PRODUCT_LEVEL[id] != null) return ANIMAL_PRODUCT_LEVEL[id]!
  return craftedLevels[id] ?? 1
}

function buildRecipeUnlockLevels(): Record<string, number> {
  const byRecipe: Record<string, number> = {}
  const craftedLevels: Partial<Record<ItemId, number>> = {}
  let changed = true
  while (changed) {
    changed = false
    for (const recipe of RECIPES) {
      const need = Math.max(
        1,
        ...Object.keys(recipe.inputs).map((id) =>
          inputItemLevel(id as ItemId, craftedLevels),
        ),
      )
      if ((byRecipe[recipe.id] ?? 0) < need) {
        byRecipe[recipe.id] = need
        craftedLevels[recipe.output] = need
        changed = true
      }
    }
  }
  return byRecipe
}

export const RECIPE_UNLOCK_LEVEL = buildRecipeUnlockLevels()

export function recipeUnlockLevel(recipeId: string): number {
  return RECIPE_UNLOCK_LEVEL[recipeId] ?? 1
}

export function machineUnlockOrder(): BuildingId[] {
  const order: BuildingId[] = []
  const seen = new Set<string>()
  for (const entry of BUILDING_LEVEL_UNLOCKS) {
    for (const unlock of entry.ids) {
      if (unlock in BUILDINGS && !seen.has(unlock)) {
        seen.add(unlock)
        order.push(unlock as BuildingId)
      }
    }
  }
  for (const id of Object.keys(BUILDINGS) as BuildingId[]) {
    if (!seen.has(id)) order.push(id)
  }
  return order
}

export function animalBuildingUnlockOrder(): string[] {
  const order: string[] = []
  const seen = new Set<string>()
  for (const entry of BUILDING_LEVEL_UNLOCKS) {
    for (const unlock of entry.ids) {
      if (unlock in ANIMAL_BUILDINGS && !seen.has(unlock)) {
        seen.add(unlock)
        order.push(unlock)
      }
    }
  }
  for (const id of Object.keys(ANIMAL_BUILDINGS)) {
    if (!seen.has(id)) order.push(id)
  }
  return order
}

export function sortedMachineBuildings(): BuildingDef[] {
  return machineUnlockOrder().map((id) => BUILDINGS[id])
}

export function sortedAnimalBuildings(): AnimalBuildingDef[] {
  return animalBuildingUnlockOrder().map(
    (id) => ANIMAL_BUILDINGS[id as keyof typeof ANIMAL_BUILDINGS],
  )
}

export function recipesForBuilding(
  buildingId: BuildingId,
  playerLevel = 99,
): RecipeDef[] {
  return RECIPES.filter((r) => r.buildingId === buildingId)
    .map((r) => ({
      ...r,
      unlockLevel: recipeUnlockLevel(r.id),
    }))
    .sort(
      (a, b) =>
        a.unlockLevel - b.unlockLevel ||
        a.name.localeCompare(b.name),
    )
    .filter((r) => r.unlockLevel <= playerLevel || playerLevel >= 99)
}

/** All recipes for a building, including level-locked (for UI). */
export function allRecipesForBuilding(buildingId: BuildingId): RecipeDef[] {
  return RECIPES.filter((r) => r.buildingId === buildingId)
    .map((r) => ({
      ...r,
      unlockLevel: recipeUnlockLevel(r.id),
    }))
    .sort(
      (a, b) =>
        a.unlockLevel - b.unlockLevel ||
        a.name.localeCompare(b.name),
    )
}

export function isRecipeUnlocked(recipeId: string, playerLevel: number): boolean {
  return playerLevel >= recipeUnlockLevel(recipeId)
}

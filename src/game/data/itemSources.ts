import { ANIMAL_LIST } from './animals'
import { RECIPES } from './buildings'
import { CROPS } from './crops'
import type {
  AnimalBuildingId,
  BuildingId,
  CropId,
  ItemId,
  RecipeDef,
} from '../types'

export function isCropItem(id: ItemId): id is CropId {
  return id in CROPS
}

export function recipeProducing(itemId: ItemId): RecipeDef | undefined {
  return RECIPES.find((r) => r.output === itemId)
}

export function animalBuildingForProduct(
  itemId: ItemId,
  unlocked: string[],
): AnimalBuildingId | null {
  const animal = ANIMAL_LIST.find(
    (a) => a.product === itemId && unlocked.includes(a.buildingId),
  )
  return (animal?.buildingId as AnimalBuildingId | undefined) ?? null
}

export function machineBuildingForItem(
  itemId: ItemId,
  unlocked: string[],
): BuildingId | null {
  const recipe = recipeProducing(itemId)
  if (recipe && unlocked.includes(recipe.buildingId)) {
    return recipe.buildingId
  }
  return null
}

export function collectMachineIngredients(
  recipes: RecipeDef[],
  playerLevel: number,
  isRecipeUnlocked: (recipeId: string, level: number) => boolean,
): { id: ItemId; qty: number }[] {
  const map = new Map<ItemId, number>()
  for (const recipe of recipes) {
    if (!isRecipeUnlocked(recipe.id, playerLevel)) continue
    for (const [id, qty] of Object.entries(recipe.inputs)) {
      const itemId = id as ItemId
      map.set(itemId, Math.max(map.get(itemId) ?? 0, qty ?? 0))
    }
  }
  return [...map.entries()]
    .map(([id, qty]) => ({ id, qty }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

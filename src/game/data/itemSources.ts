import { ADVENTURES } from './adventures'
import { ANIMAL_LIST } from './animals'
import { RECIPES } from './buildings'
import { CROPS } from './crops'
import type {
  AnimalBuildingId,
  BuildingId,
  CropId,
  GatherSiteId,
  ItemId,
  MaterialId,
  RecipeDef,
} from '../types'

export function isCropItem(id: ItemId): id is CropId {
  return id in CROPS
}

export function recipeProducing(itemId: ItemId): RecipeDef | undefined {
  return RECIPES.find((r) => r.output === itemId)
}

export function recipeProducingMaterial(
  materialId: MaterialId,
): RecipeDef | undefined {
  return RECIPES.find((r) => r.materialOutput === materialId)
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

export function animalBuildingForMaterial(
  materialId: MaterialId,
  unlocked: string[],
): AnimalBuildingId | null {
  const animal = ANIMAL_LIST.find(
    (a) => a.materialProduct === materialId && unlocked.includes(a.buildingId),
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

export function machineBuildingForMaterial(
  materialId: MaterialId,
  unlocked: string[],
): BuildingId | null {
  const recipe = recipeProducingMaterial(materialId)
  if (recipe && unlocked.includes(recipe.buildingId)) {
    return recipe.buildingId
  }
  return null
}

export function gatherSiteForMaterial(
  materialId: MaterialId,
): GatherSiteId | null {
  if (materialId === 'iron_ore') return 'mountain'
  if (materialId === 'timber') return 'forest'
  return null
}

export function adventureRewardsMaterial(materialId: MaterialId): boolean {
  return ADVENTURES.some((a) => (a.rewardMaterials?.[materialId] ?? 0) > 0)
}

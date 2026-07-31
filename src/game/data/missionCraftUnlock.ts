import { RECIPES } from './buildings'
import type { BuildingId, ItemId, MissionDef } from '../types'

export function missionCraftTargets(
  mission: MissionDef | null | undefined,
): ItemId[] {
  if (!mission) return []
  return mission.goals
    .filter((g) => g.kind === 'craft' && g.target)
    .map((g) => g.target as ItemId)
}

export function recipesForCraftTarget(itemId: ItemId) {
  return RECIPES.filter((r) => r.output === itemId)
}

export function buildingsRequiredForMission(
  mission: MissionDef | null | undefined,
): BuildingId[] {
  if (!mission) return []
  const ids = new Set<BuildingId>()
  for (const itemId of missionCraftTargets(mission)) {
    for (const recipe of recipesForCraftTarget(itemId)) {
      ids.add(recipe.buildingId)
    }
  }
  return [...ids]
}

export function isCraftRequiredByMission(
  mission: MissionDef | null | undefined,
  itemId: ItemId,
): boolean {
  return missionCraftTargets(mission).includes(itemId)
}

export function isRecipeRequiredByMission(
  mission: MissionDef | null | undefined,
  recipeId: string,
): boolean {
  const recipe = RECIPES.find((r) => r.id === recipeId)
  if (!recipe?.output || !mission) return false
  return isCraftRequiredByMission(mission, recipe.output)
}

export function isBuildingRequiredByMission(
  mission: MissionDef | null | undefined,
  buildingId: BuildingId,
): boolean {
  return buildingsRequiredForMission(mission).includes(buildingId)
}

export function mergeMissionBuildingUnlocks(
  unlocked: string[],
  mission: MissionDef | null | undefined,
): string[] {
  const extra = buildingsRequiredForMission(mission)
  if (extra.length === 0) return unlocked
  return [...new Set([...unlocked, ...extra])]
}

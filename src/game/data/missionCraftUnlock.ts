import { RECIPES } from './buildings'
import type { ItemId, MissionDef } from '../types'

export function missionCraftTargets(
  mission: MissionDef | null | undefined,
): ItemId[] {
  if (!mission) return []
  return mission.goals
    .filter((g) => g.kind === 'craft' && g.target)
    .map((g) => g.target as ItemId)
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

import type { BuildingId, GatherSiteId, RecipeDef } from '../types'

export const GATHER_SITE_MAX_SLOTS = 8

export interface GatherSiteDef {
  id: GatherSiteId
  name: string
  emoji: string
  blurb: string
  machineId: BuildingId
  machineName: string
  baseSlotCost: number
}

export const GATHER_SITES: Record<GatherSiteId, GatherSiteDef> = {
  mountain: {
    id: 'mountain',
    name: 'Iron Mountain',
    emoji: '⛰️',
    blurb: 'Expand mining veins — each slot boosts Valley Miner yield per craft.',
    machineId: 'miner',
    machineName: 'Valley Miner',
    baseSlotCost: 180,
  },
  forest: {
    id: 'forest',
    name: 'Timber Forest',
    emoji: '🌲',
    blurb: 'Clear more woodland — each slot boosts Wood Cutter yield per craft.',
    machineId: 'wood_cutter',
    machineName: 'Wood Cutter',
    baseSlotCost: 150,
  },
}

export const GATHER_SITE_LIST = Object.values(GATHER_SITES)

export function gatherSlotCost(siteId: GatherSiteId, ownedSlots: number): number {
  const site = GATHER_SITES[siteId]
  return Math.floor(site.baseSlotCost * Math.pow(1.55, ownedSlots - 1))
}

export function gatherYieldMultiplier(
  _siteId: GatherSiteId,
  slots: number,
): number {
  return Math.max(1, Math.min(GATHER_SITE_MAX_SLOTS, slots))
}

export function materialRecipeYield(
  recipe: RecipeDef,
  gatherSlots: Record<GatherSiteId, number>,
): number {
  if (!recipe.materialOutput) return recipe.outputQty
  if (recipe.buildingId === 'miner') {
    return recipe.outputQty * gatherYieldMultiplier('mountain', gatherSlots.mountain)
  }
  if (recipe.buildingId === 'wood_cutter') {
    return recipe.outputQty * gatherYieldMultiplier('forest', gatherSlots.forest)
  }
  return recipe.outputQty
}

export function gatherSiteForMachine(
  buildingId: BuildingId,
): GatherSiteId | null {
  if (buildingId === 'miner') return 'mountain'
  if (buildingId === 'wood_cutter') return 'forest'
  return null
}

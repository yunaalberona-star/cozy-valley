import { TAVERN_UNLOCK_LEVEL } from './adventures'
import { ANIMAL_BUILDINGS } from './animalBuildings'
import { ANIMAL_LIST } from './animals'
import { BUILDINGS, ITEM_META } from './buildings'
import { CROPS, CROP_LIST } from './crops'
import { GATHER_SITES } from './gatherSites'
import { MATERIAL_META } from './gear'
import {
  adventureRewardsMaterial,
  gatherSiteForMaterial,
  isCropItem,
  recipeProducing,
  recipeProducingMaterial,
} from './itemSources'
import { buildingUnlockLevel } from './levelUnlocks'
import { TREES, treeForProduct } from './trees'
import { isRecipeUnlocked, recipeUnlockLevel } from './unlockOrder'
import type {
  CraftResourceId,
  CropId,
  ItemId,
  MaterialId,
  MissionDef,
} from '../types'

export type CodexCategory = 'all' | 'crop' | 'good' | 'material'

export interface CodexEntry {
  id: string
  category: Exclude<CodexCategory, 'all'>
  resourceId: CraftResourceId
  name: string
  emoji: string
  discovered: boolean
  source: string
  unlockHint?: string
}

export interface CodexContext {
  inventory: Partial<Record<ItemId, number>>
  materials: Partial<Record<MaterialId, number>>
  seeds: Partial<Record<CropId, number>>
  unlocked: string[]
  playerLevel: number
  activeMission: MissionDef | null
}

function effectiveUnlocks(ctx: CodexContext): string[] {
  return ctx.unlocked
}

export function describeItemSource(
  itemId: ItemId,
  ctx: CodexContext,
): { source: string; unlockHint?: string } {
  const effective = effectiveUnlocks(ctx)

  if (isCropItem(itemId)) {
    const crop = CROPS[itemId]
    return {
      source: 'Grow on farm plots',
      unlockHint:
        ctx.playerLevel < crop.unlockLevel
          ? `Unlocks at Level ${crop.unlockLevel}`
          : undefined,
    }
  }

  const treeId = treeForProduct(itemId)
  if (treeId) {
    const tree = TREES[treeId]
    return {
      source: `Harvest from ${tree.name} (orchard)`,
      unlockHint:
        ctx.playerLevel < tree.unlockLevel
          ? `Unlocks at Level ${tree.unlockLevel}`
          : undefined,
    }
  }

  const animal = ANIMAL_LIST.find((a) => a.product === itemId)
  if (animal) {
    const home = ANIMAL_BUILDINGS[animal.buildingId]
    const lvl = buildingUnlockLevel(animal.buildingId)
    const buildingOk = effective.includes(animal.buildingId)
    return {
      source: buildingOk
        ? `Collect from ${home.name}`
        : `Collect from ${home.name} (animal building)`,
      unlockHint: !buildingOk
        ? `${home.name} unlocks at Level ${lvl}`
        : ctx.playerLevel < lvl
          ? `Reach Level ${lvl}`
          : undefined,
    }
  }

  const recipe = recipeProducing(itemId)
  if (recipe) {
    const building = BUILDINGS[recipe.buildingId]
    const recipeLvl = recipeUnlockLevel(recipe.id)
    const buildingOk = effective.includes(recipe.buildingId)
    const buildingLvl = buildingUnlockLevel(recipe.buildingId)
    if (!buildingOk) {
      return {
        source: `Craft at ${building.name}`,
        unlockHint: `Unlock ${building.name} at Level ${buildingLvl}`,
      }
    }
    if (ctx.playerLevel < recipeLvl) {
      return {
        source: `Craft at ${building.name}`,
        unlockHint: `Recipe unlocks at Level ${recipeLvl}`,
      }
    }
    return { source: `Craft at ${building.name}` }
  }

  return { source: 'Missions, machines, and exploration' }
}

export function describeMaterialSource(
  materialId: MaterialId,
  ctx: CodexContext,
): { source: string; unlockHint?: string } {
  const effective = effectiveUnlocks(ctx)

  const siteId = gatherSiteForMaterial(materialId)
  if (siteId) {
    const site = GATHER_SITES[siteId]
    const lvl = buildingUnlockLevel(site.machineId)
    const buildingOk = effective.includes(site.machineId)
    return {
      source: buildingOk
        ? `Gather at ${site.name} · ${site.machineName}`
        : `Gather at ${site.name}`,
      unlockHint:
        !buildingOk || ctx.playerLevel < lvl
          ? `${site.machineName} unlocks at Level ${lvl}`
          : undefined,
    }
  }

  const recipe = recipeProducingMaterial(materialId)
  if (recipe) {
    const building = BUILDINGS[recipe.buildingId]
    const recipeLvl = recipeUnlockLevel(recipe.id)
    const buildingOk = effective.includes(recipe.buildingId)
    const buildingLvl = buildingUnlockLevel(recipe.buildingId)
    if (!buildingOk) {
      return {
        source: `Craft at ${building.name}`,
        unlockHint: `Unlock ${building.name} at Level ${buildingLvl}`,
      }
    }
    if (ctx.playerLevel < recipeLvl) {
      return {
        source: `Craft at ${building.name}`,
        unlockHint: `Recipe unlocks at Level ${recipeLvl}`,
      }
    }
    return { source: `Craft at ${building.name}` }
  }

  const animal = ANIMAL_LIST.find((a) => a.materialProduct === materialId)
  if (animal) {
    const home = ANIMAL_BUILDINGS[animal.buildingId]
    const lvl = buildingUnlockLevel(animal.buildingId)
    const buildingOk = effective.includes(animal.buildingId)
    return {
      source: buildingOk
        ? `Collect from ${home.name}`
        : `Collect from ${home.name}`,
      unlockHint: !buildingOk
        ? `${home.name} unlocks at Level ${lvl}`
        : undefined,
    }
  }

  if (adventureRewardsMaterial(materialId)) {
    return {
      source: 'Expedition loot · Adventure Land',
      unlockHint: !effective.includes('tavern')
        ? `Adventures unlock at Level ${TAVERN_UNLOCK_LEVEL}`
        : undefined,
    }
  }

  return { source: 'Adventures and advanced workshops' }
}

function isItemDiscovered(itemId: ItemId, ctx: CodexContext): boolean {
  if ((ctx.inventory[itemId] ?? 0) > 0) return true
  if (itemId in CROPS && (ctx.seeds[itemId as CropId] ?? 0) > 0) return true

  const { unlockHint } = describeItemSource(itemId, ctx)
  if (unlockHint) return false

  if (isCropItem(itemId)) return ctx.playerLevel >= CROPS[itemId].unlockLevel

  const treeId = treeForProduct(itemId)
  if (treeId) return ctx.playerLevel >= TREES[treeId].unlockLevel

  const recipe = recipeProducing(itemId)
  if (recipe) {
    const effective = effectiveUnlocks(ctx)
    return (
      effective.includes(recipe.buildingId) &&
      isRecipeUnlocked(recipe.id, ctx.playerLevel)
    )
  }

  const animal = ANIMAL_LIST.find((a) => a.product === itemId)
  if (animal) {
    const effective = effectiveUnlocks(ctx)
    return (
      effective.includes(animal.buildingId) &&
      ctx.playerLevel >= buildingUnlockLevel(animal.buildingId)
    )
  }

  return false
}

function isMaterialDiscovered(materialId: MaterialId, ctx: CodexContext): boolean {
  if ((ctx.materials[materialId] ?? 0) > 0) return true
  const { unlockHint } = describeMaterialSource(materialId, ctx)
  return !unlockHint
}

export function buildCodexEntries(ctx: CodexContext): CodexEntry[] {
  const entries: CodexEntry[] = []

  for (const crop of CROP_LIST) {
    const { source, unlockHint } = describeItemSource(crop.id, ctx)
    const discovered = isItemDiscovered(crop.id, ctx)
    entries.push({
      id: crop.id,
      category: 'crop',
      resourceId: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      discovered,
      source,
      unlockHint: discovered ? undefined : unlockHint,
    })
  }

  for (const [id, meta] of Object.entries(ITEM_META) as [
    ItemId,
    { name: string; emoji: string },
  ][]) {
    if (id in CROPS) continue
    const { source, unlockHint } = describeItemSource(id, ctx)
    const discovered = isItemDiscovered(id, ctx)
    entries.push({
      id,
      category: 'good',
      resourceId: id,
      name: meta.name,
      emoji: meta.emoji,
      discovered,
      source,
      unlockHint: discovered ? undefined : unlockHint,
    })
  }

  for (const [id, meta] of Object.entries(MATERIAL_META) as [
    MaterialId,
    { name: string; emoji: string },
  ][]) {
    const { source, unlockHint } = describeMaterialSource(id, ctx)
    const discovered = isMaterialDiscovered(id, ctx)
    entries.push({
      id,
      category: 'material',
      resourceId: id,
      name: meta.name,
      emoji: meta.emoji,
      discovered,
      source,
      unlockHint: discovered ? undefined : unlockHint,
    })
  }

  return entries.sort((a, b) => {
    if (a.discovered !== b.discovered) return a.discovered ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function filterCodexEntries(
  entries: CodexEntry[],
  category: CodexCategory,
): CodexEntry[] {
  if (category === 'all') return entries
  return entries.filter((e) => e.category === category)
}
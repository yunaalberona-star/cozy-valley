import { BUILDINGS } from './data/buildings'
import { ANIMAL_BUILDINGS } from './data/animalBuildings'
import { CROPS, cropsCrossingLevels } from './data/crops'
import { GEAR_BUILDINGS } from './data/gear'
import type { CropId, TabId, UnlockId } from './types'

/** Crops that become buyable when the player hits this level. */
export function guideCropsForLevel(level: number): CropId[] {
  return cropsCrossingLevels(level - 1, level)
}

export function guideCropsForUnlock(_id: UnlockId): CropId[] {
  return []
}

export function guideTabsForUnlock(id: UnlockId): TabId[] {
  const tabs: TabId[] = []
  if (id in BUILDINGS) tabs.push('machines')
  if (id in ANIMAL_BUILDINGS) tabs.push('animals')
  if (id in GEAR_BUILDINGS || id === 'tavern' || id === 'adventure_land') {
    tabs.push('adventure')
  }
  if (id === 'orders_board') tabs.push('orders')
  if (id === 'market_board') tabs.push('market')
  if (guideCropsForUnlock(id).length > 0) tabs.push('shop')
  return tabs
}

export function mergeCropLevelGuides(
  tabPulses: TabId[],
  itemHighlights: string[],
  newLevel: number,
): { guideTabPulses: TabId[]; guideItemHighlights: string[] } {
  const crops = guideCropsForLevel(newLevel)
  if (crops.length === 0) {
    return { guideTabPulses: tabPulses, guideItemHighlights: itemHighlights }
  }
  const tabs = new Set(tabPulses)
  const items = new Set(itemHighlights)
  tabs.add('shop')
  for (const crop of crops) items.add(crop)
  return {
    guideTabPulses: [...tabs],
    guideItemHighlights: [...items],
  }
}

export function mergeUnlockGuides(
  tabPulses: TabId[],
  itemHighlights: string[],
  freshUnlocks: UnlockId[],
): { guideTabPulses: TabId[]; guideItemHighlights: string[] } {
  if (freshUnlocks.length === 0) {
    return { guideTabPulses: tabPulses, guideItemHighlights: itemHighlights }
  }
  const tabs = new Set(tabPulses)
  const items = new Set(itemHighlights)
  for (const id of freshUnlocks) {
    for (const tab of guideTabsForUnlock(id)) tabs.add(tab)
    if (id in BUILDINGS || id in ANIMAL_BUILDINGS || id in GEAR_BUILDINGS) {
      items.add(id)
    }
    for (const crop of guideCropsForUnlock(id)) items.add(crop)
  }
  // Re-show tab pulses for any tab that still has unseen item highlights.
  for (const item of items) {
    if (item in BUILDINGS || item in ANIMAL_BUILDINGS || item in GEAR_BUILDINGS) {
      for (const tab of guideTabsForUnlock(item as UnlockId)) tabs.add(tab)
    }
    if (item in CROPS) {
      tabs.add('shop')
    }
  }
  return {
    guideTabPulses: [...tabs],
    guideItemHighlights: [...items],
  }
}

export function tabShouldPulse(
  tab: TabId,
  tabPulses: TabId[],
  contextTab: TabId | null,
): boolean {
  return tabPulses.includes(tab) || contextTab === tab
}

export function isCropHighlight(id: string): id is CropId {
  return id in CROPS
}

import { BUILDINGS } from './data/buildings'
import { ANIMAL_BUILDINGS } from './data/animalBuildings'
import { CROPS } from './data/crops'
import { GEAR_BUILDINGS } from './data/gear'
import type { CropId, TabId, UnlockId } from './types'

export function guideCropsForUnlock(id: UnlockId): CropId[] {
  switch (id) {
    case 'mill':
      return ['corn', 'tomato']
    case 'bakery':
    case 'juice_press':
      return ['oat', 'berry', 'strawberry', 'grape']
    case 'sugar_mill':
      return ['sugarcane']
    case 'winery':
      return ['grape']
    case 'loom':
      return ['cotton', 'pumpkin', 'sunflower']
    case 'kitchen':
      return ['pumpkin', 'sunflower']
    default:
      return []
  }
}

export function guideTabsForUnlock(id: UnlockId): TabId[] {
  const tabs: TabId[] = []
  if (id in BUILDINGS) tabs.push('machines')
  if (id in ANIMAL_BUILDINGS) tabs.push('animals')
  if (id in GEAR_BUILDINGS || id === 'tavern' || id === 'adventure_land') {
    tabs.push('adventure')
  }
  if (id === 'orders_board') tabs.push('orders')
  if (guideCropsForUnlock(id).length > 0) tabs.push('shop')
  return tabs
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

import { ANIMAL_LIST } from './animals'
import { isCropItem } from './itemSources'
import { isTreeProduct } from './trees'
import type { AnimalProductId, ItemId, MaterialId } from '../types'

export type BagPaneId = 'seeds' | 'farm' | 'machine' | 'animal' | 'gear'

const ANIMAL_PRODUCTS = new Set<AnimalProductId>(
  ANIMAL_LIST.map((a) => a.product).filter(Boolean) as AnimalProductId[],
)

const ANIMAL_MATERIALS = new Set<MaterialId>(
  ANIMAL_LIST.map((a) => a.materialProduct).filter(Boolean) as MaterialId[],
)

/** Inventory item bucket for the bag tabs. */
export function bagItemCategory(id: ItemId): 'farm' | 'machine' | 'animal' {
  if (ANIMAL_PRODUCTS.has(id as AnimalProductId)) return 'animal'
  if (isCropItem(id) || isTreeProduct(id)) return 'farm'
  return 'machine'
}

/** Materials bucket — animal hides/pelts vs ore, timber, essence, etc. */
export function bagMaterialCategory(id: MaterialId): 'machine' | 'animal' {
  if (ANIMAL_MATERIALS.has(id)) return 'animal'
  return 'machine'
}

export const BAG_PANES: { id: BagPaneId; label: string; emoji: string }[] = [
  { id: 'seeds', label: 'Seeds', emoji: '🌱' },
  { id: 'farm', label: 'Farm', emoji: '🌾' },
  { id: 'machine', label: 'Craft', emoji: '⚙️' },
  { id: 'animal', label: 'Animals', emoji: '🐄' },
  { id: 'gear', label: 'Gear', emoji: '⚔️' },
]

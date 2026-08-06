import type { CropId, ItemId, TreeProductId, TreeDef, TreeId } from '../types'

/** Grow times are longer than crops — trees persist after harvest. */
export const TREES: Record<TreeId, TreeDef> = {
  apple_tree: {
    id: 'apple_tree',
    name: 'Apple Tree',
    emoji: '🍎',
    saplingCost: 48,
    growMs: 120_000,
    harvestQty: 4,
    product: 'apple',
    xp: 14,
    unlockLevel: 8,
  },
  orange_tree: {
    id: 'orange_tree',
    name: 'Orange Tree',
    emoji: '🍊',
    saplingCost: 55,
    growMs: 135_000,
    harvestQty: 4,
    product: 'orange',
    xp: 16,
    unlockLevel: 12,
  },
  cherry_tree: {
    id: 'cherry_tree',
    name: 'Cherry Tree',
    emoji: '🍒',
    saplingCost: 62,
    growMs: 150_000,
    harvestQty: 5,
    product: 'cherry',
    xp: 18,
    unlockLevel: 16,
  },
  maple_tree: {
    id: 'maple_tree',
    name: 'Maple Tree',
    emoji: '🍁',
    saplingCost: 70,
    growMs: 165_000,
    harvestQty: 3,
    product: 'maple_sap',
    xp: 20,
    unlockLevel: 20,
  },
  peach_tree: {
    id: 'peach_tree',
    name: 'Peach Tree',
    emoji: '🍑',
    saplingCost: 58,
    growMs: 140_000,
    harvestQty: 4,
    product: 'peach',
    xp: 17,
    unlockLevel: 24,
  },
  lemon_tree: {
    id: 'lemon_tree',
    name: 'Lemon Tree',
    emoji: '🍋',
    saplingCost: 52,
    growMs: 130_000,
    harvestQty: 4,
    product: 'lemon',
    xp: 15,
    unlockLevel: 18,
  },
}

export const TREE_LIST = Object.values(TREES)

export const SORTED_TREE_LIST = [...TREE_LIST].sort(
  (a, b) => a.unlockLevel - b.unlockLevel || a.name.localeCompare(b.name),
)

export const TREE_PRODUCTS = new Set<ItemId>(
  TREE_LIST.map((t) => t.product),
)

export function isTreeProduct(id: ItemId): boolean {
  return TREE_PRODUCTS.has(id)
}

export function treeForProduct(product: ItemId): TreeId | null {
  const tree = TREE_LIST.find((t) => t.product === product)
  return tree?.id ?? null
}

export function treesUnlockedAtLevel(level: number): TreeId[] {
  return TREE_LIST.filter((t) => t.unlockLevel <= level).map((t) => t.id)
}

export function treeProductLevel(product: TreeProductId | CropId): number {
  const tree = TREE_LIST.find((t) => t.product === product)
  return tree?.unlockLevel ?? 99
}

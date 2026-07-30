import type { CropDef, CropId } from '../types'

/** Grow times are short for web playtesting — tune up later for “real” pace. */
export const CROPS: Record<CropId, CropDef> = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    emoji: '🌾',
    seedCost: 5,
    growMs: 15_000,
    harvestQty: 2,
    xp: 4,
    unlockLevel: 1,
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    seedCost: 8,
    growMs: 25_000,
    harvestQty: 2,
    xp: 6,
    unlockLevel: 1,
  },
  corn: {
    id: 'corn',
    name: 'Corn',
    emoji: '🌽',
    seedCost: 10,
    growMs: 28_000,
    harvestQty: 2,
    xp: 7,
    unlockLevel: 2,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    seedCost: 12,
    growMs: 40_000,
    harvestQty: 3,
    xp: 10,
    unlockLevel: 2,
  },
  oat: {
    id: 'oat',
    name: 'Oat',
    emoji: '🌿',
    seedCost: 12,
    growMs: 32_000,
    harvestQty: 2,
    xp: 8,
    unlockLevel: 3,
  },
  berry: {
    id: 'berry',
    name: 'Berry',
    emoji: '🫐',
    seedCost: 18,
    growMs: 55_000,
    harvestQty: 3,
    xp: 14,
    unlockLevel: 4,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    seedCost: 20,
    growMs: 50_000,
    harvestQty: 3,
    xp: 15,
    unlockLevel: 4,
  },
  grape: {
    id: 'grape',
    name: 'Grape',
    emoji: '🍇',
    seedCost: 24,
    growMs: 60_000,
    harvestQty: 3,
    xp: 18,
    unlockLevel: 5,
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    emoji: '🎋',
    seedCost: 22,
    growMs: 58_000,
    harvestQty: 2,
    xp: 16,
    unlockLevel: 5,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    emoji: '🎃',
    seedCost: 28,
    growMs: 80_000,
    harvestQty: 2,
    xp: 22,
    unlockLevel: 6,
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    emoji: '🌼',
    seedCost: 26,
    growMs: 70_000,
    harvestQty: 2,
    xp: 20,
    unlockLevel: 7,
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    seedCost: 35,
    growMs: 90_000,
    harvestQty: 2,
    xp: 28,
    unlockLevel: 7,
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    seedCost: 14,
    growMs: 35_000,
    harvestQty: 3,
    xp: 9,
    unlockLevel: 8,
  },
  lettuce: {
    id: 'lettuce',
    name: 'Lettuce',
    emoji: '🥬',
    seedCost: 16,
    growMs: 38_000,
    harvestQty: 3,
    xp: 11,
    unlockLevel: 10,
  },
  onion: {
    id: 'onion',
    name: 'Onion',
    emoji: '🧅',
    seedCost: 18,
    growMs: 42_000,
    harvestQty: 2,
    xp: 12,
    unlockLevel: 12,
  },
  pepper: {
    id: 'pepper',
    name: 'Pepper',
    emoji: '🫑',
    seedCost: 20,
    growMs: 45_000,
    harvestQty: 3,
    xp: 13,
    unlockLevel: 15,
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💐',
    seedCost: 22,
    growMs: 48_000,
    harvestQty: 2,
    xp: 14,
    unlockLevel: 18,
  },
  rice: {
    id: 'rice',
    name: 'Rice',
    emoji: '🌾',
    seedCost: 24,
    growMs: 52_000,
    harvestQty: 3,
    xp: 16,
    unlockLevel: 21,
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    seedCost: 26,
    growMs: 55_000,
    harvestQty: 3,
    xp: 17,
    unlockLevel: 24,
  },
  melon: {
    id: 'melon',
    name: 'Melon',
    emoji: '🍈',
    seedCost: 30,
    growMs: 65_000,
    harvestQty: 2,
    xp: 19,
    unlockLevel: 27,
  },
  chili: {
    id: 'chili',
    name: 'Chili',
    emoji: '🌶️',
    seedCost: 28,
    growMs: 60_000,
    harvestQty: 3,
    xp: 18,
    unlockLevel: 30,
  },
  basil: {
    id: 'basil',
    name: 'Basil',
    emoji: '🌿',
    seedCost: 32,
    growMs: 68_000,
    harvestQty: 3,
    xp: 20,
    unlockLevel: 33,
  },
  beet: {
    id: 'beet',
    name: 'Beet',
    emoji: '🫜',
    seedCost: 34,
    growMs: 72_000,
    harvestQty: 2,
    xp: 21,
    unlockLevel: 36,
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    emoji: '🥗',
    seedCost: 36,
    growMs: 75_000,
    harvestQty: 2,
    xp: 22,
    unlockLevel: 39,
  },
  peach: {
    id: 'peach',
    name: 'Peach',
    emoji: '🍑',
    seedCost: 38,
    growMs: 78_000,
    harvestQty: 3,
    xp: 24,
    unlockLevel: 42,
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    emoji: '🍃',
    seedCost: 40,
    growMs: 82_000,
    harvestQty: 3,
    xp: 25,
    unlockLevel: 45,
  },
  eggplant: {
    id: 'eggplant',
    name: 'Eggplant',
    emoji: '🍆',
    seedCost: 42,
    growMs: 85_000,
    harvestQty: 2,
    xp: 26,
    unlockLevel: 48,
  },
}

export const CROP_LIST = Object.values(CROPS)

export const SORTED_CROP_LIST = [...CROP_LIST].sort(
  (a, b) => a.unlockLevel - b.unlockLevel || a.name.localeCompare(b.name),
)

export function xpForLevel(level: number): number {
  return Math.floor(40 * level ** 1.45)
}

export function levelFromXp(xp: number): number {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return level
}

export function xpProgress(xp: number): { level: number; into: number; need: number } {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return { level, into: remaining, need: xpForLevel(level) }
}

export function cropsUnlockedAtLevel(level: number): CropId[] {
  return CROP_LIST.filter((c) => c.unlockLevel <= level).map((c) => c.id)
}

export function cropsCrossingLevels(oldLevel: number, newLevel: number): CropId[] {
  if (newLevel <= oldLevel) return []
  return CROP_LIST.filter(
    (c) => c.unlockLevel > oldLevel && c.unlockLevel <= newLevel,
  ).map((c) => c.id)
}

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
  oat: {
    id: 'oat',
    name: 'Oat',
    emoji: '🥣',
    seedCost: 12,
    growMs: 32_000,
    harvestQty: 2,
    xp: 8,
    unlockLevel: 3,
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
  berry: {
    id: 'berry',
    name: 'Berry',
    emoji: '🫐',
    seedCost: 18,
    growMs: 55_000,
    harvestQty: 3,
    xp: 14,
    unlockLevel: 3,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    seedCost: 20,
    growMs: 50_000,
    harvestQty: 3,
    xp: 15,
    unlockLevel: 3,
  },
  grape: {
    id: 'grape',
    name: 'Grape',
    emoji: '🍇',
    seedCost: 24,
    growMs: 60_000,
    harvestQty: 3,
    xp: 18,
    unlockLevel: 4,
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    emoji: '🎋',
    seedCost: 22,
    growMs: 58_000,
    harvestQty: 2,
    xp: 16,
    unlockLevel: 4,
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    emoji: '☁️',
    seedCost: 26,
    growMs: 70_000,
    harvestQty: 2,
    xp: 20,
    unlockLevel: 5,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    emoji: '🎃',
    seedCost: 28,
    growMs: 80_000,
    harvestQty: 1,
    xp: 22,
    unlockLevel: 4,
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    seedCost: 35,
    growMs: 90_000,
    harvestQty: 2,
    xp: 28,
    unlockLevel: 5,
  },
}

export const CROP_LIST = Object.values(CROPS)

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

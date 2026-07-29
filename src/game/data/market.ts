import { ITEM_META } from './buildings'
import { CROPS } from './crops'
import { MATERIAL_META } from './gear'
import { itemSellPrice, materialSellPrice, seedSellPrice } from './sellPrices'
import type { CropId, ItemId, MaterialId } from '../types'

export const MARKET_UNLOCK_LEVEL = 7

/** How long a listing stays active before expiring. */
export const LISTING_DURATION_MS = 48 * 60 * 60 * 1000

export type MarketItemKind = 'goods' | 'seeds' | 'materials'

const PRICE_MIN_MULT = 0.5
const PRICE_MAX_MULT = 2

export function marketBasePrice(kind: MarketItemKind, itemId: string): number {
  if (kind === 'goods') return itemSellPrice(itemId as ItemId)
  if (kind === 'seeds') return seedSellPrice(itemId as CropId)
  return materialSellPrice(itemId as MaterialId)
}

export function marketPriceBounds(
  kind: MarketItemKind,
  itemId: string,
): { min: number; max: number; base: number } {
  const base = marketBasePrice(kind, itemId)
  return {
    base,
    min: Math.max(1, Math.floor(base * PRICE_MIN_MULT)),
    max: Math.max(1, Math.ceil(base * PRICE_MAX_MULT)),
  }
}

export function isValidMarketPrice(
  kind: MarketItemKind,
  itemId: string,
  pricePerUnit: number,
): boolean {
  const { min, max } = marketPriceBounds(kind, itemId)
  return pricePerUnit >= min && pricePerUnit <= max
}

export function marketItemLabel(
  kind: MarketItemKind,
  itemId: string,
): { name: string; emoji: string } {
  if (kind === 'goods') {
    const meta = ITEM_META[itemId as ItemId]
    return { name: meta?.name ?? itemId, emoji: meta?.emoji ?? '📦' }
  }
  if (kind === 'seeds') {
    const crop = CROPS[itemId as CropId]
    return { name: crop?.name ?? itemId, emoji: crop?.emoji ?? '🌱' }
  }
  const meta = MATERIAL_META[itemId as MaterialId]
  return { name: meta?.name ?? itemId, emoji: meta?.emoji ?? '✨' }
}

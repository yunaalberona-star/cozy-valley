import { ITEM_META } from './buildings'
import { itemSellPrice } from './sellPrices'
import { itemObtainLevel } from './unlockOrder'
import type { ActiveShipOrder, ItemId } from '../types'

export const SHIP_SLOTS = 6
export const SHIP_REFRESH_MS = 4 * 60 * 60 * 1000

interface ShipItemTemplate {
  itemId: ItemId
  minQty: number
  maxQty: number
  minLevel: number
}

const SHIP_POOL: ShipItemTemplate[] = [
  { itemId: 'wheat', minQty: 4, maxQty: 12, minLevel: 1 },
  { itemId: 'carrot', minQty: 3, maxQty: 8, minLevel: 1 },
  { itemId: 'tomato', minQty: 2, maxQty: 6, minLevel: 2 },
  { itemId: 'bread', minQty: 1, maxQty: 4, minLevel: 2 },
  { itemId: 'egg', minQty: 2, maxQty: 6, minLevel: 2 },
  { itemId: 'milk', minQty: 2, maxQty: 5, minLevel: 3 },
  { itemId: 'cheese', minQty: 1, maxQty: 3, minLevel: 3 },
  { itemId: 'butter', minQty: 1, maxQty: 4, minLevel: 3 },
  { itemId: 'jam', minQty: 1, maxQty: 3, minLevel: 3 },
  { itemId: 'corn', minQty: 4, maxQty: 10, minLevel: 3 },
  { itemId: 'soup', minQty: 1, maxQty: 3, minLevel: 4 },
  { itemId: 'bacon', minQty: 1, maxQty: 4, minLevel: 5 },
  { itemId: 'pie', minQty: 1, maxQty: 2, minLevel: 4 },
  { itemId: 'cake', minQty: 1, maxQty: 2, minLevel: 5 },
  { itemId: 'wine', minQty: 1, maxQty: 2, minLevel: 6 },
  { itemId: 'candy', minQty: 2, maxQty: 5, minLevel: 6 },
  { itemId: 'grape_jam', minQty: 1, maxQty: 3, minLevel: 5 },
  { itemId: 'corn_bread', minQty: 1, maxQty: 3, minLevel: 4 },
  { itemId: 'juice', minQty: 1, maxQty: 4, minLevel: 3 },
  { itemId: 'goat_milk', minQty: 2, maxQty: 5, minLevel: 5 },
]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashPeriodKey(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shipPeriodKey(now = Date.now()): string {
  return Math.floor(now / SHIP_REFRESH_MS).toString()
}

export function msUntilShipRefresh(now = Date.now()): number {
  const period = Math.floor(now / SHIP_REFRESH_MS)
  return (period + 1) * SHIP_REFRESH_MS - now
}

export function formatShipCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function shipRewards(itemId: ItemId, qty: number, minLevel: number) {
  const base = itemSellPrice(itemId) * qty
  return {
    rewardCoins: Math.max(8, Math.ceil(base * 1.65)),
    rewardXp: Math.max(6, Math.ceil(qty * 2 + minLevel * 2)),
  }
}

function shipItemObtainable(template: ShipItemTemplate, playerLevel: number): boolean {
  return (
    template.minLevel <= playerLevel &&
    itemObtainLevel(template.itemId) <= playerLevel
  )
}

export function hasInvalidShipOrders(
  orders: ActiveShipOrder[],
  playerLevel: number,
): boolean {
  return orders.some(
    (o) => !o.filled && itemObtainLevel(o.itemId) > playerLevel,
  )
}

export function rollShipOrders(
  playerLevel: number,
  periodKey = shipPeriodKey(),
): ActiveShipOrder[] {
  const eligible = SHIP_POOL.filter((t) => shipItemObtainable(t, playerLevel))
  if (eligible.length === 0) return []

  const rand = mulberry32(hashPeriodKey(`ship:${periodKey}:${playerLevel}`))
  const shuffled = [...eligible]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const picked: ShipItemTemplate[] = []
  for (const template of shuffled) {
    if (picked.length >= SHIP_SLOTS) break
    if (picked.some((p) => p.itemId === template.itemId)) continue
    picked.push(template)
  }
  while (picked.length < SHIP_SLOTS && picked.length < shuffled.length) {
    const next = shuffled.find((t) => !picked.includes(t))
    if (!next) break
    picked.push(next)
  }

  return picked.map((template, slot) => {
    const span = template.maxQty - template.minQty
    const qty = template.minQty + Math.floor(rand() * (span + 1))
    const rewards = shipRewards(template.itemId, qty, template.minLevel)
    return {
      slot,
      itemId: template.itemId,
      qty,
      ...rewards,
      filled: false,
    }
  })
}

export function shipItemLabel(itemId: ItemId, qty: number): string {
  const meta = ITEM_META[itemId]
  return `${qty}× ${meta?.name ?? itemId}`
}

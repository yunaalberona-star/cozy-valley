import { itemObtainLevel } from './unlockOrder'
import type { ActiveOrder, ItemId, OrderDef } from '../types'

export const ORDER_SLOTS = 3

export const ORDERS: OrderDef[] = [
  {
    id: 'bakery-wheat',
    name: 'Bakery Run',
    emoji: '🥐',
    needs: { wheat: 4 },
    rewardCoins: 28,
    rewardXp: 12,
    unlockLevel: 1,
  },
  {
    id: 'salad-box',
    name: 'Salad Box',
    emoji: '🥗',
    needs: { carrot: 3, tomato: 2 },
    rewardCoins: 55,
    rewardXp: 20,
    unlockLevel: 2,
  },
  {
    id: 'breakfast',
    name: 'Breakfast Basket',
    emoji: '🧺',
    needs: { bread: 1, egg: 2 },
    rewardCoins: 85,
    rewardXp: 30,
    unlockLevel: 2,
  },
  {
    id: 'dairy-crate',
    name: 'Dairy Crate',
    emoji: '🧀',
    needs: { cheese: 1, milk: 2 },
    rewardCoins: 95,
    rewardXp: 34,
    unlockLevel: 3,
  },
  {
    id: 'jam-day',
    name: 'Market Jam Day',
    emoji: '🏪',
    needs: { jam: 1, juice: 1 },
    rewardCoins: 110,
    rewardXp: 40,
    unlockLevel: 3,
  },
  {
    id: 'picnic',
    name: 'Valley Picnic',
    emoji: '🧺',
    needs: { pie: 1, carrot: 2 },
    rewardCoins: 150,
    rewardXp: 55,
    unlockLevel: 4,
  },
  {
    id: 'harbor',
    name: 'Harbor Crate',
    emoji: '⚓',
    needs: { rope: 1, bread: 2 },
    rewardCoins: 180,
    rewardXp: 60,
    unlockLevel: 5,
  },
  {
    id: 'fair-cake',
    name: 'Fair Cake Order',
    emoji: '🎂',
    needs: { cake: 1 },
    rewardCoins: 260,
    rewardXp: 90,
    unlockLevel: 5,
  },
  {
    id: 'butter-run',
    name: 'Butter Run',
    emoji: '🧈',
    needs: { butter: 2, bread: 1 },
    rewardCoins: 120,
    rewardXp: 42,
    unlockLevel: 3,
  },
  {
    id: 'corn-crate',
    name: 'Corn Crate',
    emoji: '🌽',
    needs: { corn: 6, cornmeal: 1 },
    rewardCoins: 95,
    rewardXp: 35,
    unlockLevel: 3,
  },
  {
    id: 'wine-tasting',
    name: 'Wine Tasting',
    emoji: '🍷',
    needs: { wine: 1, grape: 4 },
    rewardCoins: 220,
    rewardXp: 75,
    unlockLevel: 6,
  },
  {
    id: 'candy-gift',
    name: 'Candy Gift Box',
    emoji: '🍭',
    needs: { candy: 2, sugar: 2 },
    rewardCoins: 200,
    rewardXp: 68,
    unlockLevel: 6,
  },
  {
    id: 'bacon-breakfast',
    name: 'Bacon Breakfast',
    emoji: '🥓',
    needs: { bacon: 2, egg: 3, bread: 1 },
    rewardCoins: 175,
    rewardXp: 62,
    unlockLevel: 5,
  },
  {
    id: 'goat-dairy',
    name: 'Goat Dairy Box',
    emoji: '🐐',
    needs: { goat_milk: 3, cheese: 1 },
    rewardCoins: 165,
    rewardXp: 58,
    unlockLevel: 5,
  },
  {
    id: 'harvest-soup',
    name: 'Soup Kitchen',
    emoji: '🍲',
    needs: { soup: 2, carrot: 4 },
    rewardCoins: 140,
    rewardXp: 50,
    unlockLevel: 4,
  },
  {
    id: 'sweet-picnic',
    name: 'Sweet Picnic',
    emoji: '🧺',
    needs: { grape_jam: 1, berry_juice: 1, corn_bread: 1 },
    rewardCoins: 195,
    rewardXp: 70,
    unlockLevel: 5,
  },
  {
    id: 'autumn-feast',
    name: 'Autumn Feast',
    emoji: '🎃',
    needs: { pie: 1, soup: 1, pumpkin: 3 },
    rewardCoins: 240,
    rewardXp: 85,
    unlockLevel: 6,
  },
]

export function orderObtainLevel(needs: Partial<Record<ItemId, number>>): number {
  const ids = Object.keys(needs) as ItemId[]
  if (ids.length === 0) return 1
  return Math.max(...ids.map(itemObtainLevel))
}

export function isOrderObtainableAtLevel(
  order: OrderDef,
  playerLevel: number,
): boolean {
  return (
    order.unlockLevel <= playerLevel &&
    orderObtainLevel(order.needs) <= playerLevel
  )
}

export function ordersAvailableAtLevel(
  level: number,
  exclude: string[] = [],
): OrderDef[] {
  return ORDERS.filter(
    (o) => isOrderObtainableAtLevel(o, level) && !exclude.includes(o.id),
  )
}

export function pickActiveOrders(
  level: number,
  exclude: string[] = [],
): ActiveOrder[] {
  const pool = ordersAvailableAtLevel(level, exclude)
  const fallback = ordersAvailableAtLevel(level)
  const source = pool.length >= ORDER_SLOTS ? pool : fallback
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, ORDER_SLOTS).map((o, slot) => ({
    orderId: o.id,
    slot,
  }))
}

export function pickReplacementOrderId(
  level: number,
  exclude: string[],
): string | null {
  const available = ordersAvailableAtLevel(level)
  const fresh = available.filter((o) => !exclude.includes(o.id))
  const pool = fresh.length > 0 ? fresh : available
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]!.id
}

export function orderDefById(orderId: string): OrderDef | undefined {
  return ORDERS.find((o) => o.id === orderId)
}

export function hasInvalidActiveOrders(
  activeOrders: ActiveOrder[],
  level: number,
): boolean {
  return activeOrders.some((o) => {
    const def = orderDefById(o.orderId)
    return !def || !isOrderObtainableAtLevel(def, level)
  })
}

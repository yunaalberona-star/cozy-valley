import type { MissionGoal, MissionGoalKind } from '../types'

export const DAILY_GOAL_SLOTS = 3
export const WEEKLY_GOAL_SLOTS = 5

export const DAILY_ALL_BONUS = {
  rewardCoins: 50,
  rewardXp: 25,
}

export const WEEKLY_ALL_BONUS = {
  rewardCoins: 350,
  rewardXp: 150,
}

export const DAILY_GOALS_PARENT_ID = 'daily_goals'
export const WEEKLY_GOALS_PARENT_ID = 'weekly_goals'

/** Fixed UTC+4 — weekly ranking week resets here. */
export const WEEKLY_RESET_TZ_OFFSET_MS = 4 * 60 * 60 * 1000
export const WEEKLY_RESET_LABEL = 'Tue 12:00 AM GMT+4'

export interface GoalBonus {
  rewardCoins: number
  rewardXp: number
}

export interface GoalTemplate {
  id: string
  kind: MissionGoalKind
  target?: string
  amount: number
  label: string
  minLevel: number
  rewardCoins: number
  rewardXp: number
}

export interface ScheduledGoalSlot {
  slotId: string
  templateId: string
  kind: MissionGoalKind
  target?: string
  amount: number
  label: string
  rewardCoins: number
  rewardXp: number
  claimed: boolean
}

export const DAILY_POOL: GoalTemplate[] = [
  {
    id: 'daily_harvest_wheat',
    kind: 'harvest',
    target: 'wheat',
    amount: 8,
    label: 'Harvest 8 Wheat',
    minLevel: 1,
    rewardCoins: 28,
    rewardXp: 12,
  },
  {
    id: 'daily_harvest_carrot',
    kind: 'harvest',
    target: 'carrot',
    amount: 6,
    label: 'Harvest 6 Carrot',
    minLevel: 1,
    rewardCoins: 30,
    rewardXp: 12,
  },
  {
    id: 'daily_harvest_tomato',
    kind: 'harvest',
    target: 'tomato',
    amount: 5,
    label: 'Harvest 5 Tomato',
    minLevel: 3,
    rewardCoins: 32,
    rewardXp: 14,
  },
  {
    id: 'daily_craft_bread',
    kind: 'craft',
    target: 'bread',
    amount: 2,
    label: 'Bake 2 Bread',
    minLevel: 1,
    rewardCoins: 35,
    rewardXp: 15,
  },
  {
    id: 'daily_craft_jam',
    kind: 'craft',
    target: 'jam',
    amount: 1,
    label: 'Make 1 Jam',
    minLevel: 3,
    rewardCoins: 38,
    rewardXp: 16,
  },
  {
    id: 'daily_craft_salad',
    kind: 'craft',
    target: 'salad',
    amount: 1,
    label: 'Make 1 Garden Salad',
    minLevel: 8,
    rewardCoins: 45,
    rewardXp: 18,
  },
  {
    id: 'daily_craft_salad_3',
    kind: 'craft',
    target: 'salad',
    amount: 3,
    label: 'Make 3 Garden Salads',
    minLevel: 10,
    rewardCoins: 65,
    rewardXp: 28,
  },
  {
    id: 'daily_craft_grilled',
    kind: 'craft',
    target: 'grilled_veg',
    amount: 2,
    label: 'Grill 2 Veg',
    minLevel: 8,
    rewardCoins: 48,
    rewardXp: 20,
  },
  {
    id: 'daily_fulfill_order',
    kind: 'fulfill_order',
    amount: 1,
    label: 'Fulfill 1 Order',
    minLevel: 3,
    rewardCoins: 40,
    rewardXp: 15,
  },
  {
    id: 'daily_fulfill_orders_2',
    kind: 'fulfill_order',
    amount: 2,
    label: 'Fulfill 2 Orders',
    minLevel: 5,
    rewardCoins: 55,
    rewardXp: 22,
  },
  {
    id: 'daily_collect_egg',
    kind: 'collect_animal',
    target: 'egg',
    amount: 3,
    label: 'Collect 3 Eggs',
    minLevel: 4,
    rewardCoins: 34,
    rewardXp: 14,
  },
  {
    id: 'daily_collect_milk',
    kind: 'collect_animal',
    target: 'milk',
    amount: 2,
    label: 'Collect 2 Milk',
    minLevel: 6,
    rewardCoins: 38,
    rewardXp: 16,
  },
  {
    id: 'daily_adventure',
    kind: 'complete_adventure',
    amount: 1,
    label: 'Complete 1 Adventure',
    minLevel: 15,
    rewardCoins: 80,
    rewardXp: 35,
  },
]

export const WEEKLY_POOL: GoalTemplate[] = [
  {
    id: 'weekly_harvest_wheat',
    kind: 'harvest',
    target: 'wheat',
    amount: 200,
    label: 'Harvest 200 Wheat',
    minLevel: 1,
    rewardCoins: 280,
    rewardXp: 110,
  },
  {
    id: 'weekly_harvest_carrot',
    kind: 'harvest',
    target: 'carrot',
    amount: 150,
    label: 'Harvest 150 Carrot',
    minLevel: 1,
    rewardCoins: 300,
    rewardXp: 120,
  },
  {
    id: 'weekly_harvest_tomato',
    kind: 'harvest',
    target: 'tomato',
    amount: 120,
    label: 'Harvest 120 Tomato',
    minLevel: 3,
    rewardCoins: 320,
    rewardXp: 130,
  },
  {
    id: 'weekly_craft_bread',
    kind: 'craft',
    target: 'bread',
    amount: 50,
    label: 'Bake 50 Bread',
    minLevel: 1,
    rewardCoins: 350,
    rewardXp: 140,
  },
  {
    id: 'weekly_craft_jam',
    kind: 'craft',
    target: 'jam',
    amount: 25,
    label: 'Make 25 Jam',
    minLevel: 3,
    rewardCoins: 340,
    rewardXp: 135,
  },
  {
    id: 'weekly_craft_salad',
    kind: 'craft',
    target: 'salad',
    amount: 35,
    label: 'Make 35 Garden Salads',
    minLevel: 8,
    rewardCoins: 420,
    rewardXp: 170,
  },
  {
    id: 'weekly_craft_grilled',
    kind: 'craft',
    target: 'grilled_veg',
    amount: 30,
    label: 'Grill 30 Veg',
    minLevel: 8,
    rewardCoins: 400,
    rewardXp: 165,
  },
  {
    id: 'weekly_craft_cheese',
    kind: 'craft',
    target: 'cheese',
    amount: 25,
    label: 'Make 25 Cheese',
    minLevel: 6,
    rewardCoins: 380,
    rewardXp: 155,
  },
  {
    id: 'weekly_craft_wine',
    kind: 'craft',
    target: 'wine',
    amount: 15,
    label: 'Bottle 15 Wine',
    minLevel: 10,
    rewardCoins: 450,
    rewardXp: 180,
  },
  {
    id: 'weekly_craft_cake',
    kind: 'craft',
    target: 'cake',
    amount: 12,
    label: 'Bake 12 Cakes',
    minLevel: 12,
    rewardCoins: 480,
    rewardXp: 190,
  },
  {
    id: 'weekly_fulfill_orders',
    kind: 'fulfill_order',
    amount: 30,
    label: 'Fulfill 30 Orders',
    minLevel: 3,
    rewardCoins: 500,
    rewardXp: 200,
  },
  {
    id: 'weekly_collect_egg',
    kind: 'collect_animal',
    target: 'egg',
    amount: 80,
    label: 'Collect 80 Eggs',
    minLevel: 4,
    rewardCoins: 360,
    rewardXp: 145,
  },
  {
    id: 'weekly_collect_milk',
    kind: 'collect_animal',
    target: 'milk',
    amount: 60,
    label: 'Collect 60 Milk',
    minLevel: 6,
    rewardCoins: 370,
    rewardXp: 150,
  },
  {
    id: 'weekly_collect_honey',
    kind: 'collect_animal',
    target: 'honey',
    amount: 40,
    label: 'Collect 40 Honey',
    minLevel: 8,
    rewardCoins: 390,
    rewardXp: 160,
  },
  {
    id: 'weekly_adventures',
    kind: 'complete_adventure',
    amount: 12,
    label: 'Complete 12 Adventures',
    minLevel: 15,
    rewardCoins: 550,
    rewardXp: 220,
  },
  {
    id: 'weekly_gather_iron',
    kind: 'gather_material',
    target: 'iron_ore',
    amount: 50,
    label: 'Gather 50 Iron Ore',
    minLevel: 12,
    rewardCoins: 430,
    rewardXp: 175,
  },
  {
    id: 'weekly_gather_timber',
    kind: 'gather_material',
    target: 'timber',
    amount: 45,
    label: 'Gather 45 Timber',
    minLevel: 12,
    rewardCoins: 430,
    rewardXp: 175,
  },
  {
    id: 'weekly_craft_gear',
    kind: 'craft_gear',
    amount: 8,
    label: 'Craft 8 Gear Pieces',
    minLevel: 15,
    rewardCoins: 520,
    rewardXp: 210,
  },
  {
    id: 'weekly_recruit',
    kind: 'recruit',
    amount: 2,
    label: 'Recruit 2 Adventurers',
    minLevel: 15,
    rewardCoins: 460,
    rewardXp: 185,
  },
  {
    id: 'weekly_soup',
    kind: 'craft',
    target: 'soup',
    amount: 20,
    label: 'Cook 20 Soup',
    minLevel: 10,
    rewardCoins: 410,
    rewardXp: 165,
  },
  {
    id: 'weekly_pie',
    kind: 'craft',
    target: 'pie',
    amount: 18,
    label: 'Bake 18 Pies',
    minLevel: 8,
    rewardCoins: 400,
    rewardXp: 160,
  },
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

function resetZoneParts(now = Date.now()) {
  const z = new Date(now + WEEKLY_RESET_TZ_OFFSET_MS)
  return {
    year: z.getUTCFullYear(),
    month: z.getUTCMonth(),
    date: z.getUTCDate(),
    day: z.getUTCDay(),
    hour: z.getUTCHours(),
    minute: z.getUTCMinutes(),
    second: z.getUTCSeconds(),
    ms: z.getUTCMilliseconds(),
  }
}

function resetZoneTimestamp(
  year: number,
  month: number,
  date: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
): number {
  return (
    Date.UTC(year, month, date, hour, minute, second, ms) -
    WEEKLY_RESET_TZ_OFFSET_MS
  )
}

export function periodDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/** Ranking week id — resets every Tuesday 00:00 UTC+4. */
export function periodWeekKey(now = Date.now()): string {
  const p = resetZoneParts(now)
  const daysSinceTuesday = (p.day + 7 - 2) % 7
  const start = new Date(Date.UTC(p.year, p.month, p.date - daysSinceTuesday))
  return `${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()}`
}

export function msUntilDailyReset(now = Date.now()): number {
  const d = new Date(now)
  d.setHours(24, 0, 0, 0)
  return Math.max(0, d.getTime() - now)
}

export function msUntilWeeklyReset(now = Date.now()): number {
  const p = resetZoneParts(now)
  let daysUntil = (2 - p.day + 7) % 7
  if (daysUntil === 0) {
    const afterMidnight =
      p.hour > 0 || p.minute > 0 || p.second > 0 || p.ms > 0
    if (afterMidnight) daysUntil = 7
  }
  return Math.max(
    0,
    resetZoneTimestamp(p.year, p.month, p.date + daysUntil) - now,
  )
}

/** Day keys (UTC+4) from the current ranking week start through today. */
export function dayKeysInRankingWeek(now = Date.now()): string[] {
  const p = resetZoneParts(now)
  const daysSinceTuesday = (p.day + 7 - 2) % 7
  const keys: string[] = []
  for (let i = 0; i <= daysSinceTuesday; i++) {
    const d = new Date(Date.UTC(p.year, p.month, p.date - daysSinceTuesday + i))
    keys.push(
      `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`,
    )
  }
  return keys
}

function rollFromPool(
  pool: GoalTemplate[],
  count: number,
  playerLevel: number,
  periodKey: string,
  slotPrefix: string,
): ScheduledGoalSlot[] {
  const eligible = pool.filter((t) => t.minLevel <= playerLevel)
  if (eligible.length === 0) return []

  const rand = mulberry32(hashPeriodKey(periodKey))
  const shuffled = [...eligible]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const picked: GoalTemplate[] = []
  const usedKinds = new Set<string>()
  for (const template of shuffled) {
    if (picked.length >= count) break
    const kindKey = `${template.kind}:${template.target ?? ''}`
    if (usedKinds.has(kindKey) && eligible.length > count) continue
    picked.push(template)
    usedKinds.add(kindKey)
  }
  while (picked.length < count && picked.length < shuffled.length) {
    const next = shuffled.find((t) => !picked.includes(t))
    if (!next) break
    picked.push(next)
  }

  return picked.map((template, index) => ({
    slotId: `${slotPrefix}${index}`,
    templateId: template.id,
    kind: template.kind,
    target: template.target,
    amount: template.amount,
    label: template.label,
    rewardCoins: template.rewardCoins,
    rewardXp: template.rewardXp,
    claimed: false,
  }))
}

export function rollDailyGoals(
  playerLevel: number,
  periodKey = periodDayKey(),
): ScheduledGoalSlot[] {
  return rollFromPool(
    DAILY_POOL,
    DAILY_GOAL_SLOTS,
    playerLevel,
    `daily:${periodKey}`,
    'd',
  )
}

export function rollWeeklyGoals(
  playerLevel: number,
  periodKey = periodWeekKey(),
): ScheduledGoalSlot[] {
  return rollFromPool(
    WEEKLY_POOL,
    WEEKLY_GOAL_SLOTS,
    playerLevel,
    `weekly:${periodKey}`,
    'w',
  )
}

export function slotsToMissionGoals(slots: ScheduledGoalSlot[]): MissionGoal[] {
  return slots
    .filter((s) => !s.claimed)
    .map((s) => ({
      id: s.slotId,
      kind: s.kind,
      target: s.target,
      amount: s.amount,
      label: s.label,
    }))
}

export function allSlotsClaimed(slots: ScheduledGoalSlot[]): boolean {
  return slots.length > 0 && slots.every((s) => s.claimed)
}

export function slotComplete(
  slot: ScheduledGoalSlot,
  progress: Record<string, number>,
  parentId: string,
): boolean {
  const key = `${parentId}:${slot.slotId}`
  return (progress[key] ?? 0) >= slot.amount
}

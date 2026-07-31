import type { MissionGoalKind } from '../types'

export type AchievementKind =
  | MissionGoalKind
  | 'plant_tree'
  | 'market_sell'
  | 'purchase_building'
  | 'claim_mission'
  | 'reach_level'

export interface AchievementDef {
  id: string
  title: string
  description: string
  badge: string
  kind: AchievementKind
  target?: string
  amount: number
  rewardCoins: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_harvest',
    title: 'First Harvest',
    description: 'Harvest your first crop.',
    badge: '🌱',
    kind: 'harvest',
    amount: 1,
    rewardCoins: 25,
  },
  {
    id: 'first_bread',
    title: 'Fresh Bread',
    description: 'Bake your first loaf of bread.',
    badge: '🍞',
    kind: 'craft',
    target: 'bread',
    amount: 1,
    rewardCoins: 30,
  },
  {
    id: 'first_orchard',
    title: 'Orchard Starter',
    description: 'Plant your first orchard tree.',
    badge: '🍎',
    kind: 'plant_tree',
    amount: 1,
    rewardCoins: 50,
  },
  {
    id: 'orchard_grove',
    title: 'Growing Grove',
    description: 'Plant 5 orchard trees.',
    badge: '🌳',
    kind: 'plant_tree',
    amount: 5,
    rewardCoins: 120,
  },
  {
    id: 'market_debut',
    title: 'Market Debut',
    description: 'Sell 10 items on the player market.',
    badge: '🏪',
    kind: 'market_sell',
    amount: 10,
    rewardCoins: 75,
  },
  {
    id: 'market_mogul',
    title: 'Market Mogul',
    description: 'Sell 100 items on the player market.',
    badge: '💰',
    kind: 'market_sell',
    amount: 100,
    rewardCoins: 300,
  },
  {
    id: 'first_recruit',
    title: 'First Recruit',
    description: 'Recruit your first adventurer.',
    badge: '🧭',
    kind: 'recruit',
    amount: 1,
    rewardCoins: 80,
  },
  {
    id: 'party_of_four',
    title: 'Party of Four',
    description: 'Recruit 4 adventurers.',
    badge: '⚔️',
    kind: 'recruit',
    amount: 4,
    rewardCoins: 200,
  },
  {
    id: 'first_animal',
    title: 'Animal Friend',
    description: 'Buy your first farm animal.',
    badge: '🐔',
    kind: 'buy_animal',
    amount: 1,
    rewardCoins: 40,
  },
  {
    id: 'order_runner',
    title: 'Order Runner',
    description: 'Fulfill 5 orders.',
    badge: '📦',
    kind: 'fulfill_order',
    amount: 5,
    rewardCoins: 55,
  },
  {
    id: 'order_pro',
    title: 'Order Pro',
    description: 'Fulfill 25 orders.',
    badge: '🚚',
    kind: 'fulfill_order',
    amount: 25,
    rewardCoins: 150,
  },
  {
    id: 'first_adventure',
    title: 'Trailblazer',
    description: 'Complete your first adventure.',
    badge: '🗺️',
    kind: 'complete_adventure',
    amount: 1,
    rewardCoins: 100,
  },
  {
    id: 'adventure_veteran',
    title: 'Adventure Veteran',
    description: 'Complete 10 adventures.',
    badge: '🏔️',
    kind: 'complete_adventure',
    amount: 10,
    rewardCoins: 220,
  },
  {
    id: 'first_machine',
    title: 'Machine Shop',
    description: 'Purchase your first production machine.',
    badge: '🏭',
    kind: 'purchase_building',
    amount: 1,
    rewardCoins: 60,
  },
  {
    id: 'mission_starter',
    title: 'Story Begins',
    description: 'Complete your first story mission.',
    badge: '📜',
    kind: 'claim_mission',
    amount: 1,
    rewardCoins: 40,
  },
  {
    id: 'mission_hero',
    title: 'Mission Hero',
    description: 'Complete 10 story missions.',
    badge: '🌟',
    kind: 'claim_mission',
    amount: 10,
    rewardCoins: 180,
  },
  {
    id: 'level_10',
    title: 'Level 10',
    description: 'Reach player level 10.',
    badge: '⭐',
    kind: 'reach_level',
    amount: 10,
    rewardCoins: 100,
  },
  {
    id: 'level_25',
    title: 'Level 25',
    description: 'Reach player level 25.',
    badge: '✨',
    kind: 'reach_level',
    amount: 25,
    rewardCoins: 250,
  },
  {
    id: 'harvest_master',
    title: 'Harvest Master',
    description: 'Harvest 200 crops and tree fruit.',
    badge: '🌾',
    kind: 'harvest',
    amount: 200,
    rewardCoins: 130,
  },
  {
    id: 'master_crafter',
    title: 'Master Crafter',
    description: 'Craft 50 goods.',
    badge: '👨‍🍳',
    kind: 'craft',
    amount: 50,
    rewardCoins: 140,
  },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)

export function achievementProgressValue(
  progress: Record<string, number>,
  id: string,
): number {
  return progress[id] ?? 0
}

export function isAchievementComplete(
  ach: AchievementDef,
  progress: Record<string, number>,
): boolean {
  return achievementProgressValue(progress, ach.id) >= ach.amount
}

export function isAchievementClaimed(
  id: string,
  claimed: string[],
): boolean {
  return claimed.includes(id)
}

export function achievementsReadyToClaim(
  progress: Record<string, number>,
  claimed: string[],
): AchievementDef[] {
  return ACHIEVEMENTS.filter(
    (a) =>
      !isAchievementClaimed(a.id, claimed) &&
      isAchievementComplete(a, progress),
  )
}

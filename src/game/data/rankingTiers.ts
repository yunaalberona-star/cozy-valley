export type GoalPeriodKind = 'daily' | 'weekly'

export interface RankingTier {
  /** Inclusive upper bound for this tier (1 = first place only). */
  maxRank: number
  pointsDaily: number
  pointsWeekly: number
  label: string
}

/** Earlier finishers earn more ranking points. */
export const RANKING_TIERS: RankingTier[] = [
  { maxRank: 1, pointsDaily: 80, pointsWeekly: 500, label: '1st' },
  { maxRank: 3, pointsDaily: 50, pointsWeekly: 320, label: '2nd–3rd' },
  { maxRank: 10, pointsDaily: 35, pointsWeekly: 220, label: '4th–10th' },
  { maxRank: 50, pointsDaily: 20, pointsWeekly: 140, label: '11th–50th' },
  { maxRank: Number.POSITIVE_INFINITY, pointsDaily: 10, pointsWeekly: 80, label: '51+' },
]

export function rankingPointsForRank(
  period: GoalPeriodKind,
  rank: number,
): number {
  const r = Math.max(1, Math.floor(rank))
  for (const tier of RANKING_TIERS) {
    if (r <= tier.maxRank) {
      return period === 'daily' ? tier.pointsDaily : tier.pointsWeekly
    }
  }
  const rest = RANKING_TIERS[RANKING_TIERS.length - 1]
  return period === 'daily' ? rest.pointsDaily : rest.pointsWeekly
}

export function rankingTierLabel(rank: number): string {
  const r = Math.max(1, Math.floor(rank))
  for (const tier of RANKING_TIERS) {
    if (r <= tier.maxRank) return tier.label
  }
  return RANKING_TIERS[RANKING_TIERS.length - 1].label
}

/** Base rank when offline or ranking server unavailable. */
export const FALLBACK_RANK = 51

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './marketClient'
import { getPlayerId } from './marketClient'
import type { GoalPeriodKind } from './data/rankingTiers'
import { rankingPointsForRank } from './data/rankingTiers'

export class RankingError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'RankingError'
    this.code = code
  }
}

export interface GoalRankingResult {
  rank: number
  total: number
}

let client: SupabaseClient | null = null

function readEnv(name: string): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function getClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new RankingError(
      'Ranking is not configured. Add Supabase env vars on Vercel.',
      'not_configured',
    )
  }
  if (!client) {
    const url = readEnv('VITE_SUPABASE_URL')
    const key =
      readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
      readEnv('VITE_SUPABASE_ANON_KEY')
    client = createClient(url, key)
  }
  return client
}

function wrapError(err: unknown): RankingError {
  if (err instanceof RankingError) return err
  const e = err as { code?: string; message?: string }
  if (
    e.code === '42P01' ||
    e.code === 'PGRST205' ||
    e.message?.includes('does not exist')
  ) {
    return new RankingError(
      'Ranking tables not found — run supabase/market_schema.sql in Supabase.',
      'missing_tables',
    )
  }
  return new RankingError(e.message ?? 'Ranking request failed', e.code)
}

export async function submitGoalRanking(
  playerName: string,
  periodKind: GoalPeriodKind,
  periodKey: string,
  playerId = getPlayerId(),
): Promise<GoalRankingResult> {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('submit_goal_ranking', {
    p_player_id: playerId,
    p_player_name: playerName,
    p_period_kind: periodKind,
    p_period_key: periodKey,
  })

  if (error) throw wrapError(error)

  const row = data as { rank?: number; total?: number } | null
  const rank = Number(row?.rank ?? 0)
  const total = Number(row?.total ?? 0)
  if (!rank) {
    throw new RankingError('Invalid ranking response from server', 'bad_response')
  }
  return { rank, total }
}

export interface GoalRankingRow {
  player_id: string
  player_name: string
  completed_at: string
  rank: number
}

export async function fetchGoalRankingLeaderboard(
  periodKind: GoalPeriodKind,
  periodKey: string,
  limit = 50,
): Promise<GoalRankingRow[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('goal_ranking_entries')
    .select('player_id, player_name, completed_at')
    .eq('period_kind', periodKind)
    .eq('period_key', periodKey)
    .order('completed_at', { ascending: true })
    .limit(limit)

  if (error) throw wrapError(error)
  return (data ?? []).map((row, index) => ({
    ...row,
    rank: index + 1,
  })) as GoalRankingRow[]
}

export interface RankingPointsRow {
  player_id: string
  player_name: string
  points: number
  rank: number
}

function addRankingPoints(
  totals: Map<string, { name: string; points: number }>,
  playerId: string,
  playerName: string,
  points: number,
) {
  const cur = totals.get(playerId)
  if (cur) {
    cur.points += points
    if (playerName) cur.name = playerName
  } else {
    totals.set(playerId, { name: playerName, points })
  }
}

/** Sum daily + weekly goal bonus points for the current ranking week. */
export async function fetchRankingWeekPointsLeaderboard(
  weekKey: string,
  dayKeys: string[],
  limit = 50,
): Promise<RankingPointsRow[]> {
  const totals = new Map<string, { name: string; points: number }>()

  const weekly = await fetchGoalRankingLeaderboard('weekly', weekKey, 200)
  for (const row of weekly) {
    addRankingPoints(
      totals,
      row.player_id,
      row.player_name,
      rankingPointsForRank('weekly', row.rank),
    )
  }

  for (const dayKey of dayKeys) {
    const daily = await fetchGoalRankingLeaderboard('daily', dayKey, 200)
    for (const row of daily) {
      addRankingPoints(
        totals,
        row.player_id,
        row.player_name,
        rankingPointsForRank('daily', row.rank),
      )
    }
  }

  return [...totals.entries()]
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, limit)
    .map(([player_id, v], index) => ({
      player_id,
      player_name: v.name,
      points: v.points,
      rank: index + 1,
    }))
}

export { isSupabaseConfigured } from './marketClient'

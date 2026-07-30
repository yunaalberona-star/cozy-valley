import type { EventDef, MissionDef } from '../types'
import { buildMissionChain, pickNextMission } from './missionChain'

/**
 * Story missions scale to level 50 — machines & animals unlock by player level.
 * Complete goals → claim coin/XP rewards (no building unlocks on missions).
 */
export const MISSIONS: MissionDef[] = buildMissionChain(50)

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))

export { pickNextMission }

/** Limited events — start anytime; rewards while active. */
export const EVENTS: EventDef[] = [
  {
    id: 'ev_harvest_fest',
    name: 'Harvest Festival',
    emoji: '🎪',
    blurb: 'A weekend fair wants wheat, bread, and jam.',
    durationMs: 20 * 60_000,
    goals: [
      { id: 'g1', kind: 'harvest', target: 'wheat', amount: 10, label: 'Harvest 10 Wheat' },
      { id: 'g2', kind: 'craft', target: 'bread', amount: 2, label: 'Bake 2 Bread' },
      { id: 'g3', kind: 'craft', target: 'jam', amount: 1, label: 'Make 1 Jam' },
    ],
    rewardCoins: 180,
    rewardXp: 70,
    rewardItems: { sugar: 3, chicken_feed: 3, cow_feed: 2 },
  },
  {
    id: 'ev_barn_dance',
    name: 'Barn Dance',
    emoji: '💃',
    blurb: 'Neighbors need cheese, eggs, and a cozy sweater.',
    durationMs: 25 * 60_000,
    goals: [
      { id: 'g1', kind: 'collect_animal', target: 'egg', amount: 4, label: 'Collect 4 Eggs' },
      { id: 'g2', kind: 'craft', target: 'cheese', amount: 2, label: 'Make 2 Cheese' },
      { id: 'g3', kind: 'craft', target: 'sweater', amount: 1, label: 'Sew 1 Sweater' },
    ],
    rewardCoins: 220,
    rewardXp: 90,
    rewardItems: { cloth: 1 },
    unlocks: [],
  },
]

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]))

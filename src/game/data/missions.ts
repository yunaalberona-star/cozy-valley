import type { EventDef, MissionDef } from '../types'
import {
  buildMissionChain,
  pickNextMission,
  resolveActiveMission,
  isMissionLevelGated,
  findNextMissionInChain,
} from './missionChain'

/**
 * Story missions scale to level 50 — machines & animals unlock by player level.
 * Chapter-based narrative like Family Farm Seaside; rewards are coins/XP only.
 */
export const MISSIONS: MissionDef[] = buildMissionChain(50)

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))

export {
  pickNextMission,
  resolveActiveMission,
  isMissionLevelGated,
  findNextMissionInChain,
}

/** Limited-time events with multi-stage goals — start anytime while active. */
export const EVENTS: EventDef[] = [
  {
    id: 'ev_harvest_fest',
    name: 'Harvest Festival',
    emoji: '🎪',
    blurb: 'A weekend fair wants wheat, bread, and jam — three stages of celebration.',
    durationMs: 25 * 60_000,
    stages: [
      {
        id: 's1_fields',
        name: 'Stage 1 · Golden Fields',
        story: 'Fair organizers need wheat bundles for the parade floats.',
        goals: [
          { id: 'g1', kind: 'harvest', target: 'wheat', amount: 10, label: 'Harvest 10 Wheat' },
        ],
        rewards: {
          rewardCoins: 60,
          rewardXp: 25,
          rewardSeeds: { corn: 5, carrot: 3 },
        },
      },
      {
        id: 's2_bakery',
        name: 'Stage 2 · Bakery Booth',
        story: 'The bread contest opens — bake loaves for the judges.',
        goals: [
          { id: 'g1', kind: 'craft', target: 'bread', amount: 2, label: 'Bake 2 Bread' },
        ],
        rewards: {
          rewardCoins: 80,
          rewardXp: 35,
          rewardItems: { sugar: 2 },
        },
      },
      {
        id: 's3_jam',
        name: 'Stage 3 · Jam Jar Finale',
        story: 'Last call for preserves! One jar of jam seals the deal.',
        goals: [
          { id: 'g1', kind: 'craft', target: 'jam', amount: 1, label: 'Make 1 Jam' },
        ],
        rewards: {
          rewardCoins: 100,
          rewardXp: 45,
          rewardItems: { chicken_feed: 3, cow_feed: 2 },
        },
      },
    ],
    finaleReward: {
      rewardCoins: 50,
      rewardXp: 30,
      rewardSeeds: { berry: 5, strawberry: 3 },
    },
  },
  {
    id: 'ev_barn_dance',
    name: 'Barn Dance',
    emoji: '💃',
    blurb: 'Neighbors need cheese, eggs, and a cozy sweater — earn a special animal building.',
    durationMs: 30 * 60_000,
    stages: [
      {
        id: 's1_eggs',
        name: 'Stage 1 · Egg Gathering',
        story: 'Collect eggs for the barn dance breakfast spread.',
        goals: [
          { id: 'g1', kind: 'collect_animal', target: 'egg', amount: 4, label: 'Collect 4 Eggs' },
        ],
        rewards: {
          rewardCoins: 70,
          rewardXp: 30,
          rewardItems: { chicken_feed: 4 },
        },
      },
      {
        id: 's2_cheese',
        name: 'Stage 2 · Cheese Platter',
        story: 'Churn cheese wheels for the dance hall snack table.',
        goals: [
          { id: 'g1', kind: 'craft', target: 'cheese', amount: 2, label: 'Make 2 Cheese' },
        ],
        rewards: {
          rewardCoins: 90,
          rewardXp: 40,
          rewardItems: { butter: 1 },
        },
      },
      {
        id: 's3_sweater',
        name: 'Stage 3 · Cozy Threads',
        story: 'Sew a sweater — the dance prize for best-dressed farmer.',
        goals: [
          { id: 'g1', kind: 'craft', target: 'sweater', amount: 1, label: 'Sew 1 Sweater' },
        ],
        rewards: {
          rewardCoins: 110,
          rewardXp: 50,
          rewardItems: { cloth: 2 },
        },
      },
    ],
    finaleReward: {
      rewardCoins: 60,
      rewardXp: 35,
    },
  },
  {
    id: 'ev_spring_fair',
    name: 'Spring Planting Fair',
    emoji: '🌸',
    blurb: 'Plant, press juice, and fulfill orders — unlock the Jam Maker early!',
    durationMs: 35 * 60_000,
    stages: [
      {
        id: 's1_plant',
        name: 'Stage 1 · Seedlings',
        story: 'Plant a spring crop and show off your green thumb.',
        goals: [
          { id: 'g1', kind: 'harvest', target: 'tomato', amount: 6, label: 'Harvest 6 Tomato' },
        ],
        rewards: {
          rewardCoins: 55,
          rewardXp: 28,
          rewardSeeds: { tomato: 5, berry: 3 },
        },
      },
      {
        id: 's2_juice',
        name: 'Stage 2 · Fresh Press',
        story: 'Run the juice press for the fair tasting tent.',
        goals: [
          { id: 'g1', kind: 'craft', target: 'juice', amount: 2, label: 'Make 2 Juice' },
        ],
        rewards: {
          rewardCoins: 85,
          rewardXp: 38,
          rewardItems: { grape_juice: 1 },
        },
      },
      {
        id: 's3_orders',
        name: 'Stage 3 · Market Rush',
        story: 'Fulfill orders to keep the fair vendors stocked.',
        goals: [
          { id: 'g1', kind: 'fulfill_order', amount: 2, label: 'Fulfill 2 Orders' },
        ],
        rewards: {
          rewardCoins: 120,
          rewardXp: 55,
        },
      },
    ],
    finaleReward: {
      rewardCoins: 80,
      rewardXp: 40,
      rewardSeeds: { grape: 4, sugarcane: 3 },
    },
  },
]

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]))

/** Goals for the current event stage (or empty if invalid). */
export function eventStageGoals(
  event: EventDef,
  stageIndex: number,
): import('../types').MissionGoal[] {
  return event.stages[stageIndex]?.goals ?? []
}

/** Progress key prefix for event stage goals. */
export function eventStageParentId(eventId: string, stageIndex: number): string {
  return `${eventId}:stage:${stageIndex}`
}

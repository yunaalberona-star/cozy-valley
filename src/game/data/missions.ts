import type { EventDef, MissionDef } from '../types'

/**
 * Story missions unlock machines & animals (Family Farm Seaside style).
 * Complete goals → claim rewards + unlock flags.
 */
export const MISSIONS: MissionDef[] = [
  {
    id: 'm1_first_sprouts',
    name: 'First Sprouts',
    emoji: '🌱',
    story: 'Settle into the valley. Harvest some wheat to prove the soil is good.',
    goals: [
      { id: 'g1', kind: 'harvest', target: 'wheat', amount: 6, label: 'Harvest 6 Wheat' },
    ],
    rewardCoins: 40,
    rewardXp: 20,
    unlocks: ['mill'],
  },
  {
    id: 'm2_windmill',
    name: 'Wind in the Mill',
    emoji: '🌬️',
    story: 'The Mill is ready. Grind your first flour.',
    goals: [
      { id: 'g1', kind: 'craft', target: 'flour', amount: 2, label: 'Craft 2 Wheat Flour' },
    ],
    rewardCoins: 50,
    rewardXp: 25,
    rewardItems: { wheat: 6 },
    unlocks: ['feed_mill', 'chicken_coop'],
    requires: 'm1_first_sprouts',
  },
  {
    id: 'm3_coop',
    name: 'Clucking Start',
    emoji: '🐔',
    story: 'Buy a chicken and collect fresh eggs for the bakery.',
    goals: [
      { id: 'g1', kind: 'buy_animal', target: 'chicken', amount: 1, label: 'Buy 1 Chicken' },
      { id: 'g2', kind: 'collect_animal', target: 'egg', amount: 2, label: 'Collect 2 Eggs' },
    ],
    rewardCoins: 60,
    rewardXp: 30,
    unlocks: ['cow_barn', 'bakery'],
    requires: 'm2_windmill',
  },
  {
    id: 'm4_dairy_lane',
    name: 'Dairy Lane',
    emoji: '🐄',
    story: 'A cow means milk — and milk means a proper Dairy.',
    goals: [
      { id: 'g1', kind: 'buy_animal', target: 'cow', amount: 1, label: 'Buy 1 Cow' },
      { id: 'g2', kind: 'collect_animal', target: 'milk', amount: 2, label: 'Collect 2 Milk' },
    ],
    rewardCoins: 80,
    rewardXp: 35,
    unlocks: ['dairy'],
    requires: 'm3_coop',
  },
  {
    id: 'm5_fresh_loaves',
    name: 'Fresh Loaves',
    emoji: '🍞',
    story: 'Bake wheat bread with flour, egg, and milk.',
    goals: [
      { id: 'g1', kind: 'craft', target: 'bread', amount: 1, label: 'Bake 1 Wheat Bread' },
      { id: 'g2', kind: 'craft', target: 'cheese', amount: 1, label: 'Make 1 Cheese' },
    ],
    rewardCoins: 100,
    rewardXp: 40,
    unlocks: ['juice_press'],
    requires: 'm4_dairy_lane',
  },
  {
    id: 'm6_pressed',
    name: 'Freshly Pressed',
    emoji: '🧃',
    story: 'Fill the Juice Press and ship a market order.',
    goals: [
      { id: 'g1', kind: 'craft', target: 'juice', amount: 1, label: 'Make 1 Tomato Juice' },
      { id: 'g2', kind: 'fulfill_order', amount: 1, label: 'Fulfill 1 Order' },
    ],
    rewardCoins: 90,
    rewardXp: 40,
    unlocks: ['sugar_mill', 'jam_maker'],
    requires: 'm5_fresh_loaves',
  },
  {
    id: 'm7_sweet_jar',
    name: 'Sweet Jar',
    emoji: '🫙',
    story: 'Refine sugarcane, then cook a jar of jam.',
    goals: [
      { id: 'g1', kind: 'harvest', target: 'sugarcane', amount: 4, label: 'Harvest 4 Sugarcane' },
      { id: 'g2', kind: 'craft', target: 'sugar', amount: 2, label: 'Refine 2 Sugar' },
      { id: 'g3', kind: 'craft', target: 'jam', amount: 1, label: 'Make 1 Jam' },
    ],
    rewardCoins: 120,
    rewardXp: 50,
    unlocks: ['grill', 'kitchen'],
    requires: 'm6_pressed',
  },
  {
    id: 'm8_hearth',
    name: 'Hearth & Home',
    emoji: '👩‍🍳',
    story: 'Cook something proper in the Kitchen.',
    goals: [
      { id: 'g1', kind: 'craft', target: 'salad', amount: 1, label: 'Cook 1 Garden Salad' },
      { id: 'g2', kind: 'craft', target: 'grilled_veg', amount: 1, label: 'Grill 1 Grilled Veg' },
    ],
    rewardCoins: 130,
    rewardXp: 55,
    unlocks: ['sheep_pasture', 'bee_apiary', 'loom'],
    requires: 'm7_sweet_jar',
  },
  {
    id: 'm9_soft_fleece',
    name: 'Soft Fleece',
    emoji: '🐑',
    story: 'Raise sheep and bees, then weave cloth on the Loom.',
    goals: [
      { id: 'g1', kind: 'buy_animal', target: 'sheep', amount: 1, label: 'Buy 1 Sheep' },
      { id: 'g2', kind: 'collect_animal', target: 'wool', amount: 1, label: 'Collect 1 Wool' },
      { id: 'g3', kind: 'collect_animal', target: 'honey', amount: 1, label: 'Collect 1 Honey' },
      { id: 'g4', kind: 'craft', target: 'cloth', amount: 1, label: 'Weave 1 Cloth' },
    ],
    rewardCoins: 150,
    rewardXp: 60,
    unlocks: ['sewing', 'winery', 'pig_sty', 'goat_pen', 'duck_pond'],
    requires: 'm8_hearth',
  },
  {
    id: 'm10_celebration',
    name: 'Valley Celebration',
    emoji: '🎂',
    story: 'Finish the fancy machines — candy, cake, and wine for the valley fair.',
    goals: [
      { id: 'g1', kind: 'craft', target: 'sweater', amount: 1, label: 'Sew 1 Wool Sweater' },
      { id: 'g2', kind: 'craft', target: 'wine', amount: 1, label: 'Bottle 1 Valley Wine' },
      { id: 'g3', kind: 'own_coins', amount: 200, label: 'Hold 200 coins' },
    ],
    rewardCoins: 200,
    rewardXp: 80,
    rewardItems: { cake: 1 },
    unlocks: ['candy_machine', 'cake_machine'],
    requires: 'm9_soft_fleece',
  },
]

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))

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

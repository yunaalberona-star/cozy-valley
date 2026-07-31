import { ANIMALS } from './animals'
import { ITEM_META, RECIPES } from './buildings'
import { CROP_LIST } from './crops'
import { recipeUnlockLevel } from './unlockOrder'
import type {
  AnimalTypeId,
  ItemId,
  MissionDef,
  MissionGoal,
} from '../types'

const MISSION_NAMES = [
  'First Sprouts',
  'Wind in the Mill',
  'Clucking Start',
  'Dairy Lane',
  'Fresh Loaves',
  'Freshly Pressed',
  'Sweet Jar',
  'Hearth & Home',
  'Soft Fleece',
  'Valley Celebration',
  'Duck Pond Days',
  'Goat Hill',
  'Smokehouse',
  'Master Chef',
]

const MISSION_EMOJIS = [
  '🌱', '🌬️', '🐔', '🐄', '🍞', '🧃', '🫙', '👩‍🍳', '🐑', '🎂',
  '🦆', '🐐', '🐷', '👨‍🍳',
]

const MISSION_STORIES: Record<number, string> = {
  1: 'Mayor Maple greets you at the gate. "Prove this soil is good — harvest wheat for the village pantry."',
  2: 'The old mill creaks to life. Grind flour and learn how your machines work.',
  3: 'Clara the chicken keeper waves you over. Buy a hen and bring back fresh eggs.',
  4: 'Dairy Lane needs milk! A cow in the barn means cheese and butter soon.',
  5: 'The bakery bell rings. Bake bread and churn cheese for hungry neighbors.',
  6: 'Market day! Run the Juice Press and fulfill your first board order.',
  7: 'Sugarcane sways in the breeze. Refine sugar and cook berry jam for the fair.',
  8: 'Fire up the Kitchen and Grill — hearty meals keep the valley smiling.',
  9: 'Soft fleece season! Tend sheep and bees, then weave cloth on the Loom.',
  10: 'The valley fair is near. Sew a sweater, bottle wine, and save up coins.',
  11: 'Ducks splash at the pond. Raise ducks and mix duck feed for extra eggs.',
  12: 'Goat Hill calls. Fresh goat milk and butter for the hillside café.',
  13: 'Smoke rises from the sty. Pigs, bacon, and a pot of hearty soup.',
  14: 'Master Chef week! Candy, cake, pie — and keep the order board busy.',
}

const CHAPTER_DEFS: { title: string; npc: string; npcEmoji: string; start: number; end: number }[] = [
  { title: 'Chapter 1 · First Furrows', npc: 'Mayor Maple', npcEmoji: '🧑‍🌾', start: 1, end: 3 },
  { title: 'Chapter 2 · Mill & Market', npc: 'Miller Finn', npcEmoji: '🌬️', start: 4, end: 6 },
  { title: 'Chapter 3 · Sweet Valley', npc: 'Baker Rosa', npcEmoji: '🍞', start: 7, end: 9 },
  { title: 'Chapter 4 · Hearth & Herd', npc: 'Chef Eli', npcEmoji: '👩‍🍳', start: 10, end: 12 },
  { title: 'Chapter 5 · Riverside', npc: 'Farmer Jo', npcEmoji: '🦆', start: 13, end: 14 },
]

function chapterForMission(n: number): {
  chapter: number
  chapterTitle: string
  npcName: string
  npcEmoji: string
} {
  for (let i = 0; i < CHAPTER_DEFS.length; i++) {
    const c = CHAPTER_DEFS[i]!
    if (n >= c.start && n <= c.end) {
      return {
        chapter: i + 1,
        chapterTitle: c.title,
        npcName: c.npc,
        npcEmoji: c.npcEmoji,
      }
    }
  }
  const chapterNum = 5 + Math.ceil((n - 14) / 5)
  const mode = n % 3
  const titles = ['Harvest Horizons', 'Pasture Tales', 'Valley Commerce']
  const npcs = [
    { name: 'Scout Mira', emoji: '🌾' },
    { name: 'Herder Sam', emoji: '🐄' },
    { name: 'Trader Lex', emoji: '📦' },
  ]
  const pick = mode === 0 ? 0 : mode === 1 ? 1 : 2
  return {
    chapter: chapterNum,
    chapterTitle: `Chapter ${chapterNum} · ${titles[pick]}`,
    npcName: npcs[pick]!.name,
    npcEmoji: npcs[pick]!.emoji,
  }
}

const ANIMAL_ROTATION: AnimalTypeId[] = [
  'chicken',
  'cow',
  'sheep',
  'bee',
  'duck',
  'goat',
  'pig',
]

const CRAFT_ROTATION: ItemId[] = [
  'flour',
  'bread',
  'cheese',
  'juice',
  'jam',
  'sugar',
  'salad',
  'grilled_veg',
  'cloth',
  'wine',
  'sweater',
  'candy',
  'cake',
  'pie',
  'soup',
  'butter',
  'grape_jam',
  'berry_juice',
  'corn_bread',
  'rope',
]

function cropsUnlockedBy(level: number) {
  return CROP_LIST.filter((c) => c.unlockLevel <= level)
}

function craftsUnlockedBy(level: number): ItemId[] {
  return CRAFT_ROTATION.filter((id) => {
    const recipe = RECIPES.find((r) => r.output === id)
    if (!recipe) return false
    return recipeUnlockLevel(recipe.id) <= level
  })
}

function missionId(n: number): string {
  const legacy = [
    'm1_first_sprouts',
    'm2_windmill',
    'm3_coop',
    'm4_dairy_lane',
    'm5_fresh_loaves',
    'm6_pressed',
    'm7_sweet_jar',
    'm8_hearth',
    'm9_soft_fleece',
    'm10_celebration',
    'm11_duck_pond',
    'm12_goat_hill',
    'm13_smokehouse',
    'm14_master_chef',
  ]
  if (n <= legacy.length) return legacy[n - 1]!
  return `m${n}_rank_${n}`
}

function goalHarvest(cropId: ItemId, amount: number): MissionGoal {
  const crop = CROP_LIST.find((c) => c.id === cropId)
  return {
    id: `g_harvest_${cropId}`,
    kind: 'harvest',
    target: cropId,
    amount,
    label: `Harvest ${amount} ${crop?.name ?? cropId}`,
  }
}

function goalCraft(itemId: ItemId, amount: number): MissionGoal {
  const meta = ITEM_META[itemId]
  return {
    id: `g_craft_${itemId}`,
    kind: 'craft',
    target: itemId,
    amount,
    label: `Make ${amount} ${meta?.name ?? itemId}`,
  }
}

function goalCollect(product: ItemId, amount: number): MissionGoal {
  const meta = ITEM_META[product]
  return {
    id: `g_collect_${product}`,
    kind: 'collect_animal',
    target: product,
    amount,
    label: `Collect ${amount} ${meta?.name ?? product}`,
  }
}

function goalBuy(animalId: AnimalTypeId, amount: number): MissionGoal {
  const def = ANIMALS[animalId]
  return {
    id: `g_buy_${animalId}`,
    kind: 'buy_animal',
    target: animalId,
    amount,
    label: `Buy ${amount} ${def.name}${amount > 1 ? 's' : ''}`,
  }
}

function goalOrder(amount: number): MissionGoal {
  return {
    id: 'g_order',
    kind: 'fulfill_order',
    amount,
    label: `Fulfill ${amount} Order${amount > 1 ? 's' : ''}`,
  }
}

function goalCoins(amount: number): MissionGoal {
  return {
    id: 'g_coins',
    kind: 'own_coins',
    amount,
    label: `Hold ${amount} coins`,
  }
}

function goalsForMission(n: number): MissionGoal[] {
  if (n === 1) return [goalHarvest('wheat', 6)]
  if (n === 2) return [goalCraft('flour', 2)]
  if (n === 3) return [goalBuy('chicken', 1), goalCollect('egg', 2)]
  if (n === 4) return [goalBuy('cow', 1), goalCollect('milk', 2)]
  if (n === 5) return [goalCraft('bread', 1), goalCraft('cheese', 1)]
  if (n === 6) return [goalCraft('juice', 1), goalOrder(1)]
  if (n === 7) {
    return [
      goalHarvest('sugarcane', 4),
      goalCraft('sugar', 2),
      goalCraft('jam', 1),
    ]
  }
  if (n === 8) return [goalCraft('salad', 1), goalCraft('grilled_veg', 1)]
  if (n === 9) {
    return [
      goalBuy('sheep', 1),
      goalCollect('wool', 1),
      goalCollect('honey', 1),
      goalCraft('cloth', 1),
    ]
  }
  if (n === 10) {
    return [
      goalCraft('sweater', 1),
      goalCraft('wine', 1),
      goalCoins(200),
    ]
  }
  if (n === 11) {
    return [
      goalBuy('duck', 1),
      goalCollect('egg', 4),
      goalCraft('duck_feed', 2),
    ]
  }
  if (n === 12) {
    return [
      goalBuy('goat', 1),
      goalCollect('goat_milk', 3),
      goalCraft('butter', 1),
    ]
  }
  if (n === 13) {
    return [
      goalBuy('pig', 1),
      goalCollect('bacon', 2),
      goalCraft('soup', 1),
    ]
  }
  if (n === 14) {
    return [
      goalCraft('candy', 2),
      goalCraft('cake', 1),
      goalCraft('pie', 1),
      goalOrder(3),
    ]
  }

  const mode = n % 3
  const crops = cropsUnlockedBy(n)
  const crop = crops[(n - 1) % Math.max(1, crops.length)] ?? crops[0]!
  const crafts = craftsUnlockedBy(n)
  const craft = crafts[(n - 1) % Math.max(1, crafts.length)]
  const animal = ANIMAL_ROTATION[(n - 1) % ANIMAL_ROTATION.length]!
  const product = ANIMALS[animal].product
  const harvestAmt = 4 + Math.floor(n / 5)
  const craftAmt = 1 + Math.floor(n / 15)
  const collectAmt = 2 + Math.floor(n / 10)
  const orderAmt = 1 + Math.floor(n / 20)
  const coinGoal = 150 + n * 25

  if (mode === 0) {
    const goals: MissionGoal[] = [goalHarvest(crop.id, harvestAmt)]
    if (craft) goals.push(goalCraft(craft, craftAmt))
    else goals.push(goalOrder(orderAmt))
    return goals
  }
  if (mode === 1) {
    const goals: MissionGoal[] = [goalBuy(animal, 1)]
    if (product) goals.push(goalCollect(product, collectAmt))
    else goals.push(goalOrder(orderAmt))
    return goals
  }
  const goals: MissionGoal[] = [goalHarvest(crop.id, harvestAmt)]
  if (craft) goals.push(goalCraft(craft, craftAmt))
  goals.push(
    n >= 40 ? goalCoins(coinGoal) : goalOrder(orderAmt),
  )
  return goals
}

function storyFor(n: number): string {
  if (MISSION_STORIES[n]) return MISSION_STORIES[n]!
  const { npcName } = chapterForMission(n)
  const mode = n % 3
  if (mode === 0) {
    return `${npcName} needs help: harvest new crops and keep the machines running.`
  }
  if (mode === 1) {
    return `${npcName} asks you to tend animals and gather fresh goods.`
  }
  return `${npcName} wants you to craft goods and keep orders moving.`
}

function nameFor(n: number): string {
  if (n <= 14) return MISSION_NAMES[n - 1]!
  const mode = n % 3
  if (mode === 0) return `Millwright ${n}`
  if (mode === 1) return `Herdsman ${n}`
  return `Valley Hand ${n}`
}

function emojiFor(n: number): string {
  if (n <= 14) return MISSION_EMOJIS[n - 1]!
  const mode = n % 3
  if (mode === 0) return '🏭'
  if (mode === 1) return '🐄'
  return '🌾'
}

function rewardsFor(n: number): { coins: number; xp: number } {
  return {
    coins: 40 + n * 12,
    xp: 18 + Math.floor(n * 1.6),
  }
}

export function buildMissionChain(maxLevel = 50): MissionDef[] {
  const missions: MissionDef[] = []
  for (let n = 1; n <= maxLevel; n++) {
    const { coins, xp } = rewardsFor(n)
    const chapterMeta = chapterForMission(n)
    missions.push({
      id: missionId(n),
      name: nameFor(n),
      emoji: emojiFor(n),
      story: storyFor(n),
      goals: goalsForMission(n),
      rewardCoins: coins,
      rewardXp: xp,
      unlocks: [],
      requires: n > 1 ? missionId(n - 1) : undefined,
      minLevel: n,
      chapter: chapterMeta.chapter,
      chapterTitle: chapterMeta.chapterTitle,
      npcName: chapterMeta.npcName,
      npcEmoji: chapterMeta.npcEmoji,
    })
  }
  return missions
}

/** First incomplete mission in chain (ignores level gate). */
export function findNextMissionInChain(
  completedMissions: string[],
  missions: MissionDef[],
): MissionDef | undefined {
  return missions.find(
    (m) =>
      !completedMissions.includes(m.id) &&
      (!m.requires || completedMissions.includes(m.requires)),
  )
}

/** Next mission the player can actively work on (level + chain satisfied). */
export function pickNextMission(
  completedMissions: string[],
  playerLevel: number,
  missions: MissionDef[],
): MissionDef | undefined {
  return missions.find(
    (m) =>
      !completedMissions.includes(m.id) &&
      (!m.requires || completedMissions.includes(m.requires)) &&
      (m.minLevel ?? 1) <= playerLevel,
  )
}

/** Always show a mission when the chain isn't finished — includes level-gated next. */
export function resolveActiveMission(
  completedMissions: string[],
  playerLevel: number,
  missions: MissionDef[],
): MissionDef | undefined {
  return (
    pickNextMission(completedMissions, playerLevel, missions) ??
    findNextMissionInChain(completedMissions, missions)
  )
}

export function isMissionLevelGated(
  mission: MissionDef,
  playerLevel: number,
): boolean {
  return (mission.minLevel ?? 1) > playerLevel
}

/** Map legacy save mission ids → current chain ids. */
export const LEGACY_MISSION_ID_MAP: Record<string, string> = {
  m4_dairy: 'm4_dairy_lane',
  m5_loaves: 'm5_fresh_loaves',
  m9_fleece: 'm9_soft_fleece',
}

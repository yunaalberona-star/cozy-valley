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
  1: 'Settle into the valley. Harvest wheat to prove the soil is good.',
  2: 'Grind flour at the Mill and learn the machines.',
  3: 'Buy a chicken and collect fresh eggs.',
  4: 'A cow means milk — time for the Dairy.',
  5: 'Bake bread and churn cheese for the village.',
  6: 'Run the Juice Press and fulfill a market order.',
  7: 'Refine sugar and cook berry jam.',
  8: 'Fire up the Kitchen and Grill.',
  9: 'Sheep, bees, and cloth on the Loom.',
  10: 'Sew a sweater and bottle wine for the fair.',
  11: 'Raise ducks and mix duck feed.',
  12: 'Goats, goat milk, and fresh butter.',
  13: 'Pigs, bacon, and hearty soup.',
  14: 'Candy, cake, pie, and a busy order board.',
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
    id: 'g_harvest',
    kind: 'harvest',
    target: cropId,
    amount,
    label: `Harvest ${amount} ${crop?.name ?? cropId}`,
  }
}

function goalCraft(itemId: ItemId, amount: number): MissionGoal {
  const meta = ITEM_META[itemId]
  return {
    id: 'g_craft',
    kind: 'craft',
    target: itemId,
    amount,
    label: `Make ${amount} ${meta?.name ?? itemId}`,
  }
}

function goalCollect(product: ItemId, amount: number): MissionGoal {
  const meta = ITEM_META[product]
  return {
    id: 'g_collect',
    kind: 'collect_animal',
    target: product,
    amount,
    label: `Collect ${amount} ${meta?.name ?? product}`,
  }
}

function goalBuy(animalId: AnimalTypeId, amount: number): MissionGoal {
  const def = ANIMALS[animalId]
  return {
    id: 'g_buy',
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
    return [
      goalBuy(animal, 1),
      goalCollect(product, collectAmt),
    ]
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
  const mode = n % 3
  if (mode === 0) {
    return `Level ${n}: harvest new crops and keep the machines running.`
  }
  if (mode === 1) {
    return `Level ${n}: tend your animals and gather fresh goods.`
  }
  return `Level ${n}: run the farm, craft goods, and keep orders moving.`
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
    })
  }
  return missions
}

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

/** Map legacy save mission ids → current chain ids. */
export const LEGACY_MISSION_ID_MAP: Record<string, string> = {
  m4_dairy: 'm4_dairy_lane',
  m5_loaves: 'm5_fresh_loaves',
  m9_fleece: 'm9_soft_fleece',
}

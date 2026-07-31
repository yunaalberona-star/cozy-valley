import { ANIMALS } from './animals'
import { ADVENTURES } from './adventures'
import { ITEM_META, RECIPES } from './buildings'
import { CROP_LIST } from './crops'
import { GEAR_BLUEPRINTS, MATERIAL_META } from './gear'
import { NPCS } from './npcs'
import { TREE_LIST } from './trees'
import { recipeUnlockLevel } from './unlockOrder'
import type {
  AnimalTypeId,
  ItemId,
  MaterialId,
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
  'Orchard Awakening',
  'Citrus Sunrise',
  'Cherry Blossom',
  "Pollinator's Gift",
  'Lemonade Lane',
  'Maple Festival',
  'Peach Jubilee',
  'Tavern Call',
  'Sunny Stroll',
  "Wallace's Forge",
  'Timber Trail',
  'Cave Crawl',
  'Ruins & Runes',
]

const MISSION_EMOJIS = [
  '🌱', '🌬️', '🐔', '🐄', '🍞', '🧃', '🫙', '👩‍🍳', '🐑', '🎂',
  '🦆', '🐐', '🐷', '👨‍🍳',
  '🍎', '🍊', '🍒', '🐝', '🍋', '🍁', '🍑',
  '🍺', '🌼', '⚒️', '🌲', '🪨', '🏛️',
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
  15: 'Grove Keeper Lila opens the orchard gate. "Plant apple trees and press your first valley cider."',
  16: 'Sun-warmed oranges ripen on the hill. Fill bottles for the morning market.',
  17: 'Cherry blossoms drift over the farm. Bake pie and press juice for the spring fair.',
  18: 'Bees buzz between the blossoms. Tend hives and mix pollen from orchard flowers.',
  19: 'A lemonade stand pops up by the lane. Squeeze lemons and sweeten the valley heat.',
  20: 'Maple taps drip at dawn. Boil sap into syrup and glaze donuts for the harvest table.',
  21: 'Peach season peaks! Bake cobblers and send a crate off on the order board.',
  22: 'The tavern door swings open. Recruit your first adventurer and mine ore for Wallace\'s forge.',
  23: 'Scout Mira points to the meadow. Send a small party on an easy expedition.',
  24: 'Blacksmith Wallace needs iron and a practice weapon. Gather ore and craft at the Smithy.',
  25: 'Allan the carpenter wants timber from the forest site — then test your party in the Whispering Woods.',
  26: 'Misty Caves await. Forge a copper sickle and march a geared party into the dark.',
  27: 'Ancient ruins hold magic essence. Complete the expedition and stock rare materials for master gear.',
}

/** Missions that gate on building unlocks above their sequence number. */
const MISSION_MIN_LEVEL: Record<number, number> = {
  20: 23,
  21: 25,
  22: 15,
  23: 15,
  24: 16,
  25: 16,
  26: 17,
  27: 18,
}

const CHAPTER_DEFS: { title: string; npc: string; npcEmoji: string; start: number; end: number }[] = [
  { title: 'Chapter 1 · First Furrows', npc: 'Mayor Maple', npcEmoji: '🧑‍🌾', start: 1, end: 3 },
  { title: 'Chapter 2 · Mill & Market', npc: 'Miller Finn', npcEmoji: '🌬️', start: 4, end: 6 },
  { title: 'Chapter 3 · Sweet Valley', npc: 'Baker Rosa', npcEmoji: '🍞', start: 7, end: 9 },
  { title: 'Chapter 4 · Hearth & Herd', npc: 'Chef Eli', npcEmoji: '👩‍🍳', start: 10, end: 12 },
  { title: 'Chapter 5 · Riverside', npc: 'Farmer Jo', npcEmoji: '🦆', start: 13, end: 14 },
  { title: 'Chapter 6 · Orchard Hills', npc: 'Grove Keeper Lila', npcEmoji: '🌳', start: 15, end: 21 },
  { title: 'Chapter 7 · Adventure & Workshops', npc: 'Scout Mira', npcEmoji: '🗺️', start: 22, end: 27 },
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
  const chapterNum = 7 + Math.ceil((n - 27) / 5)
  const mode = n % 5
  const titles = [
    'Harvest Horizons',
    'Pasture Tales',
    'Valley Commerce',
    'Expedition Log',
    'Workshop Ward',
  ]
  const npcs = [
    { name: 'Scout Mira', emoji: '🌾' },
    { name: 'Herder Sam', emoji: '🐄' },
    { name: 'Trader Lex', emoji: '📦' },
    { name: 'Ranger Rosa', emoji: '🗺️' },
    { name: 'Wallace', emoji: '⚒️' },
  ]
  const pick = mode === 0 ? 0 : mode === 1 ? 1 : mode === 2 ? 2 : mode === 3 ? 3 : 4
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
  'apple_cider',
  'orange_juice',
  'cherry_pie',
  'maple_syrup',
  'peach_cobbler',
  'apple_butter',
  'mulled_cider',
  'honey_cider',
]

const MATERIAL_ROTATION: MaterialId[] = [
  'iron_ore',
  'timber',
  'leather_scrap',
  'magic_essence',
]

const ADVENTURE_ROTATION = ADVENTURES.map((a) => a.id)

const GEAR_BLUEPRINT_ROTATION = GEAR_BLUEPRINTS.filter(
  (b) => b.unlockLevel <= 20,
).map((b) => b.id)

const TREE_PRODUCT_ROTATION: ItemId[] = [
  'apple',
  'orange',
  'cherry',
  'maple_sap',
  'peach',
  'lemon',
]

function treesUnlockedBy(level: number) {
  return TREE_LIST.filter((t) => t.unlockLevel <= level).map((t) => t.product)
}

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
    'm15_orchard',
    'm16_citrus',
    'm17_cherry',
    'm18_pollinator',
    'm19_lemonade',
    'm20_maple',
    'm21_peach',
    'm22_tavern',
    'm23_meadow',
    'm24_forge',
    'm25_timber',
    'm26_caves',
    'm27_ruins',
  ]
  if (n <= legacy.length) return legacy[n - 1]!
  return `m${n}_rank_${n}`
}

function goalHarvest(itemId: ItemId, amount: number): MissionGoal {
  const crop = CROP_LIST.find((c) => c.id === itemId)
  const tree = TREE_LIST.find((t) => t.product === itemId)
  const meta = ITEM_META[itemId]
  const name = crop?.name ?? tree?.name.replace(' Tree', '') ?? meta?.name ?? itemId
  return {
    id: `g_harvest_${itemId}`,
    kind: 'harvest',
    target: itemId,
    amount,
    label: `Harvest ${amount} ${name}`,
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

function goalRecruit(amount: number, npcId?: string): MissionGoal {
  const npc = npcId ? NPCS[npcId] : null
  return {
    id: npcId ? `g_recruit_${npcId}` : 'g_recruit',
    kind: 'recruit',
    target: npcId,
    amount,
    label: npc
      ? `Recruit ${npc.name}`
      : `Recruit ${amount} adventurer${amount > 1 ? 's' : ''}`,
  }
}

function goalAdventure(adventureId: string, amount = 1): MissionGoal {
  const adv = ADVENTURES.find((a) => a.id === adventureId)
  return {
    id: `g_adventure_${adventureId}`,
    kind: 'complete_adventure',
    target: adventureId,
    amount,
    label: adv
      ? `Complete ${adv.name} ×${amount}`
      : `Complete ${amount} expedition${amount > 1 ? 's' : ''}`,
  }
}

function goalCraftGear(blueprintId: string | undefined, amount: number): MissionGoal {
  const bp = blueprintId ? GEAR_BLUEPRINTS.find((b) => b.id === blueprintId) : null
  return {
    id: blueprintId ? `g_gear_${blueprintId}` : 'g_gear',
    kind: 'craft_gear',
    target: blueprintId,
    amount,
    label: bp
      ? `Craft ${amount} ${bp.name}`
      : `Craft ${amount} gear piece${amount > 1 ? 's' : ''}`,
  }
}

function goalGatherMaterial(materialId: MaterialId, amount: number): MissionGoal {
  const meta = MATERIAL_META[materialId]
  return {
    id: `g_gather_${materialId}`,
    kind: 'gather_material',
    target: materialId,
    amount,
    label: `Gather ${amount} ${meta.name}`,
  }
}

function goalOwnMaterial(materialId: MaterialId, amount: number): MissionGoal {
  const meta = MATERIAL_META[materialId]
  return {
    id: `g_own_${materialId}`,
    kind: 'own_material',
    target: materialId,
    amount,
    label: `Hold ${amount} ${meta.name}`,
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
  if (n === 15) {
    return [goalHarvest('apple', 8), goalCraft('apple_cider', 2)]
  }
  if (n === 16) {
    return [goalHarvest('orange', 6), goalCraft('orange_juice', 2)]
  }
  if (n === 17) {
    return [
      goalHarvest('cherry', 10),
      goalCraft('cherry_juice', 1),
      goalCraft('cherry_pie', 1),
    ]
  }
  if (n === 18) {
    return [
      goalBuy('bee', 1),
      goalCollect('honey', 3),
      goalCraft('bee_pollen', 2),
      goalHarvest('cherry', 6),
    ]
  }
  if (n === 19) {
    return [goalHarvest('lemon', 8), goalCraft('lemonade', 2)]
  }
  if (n === 20) {
    return [
      goalHarvest('maple_sap', 10),
      goalCraft('maple_syrup', 2),
      goalCraft('maple_donut', 1),
    ]
  }
  if (n === 21) {
    return [
      goalHarvest('peach', 8),
      goalCraft('peach_cobbler', 1),
      goalOrder(2),
    ]
  }
  if (n === 22) {
    return [goalRecruit(1), goalGatherMaterial('iron_ore', 4)]
  }
  if (n === 23) {
    return [goalAdventure('adv_meadow', 1)]
  }
  if (n === 24) {
    return [
      goalGatherMaterial('iron_ore', 6),
      goalCraftGear('bp_wood_pitchfork', 1),
    ]
  }
  if (n === 25) {
    return [
      goalGatherMaterial('timber', 8),
      goalAdventure('adv_forest', 1),
    ]
  }
  if (n === 26) {
    return [
      goalCraftGear('bp_copper_sickle', 1),
      goalAdventure('adv_caves', 1),
    ]
  }
  if (n === 27) {
    return [
      goalAdventure('adv_ruins', 1),
      goalOwnMaterial('magic_essence', 1),
      goalCraftGear(undefined, 2),
    ]
  }

  const mode = n % 5
  const crops = cropsUnlockedBy(n)
  const crop = crops[(n - 1) % Math.max(1, crops.length)] ?? crops[0]!
  const treeProducts = treesUnlockedBy(n)
  const treeProduct =
    treeProducts[(n - 1) % Math.max(1, treeProducts.length)] ??
    TREE_PRODUCT_ROTATION[(n - 1) % TREE_PRODUCT_ROTATION.length]!
  const crafts = craftsUnlockedBy(n)
  const craft = crafts[(n - 1) % Math.max(1, crafts.length)]
  const animal = ANIMAL_ROTATION[(n - 1) % ANIMAL_ROTATION.length]!
  const product = ANIMALS[animal].product
  const harvestAmt = 4 + Math.floor(n / 5)
  const treeHarvestAmt = 3 + Math.floor(n / 6)
  const craftAmt = 1 + Math.floor(n / 15)
  const collectAmt = 2 + Math.floor(n / 10)
  const orderAmt = 1 + Math.floor(n / 20)

  const adventure =
    ADVENTURE_ROTATION[(n - 1) % ADVENTURE_ROTATION.length]!
  const material =
    MATERIAL_ROTATION[(n - 1) % MATERIAL_ROTATION.length]!
  const blueprint =
    GEAR_BLUEPRINT_ROTATION[(n - 1) % GEAR_BLUEPRINT_ROTATION.length]
  const gatherAmt = 3 + Math.floor(n / 8)
  const gearAmt = 1 + Math.floor(n / 25)
  const adventureAmt = 1 + Math.floor(n / 30)

  if (mode === 0) {
    const goals: MissionGoal[] =
      treeProducts.length > 0 && n % 2 === 0
        ? [goalHarvest(treeProduct, treeHarvestAmt)]
        : [goalHarvest(crop.id, harvestAmt)]
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
  if (mode === 2) {
    const goals: MissionGoal[] = [goalHarvest(treeProduct, treeHarvestAmt)]
    if (craft) goals.push(goalCraft(craft, craftAmt))
    return goals
  }
  if (mode === 3) {
    const goals: MissionGoal[] = [goalAdventure(adventure, adventureAmt)]
    if (n >= 28) goals.push(goalGatherMaterial(material, gatherAmt))
    return goals
  }
  const goals: MissionGoal[] = [goalGatherMaterial(material, gatherAmt)]
  if (blueprint) goals.push(goalCraftGear(blueprint, gearAmt))
  else goals.push(goalOrder(orderAmt))
  return goals
}

function storyFor(n: number): string {
  if (MISSION_STORIES[n]) return MISSION_STORIES[n]!
  const { npcName } = chapterForMission(n)
  const mode = n % 5
  if (mode === 0) {
    return `${npcName} needs orchard fruit and machines humming along the grove.`
  }
  if (mode === 1) {
    return `${npcName} asks you to tend animals and gather fresh goods.`
  }
  if (mode === 2) {
    return `${npcName} wants tree harvests turned into valley preserves.`
  }
  if (mode === 3) {
    return `${npcName} sends your recruits exploring — gear up and claim the rewards.`
  }
  return `${npcName} wants materials gathered and workshops crafting for the road ahead.`
}

function nameFor(n: number): string {
  if (n <= MISSION_NAMES.length) return MISSION_NAMES[n - 1]!
  const mode = n % 5
  if (mode === 0) return `Grove Hand ${n}`
  if (mode === 1) return `Herdsman ${n}`
  if (mode === 2) return `Orchard Keeper ${n}`
  if (mode === 3) return `Expedition ${n}`
  return `Artisan ${n}`
}

function emojiFor(n: number): string {
  if (n <= MISSION_EMOJIS.length) return MISSION_EMOJIS[n - 1]!
  const mode = n % 5
  if (mode === 0) return '🌳'
  if (mode === 1) return '🐄'
  if (mode === 2) return '🍎'
  if (mode === 3) return '🗺️'
  return '⚒️'
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
      minLevel: MISSION_MIN_LEVEL[n] ?? n,
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

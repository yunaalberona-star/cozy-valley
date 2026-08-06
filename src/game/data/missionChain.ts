import { ANIMALS } from './animals'
import { ADVENTURES, TAVERN_UNLOCK_LEVEL } from './adventures'
import { ITEM_META, ORDERS_UNLOCK_LEVEL, RECIPES } from './buildings'
import { CROP_LIST, CROPS } from './crops'
import { GEAR_BLUEPRINTS, MATERIAL_META } from './gear'
import { GATHER_SITES } from './gatherSites'
import { gatherSiteForMaterial, adventureRewardsMaterial } from './itemSources'
import { buildingUnlockLevel } from './levelUnlocks'
import { NPCS } from './npcs'
import { TREE_LIST, treeForProduct, TREES } from './trees'
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
  8: 'Fire up the bakery — pie and cheese for hungry neighbors.',
  9: 'Soft fleece season! Tend sheep and bees, then weave cloth on the Loom.',
  10: 'The valley fair is near. Stock jam, fill orders, and save up coins.',
  11: 'Ducks splash at the pond. Mix duck feed and gather eggs for the market.',
  12: 'Bull Pen opens on the ridge. Tend bulls, gather hides, and churn butter for the café.',
  13: 'Smoke rises from the kitchen. Hearty soup and grilled sides for hungry travelers.',
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
  (b) => b.unlock.starter,
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
  if (n === 8) return [goalCraft('pie', 1), goalCraft('cheese', 2)]
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
      goalCraft('jam', 2),
      goalOrder(2),
      goalCoins(250),
    ]
  }
  if (n === 11) {
    return [
      goalBuy('duck', 1),
      goalCraft('duck_feed', 3),
      goalCollect('egg', 6),
      goalOrder(1),
    ]
  }
  if (n === 12) {
    return [
      goalBuy('bull', 1),
      goalOwnMaterial('cow_hide', 1),
      goalCraft('butter', 2),
    ]
  }
  if (n === 13) {
    return [
      goalCraft('soup', 2),
      goalCraft('grilled_veg', 2),
      goalOrder(1),
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

  const adventurePool = adventuresUnlockedBy(n)
  const adventure =
    adventurePool[(n - 1) % Math.max(1, adventurePool.length)] ??
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
    const goals: MissionGoal[] = [goalAdventure(adventure.id, adventureAmt)]
    if (n >= 28) goals.push(goalGatherMaterial(material, gatherAmt))
    return goals
  }
  const goals: MissionGoal[] = [goalGatherMaterial(material, gatherAmt)]
  if (blueprint) goals.push(goalCraftGear(blueprint, gearAmt))
  else goals.push(goalOrder(orderAmt))
  return goals
}

/** Bridge missions inserted when building unlocks lag story sequence. */
const BRIDGE_MISSIONS_AFTER: Record<
  number,
  Omit<MissionDef, 'requires' | 'rewardCoins' | 'rewardXp' | 'unlocks' | 'chapter' | 'chapterTitle' | 'npcName' | 'npcEmoji'>[]
> = {
  7: [
    {
      id: 'm7b_busy_bees',
      name: 'Busy Bees',
      emoji: '🐝',
      story:
        'Beekeeper Ana opens the apiary. Tend hives and gather golden honey for the valley pantry.',
      minLevel: 13,
      goals: [goalBuy('bee', 1), goalCollect('honey', 2)],
    },
    {
      id: 'm7c_fire_side',
      name: 'Fire Side Dishes',
      emoji: '🔥',
      story:
        'Chef Eli fires up the grill. Sear fresh vegetables for the evening market stand.',
      minLevel: 14,
      goals: [goalCraft('grilled_veg', 2)],
    },
    {
      id: 'm7d_cider_start',
      name: 'Cider Start',
      emoji: '🍎',
      story:
        'The orchard press whirs to life. Harvest apples and bottle your first cider.',
      minLevel: 15,
      goals: [goalHarvest('apple', 6), goalCraft('apple_cider', 1)],
    },
    {
      id: 'm7e_kitchen_garden',
      name: 'Kitchen Garden',
      emoji: '🥗',
      story: 'Chef Eli needs fresh salads for the lunch rush.',
      minLevel: 16,
      goals: [goalCraft('salad', 2)],
    },
    {
      id: 'm7f_fluffy_friends',
      name: 'Fluffy Friends',
      emoji: '🐰',
      story: 'Rabbits hop into the hutch — gather soft pelts for the tailor.',
      minLevel: 16,
      goals: [goalBuy('rabbit', 1), goalOwnMaterial('rabbit_pelt', 1)],
    },
    {
      id: 'm7g_duck_splash',
      name: 'Duck Splash',
      emoji: '🦆',
      story: 'The duck pond opens! Collect extra eggs for the market.',
      minLevel: 17,
      goals: [goalBuy('duck', 1), goalCollect('egg', 4)],
    },
    {
      id: 'm7h_bull_strength',
      name: 'Bull Strength',
      emoji: '🐂',
      story: 'Bulls power the ridge pen. Gather hides for the tannery.',
      minLevel: 17,
      goals: [goalBuy('bull', 1), goalOwnMaterial('cow_hide', 2)],
    },
    {
      id: 'm7i_loom_song',
      name: 'Loom Song',
      emoji: '🧵',
      story: 'The loom hums. Spin wool into cloth for valley traders.',
      minLevel: 18,
      goals: [goalCraft('cloth', 2)],
    },
    {
      id: 'm7j_goat_milk',
      name: 'Goat Milk Run',
      emoji: '🐐',
      story: 'Goats climb the hill. Churn butter for the hillside café.',
      minLevel: 19,
      goals: [
        goalBuy('goat', 1),
        goalCollect('goat_milk', 3),
        goalCraft('butter', 1),
      ],
    },
    {
      id: 'm7k_stitch_fair',
      name: 'Stitch for Fair',
      emoji: '🧥',
      story: 'Sew warm sweaters before the festival chills set in.',
      minLevel: 20,
      goals: [goalCraft('sweater', 1)],
    },
    {
      id: 'm7l_pig_pen',
      name: 'Pig Pen',
      emoji: '🐷',
      story: 'Pigs snuffle in the sty. Smoke bacon for the kitchen.',
      minLevel: 21,
      goals: [goalBuy('pig', 1), goalCollect('bacon', 3)],
    },
    {
      id: 'm7m_valley_wine',
      name: 'Valley Wine',
      emoji: '🍷',
      story: 'The winery opens. Bottle your first valley vintage.',
      minLevel: 22,
      goals: [goalCraft('wine', 1)],
    },
    {
      id: 'm7n_maple_sweet',
      name: 'Maple Sweet',
      emoji: '🍁',
      story: 'Tap maple trees and boil sap into golden syrup.',
      minLevel: 23,
      goals: [goalHarvest('maple_sap', 8), goalCraft('maple_syrup', 1)],
    },
  ],
}

function adventuresUnlockedBy(level: number) {
  return ADVENTURES.filter((a) => a.unlockLevel <= level)
}

function materialRequiredLevel(materialId: MaterialId): number {
  const levels: number[] = []
  const animal = Object.values(ANIMALS).find((a) => a.materialProduct === materialId)
  if (animal) {
    levels.push(buildingUnlockLevel(animal.buildingId))
  }
  const site = gatherSiteForMaterial(materialId)
  if (site) {
    levels.push(buildingUnlockLevel(GATHER_SITES[site].machineId))
  }
  const recipe = RECIPES.find((r) => r.materialOutput === materialId)
  if (recipe) {
    levels.push(
      Math.max(
        buildingUnlockLevel(recipe.buildingId),
        recipeUnlockLevel(recipe.id),
      ),
    )
  }
  if (adventureRewardsMaterial(materialId)) {
    const advLevels = ADVENTURES.filter(
      (a) => (a.rewardMaterials?.[materialId] ?? 0) > 0,
    ).map((a) => a.unlockLevel)
    levels.push(...advLevels)
  }
  return levels.length > 0 ? Math.min(...levels) : 99
}

function collectAnimalRequiredLevel(
  productId: ItemId,
  goals: MissionGoal[],
): number {
  const buyTargets = goals
    .filter((g) => g.kind === 'buy_animal' && g.target)
    .map((g) => g.target as AnimalTypeId)
  const buyProductIds = buyTargets
    .map((id) => ANIMALS[id]?.product)
    .filter((p): p is NonNullable<typeof p> => p != null)
  if (buyProductIds.some((p) => p === productId)) {
    for (const animalId of buyTargets) {
      const def = ANIMALS[animalId]
      if (def?.product === productId) {
        return buildingUnlockLevel(def.buildingId)
      }
    }
  }
  const candidates = Object.values(ANIMALS).filter((a) => a.product === productId)
  if (candidates.length === 0) return 1
  return Math.min(...candidates.map((a) => buildingUnlockLevel(a.buildingId)))
}

export function missionRequiredLevel(goals: MissionGoal[]): number {
  let min = 1
  for (const goal of goals) {
    let need = 1
    switch (goal.kind) {
      case 'harvest': {
        const id = goal.target as ItemId
        const treeId = treeForProduct(id)
        if (treeId) need = TREES[treeId].unlockLevel
        else if (id in CROPS) need = CROPS[id as keyof typeof CROPS].unlockLevel
        break
      }
      case 'craft': {
        const itemId = goal.target as ItemId
        const recipe = RECIPES.find((r) => r.output === itemId)
        if (recipe) {
          need = Math.max(
            recipeUnlockLevel(recipe.id),
            buildingUnlockLevel(recipe.buildingId),
          )
        }
        break
      }
      case 'buy_animal': {
        const def = ANIMALS[goal.target as AnimalTypeId]
        if (def) need = buildingUnlockLevel(def.buildingId)
        break
      }
      case 'collect_animal':
        if (goal.target) {
          need = collectAnimalRequiredLevel(goal.target as ItemId, goals)
        }
        break
      case 'gather_material': {
        const materialId = goal.target as MaterialId
        need = materialRequiredLevel(materialId)
        break
      }
      case 'craft_gear': {
        if (goal.target) {
          const bp = GEAR_BLUEPRINTS.find((b) => b.id === goal.target)
          if (bp) need = buildingUnlockLevel(bp.buildingId)
        }
        break
      }
      case 'fulfill_order':
        need = ORDERS_UNLOCK_LEVEL
        break
      case 'recruit':
      case 'complete_adventure':
        need = TAVERN_UNLOCK_LEVEL
        break
      case 'own_material':
        if (goal.target) {
          need = materialRequiredLevel(goal.target as MaterialId)
        }
        break
      default:
        break
    }
    min = Math.max(min, need)
  }
  return min
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

const ADVENTURE_SIDE_CHAPTER = {
  chapter: 7,
  chapterTitle: 'Side · Expedition Board',
  npcName: 'Scout Mira',
  npcEmoji: '🗺️',
}

/** Parallel side quests on the expedition board (alongside story missions from L15). */
export const SIDE_QUEST_COUNT = 45

type SideQuestDraft = Pick<
  MissionDef,
  'id' | 'name' | 'emoji' | 'story' | 'minLevel' | 'goals'
> & {
  rewardCoins?: number
  rewardXp?: number
}

function sideQuestRewards(minLevel: number): { rewardCoins: number; rewardXp: number } {
  return {
    rewardCoins: 65 + minLevel * 4,
    rewardXp: 26 + Math.floor(minLevel * 1.8),
  }
}

const SIDE_QUEST_DRAFTS: SideQuestDraft[] = [
  {
    id: 'advq15_recruit',
    name: 'Tavern Call',
    emoji: '🍺',
    story: 'The tavern doors swing open. Recruit your first adventurer from the bar.',
    minLevel: 15,
    goals: [goalRecruit(1)],
    rewardCoins: 70,
    rewardXp: 30,
  },
  {
    id: 'advq15_meadow',
    name: 'Sunny Stroll',
    emoji: '🌼',
    story: 'Send a party to the Sunny Meadow for leather and coins.',
    minLevel: 15,
    goals: [goalAdventure('adv_meadow', 1)],
    rewardCoins: 85,
    rewardXp: 35,
  },
  {
    id: 'advq15_forest',
    name: 'Forest Path',
    emoji: '🌲',
    story: 'The Whispering Forest hides berries and timber — march a party in.',
    minLevel: 15,
    goals: [goalAdventure('adv_forest', 1), goalGatherMaterial('timber', 4)],
    rewardCoins: 95,
    rewardXp: 40,
  },
  {
    id: 'advq15_ore',
    name: 'Ore Samples',
    emoji: '⛏️',
    story: 'Wallace wants ore samples before he forges your first tool.',
    minLevel: 15,
    goals: [goalGatherMaterial('iron_ore', 4)],
    rewardCoins: 80,
    rewardXp: 32,
  },
  {
    id: 'advq16_caves',
    name: 'Cave Crawl',
    emoji: '🪨',
    story: 'Misty Caves echo with pickaxes. A geared party can bring ore home.',
    minLevel: 16,
    goals: [goalAdventure('adv_caves', 1), goalGatherMaterial('iron_ore', 6)],
    rewardCoins: 110,
    rewardXp: 45,
  },
  {
    id: 'advq17_ruins',
    name: 'Ruins & Runes',
    emoji: '🏛️',
    story: 'Ancient walls still hold treasure. Explore the Valley Ruins.',
    minLevel: 17,
    goals: [goalAdventure('adv_ruins', 1)],
    rewardCoins: 120,
    rewardXp: 50,
  },
  {
    id: 'advq18_ridge',
    name: "Dragon's Ridge",
    emoji: '🐉',
    story: 'Only the bravest parties return rich from the ridge.',
    minLevel: 18,
    goals: [goalAdventure('adv_ridge', 1)],
    rewardCoins: 140,
    rewardXp: 55,
  },
  {
    id: 'advq20_swamp',
    name: 'Gloom Swamp',
    emoji: '🌫️',
    story: 'Mire witches guard rare reagents — send a strong party.',
    minLevel: 20,
    goals: [goalAdventure('adv_swamp', 1), goalOwnMaterial('magic_essence', 1)],
    rewardCoins: 160,
    rewardXp: 65,
  },
  {
    id: 'advq22_gear',
    name: 'Field Kit',
    emoji: '⚔️',
    story: 'Craft a piece of gear and test it on an expedition.',
    minLevel: 22,
    goals: [goalCraftGear('bp_wood_pitchfork', 1), goalAdventure('adv_forest', 1)],
    rewardCoins: 150,
    rewardXp: 60,
  },
  {
    id: 'advq25_peak',
    name: 'Frost Peak',
    emoji: '🏔️',
    story: 'Ice caves glitter with sunstone. Only veterans should climb.',
    minLevel: 25,
    goals: [goalAdventure('adv_peak', 1), goalOwnMaterial('sunstone', 1)],
    rewardCoins: 200,
    rewardXp: 80,
  },
  {
    id: 'advq26_timber_haul',
    name: 'Timber Haul',
    emoji: '🪵',
    story: 'Allan needs planks for barricades before the next forest march.',
    minLevel: 15,
    goals: [goalGatherMaterial('timber', 6)],
  },
  {
    id: 'advq27_leather_pouch',
    name: 'Leather Pouch',
    emoji: '🧳',
    story: 'Stitch scrap leather into pouches for every recruit in the tavern.',
    minLevel: 15,
    goals: [goalOwnMaterial('leather_scrap', 3)],
  },
  {
    id: 'advq28_recruit_finn',
    name: 'Farmhand Finn',
    emoji: '🧑‍🌾',
    story: 'Finn knows every trail — hire him before your first long march.',
    minLevel: 15,
    goals: [goalRecruit(1, 'finn')],
  },
  {
    id: 'advq29_meadow_twice',
    name: 'Meadow Patrol',
    emoji: '🌼',
    story: 'Scout Mira wants the meadow walked twice to map safe campsites.',
    minLevel: 15,
    goals: [goalAdventure('adv_meadow', 2)],
  },
  {
    id: 'advq30_recruit_mira',
    name: 'Scout Mira',
    emoji: '🏹',
    story: 'Mira offers to lead if you cover her signing bonus at the bar.',
    minLevel: 15,
    goals: [goalRecruit(1, 'mira')],
  },
  {
    id: 'advq31_cave_delve',
    name: 'Cave Delve',
    emoji: '⛏️',
    story: 'Wallace pays extra for ore pulled straight from the misty tunnels.',
    minLevel: 16,
    goals: [goalAdventure('adv_caves', 1), goalGatherMaterial('iron_ore', 8)],
  },
  {
    id: 'advq32_ridge_sun',
    name: 'Ridge Sunstone',
    emoji: '💎',
    story: 'Dragon\'s Ridge glints with sunstone — bring a party and pocket a gem.',
    minLevel: 18,
    goals: [goalAdventure('adv_ridge', 1), goalOwnMaterial('sunstone', 1)],
  },
  {
    id: 'advq33_recruit_rosa',
    name: 'Ranger Rosa',
    emoji: '🌲',
    story: 'Rosa trades forest lore for a seat at your expedition table.',
    minLevel: 18,
    goals: [goalRecruit(1, 'rosa')],
  },
  {
    id: 'advq34_rabbit_scout',
    name: 'Rabbit Scout',
    emoji: '🐰',
    story: 'Soft pelts pad quiet boots — the tailor pays well for rabbit hide.',
    minLevel: 16,
    goals: [goalOwnMaterial('rabbit_pelt', 2)],
  },
  {
    id: 'advq35_ruins_twice',
    name: 'Ruins Survey',
    emoji: '🏛️',
    story: 'Old Tom wants two thorough passes through the valley ruins.',
    minLevel: 17,
    goals: [goalAdventure('adv_ruins', 2)],
  },
  {
    id: 'advq36_swamp_reagents',
    name: 'Swamp Reagents',
    emoji: '🧪',
    story: 'Apothecary shelves run dry — plunder gloom swamp for magic essence.',
    minLevel: 20,
    goals: [goalAdventure('adv_swamp', 1), goalOwnMaterial('magic_essence', 2)],
  },
  {
    id: 'advq37_copper_sickle',
    name: 'Copper Sickle',
    emoji: '🌾',
    story: 'Forge a copper sickle before sending farmers-turned-adventurers out.',
    minLevel: 16,
    goals: [goalCraftGear('bp_copper_sickle', 1)],
  },
  {
    id: 'advq38_hide_stock',
    name: 'Hide Stockpile',
    emoji: '🐂',
    story: 'The tannery needs bull hides before the winter expedition season.',
    minLevel: 17,
    goals: [goalOwnMaterial('cow_hide', 3)],
  },
  {
    id: 'advq39_recruit_tom',
    name: 'Sage Old Tom',
    emoji: '🧙',
    story: 'Tom maps ruins no one else dares — worth every coin at the tavern.',
    minLevel: 19,
    goals: [goalRecruit(1, 'tom')],
  },
  {
    id: 'advq40_sheep_hide',
    name: 'Sheep Leather',
    emoji: '🐑',
    story: 'Tailor workshop orders sheep leather cloaks for cold mountain treks.',
    minLevel: 19,
    goals: [goalOwnMaterial('sheep_leather', 2)],
  },
  {
    id: 'advq41_forest_grind',
    name: 'Forest Grind',
    emoji: '🌲',
    story: 'Three forest runs should flush out timber caches and berry stores.',
    minLevel: 15,
    goals: [goalAdventure('adv_forest', 3)],
  },
  {
    id: 'advq42_peak_crystals',
    name: 'Peak Crystals',
    emoji: '🏔️',
    story: 'Frost Peak hoards sunstone — climb once and bring back a handful.',
    minLevel: 25,
    goals: [goalAdventure('adv_peak', 1), goalOwnMaterial('sunstone', 2)],
  },
  {
    id: 'advq43_party_of_two',
    name: 'Party of Two',
    emoji: '👥',
    story: 'Mira insists every captain recruit at least two adventurers first.',
    minLevel: 16,
    goals: [goalRecruit(2)],
  },
  {
    id: 'advq44_field_gear',
    name: 'Field Gear',
    emoji: '⚔️',
    story: 'Stock the armory — craft two gear pieces before the next sortie.',
    minLevel: 22,
    goals: [goalCraftGear(undefined, 2)],
  },
  {
    id: 'advq45_crystal_depths',
    name: 'Crystal Depths',
    emoji: '💎',
    story: 'Deep veins of magic essence await beneath the crystal caverns.',
    minLevel: 30,
    goals: [goalAdventure('adv_depths', 1)],
  },
  {
    id: 'advq46_void_walk',
    name: 'Void Walk',
    emoji: '🕳️',
    story: 'Reality thins in the hollow — only veteran parties should enter.',
    minLevel: 35,
    goals: [goalAdventure('adv_void', 1)],
  },
  {
    id: 'advq47_sky_climb',
    name: 'Sky Climb',
    emoji: '☁️',
    story: 'Storm elementals hoard gear atop Skyreach Spire. Climb and claim it.',
    minLevel: 40,
    goals: [goalAdventure('adv_sky', 1)],
  },
  {
    id: 'advq48_crown_run',
    name: 'Crown Run',
    emoji: '👑',
    story: 'The ultimate valley expedition — send your best party to the crown.',
    minLevel: 45,
    goals: [goalAdventure('adv_crown', 1)],
  },
  {
    id: 'advq49_boar_trophy',
    name: 'Boar Trophy',
    emoji: '🐗',
    story: 'Tough boar leather makes expedition armor — hunt the ridge pens.',
    minLevel: 21,
    goals: [goalOwnMaterial('boar_leather', 2)],
  },
  {
    id: 'advq50_pig_leather',
    name: 'Pig Leather',
    emoji: '🐷',
    story: 'Pig leather straps hold shields together on long marches.',
    minLevel: 21,
    goals: [goalOwnMaterial('pig_leather', 2)],
  },
  {
    id: 'advq51_iron_cache',
    name: 'Iron Cache',
    emoji: '⛏️',
    story: 'Wallace\'s forge runs hot — fill the ore bins before the next raid.',
    minLevel: 15,
    goals: [goalGatherMaterial('iron_ore', 12)],
  },
  {
    id: 'advq52_timber_cache',
    name: 'Timber Cache',
    emoji: '🪵',
    story: 'Stock the wood cutter with enough timber for a month of gear craft.',
    minLevel: 15,
    goals: [goalGatherMaterial('timber', 10)],
  },
  {
    id: 'advq53_recruit_pip',
    name: 'Lucky Pip',
    emoji: '🍀',
    story: 'Pip finds extra coin where others find dust — worth the hire fee.',
    minLevel: 22,
    goals: [goalRecruit(1, 'pip')],
  },
  {
    id: 'advq54_recruit_elara',
    name: 'Knight Elara',
    emoji: '⚔️',
    story: 'Elara guards rough country — recruit her before the crown attempt.',
    minLevel: 28,
    goals: [goalRecruit(1, 'elara')],
  },
  {
    id: 'advq55_tri_route',
    name: 'Tri-Route March',
    emoji: '🗺️',
    story: 'Scout Mira\'s training route: meadow, forest, then caves in one season.',
    minLevel: 18,
    goals: [
      goalAdventure('adv_meadow', 1),
      goalAdventure('adv_forest', 1),
      goalAdventure('adv_caves', 1),
    ],
  },
  {
    id: 'advq56_iron_cap',
    name: 'Iron Cap',
    emoji: '🪖',
    story: 'Smithy orders an iron cap for every recruit heading to the ridge.',
    minLevel: 18,
    goals: [goalCraftGear('bp_iron_cap', 1), goalAdventure('adv_ridge', 1)],
  },
  {
    id: 'advq57_essence_stock',
    name: 'Essence Stock',
    emoji: '✨',
    story: 'Wizard tower shelves need magic essence from ruins and swamp alike.',
    minLevel: 20,
    goals: [goalOwnMaterial('magic_essence', 3)],
  },
  {
    id: 'advq58_depths_repeat',
    name: 'Depths Repeat',
    emoji: '💎',
    story: 'Crystal Depths still hold unmined essence — run the caverns twice.',
    minLevel: 30,
    goals: [goalAdventure('adv_depths', 2)],
  },
  {
    id: 'advq59_void_essence',
    name: 'Void Essence',
    emoji: '🕳️',
    story: 'Void Hollow bleeds raw magic — survive the walk and bottle what you find.',
    minLevel: 35,
    goals: [goalAdventure('adv_void', 1), goalOwnMaterial('magic_essence', 4)],
  },
  {
    id: 'advq60_sky_sunstone',
    name: 'Sky Sunstone',
    emoji: '☁️',
    story: 'Skyreach storms drop sunstone shards — climb and fill your satchel.',
    minLevel: 40,
    goals: [goalAdventure('adv_sky', 1), goalOwnMaterial('sunstone', 3)],
  },
]

/** Parallel tavern / expedition quests — active alongside story missions from L15. */
function buildAdventureSideMissions(): MissionDef[] {
  const side = {
    parallel: true,
    requires: 'm7_sweet_jar',
    unlocks: [] as MissionDef['unlocks'],
    ...ADVENTURE_SIDE_CHAPTER,
  }
  return SIDE_QUEST_DRAFTS.map((draft) => {
    const reqLevel = Math.max(
      draft.minLevel ?? TAVERN_UNLOCK_LEVEL,
      missionRequiredLevel(draft.goals),
    )
    const rewards = sideQuestRewards(reqLevel)
    return {
      ...draft,
      ...side,
      minLevel: reqLevel,
      rewardCoins: draft.rewardCoins ?? rewards.rewardCoins,
      rewardXp: draft.rewardXp ?? rewards.rewardXp,
    }
  })
}

/** Story missions m1…mN; bridges and parallel side quests add to the total count. */
export const MISSION_CHAIN_MAX_LEVEL = 80

export function buildMissionChain(maxLevel = MISSION_CHAIN_MAX_LEVEL): MissionDef[] {
  const missions: MissionDef[] = []
  let prevId: string | undefined

  for (let n = 1; n <= maxLevel; n++) {
    const goals = goalsForMission(n)
    const reqFromGoals = missionRequiredLevel(goals)
    const { coins, xp } = rewardsFor(n)
    const chapterMeta = chapterForMission(n)
    const id = missionId(n)
    missions.push({
      id,
      name: nameFor(n),
      emoji: emojiFor(n),
      story: storyFor(n),
      goals,
      rewardCoins: coins,
      rewardXp: xp,
      unlocks: [],
      requires: prevId,
      minLevel: Math.max(MISSION_MIN_LEVEL[n] ?? 1, reqFromGoals, n),
      chapter: chapterMeta.chapter,
      chapterTitle: chapterMeta.chapterTitle,
      npcName: chapterMeta.npcName,
      npcEmoji: chapterMeta.npcEmoji,
    })
    prevId = id

    const bridges = BRIDGE_MISSIONS_AFTER[n]
    if (bridges) {
      for (const bridge of bridges) {
        const bridgeGoals = bridge.goals
        const bridgeReq = Math.max(
          bridge.minLevel ?? 1,
          missionRequiredLevel(bridgeGoals),
        )
        missions.push({
          ...bridge,
          goals: bridgeGoals,
          requires: prevId,
          minLevel: bridgeReq,
          rewardCoins: rewardsFor(n).coins + 15,
          rewardXp: rewardsFor(n).xp + 8,
          unlocks: [],
          chapter: chapterMeta.chapter,
          chapterTitle: chapterMeta.chapterTitle,
          npcName: chapterMeta.npcName,
          npcEmoji: chapterMeta.npcEmoji,
        })
        prevId = bridge.id
      }
    }
  }
  return [...missions, ...buildAdventureSideMissions()]
}

/** First incomplete mission in chain (ignores level gate). */
export function findNextMissionInChain(
  completedMissions: string[],
  missions: MissionDef[],
): MissionDef | undefined {
  return missions.find(
    (m) =>
      !m.parallel &&
      !completedMissions.includes(m.id) &&
      (!m.requires || completedMissions.includes(m.requires)),
  )
}

/** Next story mission the player can work on (level + chain satisfied). */
export function pickNextMission(
  completedMissions: string[],
  playerLevel: number,
  missions: MissionDef[],
): MissionDef | undefined {
  return missions.find(
    (m) =>
      !m.parallel &&
      !completedMissions.includes(m.id) &&
      (!m.requires || completedMissions.includes(m.requires)) &&
      (m.minLevel ?? 1) <= playerLevel,
  )
}

function missionRequirementsMet(
  mission: MissionDef,
  completedMissions: string[],
  playerLevel: number,
): boolean {
  if (completedMissions.includes(mission.id)) return false
  if ((mission.minLevel ?? 1) > playerLevel) return false
  if (mission.requires && !completedMissions.includes(mission.requires)) return false
  return true
}

/** All missions active at once: one story mission + every eligible side quest. */
export function resolveActiveMissionIds(
  completedMissions: string[],
  playerLevel: number,
  missions: MissionDef[],
): string[] {
  const ids: string[] = []
  const story =
    pickNextMission(completedMissions, playerLevel, missions) ??
    findNextMissionInChain(completedMissions, missions)
  if (story && !story.parallel) ids.push(story.id)
  for (const m of missions) {
    if (!m.parallel) continue
    if (!missionRequirementsMet(m, completedMissions, playerLevel)) continue
    ids.push(m.id)
  }
  return ids
}

/** @deprecated use resolveActiveMissionIds */
export function resolveActiveMission(
  completedMissions: string[],
  playerLevel: number,
  missions: MissionDef[],
): MissionDef | undefined {
  const story = pickNextMission(completedMissions, playerLevel, missions)
  return story
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

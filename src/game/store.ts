import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ANIMALS } from './data/animals'
import { ANIMAL_BUILDINGS } from './data/animalBuildings'
import { ADVENTURE_BY_ID, scaledAdventure, TAVERN_UNLOCK_LEVEL } from './data/adventures'
import {
  rollAdventureGear,
  rollGearDropCount,
  rollRareMaterialDrops,
} from './data/adventureLoot'
import {
  GATHER_SITE_MAX_SLOTS,
  GATHER_SITES,
  gatherSlotCost,
  materialRecipeYield,
} from './data/gatherSites'
import { BUILDINGS, ITEM_META, RECIPES, machineQueueSize, ORDERS_UNLOCK_LEVEL, queueUpgradeCost, BASE_MACHINE_QUEUE, MAX_MACHINE_QUEUE, MAX_QUEUE_BONUS } from './data/buildings'
import {
  animalSpeedUpgradeCost,
  effectiveMs,
  farmSpeedUpgradeCost,
  machineSpeedUpgradeCost,
  MAX_SPEED_LEVEL,
} from './data/upgrades'
import { CROPS, cropsCrossingLevels, levelFromXp, xpToReachLevel } from './data/crops'
import { isTreeProduct, TREES, treeForProduct } from './data/trees'
import {
  animalBuildingForProduct,
  animalBuildingForMaterial,
  adventureRewardsMaterial,
  isCropItem,
  machineBuildingForItem,
  machineBuildingForMaterial,
  recipeProducing,
  recipeProducingMaterial,
} from './data/itemSources'
import { recipeUnlockLevel } from './data/unlockOrder'
import {
  GEAR_BLUEPRINT_BY_ID,
  GEAR_BUILDINGS,
  createGearInstance,
  isGearRecipeUnlocked,
  isQualityUpgrade,
  MATERIAL_META,
  QUALITY_LABEL,
  recipeStar,
  starCraftMsMultiplier,
} from './data/gear'
import {
  EVENT_BY_ID,
  EVENTS,
  MISSION_BY_ID,
  MISSIONS,
  eventStageGoals,
  eventStageParentId,
  isMissionLevelGated,
  resolveActiveMission,
} from './data/missions'
import {
  mergeMissionBuildingUnlocks,
  isBuildingRequiredByMission,
  isRecipeRequiredByMission,
} from './data/missionCraftUnlock'
import {
  DAILY_ALL_BONUS,
  DAILY_GOALS_PARENT_ID,
  WEEKLY_ALL_BONUS,
  WEEKLY_GOALS_PARENT_ID,
  WEEKLY_GOAL_SLOTS,
  allSlotsClaimed,
  periodDayKey,
  periodWeekKey,
  rollDailyGoals,
  rollWeeklyGoals,
  slotComplete,
  slotsToMissionGoals,
  type ScheduledGoalSlot,
} from './data/scheduledGoals'
import {
  FALLBACK_RANK,
  rankingPointsForRank,
  rankingTierLabel,
} from './data/rankingTiers'
import { submitGoalRanking } from './rankingClient'
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_BY_ID,
  type AchievementKind,
} from './data/achievements'
import { LEGACY_MISSION_ID_MAP } from './data/missionChain'
import { buildingUnlockLevel, unlocksCrossingLevels, unlocksForLevel } from './data/levelUnlocks'
import { MAX_RECRUITED_NPCS, NPCS } from './data/npcs'
import { grantRecruitXp, partyPower } from './data/recruits'
import { ORDERS } from './data/orders'
import {
  rollShipOrders,
  shipPeriodKey,
  SHIP_SLOTS,
} from './data/shipOrders'
import { itemSellPrice, materialSellPrice, seedSellPrice } from './data/sellPrices'
import { MARKET_UNLOCK_LEVEL, isValidMarketPrice } from './data/market'
import type { MarketItemKind } from './data/market'
import {
  MarketError,
  buyListing,
  cancelListing,
  claimSinglePayout,
  createListing,
  fetchListingById,
  fetchUnclaimedSales,
  getPlayerId,
  getPlayerName,
  isSupabaseConfigured,
} from './marketClient'
import type { MarketSaleClaim } from './marketClient'
import { mergeCropLevelGuides, mergeUnlockGuides, tabShouldPulse } from './guides'
import {
  adoptLegacySaveIfNeeded,
  mergePersistedSlice,
  SAVE_STORAGE_KEY,
  SAVE_VERSION,
} from './saveStorage'
import { migrateUnlockId, migrateGearBuildingId, unlockMeta } from './unlocks'
import type {
  ActiveAdventure,
  ActiveOrder,
  ActiveShipOrder,
  AdventurePaneId,
  GatherSiteId,
  MaterialsPaneId,
  AnimalBuildingId,
  AnimalInstance,
  AnimalTypeId,
  BuildingId,
  CraftJob,
  CraftResourceId,
  CropId,
  EventStageReward,
  GearBuildingId,
  GearCraftJob,
  GearInstance,
  ItemId,
  MaterialId,
  MissionDef,
  MissionGoal,
  PlotState,
  PopupState,
  RecruitedNpc,
  FarmPaneId,
  ShopPaneId,
  TabId,
  TreeId,
  TreeSlotState,
  UnlockId,
} from './types'

const START_PLOTS = 6
const MAX_PLOTS = 16
const START_TREE_SLOTS = 2
const MAX_TREE_SLOTS = 8
const ORDER_SLOTS = 3
const PLOT_UNLOCK_BASE = 250
const TREE_SLOT_UNLOCK_BASE = 550

function emptyPlots(count: number): PlotState[] {
  return Array.from({ length: count }, () => ({
    cropId: null,
    plantedAt: null,
  }))
}

function emptyTreeSlots(count: number): TreeSlotState[] {
  return Array.from({ length: count }, () => ({
    treeId: null,
    plantedAt: null,
  }))
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function pickOrders(level: number, exclude: string[] = []): ActiveOrder[] {
  const pool = ORDERS.filter(
    (o) => o.unlockLevel <= level && !exclude.includes(o.id),
  )
  const fallback = ORDERS.filter((o) => o.unlockLevel <= level)
  const source = pool.length >= ORDER_SLOTS ? pool : fallback
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, ORDER_SLOTS).map((o, slot) => ({
    orderId: o.id,
    slot,
  }))
}

function pickReplacementOrderId(level: number, exclude: string[]): string | null {
  const available = ORDERS.filter((o) => o.unlockLevel <= level)
  const fresh = available.filter((o) => !exclude.includes(o.id))
  const pool = fresh.length > 0 ? fresh : available
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]!.id
}

function hasItems(
  inventory: Partial<Record<ItemId, number>>,
  needs: Partial<Record<ItemId, number>>,
): boolean {
  return Object.entries(needs).every(
    ([id, qty]) => (inventory[id as ItemId] ?? 0) >= (qty ?? 0),
  )
}

function takeMaterial(
  materials: Partial<Record<MaterialId, number>>,
  needs: Partial<Record<MaterialId, number>>,
): Partial<Record<MaterialId, number>> {
  const next = { ...materials }
  for (const [id, qty] of Object.entries(needs)) {
    const key = id as MaterialId
    const left = (next[key] ?? 0) - (qty ?? 0)
    if (left <= 0) delete next[key]
    else next[key] = left
  }
  return next
}

function takeSeeds(
  seeds: Partial<Record<CropId, number>>,
  needs: Partial<Record<CropId, number>>,
): Partial<Record<CropId, number>> {
  const next = { ...seeds }
  for (const [id, qty] of Object.entries(needs)) {
    const key = id as CropId
    const left = (next[key] ?? 0) - (qty ?? 0)
    if (left <= 0) delete next[key]
    else next[key] = left
  }
  return next
}

function takeItems(
  inventory: Partial<Record<ItemId, number>>,
  needs: Partial<Record<ItemId, number>>,
): Partial<Record<ItemId, number>> {
  const next = { ...inventory }
  for (const [id, qty] of Object.entries(needs)) {
    const key = id as ItemId
    const left = (next[key] ?? 0) - (qty ?? 0)
    if (left <= 0) delete next[key]
    else next[key] = left
  }
  return next
}

function addItem(
  inventory: Partial<Record<ItemId, number>>,
  id: ItemId,
  qty: number,
): Partial<Record<ItemId, number>> {
  return { ...inventory, [id]: (inventory[id] ?? 0) + qty }
}

function addItems(
  inventory: Partial<Record<ItemId, number>>,
  items?: Partial<Record<ItemId, number>>,
): Partial<Record<ItemId, number>> {
  if (!items) return inventory
  let next = inventory
  for (const [id, qty] of Object.entries(items)) {
    next = addItem(next, id as ItemId, qty ?? 0)
  }
  return next
}

function addMaterial(
  materials: Partial<Record<MaterialId, number>>,
  id: MaterialId,
  qty: number,
): Partial<Record<MaterialId, number>> {
  return { ...materials, [id]: (materials[id] ?? 0) + qty }
}

function addMaterials(
  materials: Partial<Record<MaterialId, number>>,
  items?: Partial<Record<MaterialId, number>>,
): Partial<Record<MaterialId, number>> {
  if (!items) return materials
  let next = materials
  for (const [id, qty] of Object.entries(items)) {
    next = addMaterial(next, id as MaterialId, qty ?? 0)
  }
  return next
}

function isMaterialId(id: string): id is MaterialId {
  return [
    'iron_ore',
    'timber',
    'leather_scrap',
    'rabbit_pelt',
    'cow_hide',
    'pig_leather',
    'sheep_leather',
    'boar_leather',
    'magic_essence',
    'sunstone',
  ].includes(id)
}

function hasResources(
  inventory: Partial<Record<ItemId, number>>,
  materials: Partial<Record<MaterialId, number>>,
  needs: Partial<Record<CraftResourceId, number>>,
): boolean {
  return Object.entries(needs).every(([id, qty]) => {
    if (isMaterialId(id)) return (materials[id] ?? 0) >= (qty ?? 0)
    return (inventory[id as ItemId] ?? 0) >= (qty ?? 0)
  })
}

function takeResources(
  inventory: Partial<Record<ItemId, number>>,
  materials: Partial<Record<MaterialId, number>>,
  needs: Partial<Record<CraftResourceId, number>>,
): {
  inventory: Partial<Record<ItemId, number>>
  materials: Partial<Record<MaterialId, number>>
} {
  let nextInv = { ...inventory }
  let nextMat = { ...materials }
  for (const [id, qty] of Object.entries(needs)) {
    const need = qty ?? 0
    if (isMaterialId(id)) {
      const left = (nextMat[id] ?? 0) - need
      if (left <= 0) delete nextMat[id]
      else nextMat[id] = left
    } else {
      const key = id as ItemId
      const left = (nextInv[key] ?? 0) - need
      if (left <= 0) delete nextInv[key]
      else nextInv[key] = left
    }
  }
  return { inventory: nextInv, materials: nextMat }
}

function migrateInventory(
  inventory: Partial<Record<string, number>>,
): Partial<Record<ItemId, number>> {
  const next = { ...inventory } as Partial<Record<ItemId, number>>
  const legacyFeed = inventory.feed
  if (legacyFeed != null && legacyFeed > 0) {
    delete (next as Record<string, number>).feed
    next.chicken_feed = (next.chicken_feed ?? 0) + legacyFeed
  }
  return next
}

function migrateUnlocked(unlocked: string[]): UnlockId[] {
  return [...new Set(unlocked.map((u) => migrateUnlockId(u)))] as UnlockId[]
}

function unlockPopupItems(ids: UnlockId[]): PopupState['items'] {
  return ids.map((id) => {
    const meta = unlockMeta(id)
    return { emoji: meta.emoji, name: meta.name }
  })
}

function newUnlocks(prev: UnlockId[], next: UnlockId[]): UnlockId[] {
  const seen = new Set(prev)
  return next.filter((u) => !seen.has(u))
}

function unlockGuidePatch(
  s: { guideTabPulses: TabId[]; guideItemHighlights: string[]; unlocked: UnlockId[] },
  nextUnlocked: UnlockId[],
  newLevel?: number,
) {
  let guides = mergeUnlockGuides(
    s.guideTabPulses,
    s.guideItemHighlights,
    newUnlocks(s.unlocked, nextUnlocked),
  )
  if (newLevel != null && newLevel > 1) {
    guides = mergeCropLevelGuides(
      guides.guideTabPulses,
      guides.guideItemHighlights,
      newLevel,
    )
  }
  return guides
}

function shopGuidePatch(s: {
  guideTabPulses: TabId[]
  contextGuideTab: TabId | null
}) {
  const tabs = new Set(s.guideTabPulses)
  tabs.add('shop')
  return {
    guideTabPulses: [...tabs],
    contextGuideTab: 'shop' as TabId,
  }
}

function enqueuePopups(
  queue: PopupState[],
  ...popups: (PopupState | null | undefined)[]
): PopupState[] {
  return [...queue, ...popups.filter((p): p is PopupState => p != null)]
}

const SEED_UNLOCK_GRANT = 3

function grantSeedsForLevelCrossing(
  seeds: Partial<Record<CropId, number>>,
  oldLevel: number,
  newLevel: number,
): Partial<Record<CropId, number>> {
  const added = cropsCrossingLevels(oldLevel, newLevel)
  if (added.length === 0) return seeds
  const next = { ...seeds }
  for (const cropId of added) {
    next[cropId] = (next[cropId] ?? 0) + SEED_UNLOCK_GRANT
  }
  return next
}

function applyXpGain(
  xp: number,
  amount: number,
  popupQueue: PopupState[],
  unlocked: UnlockId[],
  activeOrders: ActiveOrder[],
  seeds: Partial<Record<CropId, number>>,
): {
  xp: number
  popupQueue: PopupState[]
  unlocked: UnlockId[]
  activeOrders: ActiveOrder[]
  seeds: Partial<Record<CropId, number>>
} {
  if (amount <= 0) {
    return { xp, popupQueue, unlocked, activeOrders, seeds }
  }
  const oldLevel = levelFromXp(xp)
  const nextXp = xp + amount
  const newLevel = levelFromXp(nextXp)
  if (newLevel <= oldLevel) {
    return { xp: nextXp, popupQueue, unlocked, activeOrders, seeds }
  }

  let nextUnlocked = unlocked
  let nextQueue = popupQueue
  let nextOrders = activeOrders
  let nextSeeds = seeds
  const levelIds = unlocksCrossingLevels(oldLevel, newLevel).filter(
    (u) => !unlocked.includes(u),
  )
  if (levelIds.length > 0) {
    nextUnlocked = [...new Set([...unlocked, ...levelIds])]
    nextQueue = enqueuePopups(
      nextQueue,
      unlockPopup(
        levelIds,
        levelUnlockSubtitle(levelIds, newLevel),
      ),
    )
    if (levelIds.includes('orders_board') && activeOrders.length === 0) {
      nextOrders = pickOrders(newLevel)
    }
  }
  const newCrops = cropsCrossingLevels(oldLevel, newLevel)
  if (newCrops.length > 0) {
    nextSeeds = grantSeedsForLevelCrossing(seeds, oldLevel, newLevel)
  }
  nextQueue = enqueuePopups(nextQueue, {
    kind: 'level_up',
    title: `Level ${newLevel}!`,
    subtitle: 'Your valley grows stronger.',
    items: [{ emoji: '⭐', name: `Level ${newLevel}` }],
  })
  return {
    xp: nextXp,
    popupQueue: nextQueue,
    unlocked: nextUnlocked,
    activeOrders: nextOrders,
    seeds: nextSeeds,
  }
}

function levelUnlockSubtitle(levelIds: UnlockId[], newLevel: number): string {
  if (levelIds.includes('orders_board')) {
    return `Reached Level ${ORDERS_UNLOCK_LEVEL}!`
  }
  if (levelIds.includes('market_board')) {
    return `Reached Level ${MARKET_UNLOCK_LEVEL}!`
  }
  if (levelIds.includes('tavern')) {
    return `Reached Level ${TAVERN_UNLOCK_LEVEL}!`
  }
  return `Reached Level ${newLevel}!`
}

function ensureShipOrders(
  playerLevel: number,
  slice: Pick<
    GameState,
    'shipPeriodKey' | 'activeShipOrders' | 'shipBoardComplete' | 'unlocked'
  >,
): Partial<
  Pick<GameState, 'shipPeriodKey' | 'activeShipOrders' | 'shipBoardComplete'>
> {
  if (!slice.unlocked.includes('orders_board')) return {}
  const key = shipPeriodKey()
  if (
    slice.shipPeriodKey !== key ||
    slice.activeShipOrders.length === 0 ||
    slice.activeShipOrders.length !== SHIP_SLOTS
  ) {
    return {
      shipPeriodKey: key,
      activeShipOrders: rollShipOrders(playerLevel, key),
      shipBoardComplete: false,
    }
  }
  return {}
}

function activeMissionDef(activeMissionId: string | null): MissionDef | null {
  return activeMissionId ? (MISSION_BY_ID[activeMissionId] ?? null) : null
}

function ensureScheduledGoals(
  playerLevel: number,
  slice: Pick<
    GameState,
    | 'dailyGoalsPeriodKey'
    | 'dailyGoals'
    | 'dailyGoalProgress'
    | 'dailyBonusClaimed'
    | 'weeklyGoalsPeriodKey'
    | 'weeklyGoals'
    | 'weeklyGoalProgress'
    | 'weeklyBonusClaimed'
    | 'rankingWeekKey'
    | 'rankingWeekPoints'
    | 'dailyRankingRank'
    | 'weeklyRankingRank'
  >,
): Partial<
  Pick<
    GameState,
    | 'dailyGoalsPeriodKey'
    | 'dailyGoals'
    | 'dailyGoalProgress'
    | 'dailyBonusClaimed'
    | 'dailyRankingRank'
    | 'weeklyGoalsPeriodKey'
    | 'weeklyGoals'
    | 'weeklyGoalProgress'
    | 'weeklyBonusClaimed'
    | 'weeklyRankingRank'
    | 'rankingWeekKey'
    | 'rankingWeekPoints'
  >
> {
  const dayKey = periodDayKey()
  const weekKey = periodWeekKey()
  const patch: Partial<
    Pick<
      GameState,
      | 'dailyGoalsPeriodKey'
      | 'dailyGoals'
      | 'dailyGoalProgress'
      | 'dailyBonusClaimed'
      | 'dailyRankingRank'
      | 'weeklyGoalsPeriodKey'
      | 'weeklyGoals'
      | 'weeklyGoalProgress'
      | 'weeklyBonusClaimed'
      | 'weeklyRankingRank'
      | 'rankingWeekKey'
      | 'rankingWeekPoints'
    >
  > = {}

  if (slice.dailyGoalsPeriodKey !== dayKey || slice.dailyGoals.length === 0) {
    patch.dailyGoalsPeriodKey = dayKey
    patch.dailyGoals = rollDailyGoals(playerLevel, dayKey)
    patch.dailyGoalProgress = {}
    patch.dailyBonusClaimed = false
    patch.dailyRankingRank = null
  }

  if (
    slice.weeklyGoalsPeriodKey !== weekKey ||
    slice.weeklyGoals.length === 0 ||
    slice.weeklyGoals.length !== WEEKLY_GOAL_SLOTS
  ) {
    patch.weeklyGoalsPeriodKey = weekKey
    patch.weeklyGoals = rollWeeklyGoals(playerLevel, weekKey)
    patch.weeklyGoalProgress = {}
    patch.weeklyBonusClaimed = false
    patch.weeklyRankingRank = null
  }

  if (slice.rankingWeekKey !== weekKey) {
    patch.rankingWeekKey = weekKey
    patch.rankingWeekPoints = 0
  }

  return patch
}

function syncLevelUnlocks(xp: number, unlocked: UnlockId[]): UnlockId[] {
  const level = levelFromXp(xp)
  return [...new Set([...unlocked, ...unlocksForLevel(level)])]
}

function busyNpcIds(activeAdventures: ActiveAdventure[]): Set<string> {
  return new Set(activeAdventures.flatMap((a) => a.npcInstanceIds))
}

function unlockPopup(
  ids: UnlockId[],
  subtitle: string,
): PopupState | null {
  if (ids.length === 0) return null
  return {
    kind: 'unlock',
    title: ids.length === 1 ? 'Something unlocked!' : 'New unlocks!',
    subtitle,
    items: unlockPopupItems(ids),
  }
}

function goalKey(missionOrEventId: string, goalId: string): string {
  return `${missionOrEventId}:${goalId}`
}

function legacyGoalId(kind: MissionGoal['kind']): string | null {
  switch (kind) {
    case 'harvest':
      return 'g_harvest'
    case 'craft':
      return 'g_craft'
    case 'collect_animal':
      return 'g_collect'
    case 'buy_animal':
      return 'g_buy'
    default:
      return null
  }
}

function migrateMissionProgress(
  missionId: string,
  oldProgress: Record<string, number>,
): Record<string, number> {
  const mission = MISSION_BY_ID[missionId]
  if (!mission) return oldProgress
  const next = emptyProgress(mission.goals, mission.id)
  for (const g of mission.goals) {
    const newKey = goalKey(mission.id, g.id)
    if (oldProgress[newKey] != null) {
      next[newKey] = oldProgress[newKey]
      continue
    }
    const legacyId = legacyGoalId(g.kind)
    if (!legacyId) continue
    const legacyKey = goalKey(mission.id, legacyId)
    const legacyVal = oldProgress[legacyKey] ?? 0
    if (legacyVal <= 0) continue
    const sameKind = mission.goals.filter((x) => x.kind === g.kind)
    if (sameKind.length === 1) {
      next[newKey] = Math.min(g.amount, legacyVal)
    }
  }
  return next
}

function isMissionComplete(
  missionId: string,
  progress: Record<string, number>,
): boolean {
  const mission = MISSION_BY_ID[missionId]
  if (!mission) return false
  return mission.goals.every(
    (g) => (progress[goalKey(missionId, g.id)] ?? 0) >= g.amount,
  )
}

function missionClaimPopup(mission: MissionDef): PopupState {
  const unlockItems = mission.unlocks.map((u) => {
    const meta = unlockMeta(u)
    return { emoji: meta.emoji, name: meta.name }
  })
  return {
    kind: 'mission_claim',
    missionId: mission.id,
    title: 'Mission complete!',
    subtitle: `${mission.emoji} ${mission.name} — all goals ready`,
    items: [
      { emoji: '🪙', name: `${mission.rewardCoins} coins` },
      { emoji: '⭐', name: `${mission.rewardXp} XP` },
      ...unlockItems,
    ],
  }
}

function queueMissionClaimIfReady(
  activeMissionId: string | null,
  beforeProgress: Record<string, number>,
  afterProgress: Record<string, number>,
  popupQueue: PopupState[],
): PopupState[] {
  if (!activeMissionId) return popupQueue
  const mission = MISSION_BY_ID[activeMissionId]
  if (!mission) return popupQueue
  if (isMissionComplete(activeMissionId, beforeProgress)) return popupQueue
  if (!isMissionComplete(activeMissionId, afterProgress)) return popupQueue
  if (popupQueue.some((p) => p.kind === 'mission_claim')) return popupQueue
  const filtered = popupQueue.filter((p) => p.kind !== 'mission_claim')
  return [missionClaimPopup(mission), ...filtered]
}

type MissionProgressSlice = Pick<
  GameState,
  | 'activeMissionId'
  | 'missionProgress'
  | 'popupQueue'
  | 'inventory'
  | 'coins'
  | 'animals'
  | 'materials'
  | 'recruitedNpcs'
>

function computeMissionProgressFromState(
  s: Pick<
    GameState,
    | 'inventory'
    | 'coins'
    | 'animals'
    | 'materials'
    | 'recruitedNpcs'
    | 'missionProgress'
  >,
  missionId: string,
): Record<string, number> {
  const mission = MISSION_BY_ID[missionId]
  if (!mission) return s.missionProgress
  const next = { ...s.missionProgress }
  for (const g of mission.goals) {
    const key = goalKey(missionId, g.id)
    switch (g.kind) {
      case 'harvest':
      case 'craft':
      case 'collect_animal':
      case 'complete_adventure':
      case 'craft_gear':
      case 'gather_material':
        // Lifetime progress from player actions only — not bag inventory (market buys don't count).
        next[key] = Math.min(g.amount, next[key] ?? 0)
        break
      case 'buy_animal':
        if (g.target) {
          next[key] = Math.min(
            g.amount,
            s.animals.filter((a) => a.typeId === g.target).length,
          )
        }
        break
      case 'recruit':
        next[key] = Math.min(
          g.amount,
          g.target
            ? s.recruitedNpcs.filter((n) => n.npcId === g.target).length
            : s.recruitedNpcs.length,
        )
        break
      case 'own_coins':
        next[key] = Math.min(g.amount, s.coins)
        break
      case 'own_material':
        if (g.target) {
          next[key] = Math.min(
            g.amount,
            s.materials[g.target as MaterialId] ?? 0,
          )
        }
        break
      case 'fulfill_order':
        next[key] = Math.min(g.amount, next[key] ?? 0)
        break
    }
  }
  return next
}

function resolveMissionProgress(
  s: MissionProgressSlice,
  bumpedProgress?: Record<string, number>,
): Pick<GameState, 'missionProgress' | 'popupQueue'> {
  if (!s.activeMissionId) {
    return {
      missionProgress: bumpedProgress ?? s.missionProgress,
      popupQueue: s.popupQueue,
    }
  }
  const missionProgress = computeMissionProgressFromState(
    { ...s, missionProgress: bumpedProgress ?? s.missionProgress },
    s.activeMissionId,
  )
  const wasComplete = isMissionComplete(s.activeMissionId, s.missionProgress)
  const nowComplete = isMissionComplete(s.activeMissionId, missionProgress)
  let popupQueue = s.popupQueue
  if (wasComplete && !nowComplete) {
    popupQueue = popupQueue.filter((p) => p.kind !== 'mission_claim')
  } else if (!wasComplete && nowComplete) {
    popupQueue = queueMissionClaimIfReady(
      s.activeMissionId,
      s.missionProgress,
      missionProgress,
      popupQueue,
    )
  }
  return { missionProgress, popupQueue }
}

function withMissionProgress<T extends MissionProgressSlice>(
  s: T,
  patch: Partial<T>,
  bumpedProgress?: Record<string, number>,
): T & Pick<GameState, 'missionProgress' | 'popupQueue'> {
  const merged = { ...s, ...patch }
  return {
    ...merged,
    ...resolveMissionProgress(merged, bumpedProgress),
  }
}

function addSeeds(
  seeds: Partial<Record<CropId, number>>,
  items?: Partial<Record<CropId, number>>,
): Partial<Record<CropId, number>> {
  if (!items) return seeds
  let next = { ...seeds }
  for (const [id, qty] of Object.entries(items)) {
    next[id as CropId] = (next[id as CropId] ?? 0) + (qty ?? 0)
  }
  return next
}

function applyStageRewards(
  state: Pick<GameState, 'coins' | 'inventory' | 'seeds' | 'unlocked'>,
  rewards: EventStageReward,
): Pick<GameState, 'coins' | 'inventory' | 'seeds' | 'unlocked'> {
  return {
    coins: state.coins + (rewards.rewardCoins ?? 0),
    inventory: addItems(state.inventory, rewards.rewardItems),
    seeds: addSeeds(state.seeds, rewards.rewardSeeds),
    unlocked: [...new Set([...state.unlocked, ...(rewards.unlocks ?? [])])],
  }
}

function ensureActiveMission(
  completedMissions: string[],
  playerLevel: number,
  activeMissionId: string | null,
  existingProgress?: Record<string, number>,
): { activeMissionId: string | null; missionProgress: Record<string, number> } {
  const completed = completedMissions
  const activeMission = activeMissionId ? MISSION_BY_ID[activeMissionId] : undefined
  const activeOk =
    activeMission &&
    !completed.includes(activeMissionId!) &&
    (!activeMission.requires || completed.includes(activeMission.requires))
  if (activeOk) {
    return {
      activeMissionId,
      missionProgress:
        existingProgress ?? emptyProgress(activeMission.goals, activeMission.id),
    }
  }
  const next = resolveActiveMission(completed, playerLevel, MISSIONS)
  return {
    activeMissionId: next?.id ?? null,
    missionProgress: next ? emptyProgress(next.goals, next.id) : {},
  }
}

function emptyProgress(goals: MissionGoal[], id: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const g of goals) out[goalKey(id, g.id)] = 0
  return out
}

function emptyEventProgress(eventId: string, stageIndex: number): Record<string, number> {
  const event = EVENT_BY_ID[eventId]
  const goals = event ? eventStageGoals(event, stageIndex) : []
  return emptyProgress(goals, eventStageParentId(eventId, stageIndex))
}

function firstMissionId(): string {
  return MISSIONS[0]?.id ?? 'm1_first_sprouts'
}

function migrateSaveState(
  persisted: unknown,
  version: number,
): Record<string, unknown> {
  const state = { ...(persisted as Record<string, unknown>) }
  if (version < 3) {
    if (Array.isArray(state.unlocked)) {
      state.unlocked = migrateUnlocked(state.unlocked as string[])
    }
    if (state.inventory && typeof state.inventory === 'object') {
      state.inventory = migrateInventory(
        state.inventory as Partial<Record<string, number>>,
      )
    }
  }
  if (typeof state.xp === 'number' && Array.isArray(state.unlocked)) {
    state.unlocked = syncLevelUnlocks(
      state.xp,
      state.unlocked as UnlockId[],
    )
  }
  if (!Array.isArray(state.recruitedNpcs)) state.recruitedNpcs = []
  if (!Array.isArray(state.activeAdventures)) state.activeAdventures = []
  if (!state.materials || typeof state.materials !== 'object') {
    state.materials = {}
  }
  if (!Array.isArray(state.gearInventory)) state.gearInventory = []
  if (!Array.isArray(state.gearCraftQueue)) state.gearCraftQueue = []
  const pane = state.adventurePane
  if (
    pane !== 'tavern' &&
    pane !== 'recruits' &&
    pane !== 'lands' &&
    pane !== 'workshop' &&
    pane !== 'materials'
  ) {
    state.adventurePane = 'tavern'
  }
  if (!state.gatherSlots || typeof state.gatherSlots !== 'object') {
    state.gatherSlots = { mountain: 1, forest: 1 }
  } else {
    const slots = state.gatherSlots as Record<GatherSiteId, number>
    if (typeof slots.mountain !== 'number') slots.mountain = 1
    if (typeof slots.forest !== 'number') slots.forest = 1
  }
  const materialsPane = state.materialsPane
  if (materialsPane !== 'mountain' && materialsPane !== 'forest') {
    state.materialsPane = 'mountain'
  }
  if (version < 6) {
    const unlocked = (state.unlocked as UnlockId[] | undefined) ?? []
    const owned = new Set([
      ...((state.ownedBuildings as BuildingId[] | undefined) ?? []),
      ...unlocked.filter((u) => u in BUILDINGS),
    ])
    state.ownedBuildings = [...owned] as BuildingId[]
    if (!state.machineQueueBonus || typeof state.machineQueueBonus !== 'object') {
      state.machineQueueBonus = {}
    }
    const xp = typeof state.xp === 'number' ? state.xp : 0
    if (
      (state.unlocked as UnlockId[])?.includes('orders_board') &&
      (!Array.isArray(state.activeOrders) ||
        (state.activeOrders as ActiveOrder[]).length === 0)
    ) {
      state.activeOrders = pickOrders(levelFromXp(xp))
    }
  }
  if (version < 7) {
    if (!Array.isArray(state.guideTabPulses)) state.guideTabPulses = []
    if (!Array.isArray(state.guideItemHighlights)) {
      state.guideItemHighlights = []
    }
    if (state.contextGuideTab !== null && state.contextGuideTab !== undefined) {
      const tabs = new Set([
        ...((state.guideTabPulses as TabId[] | undefined) ?? []),
      ])
      tabs.add(state.contextGuideTab as TabId)
      state.guideTabPulses = [...tabs]
    }
    state.contextGuideTab = null
  }
  if (version < 9) {
    if (Array.isArray(state.completedMissions)) {
      state.completedMissions = (state.completedMissions as string[]).map(
        (id) => LEGACY_MISSION_ID_MAP[id] ?? id,
      )
    }
    const xp = typeof state.xp === 'number' ? state.xp : 0
    const level = levelFromXp(xp)
    state.unlocked = syncLevelUnlocks(xp, (state.unlocked as UnlockId[]) ?? [])
    const completed = (state.completedMissions as string[]) ?? []
    const missionFix = ensureActiveMission(
      completed,
      level,
      (state.activeMissionId as string | null) ?? null,
      state.missionProgress as Record<string, number> | undefined,
    )
    state.activeMissionId = missionFix.activeMissionId
    state.missionProgress = missionFix.missionProgress
  }
  if (version < 10) {
    const xp = typeof state.xp === 'number' ? state.xp : 0
    const level = levelFromXp(xp)
    const completed = (state.completedMissions as string[]) ?? []
    const missionFix = ensureActiveMission(
      completed,
      level,
      (state.activeMissionId as string | null) ?? null,
      state.missionProgress as Record<string, number> | undefined,
    )
    state.activeMissionId = missionFix.activeMissionId
    state.missionProgress = missionFix.missionProgress
    if (typeof state.eventStageIndex !== 'number') {
      state.eventStageIndex = 0
    }
    if (state.activeEventId) {
      const eventId = state.activeEventId as string
      const event = EVENT_BY_ID[eventId]
      if (event?.stages?.length) {
        const stageIndex = Math.min(
          (state.eventStageIndex as number) || 0,
          event.stages.length - 1,
        )
        state.eventStageIndex = stageIndex
        state.eventProgress = emptyEventProgress(eventId, stageIndex)
      } else {
        state.activeEventId = null
        state.eventEndsAt = null
        state.eventProgress = {}
        state.eventStageIndex = 0
      }
    }
  }
  if (version < 11) {
    if (Array.isArray(state.unlocked)) {
      state.unlocked = migrateUnlocked(state.unlocked as string[])
    }
    if (state.selectedGearBuilding && typeof state.selectedGearBuilding === 'string') {
      state.selectedGearBuilding = migrateGearBuildingId(
        state.selectedGearBuilding,
      )
    }
    if (Array.isArray(state.gearCraftQueue)) {
      state.gearCraftQueue = (state.gearCraftQueue as GearCraftJob[]).map(
        (job) => ({
          ...job,
          buildingId: migrateGearBuildingId(job.buildingId) as GearBuildingId,
        }),
      )
    }
  }
  if (version < 12) {
    if (Array.isArray(state.recruitedNpcs)) {
      state.recruitedNpcs = (state.recruitedNpcs as RecruitedNpc[]).map((r) => ({
        ...r,
        xp: typeof r.xp === 'number' ? r.xp : 0,
      }))
    }
    if (Array.isArray(state.gearInventory)) {
      state.gearInventory = (state.gearInventory as GearInstance[]).map((g) => ({
        ...g,
        level: typeof g.level === 'number' ? g.level : 1,
      }))
    }
  }
  if (version < 13) {
    if (Array.isArray(state.gearInventory)) {
      state.gearInventory = (state.gearInventory as GearInstance[]).map((g) => {
        const bp = GEAR_BLUEPRINT_BY_ID[g.blueprintId]
        return {
          ...g,
          quality: g.quality ?? bp?.quality ?? 'rustic',
        }
      })
    }
  }
  if (version < 14) {
    if (!state.gatherSlots || typeof state.gatherSlots !== 'object') {
      state.gatherSlots = { mountain: 1, forest: 1 }
    }
    if (state.materialsPane !== 'mountain' && state.materialsPane !== 'forest') {
      state.materialsPane = 'mountain'
    }
  }
  if (version < 15) {
    const activeMissionId = state.activeMissionId as string | null | undefined
    if (activeMissionId && state.missionProgress) {
      state.missionProgress = migrateMissionProgress(
        activeMissionId,
        state.missionProgress as Record<string, number>,
      )
      if (
        !isMissionComplete(
          activeMissionId,
          state.missionProgress as Record<string, number>,
        )
      ) {
        state.popupQueue = ((state.popupQueue as PopupState[]) ?? []).filter(
          (p) => p.kind !== 'mission_claim',
        )
      }
    }
  }
  if (version < 16) {
    if (!Array.isArray(state.treeSlots)) {
      state.treeSlots = emptyTreeSlots(START_TREE_SLOTS)
    }
    if (!state.saplings || typeof state.saplings !== 'object') {
      state.saplings = {}
    }
    if (state.selectedTree == null) {
      state.selectedTree = 'apple_tree'
    }
    if (state.shopPane !== 'seed' && state.shopPane !== 'tree' && state.shopPane !== 'upgrade') {
      state.shopPane = 'seed'
    }
    if (state.farmPane !== 'plots' && state.farmPane !== 'trees') {
      state.farmPane = 'plots'
    }
  }
  if (version < 17) {
    if (!state.machineSpeedLevel || typeof state.machineSpeedLevel !== 'object') {
      state.machineSpeedLevel = {}
    }
    if (!state.animalSpeedLevel || typeof state.animalSpeedLevel !== 'object') {
      state.animalSpeedLevel = {}
    }
    if (typeof state.farmSpeedLevel !== 'number') {
      state.farmSpeedLevel = 0
    }
  }
  if (version < 18) {
    const level =
      typeof state.xp === 'number'
        ? levelFromXp(state.xp as number)
        : 1
    const dayKey = periodDayKey()
    const weekKey = periodWeekKey()
    state.dailyGoalsPeriodKey = dayKey
    state.dailyGoals = rollDailyGoals(level, dayKey)
    state.dailyGoalProgress = {}
    state.dailyBonusClaimed = false
    state.weeklyGoalsPeriodKey = weekKey
    state.weeklyGoals = rollWeeklyGoals(level, weekKey)
    state.weeklyGoalProgress = {}
    state.weeklyBonusClaimed = false
  }
  if (version < 19) {
    const level =
      typeof state.xp === 'number'
        ? levelFromXp(state.xp as number)
        : 1
    const weekKey = periodWeekKey()
    state.weeklyGoalsPeriodKey = weekKey
    state.weeklyGoals = rollWeeklyGoals(level, weekKey)
    state.weeklyGoalProgress = {}
    state.weeklyBonusClaimed = false
    state.rankingPoints = 0
    state.rankingWeekKey = weekKey
    state.rankingWeekPoints = 0
  }
  if (version < 20) {
    state.dailyRankingRank = null
    state.weeklyRankingRank = null
  }
  if (version < 21) {
    state.achievementProgress = {}
    state.claimedAchievements = []
  }
  if (version < 22) {
    const xp = typeof state.xp === 'number' ? state.xp : 0
    const level = levelFromXp(xp)
    const key = shipPeriodKey()
    state.shipPeriodKey = key
    state.activeShipOrders = (state.unlocked as UnlockId[])?.includes(
      'orders_board',
    )
      ? rollShipOrders(level, key)
      : []
  }
  if (version < 23) {
    const orders = state.activeShipOrders as
      | Array<Record<string, unknown>>
      | undefined
    if (Array.isArray(orders)) {
      state.activeShipOrders = orders.map((o) => ({
        slot: o.slot as number,
        itemId: o.itemId,
        qty: o.qty as number,
        rewardCoins: o.rewardCoins as number,
        rewardXp: o.rewardXp as number,
        filled: Boolean(o.filled ?? o.fulfilled),
      }))
    }
    if (typeof state.shipBoardComplete !== 'boolean') {
      const allDone = (state.activeShipOrders as ActiveShipOrder[] | undefined)?.every(
        (o) => o.filled,
      )
      state.shipBoardComplete = Boolean(allDone)
    }
  }
  if (version < 24) {
    state.gearRecipeCraftCount = {}
  }
  return state
}

function cropAvailable(cropId: CropId, playerLevel: number): boolean {
  return CROPS[cropId].unlockLevel <= playerLevel
}

function treeAvailable(treeId: TreeId, playerLevel: number): boolean {
  return TREES[treeId].unlockLevel <= playerLevel
}

function addMarketItems(
  itemKind: MarketItemKind,
  itemId: string,
  qty: number,
  state: Pick<GameState, 'inventory' | 'seeds' | 'materials'>,
): Pick<GameState, 'inventory' | 'seeds' | 'materials'> {
  if (itemKind === 'goods') {
    return { ...state, inventory: addItem(state.inventory, itemId as ItemId, qty) }
  }
  if (itemKind === 'seeds') {
    return {
      ...state,
      seeds: {
        ...state.seeds,
        [itemId as CropId]: (state.seeds[itemId as CropId] ?? 0) + qty,
      },
    }
  }
  return {
    ...state,
    materials: addMaterial(state.materials, itemId as MaterialId, qty),
  }
}

function takeMarketItems(
  itemKind: MarketItemKind,
  itemId: string,
  qty: number,
  state: Pick<GameState, 'inventory' | 'seeds' | 'materials'>,
): Pick<GameState, 'inventory' | 'seeds' | 'materials'> | null {
  if (itemKind === 'goods') {
    if ((state.inventory[itemId as ItemId] ?? 0) < qty) return null
    return {
      ...state,
      inventory: takeItems(state.inventory, { [itemId as ItemId]: qty }),
    }
  }
  if (itemKind === 'seeds') {
    if ((state.seeds[itemId as CropId] ?? 0) < qty) return null
    return {
      ...state,
      seeds: takeSeeds(state.seeds, { [itemId as CropId]: qty }),
    }
  }
  if ((state.materials[itemId as MaterialId] ?? 0) < qty) return null
  return {
    ...state,
    materials: takeMaterial(state.materials, { [itemId as MaterialId]: qty }),
  }
}

export interface GameState {
  coins: number
  xp: number
  seeds: Partial<Record<CropId, number>>
  inventory: Partial<Record<ItemId, number>>
  materials: Partial<Record<MaterialId, number>>
  plots: PlotState[]
  treeSlots: TreeSlotState[]
  saplings: Partial<Record<TreeId, number>>
  selectedCrop: CropId
  selectedTree: TreeId
  shopPane: ShopPaneId
  farmPane: FarmPaneId
  tab: TabId
  craftQueue: CraftJob[]
  activeOrders: ActiveOrder[]
  shipPeriodKey: string
  activeShipOrders: ActiveShipOrder[]
  shipBoardComplete: boolean
  animals: AnimalInstance[]
  unlocked: UnlockId[]
  ownedBuildings: BuildingId[]
  machineQueueBonus: Partial<Record<BuildingId, number>>
  machineSpeedLevel: Partial<Record<BuildingId, number>>
  animalSpeedLevel: Partial<Record<AnimalTypeId, number>>
  farmSpeedLevel: number
  completedMissions: string[]
  activeMissionId: string | null
  missionProgress: Record<string, number>
  activeEventId: string | null
  eventEndsAt: number | null
  eventStageIndex: number
  eventProgress: Record<string, number>
  completedEvents: string[]
  dailyGoalsPeriodKey: string
  dailyGoals: ScheduledGoalSlot[]
  dailyGoalProgress: Record<string, number>
  dailyBonusClaimed: boolean
  weeklyGoalsPeriodKey: string
  weeklyGoals: ScheduledGoalSlot[]
  weeklyGoalProgress: Record<string, number>
  weeklyBonusClaimed: boolean
  rankingPoints: number
  rankingWeekKey: string
  rankingWeekPoints: number
  dailyRankingRank: number | null
  weeklyRankingRank: number | null
  achievementProgress: Record<string, number>
  claimedAchievements: string[]
  selectedBuilding: BuildingId | null
  selectedAnimalBuilding: AnimalBuildingId | null
  selectedGearBuilding: GearBuildingId | null
  adventurePane: AdventurePaneId
  materialsPane: MaterialsPaneId
  gatherSlots: Record<GatherSiteId, number>
  recruitedNpcs: RecruitedNpc[]
  activeAdventures: ActiveAdventure[]
  gearInventory: GearInstance[]
  gearCraftQueue: GearCraftJob[]
  gearRecipeCraftCount: Record<string, number>
  popupQueue: PopupState[]
  toast: string | null
  guideTabPulses: TabId[]
  guideItemHighlights: string[]
  contextGuideTab: TabId | null
  darkMode: boolean
  shopScrollTarget: CropId | null
  shopTreeScrollTarget: TreeId | null
  machineScrollTarget: string | null
  unclaimedMarketSales: MarketSaleClaim[]

  setTab: (tab: TabId) => void
  setShopPane: (pane: ShopPaneId) => void
  setFarmPane: (pane: FarmPaneId) => void
  selectCrop: (id: CropId) => void
  selectTree: (id: TreeId) => void
  selectBuilding: (id: BuildingId | null) => void
  selectAnimalBuilding: (id: AnimalBuildingId | null) => void
  selectGearBuilding: (id: GearBuildingId | null) => void
  setAdventurePane: (pane: AdventurePaneId) => void
  setMaterialsPane: (pane: MaterialsPaneId) => void
  purchaseGatherSlot: (siteId: GatherSiteId) => void
  dismissPopup: () => void
  clearToast: () => void
  toggleDarkMode: () => void
  isTabPulsing: (tab: TabId) => boolean
  isUnlocked: (id: UnlockId) => boolean
  isBlueprintAvailable: (id: UnlockId) => boolean
  isBuildingOwned: (id: BuildingId) => boolean
  isOrdersOpen: () => boolean
  isMarketOpen: () => boolean
  isCropAvailable: (id: CropId) => boolean
  isTreeAvailable: (id: TreeId) => boolean
  isTavernOpen: () => boolean
  machineQueueCapacity: (id: BuildingId) => number

  navigateToItem: (itemId: ItemId, needQty?: number, force?: boolean) => void
  navigateToResource: (
    resourceId: CraftResourceId,
    needQty?: number,
    force?: boolean,
  ) => void
  navigateToMissionGoal: (goal: MissionGoal) => void
  clearShopScrollTarget: () => void
  clearShopTreeScrollTarget: () => void
  clearMachineScrollTarget: () => void

  buySeed: (id: CropId, amount?: number) => void
  buySapling: (id: TreeId, amount?: number) => void
  plant: (plotIndex: number) => void
  harvest: (plotIndex: number) => void
  unlockPlot: () => void
  plantTree: (slotIndex: number) => void
  harvestTree: (slotIndex: number) => void
  unlockTreeSlot: () => void

  startCraft: (recipeId: string) => void
  collectCraft: (index: number) => void
  purchaseBuilding: (id: BuildingId) => void
  upgradeMachineQueue: (id: BuildingId) => void
  upgradeMachineSpeed: (id: BuildingId) => void
  upgradeAnimalSpeed: (typeId: AnimalTypeId) => void
  upgradeFarmSpeed: () => void

  buyAnimal: (typeId: AnimalTypeId) => void
  feedAnimal: (animalId: string) => void
  collectAnimal: (animalId: string) => void

  fulfillOrder: (slot: number) => void
  fillShipOrder: (slot: number) => void
  shipCrate: () => void
  refreshShipOrders: () => void

  createMarketListing: (
    itemKind: MarketItemKind,
    itemId: string,
    qty: number,
    pricePerUnit: number,
  ) => Promise<boolean>
  buyMarketListing: (listingId: string) => Promise<boolean>
  cancelMarketListing: (listingId: string) => Promise<boolean>
  refreshMarketSales: () => Promise<void>
  claimMarketSale: (payoutId: string) => Promise<boolean>

  sellGoods: (id: ItemId, qty?: number) => void
  sellSeeds: (id: CropId, qty?: number) => void
  sellMaterial: (id: MaterialId, qty?: number) => void

  claimMission: () => void
  startEvent: (eventId: string) => void
  claimEvent: () => void
  claimScheduledGoal: (period: 'daily' | 'weekly', slotId: string) => void
  claimScheduledBonus: (period: 'daily' | 'weekly') => Promise<void>
  refreshScheduledGoals: () => void
  claimAchievement: (achievementId: string) => void

  recruitNpc: (npcId: string) => void
  startAdventure: (adventureId: string, npcInstanceIds: string[]) => void
  collectAdventure: (jobId: string) => void

  startGearCraft: (blueprintId: string) => void
  collectGearCraft: (index: number) => void
  equipGear: (gearInstanceId: string, npcInstanceId: string) => void
  unequipGear: (gearInstanceId: string) => void

  track: (
    kind: AchievementKind,
    target: string | undefined,
    amount?: number,
  ) => void

  resetGame: () => void
  /** Local dev only — no-op in production builds */
  devSetPlayerLevel: (targetLevel: number) => void
}

const initial = () => {
  const missionId = firstMissionId()
  const mission = MISSION_BY_ID[missionId]
  return {
    coins: 80,
    xp: 0,
    seeds: { wheat: 8, carrot: 4 } as Partial<Record<CropId, number>>,
    inventory: {} as Partial<Record<ItemId, number>>,
    materials: {} as Partial<Record<MaterialId, number>>,
    plots: emptyPlots(START_PLOTS),
    treeSlots: emptyTreeSlots(START_TREE_SLOTS),
    saplings: {} as Partial<Record<TreeId, number>>,
    selectedCrop: 'wheat' as CropId,
    selectedTree: 'apple_tree' as TreeId,
    shopPane: 'seed' as ShopPaneId,
    farmPane: 'plots' as FarmPaneId,
    tab: 'missions' as TabId,
    craftQueue: [] as CraftJob[],
    activeOrders: [] as ActiveOrder[],
    shipPeriodKey: shipPeriodKey(),
    activeShipOrders: [] as ActiveShipOrder[],
    shipBoardComplete: false,
    animals: [] as AnimalInstance[],
    unlocked: syncLevelUnlocks(0, []) as UnlockId[],
    ownedBuildings: [] as BuildingId[],
    machineQueueBonus: {} as Partial<Record<BuildingId, number>>,
    machineSpeedLevel: {} as Partial<Record<BuildingId, number>>,
    animalSpeedLevel: {} as Partial<Record<AnimalTypeId, number>>,
    farmSpeedLevel: 0,
    completedMissions: [] as string[],
    activeMissionId: missionId as string | null,
    missionProgress: mission ? emptyProgress(mission.goals, missionId) : {},
    activeEventId: null as string | null,
    eventEndsAt: null as number | null,
    eventStageIndex: 0,
    eventProgress: {} as Record<string, number>,
    completedEvents: [] as string[],
    dailyGoalsPeriodKey: periodDayKey(),
    dailyGoals: rollDailyGoals(1, periodDayKey()),
    dailyGoalProgress: {} as Record<string, number>,
    dailyBonusClaimed: false,
    weeklyGoalsPeriodKey: periodWeekKey(),
    weeklyGoals: rollWeeklyGoals(1, periodWeekKey()),
    weeklyGoalProgress: {} as Record<string, number>,
    weeklyBonusClaimed: false,
    rankingPoints: 0,
    rankingWeekKey: periodWeekKey(),
    rankingWeekPoints: 0,
    dailyRankingRank: null as number | null,
    weeklyRankingRank: null as number | null,
    achievementProgress: {} as Record<string, number>,
    claimedAchievements: [] as string[],
    selectedBuilding: null as BuildingId | null,
    selectedAnimalBuilding: null as AnimalBuildingId | null,
    selectedGearBuilding: null as GearBuildingId | null,
    adventurePane: 'tavern' as AdventurePaneId,
    materialsPane: 'mountain' as MaterialsPaneId,
    gatherSlots: { mountain: 1, forest: 1 } as Record<GatherSiteId, number>,
    recruitedNpcs: [] as RecruitedNpc[],
    activeAdventures: [] as ActiveAdventure[],
    gearInventory: [] as GearInstance[],
    gearCraftQueue: [] as GearCraftJob[],
    gearRecipeCraftCount: {} as Record<string, number>,
    popupQueue: [] as PopupState[],
    toast: 'Welcome! Level up to unlock machines and new seeds.' as string | null,
    guideTabPulses: [] as TabId[],
    guideItemHighlights: [] as string[],
    contextGuideTab: null as TabId | null,
    darkMode: false,
    shopScrollTarget: null as CropId | null,
    shopTreeScrollTarget: null as TreeId | null,
    machineScrollTarget: null as string | null,
    unclaimedMarketSales: [] as MarketSaleClaim[],
  }
}

function bumpGoals(
  progress: Record<string, number>,
  goals: MissionGoal[],
  parentId: string,
  kind: MissionGoal['kind'],
  target: string | undefined,
  amount: number,
): Record<string, number> {
  let changed = false
  const next = { ...progress }
  for (const g of goals) {
    if (g.kind !== kind) continue
    if (g.target != null && g.target !== target) continue
    const key = goalKey(parentId, g.id)
    const cur = next[key] ?? 0
    if (cur >= g.amount) continue
    if (kind === 'own_coins' || kind === 'own_material') {
      next[key] = Math.min(g.amount, amount)
    } else {
      next[key] = Math.min(g.amount, cur + amount)
    }
    changed = true
  }
  return changed ? next : progress
}

type AchievementSlice = Pick<
  GameState,
  | 'recruitedNpcs'
  | 'ownedBuildings'
  | 'completedMissions'
  | 'xp'
>

function syncStateAchievements(
  progress: Record<string, number>,
  s: AchievementSlice,
): Record<string, number> {
  const next = { ...progress }
  for (const ach of ACHIEVEMENTS) {
    switch (ach.kind) {
      case 'recruit':
        next[ach.id] = Math.min(ach.amount, s.recruitedNpcs.length)
        break
      case 'purchase_building':
        next[ach.id] = Math.min(ach.amount, s.ownedBuildings.length)
        break
      case 'claim_mission':
        next[ach.id] = Math.min(ach.amount, s.completedMissions.length)
        break
      case 'reach_level':
        next[ach.id] = Math.min(ach.amount, levelFromXp(s.xp))
        break
    }
  }
  return next
}

function bumpAchievementProgress(
  progress: Record<string, number>,
  kind: AchievementKind,
  target: string | undefined,
  value: number,
  s: AchievementSlice,
): Record<string, number> {
  let next = syncStateAchievements(progress, s)

  for (const ach of ACHIEVEMENTS) {
    if (
      ach.kind === 'recruit' ||
      ach.kind === 'purchase_building' ||
      ach.kind === 'claim_mission' ||
      ach.kind === 'reach_level'
    ) {
      continue
    }
    if (ach.kind !== kind) continue
    if (ach.target != null && ach.target !== target) continue
    const cur = next[ach.id] ?? 0
    if (cur >= ach.amount) continue
    next[ach.id] = Math.min(ach.amount, cur + value)
  }

  for (const ach of ACHIEVEMENTS) {
    if ((next[ach.id] ?? 0) !== (progress[ach.id] ?? 0)) return next
  }
  return progress
}

function persistedDefaults() {
  const data = initial()
  const {
    tab: _tab,
    toast: _toast,
    popupQueue: _popupQueue,
    contextGuideTab: _contextGuideTab,
    ...rest
  } = data
  return rest
}

adoptLegacySaveIfNeeded()

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial(),

      setTab: (tab) =>
        set((s) => {
          const switching = s.tab !== tab
          const patch: Partial<GameState> = {
            tab,
            selectedBuilding:
              switching && tab === 'machines' ? null : s.selectedBuilding,
            selectedAnimalBuilding:
              switching && tab === 'animals' ? null : s.selectedAnimalBuilding,
            guideTabPulses: s.guideTabPulses.filter((t) => t !== tab),
            contextGuideTab:
              s.contextGuideTab === tab ? null : s.contextGuideTab,
          }
          if (tab === 'orders') {
            Object.assign(
              patch,
              ensureShipOrders(levelFromXp(s.xp), s),
            )
          }
          return patch
        }),
      setShopPane: (pane) => set({ shopPane: pane }),
      setFarmPane: (pane) => set({ farmPane: pane }),
      selectCrop: (id) => set({ selectedCrop: id }),
      selectTree: (id) => set({ selectedTree: id }),
      selectBuilding: (id) =>
        set((s) => ({
          selectedBuilding: id,
          guideItemHighlights:
            id != null
              ? s.guideItemHighlights.filter((h) => h !== id)
              : s.guideItemHighlights,
        })),
      selectAnimalBuilding: (id) =>
        set((s) => ({
          selectedAnimalBuilding: id,
          guideItemHighlights:
            id != null
              ? s.guideItemHighlights.filter((h) => h !== id)
              : s.guideItemHighlights,
        })),
      selectGearBuilding: (id) =>
        set((s) => ({
          selectedGearBuilding: id,
          guideItemHighlights:
            id != null
              ? s.guideItemHighlights.filter((h) => h !== id)
              : s.guideItemHighlights,
        })),
      setAdventurePane: (pane) =>
        set((s) => ({
          adventurePane: pane,
          selectedGearBuilding:
            pane === 'workshop'
              ? s.adventurePane === 'workshop'
                ? s.selectedGearBuilding
                : null
              : null,
        })),
      setMaterialsPane: (pane) => set({ materialsPane: pane }),
      purchaseGatherSlot: (siteId) => {
        const site = GATHER_SITES[siteId]
        const s = get()
        if (!s.unlocked.includes(site.machineId)) {
          set({
            toast: `Unlock ${site.machineName} first — check Missions & Machines`,
          })
          return
        }
        const owned = s.gatherSlots[siteId] ?? 1
        if (owned >= GATHER_SITE_MAX_SLOTS) {
          set({ toast: `${site.name} is fully expanded` })
          return
        }
        const cost = gatherSlotCost(siteId, owned)
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins to expand ${site.name}` })
          return
        }
        const next = owned + 1
        set({
          coins: s.coins - cost,
          gatherSlots: { ...s.gatherSlots, [siteId]: next },
          toast: `${site.name} → ${next} slots · ${site.machineName} yields ×${next} per craft`,
        })
        get().track('own_coins', undefined, get().coins)
      },
      dismissPopup: () =>
        set((s) => ({ popupQueue: s.popupQueue.slice(1) })),
      clearToast: () => set({ toast: null }),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      isTabPulsing: (tab) =>
        tabShouldPulse(
          tab,
          get().guideTabPulses,
          get().contextGuideTab,
        ),
      isUnlocked: (id) => get().unlocked.includes(id),
  isBlueprintAvailable: (id) => {
    const s = get()
    return (
      s.unlocked.includes(id) ||
      isBuildingRequiredByMission(activeMissionDef(s.activeMissionId), id as BuildingId)
    )
  },
      isBuildingOwned: (id) => get().ownedBuildings.includes(id),
      isOrdersOpen: () => get().unlocked.includes('orders_board'),
      isMarketOpen: () => {
        const s = get()
        return (
          s.unlocked.includes('market_board') ||
          levelFromXp(s.xp) >= MARKET_UNLOCK_LEVEL
        )
      },
      isCropAvailable: (id) =>
        cropAvailable(id, levelFromXp(get().xp)),
      isTreeAvailable: (id) =>
        treeAvailable(id, levelFromXp(get().xp)),
      isTavernOpen: () => get().unlocked.includes('tavern'),
      machineQueueCapacity: (id) =>
        machineQueueSize(id, get().machineQueueBonus),

      navigateToItem: (itemId, needQty = 1, force = false) => {
        const s = get()
        const meta = ITEM_META[itemId]
        const have = s.inventory[itemId] ?? 0
        if (!force && have >= needQty) return

        if (isCropItem(itemId)) {
          const crop = CROPS[itemId]
          const seedCount = s.seeds[itemId] ?? 0
          if (seedCount > 0) {
            set({
              tab: 'farm',
              farmPane: 'plots',
              selectedCrop: itemId,
              shopScrollTarget: null,
              machineScrollTarget: null,
              toast: `Selected ${crop.name} seeds — tap empty soil to plant`,
            })
            return
          }
          if (s.isCropAvailable(itemId)) {
            set({
              tab: 'shop',
              shopPane: 'seed',
              shopScrollTarget: itemId,
              machineScrollTarget: null,
              guideItemHighlights: [
                ...new Set([...s.guideItemHighlights, itemId]),
              ],
              toast: `Buy ${crop.name} seeds in the shop`,
            })
            return
          }
          set({ toast: `${crop.name} seeds locked — finish Missions first` })
          return
        }

        if (isTreeProduct(itemId)) {
          const treeId = treeForProduct(itemId)
          const meta = ITEM_META[itemId]
          if (treeId) {
            const saplingCount = s.saplings[treeId] ?? 0
            if (saplingCount > 0) {
              set({
                tab: 'farm',
                farmPane: 'trees',
                selectedTree: treeId,
                toast: `Selected ${TREES[treeId].name} — tap an empty tree slot to plant`,
              })
              return
            }
            if (s.isTreeAvailable(treeId)) {
              set({
                tab: 'shop',
                shopPane: 'tree',
                shopTreeScrollTarget: treeId,
                guideItemHighlights: [
                  ...new Set([...s.guideItemHighlights, treeId]),
                ],
                toast: `Buy ${TREES[treeId].name} saplings in the shop`,
              })
              return
            }
          }
          set({ toast: `${meta.name} comes from orchard trees — level up to unlock` })
          return
        }

        const machineId = machineBuildingForItem(
          itemId,
          mergeMissionBuildingUnlocks(s.unlocked, activeMissionDef(s.activeMissionId)),
        )
        if (machineId) {
          const recipe = recipeProducing(itemId)
          set({
            tab: 'machines',
            selectedBuilding: machineId,
            shopScrollTarget: null,
            machineScrollTarget: recipe?.id ?? null,
            guideItemHighlights: [
              ...new Set([...s.guideItemHighlights, itemId]),
            ],
            toast: `Make ${meta.name} at the ${BUILDINGS[machineId].name}`,
          })
          return
        }

        const animalBuilding = animalBuildingForProduct(itemId, s.unlocked)
        if (animalBuilding) {
          set({
            tab: 'animals',
            selectedAnimalBuilding: animalBuilding,
            shopScrollTarget: null,
            machineScrollTarget: null,
            toast: `Collect ${meta.name} from your animals`,
          })
          return
        }

        const recipe = recipeProducing(itemId)
        if (recipe) {
          const effective = mergeMissionBuildingUnlocks(
            s.unlocked,
            activeMissionDef(s.activeMissionId),
          )
          if (effective.includes(recipe.buildingId)) {
            set({
              tab: 'machines',
              selectedBuilding: recipe.buildingId,
              shopScrollTarget: null,
              machineScrollTarget: recipe.id,
              guideItemHighlights: [
                ...new Set([...s.guideItemHighlights, itemId]),
              ],
              toast: `Make ${meta.name} at the ${BUILDINGS[recipe.buildingId].name}`,
            })
            return
          }
          set({
            toast: `Unlock the ${BUILDINGS[recipe.buildingId].name} via Missions first`,
          })
          return
        }

        set({ toast: `Find ${meta.name} through Missions and machines` })
      },

      navigateToResource: (resourceId, needQty = 1, force = false) => {
        if (!isMaterialId(resourceId)) {
          get().navigateToItem(resourceId, needQty, force)
          return
        }
        const s = get()
        const materialId = resourceId
        const have = s.materials[materialId] ?? 0
        if (!force && have >= needQty) return

        const meta = MATERIAL_META[materialId]

        const machineId = machineBuildingForMaterial(materialId, s.unlocked)
        if (machineId) {
          const recipe = recipeProducingMaterial(materialId)
          set({
            tab: 'machines',
            selectedBuilding: machineId,
            shopScrollTarget: null,
            machineScrollTarget: recipe?.id ?? null,
            guideItemHighlights: [
              ...new Set([...s.guideItemHighlights, materialId]),
            ],
            toast: `Make ${meta.name} at the ${BUILDINGS[machineId].name}`,
          })
          return
        }

        const animalBuilding = animalBuildingForMaterial(materialId, s.unlocked)
        if (animalBuilding) {
          set({
            tab: 'animals',
            selectedAnimalBuilding: animalBuilding,
            shopScrollTarget: null,
            machineScrollTarget: null,
            toast: `Collect ${meta.name} from your animals`,
          })
          return
        }

        const recipe = recipeProducingMaterial(materialId)
        if (recipe) {
          if (adventureRewardsMaterial(materialId) && s.isTavernOpen()) {
            set({
              tab: 'adventure',
              adventurePane: 'lands',
              shopScrollTarget: null,
              machineScrollTarget: null,
              toast: `${meta.name} drops from expeditions — unlock ${BUILDINGS[recipe.buildingId].name} or send parties exploring`,
            })
            return
          }
          set({
            toast: `Unlock the ${BUILDINGS[recipe.buildingId].name} via Missions first`,
          })
          return
        }

        if (adventureRewardsMaterial(materialId) && s.isTavernOpen()) {
          set({
            tab: 'adventure',
            adventurePane: 'lands',
            shopScrollTarget: null,
            machineScrollTarget: null,
            toast: `${meta.name} drops from expeditions — send recruits exploring`,
          })
          return
        }

        set({ toast: `${meta.name} comes from machines, animals, or adventures` })
      },

      navigateToMissionGoal: (goal) => {
        const s = get()
        switch (goal.kind) {
          case 'harvest':
          case 'craft':
          case 'collect_animal':
            if (goal.target) {
              get().navigateToItem(goal.target as ItemId, goal.amount, true)
            }
            return
          case 'buy_animal': {
            const animal = ANIMALS[goal.target as AnimalTypeId]
            if (!animal) return
            if (!s.unlocked.includes(animal.buildingId)) {
              set({
                toast: `Unlock ${ANIMAL_BUILDINGS[animal.buildingId].name} via Missions`,
              })
              return
            }
            set({
              tab: 'animals',
              selectedAnimalBuilding: animal.buildingId,
              shopScrollTarget: null,
              toast: `Buy a ${animal.name} here`,
            })
            return
          }
          case 'fulfill_order':
            if (s.isOrdersOpen()) {
              set({ tab: 'orders', toast: 'Fulfill an order from your board' })
            } else {
              set({ toast: `Orders unlock at Level ${ORDERS_UNLOCK_LEVEL}` })
            }
            return
          case 'own_coins':
            set({ toast: 'Earn coins from harvests, crafts, and orders' })
            return
          case 'recruit':
            if (s.isTavernOpen()) {
              set({
                tab: 'adventure',
                adventurePane: 'tavern',
                toast: 'Recruit an adventurer at the Tavern',
              })
            } else {
              set({ toast: `Tavern unlocks at Level ${TAVERN_UNLOCK_LEVEL}` })
            }
            return
          case 'complete_adventure':
            if (s.unlocked.includes('adventure_land')) {
              set({
                tab: 'adventure',
                adventurePane: 'lands',
                toast: goal.target
                  ? 'Send a party on this expedition'
                  : 'Complete an expedition in Adventure Land',
              })
            } else {
              set({ toast: `Adventure Land unlocks at Level ${TAVERN_UNLOCK_LEVEL}` })
            }
            return
          case 'craft_gear': {
            if (!s.unlocked.includes('tavern')) {
              set({ toast: `Workshops unlock at Level ${TAVERN_UNLOCK_LEVEL}` })
              return
            }
            const blueprint = goal.target
              ? GEAR_BLUEPRINT_BY_ID[goal.target]
              : null
            const buildingId =
              blueprint?.buildingId ??
              (s.unlocked.includes('smithy') ? 'smithy' : 'tailor_workshop')
            set({
              tab: 'adventure',
              adventurePane: 'workshop',
              selectedGearBuilding: buildingId,
              toast: blueprint
                ? `Craft ${blueprint.name} at the workshop`
                : 'Craft gear at a workshop',
            })
            return
          }
          case 'gather_material':
          case 'own_material':
            if (goal.target) {
              get().navigateToResource(goal.target as MaterialId, goal.amount, true)
            }
            return
        }
      },

      clearShopScrollTarget: () => set({ shopScrollTarget: null }),

      clearShopTreeScrollTarget: () => set({ shopTreeScrollTarget: null }),

      clearMachineScrollTarget: () => set({ machineScrollTarget: null }),

      track: (kind, target, amount = 1) => {
        const s = get()
        const playerLevel = levelFromXp(s.xp)
        const goalRefresh = ensureScheduledGoals(playerLevel, s)
        const base = goalRefresh.dailyGoals ? { ...s, ...goalRefresh } : s

        let missionProgress = base.missionProgress
        let eventProgress = base.eventProgress
        let dailyGoalProgress = base.dailyGoalProgress
        let weeklyGoalProgress = base.weeklyGoalProgress
        let achievementProgress = bumpAchievementProgress(
          base.achievementProgress,
          kind as AchievementKind,
          target,
          kind === 'own_coins'
            ? base.coins
            : kind === 'own_material' && target
              ? (base.materials[target as MaterialId] ?? 0)
              : amount,
          base,
        )
        const value =
          kind === 'own_coins'
            ? base.coins
            : kind === 'own_material' && target
              ? (base.materials[target as MaterialId] ?? 0)
              : amount

        if (base.activeMissionId) {
          const mission = MISSION_BY_ID[base.activeMissionId]
          if (mission && !isMissionLevelGated(mission, playerLevel)) {
            missionProgress = bumpGoals(
              missionProgress,
              mission.goals,
              base.activeMissionId,
              kind as MissionGoal['kind'],
              target,
              value,
            )
          }
        }

        if (base.activeEventId && base.eventEndsAt && Date.now() < base.eventEndsAt) {
          const event = EVENT_BY_ID[base.activeEventId]
          if (event) {
            const stage = event.stages[base.eventStageIndex]
            if (stage) {
              const parentId = eventStageParentId(base.activeEventId, base.eventStageIndex)
              eventProgress = bumpGoals(
                eventProgress,
                stage.goals,
                parentId,
                kind as MissionGoal['kind'],
                target,
                value,
              )
            }
          }
        }

        const dailyGoals = slotsToMissionGoals(base.dailyGoals)
        if (dailyGoals.length > 0) {
          dailyGoalProgress = bumpGoals(
            dailyGoalProgress,
            dailyGoals,
            DAILY_GOALS_PARENT_ID,
            kind as MissionGoal['kind'],
            target,
            value,
          )
        }

        const weeklyGoals = slotsToMissionGoals(base.weeklyGoals)
        if (weeklyGoals.length > 0) {
          weeklyGoalProgress = bumpGoals(
            weeklyGoalProgress,
            weeklyGoals,
            WEEKLY_GOALS_PARENT_ID,
            kind as MissionGoal['kind'],
            target,
            value,
          )
        }

        const missionPatch = resolveMissionProgress(base, missionProgress)

        if (
          missionPatch.missionProgress !== s.missionProgress ||
          eventProgress !== s.eventProgress ||
          dailyGoalProgress !== s.dailyGoalProgress ||
          weeklyGoalProgress !== s.weeklyGoalProgress ||
          achievementProgress !== s.achievementProgress ||
          missionPatch.popupQueue !== s.popupQueue ||
          Object.keys(goalRefresh).length > 0
        ) {
          set({
            ...goalRefresh,
            missionProgress: missionPatch.missionProgress,
            eventProgress,
            dailyGoalProgress,
            weeklyGoalProgress,
            achievementProgress,
            popupQueue: missionPatch.popupQueue,
          })
        }
      },

      buySeed: (id, amount = 1) => {
        const crop = CROPS[id]
        if (!crop) return
        if (!get().isCropAvailable(id)) {
          set({ toast: 'Crop locked — finish missions to unlock' })
          return
        }
        const cost = crop.seedCost * amount
        if (get().coins < cost) {
          set({ toast: 'Not enough coins' })
          return
        }
        set((s) => ({
          coins: s.coins - cost,
          seeds: { ...s.seeds, [id]: (s.seeds[id] ?? 0) + amount },
          toast: `Bought ${amount}× ${crop.name} seed`,
          guideItemHighlights: s.guideItemHighlights.filter((h) => h !== id),
          contextGuideTab:
            s.contextGuideTab === 'shop' ? null : s.contextGuideTab,
          guideTabPulses:
            s.contextGuideTab === 'shop'
              ? s.guideTabPulses.filter((t) => t !== 'shop')
              : s.guideTabPulses,
        }))
        get().track('own_coins', undefined, get().coins)
      },

      buySapling: (id, amount = 1) => {
        const tree = TREES[id]
        if (!tree) return
        if (!get().isTreeAvailable(id)) {
          set({ toast: 'Tree locked — level up to unlock' })
          return
        }
        const cost = tree.saplingCost * amount
        if (get().coins < cost) {
          set({ toast: 'Not enough coins' })
          return
        }
        set((s) => ({
          coins: s.coins - cost,
          saplings: { ...s.saplings, [id]: (s.saplings[id] ?? 0) + amount },
          toast: `Bought ${amount}× ${tree.name} sapling`,
          guideItemHighlights: s.guideItemHighlights.filter((h) => h !== id),
          contextGuideTab:
            s.contextGuideTab === 'shop' ? null : s.contextGuideTab,
          guideTabPulses:
            s.contextGuideTab === 'shop'
              ? s.guideTabPulses.filter((t) => t !== 'shop')
              : s.guideTabPulses,
        }))
        get().track('own_coins', undefined, get().coins)
      },

      plant: (plotIndex) => {
        const s = get()
        const plot = s.plots[plotIndex]
        if (!plot || plot.cropId) return
        const cropId = s.selectedCrop
        const crop = CROPS[cropId]
        if (!crop) return
        if (!s.isCropAvailable(cropId)) {
          set({ toast: 'Crop locked — finish missions to unlock' })
          return
        }
        if ((s.seeds[cropId] ?? 0) < 1) {
          set((state) => ({
            toast: 'No seeds — buy some in Shop',
            ...shopGuidePatch(state),
          }))
          return
        }
        const plots = s.plots.map((p, i) =>
          i === plotIndex ? { cropId, plantedAt: Date.now() } : p,
        )
        const seeds = { ...s.seeds }
        const left = (seeds[cropId] ?? 0) - 1
        if (left <= 0) delete seeds[cropId]
        else seeds[cropId] = left
        set({ plots, seeds })
      },

      harvest: (plotIndex) => {
        const s = get()
        const plot = s.plots[plotIndex]
        if (!plot?.cropId || plot.plantedAt == null) return
        const crop = CROPS[plot.cropId]
        if (!crop) return
        if (Date.now() - plot.plantedAt < effectiveMs(crop.growMs, s.farmSpeedLevel)) {
          set({ toast: 'Still growing — no rush' })
          return
        }
        const cropId = plot.cropId
        const plots = s.plots.map((p, i) =>
          i === plotIndex ? { cropId: null, plantedAt: null } : p,
        )
        const xpResult = applyXpGain(
          s.xp,
          crop.xp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          plots,
          inventory: addItem(s.inventory, cropId, crop.harvestQty),
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: `Harvested ${crop.harvestQty}× ${crop.name}`,
        })
        get().track('harvest', cropId, crop.harvestQty)
      },

      unlockPlot: () => {
        const s = get()
        if (s.plots.length >= MAX_PLOTS) {
          set({ toast: 'Farm is full for now' })
          return
        }
        const cost = PLOT_UNLOCK_BASE * s.plots.length
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins` })
          return
        }
        set({
          coins: s.coins - cost,
          plots: [...s.plots, { cropId: null, plantedAt: null }],
          toast: 'New plot unlocked!',
        })
        get().track('own_coins', undefined, get().coins)
      },

      plantTree: (slotIndex) => {
        const s = get()
        const slot = s.treeSlots[slotIndex]
        if (!slot || slot.treeId) return
        const treeId = s.selectedTree
        const tree = TREES[treeId]
        if (!tree) return
        if (!s.isTreeAvailable(treeId)) {
          set({ toast: 'Tree locked — level up to unlock' })
          return
        }
        if ((s.saplings[treeId] ?? 0) < 1) {
          set((state) => ({
            toast: 'No saplings — buy some in Shop',
            tab: 'shop',
            shopPane: 'tree',
            ...shopGuidePatch(state),
          }))
          return
        }
        const treeSlots = s.treeSlots.map((t, i) =>
          i === slotIndex ? { treeId, plantedAt: Date.now() } : t,
        )
        const saplings = { ...s.saplings }
        const left = (saplings[treeId] ?? 0) - 1
        if (left <= 0) delete saplings[treeId]
        else saplings[treeId] = left
        set({ treeSlots, saplings })
        get().track('plant_tree', treeId, 1)
      },

      harvestTree: (slotIndex) => {
        const s = get()
        const slot = s.treeSlots[slotIndex]
        if (!slot?.treeId || slot.plantedAt == null) return
        const tree = TREES[slot.treeId]
        if (!tree) return
        if (Date.now() - slot.plantedAt < effectiveMs(tree.growMs, s.farmSpeedLevel)) {
          set({ toast: 'Still growing — trees take patience' })
          return
        }
        const treeSlots = s.treeSlots.map((t, i) =>
          i === slotIndex
            ? { treeId: t.treeId, plantedAt: Date.now() }
            : t,
        )
        const xpResult = applyXpGain(
          s.xp,
          tree.xp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        const productMeta = ITEM_META[tree.product]
        set({
          treeSlots,
          inventory: addItem(s.inventory, tree.product, tree.harvestQty),
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: `Harvested ${tree.harvestQty}× ${productMeta.name} — tree stays planted`,
        })
        get().track('harvest', tree.product, tree.harvestQty)
      },

      unlockTreeSlot: () => {
        const s = get()
        if (s.treeSlots.length >= MAX_TREE_SLOTS) {
          set({ toast: 'Orchard is full for now' })
          return
        }
        const cost = TREE_SLOT_UNLOCK_BASE * s.treeSlots.length
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins` })
          return
        }
        set({
          coins: s.coins - cost,
          treeSlots: [...s.treeSlots, { treeId: null, plantedAt: null }],
          toast: 'New tree slot unlocked!',
        })
        get().track('own_coins', undefined, get().coins)
      },

      startCraft: (recipeId) => {
        const recipe = RECIPES.find((r) => r.id === recipeId)
        if (!recipe) return
        const s = get()
        const blueprintOk =
          s.unlocked.includes(recipe.buildingId) ||
          isBuildingRequiredByMission(activeMissionDef(s.activeMissionId), recipe.buildingId)
        if (!blueprintOk) {
          set({ toast: 'Machine blueprint locked — check Missions' })
          return
        }
        if (!s.ownedBuildings.includes(recipe.buildingId)) {
          set({ toast: 'Purchase this machine first' })
          return
        }
        const missionCraft =
          s.activeMissionId != null &&
          isRecipeRequiredByMission(activeMissionDef(s.activeMissionId), recipeId)
        const needLevel = recipeUnlockLevel(recipeId)
        if (!missionCraft && levelFromXp(s.xp) < needLevel) {
          set({ toast: `Reach Level ${needLevel} to craft this` })
          return
        }
        const building = BUILDINGS[recipe.buildingId]
        const queued = s.craftQueue.filter((j) => j.buildingId === recipe.buildingId)
        const queueCap = machineQueueSize(recipe.buildingId, s.machineQueueBonus)
        if (queued.length >= queueCap) {
          set({ toast: `${building.name} queue full (${queueCap} slots)` })
          return
        }
        if (!hasResources(s.inventory, s.materials, recipe.inputs)) {
          set({ toast: 'Missing ingredients' })
          return
        }
        const now = Date.now()
        const speedLevel = s.machineSpeedLevel[recipe.buildingId] ?? 0
        const craftMs = effectiveMs(recipe.craftMs, speedLevel)
        const taken = takeResources(s.inventory, s.materials, recipe.inputs)
        set((s) =>
          withMissionProgress(s, {
            inventory: taken.inventory,
            materials: taken.materials,
            craftQueue: [
              ...s.craftQueue,
              {
                recipeId,
                buildingId: recipe.buildingId,
                startedAt: now,
                doneAt: now + craftMs,
              },
            ],
            toast: `${building.name}: ${recipe.name}…`,
          }),
        )
      },

      collectCraft: (index) => {
        const s = get()
        const job = s.craftQueue[index]
        if (!job || Date.now() < job.doneAt) return
        const recipe = RECIPES.find((r) => r.id === job.recipeId)
        if (!recipe) return
        const craftQueue = s.craftQueue.filter((_, i) => i !== index)
        const xpResult = applyXpGain(
          s.xp,
          recipe.xp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        const outputLabel = recipe.materialOutput
          ? MATERIAL_META[recipe.materialOutput].name
          : recipe.output
            ? ITEM_META[recipe.output].name
            : 'item'
        const outputQty = materialRecipeYield(recipe, s.gatherSlots)
        set({
          craftQueue,
          inventory: recipe.output
            ? addItem(s.inventory, recipe.output, outputQty)
            : s.inventory,
          materials: recipe.materialOutput
            ? addMaterial(
                s.materials,
                recipe.materialOutput,
                outputQty,
              )
            : s.materials,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: `Collected ${outputQty}× ${outputLabel}`,
        })
        if (recipe.output) {
          get().track('craft', recipe.output, outputQty)
        }
        if (recipe.materialOutput) {
          get().track('gather_material', recipe.materialOutput, outputQty)
          get().track('own_material', recipe.materialOutput)
        }
      },

      purchaseBuilding: (id) => {
        const building = BUILDINGS[id]
        if (!building) return
        const s = get()
        if (
          !s.unlocked.includes(id) &&
          !isBuildingRequiredByMission(activeMissionDef(s.activeMissionId), id)
        ) {
          set({ toast: 'Blueprint locked — level up to unlock' })
          return
        }
        if (s.ownedBuildings.includes(id)) {
          set({ toast: `${building.name} already built` })
          return
        }
        if (s.coins < building.buyCost) {
          set({ toast: `Need ${building.buyCost} coins to build` })
          return
        }
        set({
          coins: s.coins - building.buyCost,
          ownedBuildings: [...s.ownedBuildings, id],
          toast: `${building.name} built! Queue: ${BASE_MACHINE_QUEUE} slots`,
        })
        get().track('purchase_building', id, 1)
        get().track('own_coins', undefined, get().coins)
      },

      upgradeMachineQueue: (id) => {
        const building = BUILDINGS[id]
        if (!building) return
        const s = get()
        if (!s.ownedBuildings.includes(id)) {
          set({ toast: 'Build the machine first' })
          return
        }
        const bonus = s.machineQueueBonus[id] ?? 0
        if (machineQueueSize(id, s.machineQueueBonus) >= MAX_MACHINE_QUEUE) {
          set({ toast: `${building.name} queue is maxed out (${MAX_MACHINE_QUEUE} slots)` })
          return
        }
        const cost = queueUpgradeCost(id, bonus)
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins for queue upgrade` })
          return
        }
        const nextBonus = bonus + 1
        set({
          coins: s.coins - cost,
          machineQueueBonus: { ...s.machineQueueBonus, [id]: nextBonus },
          toast: `${building.name} queue → ${BASE_MACHINE_QUEUE + nextBonus} slots`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      upgradeMachineSpeed: (id) => {
        const building = BUILDINGS[id]
        if (!building) return
        const s = get()
        if (!s.ownedBuildings.includes(id)) {
          set({ toast: 'Build the machine first' })
          return
        }
        const level = s.machineSpeedLevel[id] ?? 0
        if (level >= MAX_SPEED_LEVEL) {
          set({ toast: `${building.name} speed is maxed out` })
          return
        }
        const cost = machineSpeedUpgradeCost(id, level)
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins for speed upgrade` })
          return
        }
        const next = level + 1
        set({
          coins: s.coins - cost,
          machineSpeedLevel: { ...s.machineSpeedLevel, [id]: next },
          toast: `${building.name} crafts ${Math.round((1 - Math.pow(0.88, next)) * 100)}% faster`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      upgradeAnimalSpeed: (typeId) => {
        const def = ANIMALS[typeId]
        if (!def) return
        const s = get()
        if (!s.animals.some((a) => a.typeId === typeId)) {
          set({ toast: `Buy a ${def.name} first` })
          return
        }
        const level = s.animalSpeedLevel[typeId] ?? 0
        if (level >= MAX_SPEED_LEVEL) {
          set({ toast: `${def.name} speed is maxed out` })
          return
        }
        const cost = animalSpeedUpgradeCost(typeId, level)
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins for speed upgrade` })
          return
        }
        const next = level + 1
        set({
          coins: s.coins - cost,
          animalSpeedLevel: { ...s.animalSpeedLevel, [typeId]: next },
          toast: `${def.name} produces ${Math.round((1 - Math.pow(0.88, next)) * 100)}% faster`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      upgradeFarmSpeed: () => {
        const s = get()
        if (s.farmSpeedLevel >= MAX_SPEED_LEVEL) {
          set({ toast: 'Farm growth speed is maxed out' })
          return
        }
        const cost = farmSpeedUpgradeCost(s.farmSpeedLevel)
        if (s.coins < cost) {
          set({ toast: `Need ${cost} coins for farm speed upgrade` })
          return
        }
        const next = s.farmSpeedLevel + 1
        set({
          coins: s.coins - cost,
          farmSpeedLevel: next,
          toast: `Crops & trees grow ${Math.round((1 - Math.pow(0.88, next)) * 100)}% faster`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      buyAnimal: (typeId) => {
        const def = ANIMALS[typeId]
        if (!def) return
        const s = get()
        if (!s.unlocked.includes(def.buildingId)) {
          set({ toast: `${def.name} building locked — check Missions` })
          return
        }
        const owned = s.animals.filter((a) => a.typeId === typeId).length
        if (owned >= def.maxOwned) {
          set({ toast: `Max ${def.name}s owned` })
          return
        }
        if (s.coins < def.buyCost) {
          set({ toast: `Need ${def.buyCost} coins` })
          return
        }
        const needsFeed = Boolean(def.feedItem)
        const animal: AnimalInstance = {
          id: uid(),
          typeId,
          startedAt: needsFeed ? null : Date.now(),
        }
        set({
          coins: s.coins - def.buyCost,
          animals: [...s.animals, animal],
          toast: `Bought ${def.name}!`,
        })
        get().track('buy_animal', typeId, 1)
        get().track('own_coins', undefined, get().coins)
      },

      feedAnimal: (animalId) => {
        const s = get()
        const animal = s.animals.find((a) => a.id === animalId)
        if (!animal || animal.startedAt != null) return
        const def = ANIMALS[animal.typeId]
        if (!def?.feedItem) {
          set({
            animals: s.animals.map((a) =>
              a.id === animalId ? { ...a, startedAt: Date.now() } : a,
            ),
          })
          return
        }
        const qty = def.feedQty ?? 1
        if ((s.inventory[def.feedItem] ?? 0) < qty) {
          set({ toast: `Need ${qty}× ${ITEM_META[def.feedItem].name}` })
          return
        }
        set((s) =>
          withMissionProgress(s, {
            inventory: takeItems(s.inventory, { [def.feedItem!]: qty }),
            animals: s.animals.map((a) =>
              a.id === animalId ? { ...a, startedAt: Date.now() } : a,
            ),
            toast: `Fed ${def.name}`,
          }),
        )
      },

      collectAnimal: (animalId) => {
        const s = get()
        const animal = s.animals.find((a) => a.id === animalId)
        if (!animal?.startedAt) return
        const def = ANIMALS[animal.typeId]
        if (!def) return
        if (Date.now() - animal.startedAt < effectiveMs(def.produceMs, s.animalSpeedLevel[animal.typeId] ?? 0)) {
          set({ toast: 'Not ready yet' })
          return
        }
        const needsFeed = Boolean(def.feedItem)
        const xpResult = applyXpGain(
          s.xp,
          def.xp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        const mat = def.materialProduct
        const good = def.product
        const label = mat
          ? MATERIAL_META[mat].name
          : good
            ? ITEM_META[good].name
            : 'goods'
        set({
          inventory: good
            ? addItem(s.inventory, good, def.productQty)
            : s.inventory,
          materials: mat
            ? addMaterial(s.materials, mat, def.productQty)
            : s.materials,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          animals: s.animals.map((a) =>
            a.id === animalId
              ? { ...a, startedAt: needsFeed ? null : Date.now() }
              : a,
          ),
          toast: `Collected ${def.productQty}× ${label}`,
        })
        get().track('collect_animal', mat ?? good ?? def.id, def.productQty)
      },

      fulfillOrder: (slot) => {
        const s = get()
        if (!s.unlocked.includes('orders_board')) {
          set({ toast: `Orders unlock at Level ${ORDERS_UNLOCK_LEVEL}` })
          return
        }
        const active = s.activeOrders.find((o) => o.slot === slot)
        if (!active) return
        const order = ORDERS.find((o) => o.id === active.orderId)
        if (!order) return
        if (!hasItems(s.inventory, order.needs)) {
          set({ toast: 'Missing items for this order' })
          return
        }
        const exclude = s.activeOrders.map((o) => o.orderId)
        const level = levelFromXp(s.xp + order.rewardXp)
        const replacementId = pickReplacementOrderId(level, exclude)
        const xpResult = applyXpGain(
          s.xp,
          order.rewardXp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const activeOrdersAfter = xpResult.activeOrders.map((o) =>
          o.slot === slot
            ? {
                orderId: replacementId ?? o.orderId,
                slot,
              }
            : o,
        )
        const replacement = replacementId
          ? ORDERS.find((o) => o.id === replacementId)
          : null
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          inventory: takeItems(s.inventory, order.needs),
          coins: s.coins + order.rewardCoins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: activeOrdersAfter,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: replacement
            ? `+${order.rewardCoins} coins · New order: ${replacement.name}`
            : `+${order.rewardCoins} coins · +${order.rewardXp} XP`,
        })
        get().track('fulfill_order', undefined, 1)
        get().track('own_coins', undefined, get().coins)
      },

      fillShipOrder: (slot) => {
        const s = get()
        if (!s.unlocked.includes('orders_board')) {
          set({ toast: `Orders unlock at Level ${ORDERS_UNLOCK_LEVEL}` })
          return
        }
        if (s.shipBoardComplete) return
        const active = s.activeShipOrders.find((o) => o.slot === slot)
        if (!active || active.filled) return
        const needs = { [active.itemId]: active.qty }
        if (!hasItems(s.inventory, needs)) {
          set({ toast: 'Missing items for this slot' })
          return
        }
        const meta = ITEM_META[active.itemId]
        set({
          inventory: takeItems(s.inventory, needs),
          activeShipOrders: s.activeShipOrders.map((o) =>
            o.slot === slot ? { ...o, filled: true } : o,
          ),
          toast: `Filled ${active.qty}× ${meta?.name ?? active.itemId}`,
        })
      },

      shipCrate: () => {
        const s = get()
        if (!s.unlocked.includes('orders_board')) {
          set({ toast: `Orders unlock at Level ${ORDERS_UNLOCK_LEVEL}` })
          return
        }
        if (s.shipBoardComplete) return
        if (
          s.activeShipOrders.length === 0 ||
          !s.activeShipOrders.every((o) => o.filled)
        ) {
          set({ toast: 'Fill every slot before shipping' })
          return
        }
        const totalCoins = s.activeShipOrders.reduce(
          (sum, o) => sum + o.rewardCoins,
          0,
        )
        const totalXp = s.activeShipOrders.reduce(
          (sum, o) => sum + o.rewardXp,
          0,
        )
        const xpResult = applyXpGain(
          s.xp,
          totalXp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          coins: s.coins + totalCoins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          shipBoardComplete: true,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: `+${totalCoins} coins · +${totalXp} XP · Shipment sent!`,
        })
        get().track('fulfill_order', undefined, 1)
        get().track('own_coins', undefined, get().coins)
      },

      refreshShipOrders: () => {
        const s = get()
        const patch = ensureShipOrders(levelFromXp(s.xp), s)
        if (Object.keys(patch).length > 0) set(patch)
      },

      createMarketListing: async (itemKind, itemId, qty, pricePerUnit) => {
        const amount = Math.max(1, Math.floor(qty))
        if (!get().isMarketOpen()) {
          set({ toast: `Market unlocks at Level ${MARKET_UNLOCK_LEVEL}` })
          return false
        }
        if (!isSupabaseConfigured()) {
          set({
            toast: 'Market not configured — add Supabase env vars to .env.local',
          })
          return false
        }
        const sellerName = getPlayerName()
        if (!sellerName) {
          set({ toast: 'Set your market name first' })
          return false
        }
        if (!isValidMarketPrice(itemKind, itemId, pricePerUnit)) {
          set({ toast: 'Price must be 50%–200% of the sell value' })
          return false
        }
        const s = get()
        const taken = takeMarketItems(itemKind, itemId, amount, s)
        if (!taken) {
          set({ toast: 'Not enough items to list' })
          return false
        }
        set({
          inventory: taken.inventory,
          seeds: taken.seeds,
          materials: taken.materials,
        })
        try {
          await createListing(
            getPlayerId(),
            sellerName,
            itemKind,
            itemId,
            amount,
            pricePerUnit,
          )
          set({ toast: 'Listing posted on the Market Board!' })
          return true
        } catch (err) {
          const rollback = addMarketItems(itemKind, itemId, amount, get())
          set({
            ...rollback,
            toast:
              err instanceof MarketError
                ? err.message
                : 'Failed to post listing',
          })
          return false
        }
      },

      buyMarketListing: async (listingId) => {
        if (!get().isMarketOpen()) {
          set({ toast: `Market unlocks at Level ${MARKET_UNLOCK_LEVEL}` })
          return false
        }
        if (!isSupabaseConfigured()) {
          set({
            toast: 'Market not configured — add Supabase env vars to .env.local',
          })
          return false
        }
        const buyerName = getPlayerName()
        if (!buyerName) {
          set({ toast: 'Set your market name first' })
          return false
        }
        const buyerId = getPlayerId()
        try {
          const listing = await fetchListingById(listingId)
          if (!listing || listing.status !== 'active') {
            set({ toast: 'Listing no longer available' })
            return false
          }
          if (new Date(listing.expires_at).getTime() <= Date.now()) {
            set({ toast: 'This listing has expired' })
            return false
          }
          if (listing.seller_id === buyerId) {
            set({ toast: "You can't buy your own listing" })
            return false
          }
          const total = listing.quantity * listing.price_per_unit
          const s = get()
          if (s.coins < total) {
            set({ toast: `Need ${total} coins` })
            return false
          }
          set({ coins: s.coins - total })
          const added = addMarketItems(
            listing.item_kind,
            listing.item_id,
            listing.quantity,
            get(),
          )
          set(added)
          try {
            await buyListing(listing, buyerId, buyerName)
            set({
              toast: `Purchased listing · 🪙 ${total}`,
            })
            get().track('own_coins', undefined, get().coins)
            return true
          } catch (err) {
            const rollback = takeMarketItems(
              listing.item_kind,
              listing.item_id,
              listing.quantity,
              get(),
            )
            set({
              coins: get().coins + total,
              ...(rollback ?? get()),
              toast:
                err instanceof MarketError ? err.message : 'Purchase failed',
            })
            return false
          }
        } catch (err) {
          set({
            toast:
              err instanceof MarketError ? err.message : 'Purchase failed',
          })
          return false
        }
      },

      cancelMarketListing: async (listingId) => {
        if (!get().isMarketOpen()) {
          set({ toast: `Market unlocks at Level ${MARKET_UNLOCK_LEVEL}` })
          return false
        }
        if (!isSupabaseConfigured()) {
          set({
            toast: 'Market not configured — add Supabase env vars to .env.local',
          })
          return false
        }
        try {
          const listing = await cancelListing(listingId, getPlayerId())
          const returned = addMarketItems(
            listing.item_kind,
            listing.item_id,
            listing.quantity,
            get(),
          )
          set({
            ...returned,
            toast: 'Listing cancelled — items returned',
          })
          return true
        } catch (err) {
          set({
            toast:
              err instanceof MarketError ? err.message : 'Cancel failed',
          })
          return false
        }
      },

      refreshMarketSales: async () => {
        if (!isSupabaseConfigured()) return
        try {
          const sales = await fetchUnclaimedSales(getPlayerId())
          set({ unclaimedMarketSales: sales })
        } catch {
          // Missing tables or offline — ignore background refresh
        }
      },

      claimMarketSale: async (payoutId) => {
        if (!isSupabaseConfigured()) return false
        const sale = get().unclaimedMarketSales.find((s) => s.payoutId === payoutId)
        try {
          const amount = await claimSinglePayout(payoutId, getPlayerId())
          set({
            coins: get().coins + amount,
            unclaimedMarketSales: get().unclaimedMarketSales.filter(
              (s) => s.payoutId !== payoutId,
            ),
          })
          get().track(
            'market_sell',
            undefined,
            sale?.listing.quantity ?? 1,
          )
          get().track('own_coins', undefined, get().coins)
          return true
        } catch (err) {
          set({
            toast:
              err instanceof MarketError
                ? err.message
                : 'Could not claim sale',
          })
          void get().refreshMarketSales()
          return false
        }
      },

      sellGoods: (id, qty = 1) => {
        const amount = Math.max(1, Math.floor(qty))
        const s = get()
        const have = s.inventory[id] ?? 0
        if (have < amount) {
          set({ toast: 'Not enough to sell' })
          return
        }
        const unit = itemSellPrice(id)
        const total = unit * amount
        set((s) =>
          withMissionProgress(s, {
            inventory: takeItems(s.inventory, { [id]: amount }),
            coins: s.coins + total,
            toast: `Sold ${amount}× ${ITEM_META[id].name} · 🪙 ${total}`,
          }),
        )
        get().track('own_coins', undefined, get().coins)
      },

      sellSeeds: (id, qty = 1) => {
        const amount = Math.max(1, Math.floor(qty))
        const s = get()
        const have = s.seeds[id] ?? 0
        if (have < amount) {
          set({ toast: 'Not enough seeds to sell' })
          return
        }
        const unit = seedSellPrice(id)
        const total = unit * amount
        const crop = CROPS[id]
        set({
          seeds: takeSeeds(s.seeds, { [id]: amount }),
          coins: s.coins + total,
          toast: `Sold ${amount}× ${crop.name} seeds · 🪙 ${total}`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      sellMaterial: (id, qty = 1) => {
        const amount = Math.max(1, Math.floor(qty))
        const s = get()
        const have = s.materials[id] ?? 0
        if (have < amount) {
          set({ toast: 'Not enough to sell' })
          return
        }
        const unit = materialSellPrice(id)
        const total = unit * amount
        set({
          materials: takeMaterial(s.materials, { [id]: amount }),
          coins: s.coins + total,
          toast: `Sold ${amount}× ${MATERIAL_META[id].name} · 🪙 ${total}`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      claimMission: () => {
        const s = get()
        const id = s.activeMissionId
        if (!id) return
        const mission = MISSION_BY_ID[id]
        if (!mission) return
        const done = mission.goals.every(
          (g) => (s.missionProgress[goalKey(id, g.id)] ?? 0) >= g.amount,
        )
        if (!done) {
          set({ toast: 'Finish all mission goals first' })
          return
        }
        const queueWithoutClaim = s.popupQueue.filter(
          (p) => p.kind !== 'mission_claim',
        )
        const completedMissions = [...s.completedMissions, id]
        const playerLevel = levelFromXp(s.xp + mission.rewardXp)
        const next = resolveActiveMission(completedMissions, playerLevel, MISSIONS)
        const xpResult = applyXpGain(
          s.xp,
          mission.rewardXp,
          queueWithoutClaim,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          coins: s.coins + mission.rewardCoins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          inventory: addItems(s.inventory, mission.rewardItems),
          completedMissions,
          activeMissionId: next?.id ?? null,
          missionProgress: next ? emptyProgress(next.goals, next.id) : {},
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          popupQueue: xpResult.popupQueue,
          toast: `Mission complete! +${mission.rewardCoins} coins`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      startEvent: (eventId) => {
        const event = EVENT_BY_ID[eventId]
        if (!event) return
        const s = get()
        if (s.activeEventId) {
          set({ toast: 'Finish or wait out the current event' })
          return
        }
        set({
          activeEventId: eventId,
          eventEndsAt: Date.now() + event.durationMs,
          eventStageIndex: 0,
          eventProgress: emptyEventProgress(eventId, 0),
          toast: `${event.name} started!`,
        })
      },

      claimEvent: () => {
        const s = get()
        const id = s.activeEventId
        if (!id) return
        const event = EVENT_BY_ID[id]
        if (!event) return
        if (s.eventEndsAt && Date.now() > s.eventEndsAt) {
          set({
            activeEventId: null,
            eventEndsAt: null,
            eventStageIndex: 0,
            eventProgress: {},
            toast: 'Event expired',
          })
          return
        }
        const stageIndex = s.eventStageIndex
        const stage = event.stages[stageIndex]
        if (!stage) return
        const parentId = eventStageParentId(id, stageIndex)
        const stageDone = stage.goals.every(
          (g) => (s.eventProgress[goalKey(parentId, g.id)] ?? 0) >= g.amount,
        )
        if (!stageDone) {
          set({ toast: 'Finish all stage goals first' })
          return
        }
        const rewardPatch = applyStageRewards(s, stage.rewards)
        const freshUnlocks = newUnlocks(s.unlocked, rewardPatch.unlocked)
        let xpGain = stage.rewards.rewardXp ?? 0
        let coins = rewardPatch.coins
        let inventory = rewardPatch.inventory
        let seeds = rewardPatch.seeds
        let unlocked = rewardPatch.unlocked
        const nextStageIndex = stageIndex + 1
        const isLastStage = nextStageIndex >= event.stages.length
        if (isLastStage && event.finaleReward) {
          const finale = applyStageRewards(
            { ...s, ...rewardPatch },
            event.finaleReward,
          )
          coins = finale.coins
          inventory = finale.inventory
          seeds = finale.seeds
          unlocked = finale.unlocked
          xpGain += event.finaleReward.rewardXp ?? 0
        }
        const xpResult = applyXpGain(
          s.xp,
          xpGain,
          s.popupQueue,
          unlocked,
          s.activeOrders,
          seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        if (isLastStage) {
          set({
            coins,
            xp: xpResult.xp,
            seeds: xpResult.seeds,
            unlocked: xpResult.unlocked,
            inventory,
            activeOrders: xpResult.activeOrders,
            guideTabPulses: guides.guideTabPulses,
            guideItemHighlights: guides.guideItemHighlights,
            completedEvents: [...s.completedEvents, id],
            activeEventId: null,
            eventEndsAt: null,
            eventStageIndex: 0,
            eventProgress: {},
            popupQueue: enqueuePopups(
              xpResult.popupQueue,
              unlockPopup(freshUnlocks, `${event.name} — stage complete`),
            ),
            toast: `Event complete! +${coins - s.coins} coins`,
          })
          get().track('own_coins', undefined, get().coins)
          return
        }
        set({
          coins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          inventory,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          eventStageIndex: nextStageIndex,
          eventProgress: emptyEventProgress(id, nextStageIndex),
          popupQueue: enqueuePopups(
            xpResult.popupQueue,
            unlockPopup(freshUnlocks, `${stage.name} complete`),
          ),
          toast: `${stage.name} complete — next stage unlocked!`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      refreshScheduledGoals: () => {
        const s = get()
        const patch = ensureScheduledGoals(levelFromXp(s.xp), s)
        if (Object.keys(patch).length > 0) set(patch)
      },

      claimAchievement: (achievementId) => {
        const ach = ACHIEVEMENT_BY_ID[achievementId]
        if (!ach) return
        const s = get()
        if (s.claimedAchievements.includes(achievementId)) {
          set({ toast: 'Achievement already claimed' })
          return
        }
        const progress = syncStateAchievements(s.achievementProgress, s)
        if ((progress[achievementId] ?? 0) < ach.amount) {
          set({ toast: 'Achievement not complete yet' })
          return
        }
        set({
          achievementProgress: progress,
          claimedAchievements: [...s.claimedAchievements, achievementId],
          coins: s.coins + ach.rewardCoins,
          toast: `${ach.badge} ${ach.title} — +🪙 ${ach.rewardCoins}`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      claimScheduledGoal: (period, slotId) => {
        const s = get()
        const playerLevel = levelFromXp(s.xp)
        const goalRefresh = ensureScheduledGoals(playerLevel, s)
        const base = { ...s, ...goalRefresh }

        const slots = period === 'daily' ? base.dailyGoals : base.weeklyGoals
        const progress =
          period === 'daily' ? base.dailyGoalProgress : base.weeklyGoalProgress
        const parentId =
          period === 'daily' ? DAILY_GOALS_PARENT_ID : WEEKLY_GOALS_PARENT_ID
        const slot = slots.find((g) => g.slotId === slotId)
        if (!slot) return
        if (slot.claimed) {
          set({ toast: 'Reward already claimed' })
          return
        }
        if (!slotComplete(slot, progress, parentId)) {
          set({ toast: 'Goal not finished yet' })
          return
        }

        const updatedSlots = slots.map((g) =>
          g.slotId === slotId ? { ...g, claimed: true } : g,
        )
        const xpResult = applyXpGain(
          base.xp,
          slot.rewardXp,
          base.popupQueue,
          base.unlocked,
          base.activeOrders,
          base.seeds,
        )
        const guides = unlockGuidePatch(
          base,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          ...goalRefresh,
          coins: base.coins + slot.rewardCoins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          popupQueue: xpResult.popupQueue,
          ...(period === 'daily'
            ? { dailyGoals: updatedSlots }
            : { weeklyGoals: updatedSlots }),
          toast: `Goal complete! +🪙 ${slot.rewardCoins} · +⭐ ${slot.rewardXp} XP`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      claimScheduledBonus: async (period) => {
        const s = get()
        const playerLevel = levelFromXp(s.xp)
        const goalRefresh = ensureScheduledGoals(playerLevel, s)
        const base = { ...s, ...goalRefresh }

        const slots = period === 'daily' ? base.dailyGoals : base.weeklyGoals
        const bonusClaimed =
          period === 'daily' ? base.dailyBonusClaimed : base.weeklyBonusClaimed
        const bonus = period === 'daily' ? DAILY_ALL_BONUS : WEEKLY_ALL_BONUS
        const periodKey =
          period === 'daily'
            ? base.dailyGoalsPeriodKey
            : base.weeklyGoalsPeriodKey

        if (bonusClaimed) {
          set({ toast: 'Bonus already claimed' })
          return
        }
        if (!allSlotsClaimed(slots)) {
          set({ toast: 'Claim each goal reward first' })
          return
        }

        let rank = FALLBACK_RANK
        let rankingNote = 'offline base tier'
        const playerName = getPlayerName()
        if (isSupabaseConfigured() && playerName) {
          try {
            const result = await submitGoalRanking(
              playerName,
              period,
              periodKey,
            )
            rank = result.rank
            rankingNote = `#${result.rank} of ${result.total}`
          } catch {
            rankingNote = 'server unavailable — base tier'
          }
        } else if (!playerName) {
          rankingNote = 'set farmer name for ranked bonus'
        }

        const rankingPts = rankingPointsForRank(period, rank)
        const tierLabel = rankingTierLabel(rank)

        const xpResult = applyXpGain(
          base.xp,
          bonus.rewardXp,
          base.popupQueue,
          base.unlocked,
          base.activeOrders,
          base.seeds,
        )
        const guides = unlockGuidePatch(
          base,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        set({
          ...goalRefresh,
          coins: base.coins + bonus.rewardCoins,
          xp: xpResult.xp,
          rankingPoints: base.rankingPoints + rankingPts,
          rankingWeekPoints: base.rankingWeekPoints + rankingPts,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          popupQueue: xpResult.popupQueue,
          ...(period === 'daily'
            ? {
                dailyBonusClaimed: true,
                dailyRankingRank: rank,
              }
            : {
                weeklyBonusClaimed: true,
                weeklyRankingRank: rank,
              }),
          toast: `${period === 'daily' ? 'Daily' : 'Weekly'} bonus! ${tierLabel} (${rankingNote}) · +🪙 ${bonus.rewardCoins} · +⭐ ${bonus.rewardXp} XP · +🏆 ${rankingPts} pts`,
        })
        get().track('own_coins', undefined, get().coins)
      },

      recruitNpc: (npcId) => {
        const def = NPCS[npcId]
        if (!def) return
        const s = get()
        if (!s.unlocked.includes('tavern')) {
          set({ toast: `Tavern unlocks at Level ${TAVERN_UNLOCK_LEVEL}` })
          return
        }
        if (s.recruitedNpcs.length >= MAX_RECRUITED_NPCS) {
          set({ toast: `Tavern full (${MAX_RECRUITED_NPCS} recruits max)` })
          return
        }
        if (s.recruitedNpcs.some((n) => n.npcId === npcId)) {
          set({ toast: `${def.name} is already on your roster` })
          return
        }
        if (s.coins < def.hireCost) {
          set({ toast: `Need ${def.hireCost} coins to recruit ${def.name}` })
          return
        }
        const recruit: RecruitedNpc = { id: uid(), npcId, xp: 0 }
        set({
          coins: s.coins - def.hireCost,
          recruitedNpcs: [...s.recruitedNpcs, recruit],
          adventurePane: 'recruits',
          toast: `${def.name} joined your party! Check Recruits to equip gear.`,
        })
        get().track('recruit', npcId, 1)
        get().track('own_coins', undefined, get().coins)
      },

      startAdventure: (adventureId, npcInstanceIds) => {
        const adventure = ADVENTURE_BY_ID[adventureId]
        if (!adventure) return
        const s = get()
        if (!s.unlocked.includes('adventure_land')) {
          set({ toast: `Adventure Land unlocks at Level ${TAVERN_UNLOCK_LEVEL}` })
          return
        }
        const level = levelFromXp(s.xp)
        if (level < adventure.unlockLevel) {
          set({ toast: `Reach Level ${adventure.unlockLevel} for this expedition` })
          return
        }
        if (
          npcInstanceIds.length < adventure.minNpcs ||
          npcInstanceIds.length > adventure.maxNpcs
        ) {
          set({
            toast: `Pick ${adventure.minNpcs}–${adventure.maxNpcs} adventurers`,
          })
          return
        }
        const busy = busyNpcIds(s.activeAdventures)
        if (npcInstanceIds.some((id) => busy.has(id))) {
          set({ toast: 'Some adventurers are already exploring' })
          return
        }
        const rosterIds = new Set(s.recruitedNpcs.map((n) => n.id))
        if (!npcInstanceIds.every((id) => rosterIds.has(id))) {
          set({ toast: 'Invalid party selection' })
          return
        }
        const scaled = scaledAdventure(adventure, level)
        const power = partyPower(npcInstanceIds, s.recruitedNpcs, s.gearInventory)
        if (power < scaled.minPower) {
          set({
            toast: `Party power too low (need ${scaled.minPower}, have ${power})`,
          })
          return
        }
        const now = Date.now()
        const job: ActiveAdventure = {
          id: uid(),
          adventureId,
          npcInstanceIds,
          startedAt: now,
          doneAt: now + adventure.durationMs,
        }
        set({
          activeAdventures: [...s.activeAdventures, job],
          toast: `${adventure.name} expedition started!`,
        })
      },

      collectAdventure: (jobId) => {
        const s = get()
        const job = s.activeAdventures.find((a) => a.id === jobId)
        if (!job || Date.now() < job.doneAt) return
        const adventure = ADVENTURE_BY_ID[job.adventureId]
        if (!adventure) return
        const playerLevel = levelFromXp(s.xp)
        const scaled = scaledAdventure(adventure, playerLevel)
        const xpResult = applyXpGain(
          s.xp,
          scaled.rewardXp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        const gearDrops = rollAdventureGear(
          playerLevel,
          rollGearDropCount(),
          uid,
          s.unlocked.filter((id) => id in GEAR_BUILDINGS),
        )
        const materialDrops = rollRareMaterialDrops(
          playerLevel,
          adventure.rewardMaterials,
        )
        const updatedRecruits = grantRecruitXp(
          s.recruitedNpcs,
          job.npcInstanceIds,
          scaled.recruitXp,
        )
        set({
          activeAdventures: s.activeAdventures.filter((a) => a.id !== jobId),
          recruitedNpcs: updatedRecruits,
          coins: s.coins + scaled.rewardCoins,
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          inventory: addItems(s.inventory, adventure.rewardItems),
          materials: addMaterials(s.materials, materialDrops),
          gearInventory: [...s.gearInventory, ...gearDrops],
          toast: `${adventure.name} complete! +${scaled.rewardCoins} coins · ${gearDrops.length} gear · recruits +${scaled.recruitXp} XP`,
        })
        get().track('complete_adventure', job.adventureId, 1)
        for (const matId of Object.keys(materialDrops) as MaterialId[]) {
          get().track('own_material', matId)
        }
      },

      startGearCraft: (blueprintId) => {
        const blueprint = GEAR_BLUEPRINT_BY_ID[blueprintId]
        if (!blueprint) return
        const s = get()
        if (!s.unlocked.includes(blueprint.buildingId)) {
          const need = buildingUnlockLevel(blueprint.buildingId)
          set({ toast: `${GEAR_BUILDINGS[blueprint.buildingId].name} unlocks at Level ${need}` })
          return
        }
        if (!isGearRecipeUnlocked(blueprint, s.gearRecipeCraftCount)) {
          set({ toast: 'Craft earlier recipes to unlock this blueprint' })
          return
        }
        const building = GEAR_BUILDINGS[blueprint.buildingId]
        const queued = s.gearCraftQueue.filter(
          (j) => j.buildingId === blueprint.buildingId,
        )
        if (queued.length >= building.queueSize) {
          set({ toast: `${building.name} queue full` })
          return
        }
        if (!hasResources(s.inventory, s.materials, blueprint.inputs)) {
          set({ toast: 'Missing materials or goods' })
          return
        }
        const taken = takeResources(s.inventory, s.materials, blueprint.inputs)
        const now = Date.now()
        const star = recipeStar(s.gearRecipeCraftCount[blueprintId] ?? 0)
        const craftMs = Math.round(
          blueprint.craftMs * starCraftMsMultiplier(star),
        )
        set((s) =>
          withMissionProgress(s, {
            inventory: taken.inventory,
            materials: taken.materials,
            gearCraftQueue: [
              ...s.gearCraftQueue,
              {
                blueprintId,
                buildingId: blueprint.buildingId,
                startedAt: now,
                doneAt: now + craftMs,
              },
            ],
            toast: `${building.name}: ${blueprint.name}…`,
          }),
        )
      },

      collectGearCraft: (index) => {
        const s = get()
        const job = s.gearCraftQueue[index]
        if (!job || Date.now() < job.doneAt) return
        const blueprint = GEAR_BLUEPRINT_BY_ID[job.blueprintId]
        if (!blueprint) return
        const craftLevel = levelFromXp(s.xp)
        const prevCount = s.gearRecipeCraftCount[job.blueprintId] ?? 0
        const star = recipeStar(prevCount)
        const gear = createGearInstance(
          job.blueprintId,
          craftLevel,
          'craft',
          craftLevel,
          uid,
          star,
        )
        const upgraded = isQualityUpgrade(blueprint.quality, gear.quality)
        const nextCraftCount = prevCount + 1
        const newStar = recipeStar(nextCraftCount)
        const xpResult = applyXpGain(
          s.xp,
          blueprint.xp,
          s.popupQueue,
          s.unlocked,
          s.activeOrders,
          s.seeds,
        )
        const guides = unlockGuidePatch(
          s,
          xpResult.unlocked,
          levelFromXp(xpResult.xp),
        )
        const starUp = newStar > recipeStar(prevCount)
        set({
          gearCraftQueue: s.gearCraftQueue.filter((_, i) => i !== index),
          gearInventory: [...s.gearInventory, gear],
          gearRecipeCraftCount: {
            ...s.gearRecipeCraftCount,
            [job.blueprintId]: nextCraftCount,
          },
          xp: xpResult.xp,
          seeds: xpResult.seeds,
          unlocked: xpResult.unlocked,
          popupQueue: xpResult.popupQueue,
          activeOrders: xpResult.activeOrders,
          guideTabPulses: guides.guideTabPulses,
          guideItemHighlights: guides.guideItemHighlights,
          toast: starUp
            ? `${blueprint.name} → ${newStar}★!`
            : upgraded
              ? `Crafted ${blueprint.name} — ${QUALITY_LABEL[gear.quality]}! ✨`
              : `Crafted ${blueprint.name} (${QUALITY_LABEL[gear.quality]})`,
        })
        get().track('craft_gear', job.blueprintId, 1)
      },

      equipGear: (gearInstanceId, npcInstanceId) => {
        const s = get()
        const gear = s.gearInventory.find((g) => g.id === gearInstanceId)
        const npc = s.recruitedNpcs.find((n) => n.id === npcInstanceId)
        if (!gear || !npc) return
        if (busyNpcIds(s.activeAdventures).has(npcInstanceId)) {
          set({ toast: 'Cannot change gear while exploring' })
          return
        }
        const blueprint = GEAR_BLUEPRINT_BY_ID[gear.blueprintId]
        if (!blueprint) return
        if (gear.equippedBy && gear.equippedBy !== npcInstanceId) {
          set({ toast: 'Unequip from other recruit first' })
          return
        }
        const slot = blueprint.slot
        set({
          gearInventory: s.gearInventory.map((g) => {
            if (g.id === gearInstanceId) return { ...g, equippedBy: npcInstanceId }
            if (
              g.equippedBy === npcInstanceId &&
              GEAR_BLUEPRINT_BY_ID[g.blueprintId]?.slot === slot
            ) {
              return { ...g, equippedBy: null }
            }
            return g
          }),
          toast: `Equipped ${blueprint.name} on ${NPCS[npc.npcId]?.name ?? 'recruit'}`,
        })
      },

      unequipGear: (gearInstanceId) => {
        const s = get()
        const gear = s.gearInventory.find((g) => g.id === gearInstanceId)
        if (!gear?.equippedBy) return
        if (busyNpcIds(s.activeAdventures).has(gear.equippedBy)) {
          set({ toast: 'Cannot change gear while exploring' })
          return
        }
        set({
          gearInventory: s.gearInventory.map((g) =>
            g.id === gearInstanceId ? { ...g, equippedBy: null } : g,
          ),
          toast: 'Gear unequipped',
        })
      },

      resetGame: () => set({ ...initial() }),

      devSetPlayerLevel: (targetLevel) => {
        if (!import.meta.env.DEV) return
        const level = Math.max(1, Math.floor(targetLevel))
        const s = get()
        const oldLevel = levelFromXp(s.xp)
        const newXp = xpToReachLevel(level)
        const unlocked = syncLevelUnlocks(newXp, s.unlocked)
        let seeds = { ...s.seeds }
        for (const cropId of cropsCrossingLevels(oldLevel, level)) {
          seeds[cropId] = (seeds[cropId] ?? 0) + SEED_UNLOCK_GRANT
        }
        let activeOrders = s.activeOrders
        if (
          level >= ORDERS_UNLOCK_LEVEL &&
          activeOrders.length === 0
        ) {
          activeOrders = pickOrders(level)
        }
        const missionFix = ensureActiveMission(
          s.completedMissions,
          level,
          s.activeMissionId,
        )
        set({
          xp: newXp,
          unlocked,
          seeds,
          activeOrders,
          activeMissionId: missionFix.activeMissionId,
          missionProgress: missionFix.missionProgress,
          tab: level >= TAVERN_UNLOCK_LEVEL ? 'adventure' : s.tab,
          toast: `Dev boost: Level ${level}`,
        })
      },
    }),
    {
      name: SAVE_STORAGE_KEY,
      version: SAVE_VERSION,
      migrate: (persisted, version) => {
        try {
          return migrateSaveState(persisted, version)
        } catch {
          return migrateSaveState(persisted, SAVE_VERSION)
        }
      },
      merge: (persisted, current) => ({
        ...current,
        ...mergePersistedSlice(persisted, persistedDefaults()),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return
        state.unlocked = syncLevelUnlocks(state.xp, state.unlocked ?? [])
        const level = levelFromXp(state.xp)
        Object.assign(state, ensureScheduledGoals(level, state as GameState))
        Object.assign(state, ensureShipOrders(level, state as GameState))
        state.achievementProgress = syncStateAchievements(
          (state.achievementProgress as Record<string, number>) ?? {},
          state as GameState,
        )
        if (!state.activeMissionId) {
          const fix = ensureActiveMission(
            state.completedMissions ?? [],
            level,
            null,
          )
          state.activeMissionId = fix.activeMissionId
          state.missionProgress = fix.missionProgress
        } else {
          const fix = ensureActiveMission(
            state.completedMissions ?? [],
            level,
            state.activeMissionId,
            state.missionProgress,
          )
          if (fix.activeMissionId !== state.activeMissionId) {
            state.activeMissionId = fix.activeMissionId
            state.missionProgress = fix.missionProgress
          }
        }
        if (!state.activeMissionId) return
        const mission = MISSION_BY_ID[state.activeMissionId]
        if (!mission) return
        state.missionProgress = computeMissionProgressFromState(
          state,
          state.activeMissionId,
        )
        if (!isMissionComplete(state.activeMissionId, state.missionProgress)) {
          state.popupQueue = (state.popupQueue ?? []).filter(
            (p) => p.kind !== 'mission_claim',
          )
          return
        }
        if (state.popupQueue.some((p) => p.kind === 'mission_claim')) return
        state.popupQueue = [
          missionClaimPopup(mission),
          ...(state.popupQueue ?? []).filter((p) => p.kind !== 'mission_claim'),
        ]
      },
      partialize: (s) => ({
        coins: s.coins,
        xp: s.xp,
        seeds: s.seeds,
        inventory: s.inventory,
        materials: s.materials,
        plots: s.plots,
        treeSlots: s.treeSlots,
        saplings: s.saplings,
        selectedCrop: s.selectedCrop,
        selectedTree: s.selectedTree,
        shopPane: s.shopPane,
        farmPane: s.farmPane,
        craftQueue: s.craftQueue,
        activeOrders: s.activeOrders,
        shipPeriodKey: s.shipPeriodKey,
        activeShipOrders: s.activeShipOrders,
        shipBoardComplete: s.shipBoardComplete,
        animals: s.animals,
        unlocked: s.unlocked,
        ownedBuildings: s.ownedBuildings,
        machineQueueBonus: s.machineQueueBonus,
        machineSpeedLevel: s.machineSpeedLevel,
        animalSpeedLevel: s.animalSpeedLevel,
        farmSpeedLevel: s.farmSpeedLevel,
        completedMissions: s.completedMissions,
        activeMissionId: s.activeMissionId,
        missionProgress: s.missionProgress,
        activeEventId: s.activeEventId,
        eventEndsAt: s.eventEndsAt,
        eventStageIndex: s.eventStageIndex,
        eventProgress: s.eventProgress,
        completedEvents: s.completedEvents,
        dailyGoalsPeriodKey: s.dailyGoalsPeriodKey,
        dailyGoals: s.dailyGoals,
        dailyGoalProgress: s.dailyGoalProgress,
        dailyBonusClaimed: s.dailyBonusClaimed,
        weeklyGoalsPeriodKey: s.weeklyGoalsPeriodKey,
        weeklyGoals: s.weeklyGoals,
        weeklyGoalProgress: s.weeklyGoalProgress,
        weeklyBonusClaimed: s.weeklyBonusClaimed,
        rankingPoints: s.rankingPoints,
        rankingWeekKey: s.rankingWeekKey,
        rankingWeekPoints: s.rankingWeekPoints,
        dailyRankingRank: s.dailyRankingRank,
        weeklyRankingRank: s.weeklyRankingRank,
        achievementProgress: s.achievementProgress,
        claimedAchievements: s.claimedAchievements,
        selectedBuilding: s.selectedBuilding,
        selectedAnimalBuilding: s.selectedAnimalBuilding,
        selectedGearBuilding: s.selectedGearBuilding,
        adventurePane: s.adventurePane,
        materialsPane: s.materialsPane,
        gatherSlots: s.gatherSlots,
        recruitedNpcs: s.recruitedNpcs,
        activeAdventures: s.activeAdventures,
        gearInventory: s.gearInventory,
        gearCraftQueue: s.gearCraftQueue,
        gearRecipeCraftCount: s.gearRecipeCraftCount,
        guideTabPulses: s.guideTabPulses,
        guideItemHighlights: s.guideItemHighlights,
        darkMode: s.darkMode,
      }),
    },
  ),
)

export function adventureProgress(
  job: ActiveAdventure,
  now = Date.now(),
): number {
  const span = job.doneAt - job.startedAt
  if (span <= 0) return 1
  return Math.min(1, (now - job.startedAt) / span)
}

export function adventureReady(job: ActiveAdventure, now = Date.now()): boolean {
  return adventureProgress(job, now) >= 1
}

export function idleRecruits(
  recruited: RecruitedNpc[],
  activeAdventures: ActiveAdventure[],
): RecruitedNpc[] {
  const busy = busyNpcIds(activeAdventures)
  return recruited.filter((n) => !busy.has(n.id))
}

export function plotProgress(
  plot: PlotState,
  now = Date.now(),
  farmSpeedLevel = 0,
): number {
  if (!plot.cropId || plot.plantedAt == null) return 0
  const crop = CROPS[plot.cropId]
  if (!crop) return 0
  const growMs = effectiveMs(crop.growMs, farmSpeedLevel)
  return Math.min(1, (now - plot.plantedAt) / growMs)
}

export function isReady(
  plot: PlotState,
  now = Date.now(),
  farmSpeedLevel = 0,
): boolean {
  return plotProgress(plot, now, farmSpeedLevel) >= 1
}

export function animalProgress(
  animal: AnimalInstance,
  now = Date.now(),
  speedLevel = 0,
): number {
  if (animal.startedAt == null) return 0
  const def = ANIMALS[animal.typeId]
  if (!def) return 0
  const produceMs = effectiveMs(def.produceMs, speedLevel)
  return Math.min(1, (now - animal.startedAt) / produceMs)
}

export function animalReady(
  animal: AnimalInstance,
  now = Date.now(),
  speedLevel = 0,
): boolean {
  return animalProgress(animal, now, speedLevel) >= 1
}

export function plotUnlockCost(plotCount: number): number {
  return PLOT_UNLOCK_BASE * plotCount
}

export function treeSlotUnlockCost(slotCount: number): number {
  return TREE_SLOT_UNLOCK_BASE * slotCount
}

export function treeProgress(
  slot: TreeSlotState,
  now = Date.now(),
  farmSpeedLevel = 0,
): number {
  if (!slot.treeId || slot.plantedAt == null) return 0
  const tree = TREES[slot.treeId]
  if (!tree) return 0
  const growMs = effectiveMs(tree.growMs, farmSpeedLevel)
  return Math.min(1, (now - slot.plantedAt) / growMs)
}

export function treeReady(
  slot: TreeSlotState,
  now = Date.now(),
  farmSpeedLevel = 0,
): boolean {
  return treeProgress(slot, now, farmSpeedLevel) >= 1
}

export function missionGoalProgress(
  progress: Record<string, number>,
  parentId: string,
  goalId: string,
): number {
  return progress[`${parentId}:${goalId}`] ?? 0
}

export { MAX_PLOTS, MAX_TREE_SLOTS, EVENTS, BUILDINGS, TAVERN_UNLOCK_LEVEL, ORDERS_UNLOCK_LEVEL, MARKET_UNLOCK_LEVEL, BASE_MACHINE_QUEUE, MAX_MACHINE_QUEUE, MAX_QUEUE_BONUS }

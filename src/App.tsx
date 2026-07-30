import { useEffect, useRef, useState } from 'react'
import { ANIMALS } from './game/data/animals'
import { ANIMAL_BUILDINGS } from './game/data/animalBuildings'
import {
  allRecipesForBuilding,
  isRecipeUnlocked,
  sortedAnimalBuildings,
  sortedMachineBuildings,
} from './game/data/unlockOrder'
import {
  BUILDINGS,
  ITEM_META,
  MAX_QUEUE_BONUS,
  ORDERS_UNLOCK_LEVEL,
  queueUpgradeCost,
} from './game/data/buildings'
import { CROPS, SORTED_CROP_LIST, levelFromXp, xpProgress } from './game/data/crops'
import {
  ADVENTURES,
  adventuresForLevel,
  TAVERN_UNLOCK_LEVEL,
} from './game/data/adventures'
import {
  blueprintsForBuilding,
  GEAR_BLUEPRINT_BY_ID,
  GEAR_BUILDING_LIST,
  GEAR_BUILDINGS,
  GEAR_SLOT_LABEL,
  gearForNpc,
  gearInstanceStats,
  MATERIAL_META,
  npcCombatStats,
  npcEffectiveSkill,
  partyEffectiveSkill,
  QUALITY_LABEL,
  resourceMeta,
  scaledStats,
} from './game/data/gear'
import {
  EVENT_BY_ID,
  EVENTS,
  MISSION_BY_ID,
  eventStageParentId,
  isMissionLevelGated,
} from './game/data/missions'
import { MAX_RECRUITED_NPCS, NPC_LIST, NPCS } from './game/data/npcs'
import { ORDERS } from './game/data/orders'
import {
  MARKET_UNLOCK_LEVEL,
  marketItemLabel,
  marketPriceBounds,
  type MarketItemKind,
} from './game/data/market'
import {
  itemSellPrice,
  materialSellPrice,
  seedSellPrice,
} from './game/data/sellPrices'
import {
  getPlayerId,
  getPlayerName,
  isSupabaseConfigured,
  sendChatMessage,
  setPlayerName,
  subscribeToChat,
  subscribeToListings,
  type ChatMessage,
  type MarketListing,
} from './game/marketClient'
import { unlockLabel } from './game/unlocks'
import { tabShouldPulse } from './game/guides'
import {
  adventureProgress,
  adventureReady,
  animalProgress,
  animalReady,
  idleRecruits,
  isReady,
  missionGoalProgress,
  plotProgress,
  plotUnlockCost,
  MAX_PLOTS,
  useGame,
} from './game/store'
import {
  GEAR_SLOT_ORDER,
  type AnimalTypeId,
  type CropId,
  type GearSlot,
  type ItemId,
  type MaterialId,
  type TabId,
} from './game/types'
import './App.css'

function useNow(ms = 500) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

function formatLeft(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r}s`
}

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'missions', label: 'Missions', emoji: '📜' },
  { id: 'farm', label: 'Farm', emoji: '🌱' },
  { id: 'machines', label: 'Machines', emoji: '🏭' },
  { id: 'animals', label: 'Animals', emoji: '🐄' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { id: 'orders', label: 'Orders', emoji: '📦' },
  { id: 'market', label: 'Market', emoji: '🏪' },
  { id: 'bag', label: 'Bag', emoji: '🎒' },
  { id: 'shop', label: 'Shop', emoji: '🛒' },
]

function TopBar() {
  const coins = useGame((s) => s.coins)
  const xp = useGame((s) => s.xp)
  const darkMode = useGame((s) => s.darkMode)
  const toggleDarkMode = useGame((s) => s.toggleDarkMode)
  const { level, into, need } = xpProgress(xp)
  const pct = Math.min(100, (into / need) * 100)

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden>
          🌾
        </span>
        <div>
          <p className="brand-name">Cozy Valley</p>
          <p className="brand-sub">level up to grow the valley</p>
        </div>
      </div>
      <div className="stats">
        <div className="stat coin" title="Coins">
          <span>🪙</span>
          <strong>{coins}</strong>
        </div>
        <div className="stat-level-col">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="stat level">
            <span className="lvl">Lv {level}</span>
            <div className="xp-track" aria-hidden>
              <div className="xp-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function Toast() {
  const toast = useGame((s) => s.toast)
  const clearToast = useGame((s) => s.clearToast)
  const popupQueue = useGame((s) => s.popupQueue)
  useEffect(() => {
    if (!toast || popupQueue.length > 0) return
    const id = window.setTimeout(clearToast, 2400)
    return () => window.clearTimeout(id)
  }, [toast, clearToast, popupQueue.length])
  if (!toast || popupQueue.length > 0) return null
  return <div className="toast">{toast}</div>
}

function CelebrationPopup() {
  const popup = useGame((s) => s.popupQueue[0])
  const dismissPopup = useGame((s) => s.dismissPopup)
  const claimMission = useGame((s) => s.claimMission)

  const handleClaim = () => {
    claimMission()
  }

  const handleDismiss = () => {
    dismissPopup()
  }

  useEffect(() => {
    if (!popup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss()
      if (e.key === 'Enter' && popup.kind === 'mission_claim') handleClaim()
      if (e.key === 'Enter' && popup.kind !== 'mission_claim') handleDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popup, dismissPopup, claimMission])

  if (!popup) return null

  const primaryLabel =
    popup.kind === 'level_up'
      ? 'Nice!'
      : popup.kind === 'mission_claim'
        ? 'Claim rewards'
        : 'Got it!'

  return (
    <div
      className="popup-backdrop"
      role="presentation"
      onClick={handleDismiss}
    >
      <div
        className={`popup-card kind-${popup.kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-sparkle" aria-hidden>
          {popup.kind === 'mission_claim' ? '📜' : '✨'}
        </div>
        <h2 id="popup-title" className="popup-title">
          {popup.title}
        </h2>
        {popup.subtitle && <p className="popup-sub">{popup.subtitle}</p>}
        {popup.kind === 'mission_claim' && (
          <p className="popup-hint muted">
            Tap Later to keep playing — selling or using mission items lowers
            progress until everything is ready at once.
          </p>
        )}
        <ul className="popup-items">
          {popup.items.map((item) => (
            <li key={item.name}>
              <span className="popup-item-emoji">{item.emoji}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
        {popup.kind === 'mission_claim' ? (
          <div className="popup-actions">
            <button type="button" className="btn full popup-btn" onClick={handleClaim}>
              {primaryLabel}
            </button>
            <button
              type="button"
              className="btn ghost full popup-btn-secondary"
              onClick={handleDismiss}
            >
              Later
            </button>
          </div>
        ) : (
          <button type="button" className="btn full popup-btn" onClick={handleDismiss}>
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function GoalList({
  goals,
  parentId,
  progress,
}: {
  goals: import('./game/types').MissionGoal[]
  parentId: string
  progress: Record<string, number>
}) {
  const navigateToMissionGoal = useGame((s) => s.navigateToMissionGoal)
  return (
    <ul className="need-list mission-goals">
      {goals.map((g) => {
        const cur = missionGoalProgress(progress, parentId, g.id)
        const ok = cur >= g.amount
        if (ok) {
          return (
            <li key={g.id} className="ok">
              {g.label}{' '}
              <span>
                ({Math.min(cur, g.amount)}/{g.amount})
              </span>
            </li>
          )
        }
        return (
          <li key={g.id} className="no">
            <button
              type="button"
              className="need-item-btn"
              onClick={() => navigateToMissionGoal(g)}
            >
              {g.label}{' '}
              <span>
                ({Math.min(cur, g.amount)}/{g.amount})
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function StoryMissionsPane() {
  const xp = useGame((s) => s.xp)
  const activeMissionId = useGame((s) => s.activeMissionId)
  const missionProgress = useGame((s) => s.missionProgress)
  const completedMissions = useGame((s) => s.completedMissions)
  const claimMission = useGame((s) => s.claimMission)
  const unlocked = useGame((s) => s.unlocked)
  const playerLevel = levelFromXp(xp)

  const mission = activeMissionId ? MISSION_BY_ID[activeMissionId] : null
  const levelGated = mission ? isMissionLevelGated(mission, playerLevel) : false
  const missionDone =
    mission &&
    !levelGated &&
    mission.goals.every(
      (g) =>
        missionGoalProgress(missionProgress, mission.id, g.id) >= g.amount,
    )
  const allComplete = completedMissions.length >= 50 && !mission

  return (
    <>
      {mission ? (
        <>
          <p className="chapter-label">
            {mission.chapterTitle}
            {mission.npcEmoji && mission.npcName ? (
              <span className="muted"> · {mission.npcEmoji} {mission.npcName}</span>
            ) : null}
          </p>
          <div className={`recipe-card highlight${levelGated ? ' level-gated' : ''}`}>
            <div className="recipe-top">
              <span className="big-emoji">{mission.emoji}</span>
              <div>
                <strong>{mission.name}</strong>
                <p className="muted">{mission.story}</p>
              </div>
            </div>
            {levelGated ? (
              <p className="level-gate-msg">
                🔒 Reach Level {mission.minLevel} to begin this mission.
                Keep farming and crafting to level up!
              </p>
            ) : (
              <>
                <GoalList
                  goals={mission.goals}
                  parentId={mission.id}
                  progress={missionProgress}
                />
                <p className="unlock-line">
                  Reward: 🪙 {mission.rewardCoins} · ⭐ {mission.rewardXp} XP
                </p>
                <button
                  type="button"
                  className="btn full"
                  disabled={!missionDone}
                  onClick={claimMission}
                >
                  {missionDone
                    ? `Claim · 🪙 ${mission.rewardCoins}`
                    : 'In progress…'}
                </button>
              </>
            )}
          </div>
        </>
      ) : allComplete ? (
        <p className="muted pad">All 50 story missions complete. Nice work!</p>
      ) : (
        <p className="muted pad">Loading missions…</p>
      )}

      <h3 className="section-label">Unlocked so far</h3>
      <div className="chip-wrap">
        {unlocked.length === 0 && (
          <span className="muted">Nothing yet — finish First Sprouts.</span>
        )}
        {unlocked.map((u) => (
          <span key={u} className="unlock-chip">
            {unlockLabel(u)}
          </span>
        ))}
      </div>

      {completedMissions.length > 0 && (
        <p className="muted pad small">
          Completed: {completedMissions.length} / 50 missions
        </p>
      )}
    </>
  )
}

function EventsPane() {
  const now = useNow(1000)
  const activeEventId = useGame((s) => s.activeEventId)
  const eventEndsAt = useGame((s) => s.eventEndsAt)
  const eventStageIndex = useGame((s) => s.eventStageIndex)
  const eventProgress = useGame((s) => s.eventProgress)
  const completedEvents = useGame((s) => s.completedEvents)
  const startEvent = useGame((s) => s.startEvent)
  const claimEvent = useGame((s) => s.claimEvent)

  const event = activeEventId ? EVENT_BY_ID[activeEventId] : null
  const eventExpired = eventEndsAt != null && now > eventEndsAt
  const currentStage = event?.stages[eventStageIndex]
  const stageParentId =
    event && currentStage
      ? eventStageParentId(event.id, eventStageIndex)
      : ''
  const stageDone =
    currentStage &&
    !eventExpired &&
    currentStage.goals.every(
      (g) => missionGoalProgress(eventProgress, stageParentId, g.id) >= g.amount,
    )

  return (
    <>
      {event ? (
        <div className="recipe-card highlight">
          <div className="recipe-top">
            <span className="big-emoji">{event.emoji}</span>
            <div>
              <strong>{event.name}</strong>
              <p className="muted">
                {eventExpired
                  ? 'Expired'
                  : `Stage ${eventStageIndex + 1}/${event.stages.length} · Ends in ${formatLeft((eventEndsAt ?? now) - now)}`}
              </p>
            </div>
          </div>
          <div className="event-stages">
            {event.stages.map((stage, i) => {
              const done = i < eventStageIndex
              const active = i === eventStageIndex
              return (
                <div
                  key={stage.id}
                  className={`event-stage${done ? ' done' : ''}${active ? ' active' : ''}`}
                >
                  <strong>{stage.name}</strong>
                  {done && <span className="stage-check"> ✓</span>}
                  {active && currentStage && (
                    <p className="muted small">{currentStage.story}</p>
                  )}
                </div>
              )
            })}
          </div>
          {currentStage && !eventExpired && (
            <>
              <GoalList
                goals={currentStage.goals}
                parentId={stageParentId}
                progress={eventProgress}
              />
              <p className="unlock-line">
                Stage reward:
                {currentStage.rewards.rewardCoins
                  ? ` 🪙 ${currentStage.rewards.rewardCoins}`
                  : ''}
                {currentStage.rewards.rewardXp
                  ? ` · ⭐ ${currentStage.rewards.rewardXp} XP`
                  : ''}
                {currentStage.rewards.unlocks?.length
                  ? ` · 🔓 ${currentStage.rewards.unlocks.map(unlockLabel).join(', ')}`
                  : ''}
              </p>
            </>
          )}
          <button
            type="button"
            className="btn full"
            disabled={!stageDone && !eventExpired}
            onClick={claimEvent}
          >
            {eventExpired
              ? 'Dismiss'
              : stageDone
                ? eventStageIndex + 1 >= (event.stages.length ?? 0)
                  ? 'Claim finale'
                  : `Claim stage ${eventStageIndex + 1}`
                : 'Event active…'}
          </button>
        </div>
      ) : (
        <div className="card-list">
          {EVENTS.map((ev) => {
            const done = completedEvents.includes(ev.id)
            return (
              <div key={ev.id} className="recipe-card">
                <div className="recipe-top">
                  <span className="big-emoji">{ev.emoji}</span>
                  <div>
                    <strong>{ev.name}</strong>
                    <p className="muted">{ev.blurb}</p>
                    <p className="muted small">
                      {ev.stages.length} stages
                      {ev.finaleReward?.rewardSeeds
                        ? ' · seed rewards'
                        : ''}
                      {ev.stages.some((s) => s.rewards.unlocks?.length)
                        ? ' · unlock rewards'
                        : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn full"
                  disabled={done}
                  onClick={() => startEvent(ev.id)}
                >
                  {done ? 'Completed' : `Start · ${formatLeft(ev.durationMs)}`}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function MissionsView() {
  const [pane, setPane] = useState<'story' | 'events'>('story')
  const activeEventId = useGame((s) => s.activeEventId)

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Missions</h2>
        <p>Story chapters & limited-time events — machines unlock as you level.</p>
      </div>

      <div className="pane-tabs pane-tabs-2" role="tablist" aria-label="Mission areas">
        <button
          type="button"
          role="tab"
          aria-selected={pane === 'story'}
          className={pane === 'story' ? 'active' : ''}
          onClick={() => setPane('story')}
        >
          📜 Story
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pane === 'events'}
          className={`${pane === 'events' ? 'active' : ''}${activeEventId ? ' has-active' : ''}`}
          onClick={() => setPane('events')}
        >
          🎪 Events
        </button>
      </div>

      {pane === 'story' && <StoryMissionsPane />}
      {pane === 'events' && <EventsPane />}
    </div>
  )
}

function FarmView() {
  const now = useNow()
  const plots = useGame((s) => s.plots)
  const seeds = useGame((s) => s.seeds)
  const selectedCrop = useGame((s) => s.selectedCrop)
  const selectCrop = useGame((s) => s.selectCrop)
  const plant = useGame((s) => s.plant)
  const harvest = useGame((s) => s.harvest)
  const unlockPlot = useGame((s) => s.unlockPlot)
  const isCropAvailable = useGame((s) => s.isCropAvailable)
  const unlockCost = plotUnlockCost(plots.length)
  const available = SORTED_CROP_LIST.filter((c) => isCropAvailable(c.id))

  return (
    <div className="panel farm-panel">
      <div className="panel-head">
        <h2>Your farm</h2>
        <p>Tap empty soil to plant. Crops never wither.</p>
      </div>

      <div className="seed-row" role="listbox" aria-label="Selected seed">
        {available.map((crop) => {
          const count = seeds[crop.id] ?? 0
          const active = selectedCrop === crop.id
          return (
            <button
              key={crop.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`seed-chip ${active ? 'active' : ''}`}
              onClick={() => selectCrop(crop.id)}
            >
              <span className="seed-emoji">{crop.emoji}</span>
              <span className="seed-meta">
                <strong>{crop.name}</strong>
                <small>{count} seeds</small>
              </span>
            </button>
          )
        })}
      </div>

      <div className="plot-grid">
        {plots.map((plot, i) => {
          const ready = isReady(plot, now)
          const progress = plotProgress(plot, now)
          const crop = plot.cropId ? CROPS[plot.cropId] : null
          const stage =
            !crop || !plot.plantedAt
              ? 'empty'
              : ready
                ? 'ready'
                : progress < 0.33
                  ? 'sprout'
                  : progress < 0.66
                    ? 'grow'
                    : 'almost'

          return (
            <button
              key={i}
              type="button"
              className={`plot stage-${stage} ${ready ? 'pulse' : ''}`}
              onClick={() => (ready ? harvest(i) : plant(i))}
              aria-label={
                crop
                  ? ready
                    ? `Harvest ${crop.name}`
                    : `${crop.name} growing`
                  : 'Empty plot'
              }
            >
              <span className="plot-soil" />
              {crop ? (
                <>
                  <span className="plot-crop">{crop.emoji}</span>
                  {!ready && (
                    <span className="plot-bar">
                      <span style={{ width: `${progress * 100}%` }} />
                    </span>
                  )}
                  {ready && <span className="plot-ready">Ready</span>}
                  {!ready && plot.plantedAt != null && (
                    <span className="plot-time">
                      {formatLeft(crop.growMs - (now - plot.plantedAt))}
                    </span>
                  )}
                </>
              ) : (
                <span className="plot-empty">+</span>
              )}
            </button>
          )
        })}
      </div>

      {plots.length < MAX_PLOTS && (
        <button type="button" className="btn secondary full" onClick={unlockPlot}>
          Unlock plot · 🪙 {unlockCost}
        </button>
      )}
    </div>
  )
}

function IngredientBar({
  items,
  inventory,
  onNeedItem,
  label = 'Required items',
  compact = false,
}: {
  items: { id: ItemId; qty: number }[]
  inventory: Partial<Record<ItemId, number>>
  onNeedItem: (id: ItemId, qty: number) => void
  label?: string | false
  compact?: boolean
}) {
  if (items.length === 0) return null

  const sorted = [...items].sort((a, b) => {
    const aOk = (inventory[a.id] ?? 0) >= a.qty
    const bOk = (inventory[b.id] ?? 0) >= b.qty
    if (aOk === bOk) return a.id.localeCompare(b.id)
    return aOk ? 1 : -1
  })

  return (
    <div className={`ingredient-bar ${compact ? 'compact' : ''}`}>
      {label !== false && <p className="ingredient-bar-label">{label}</p>}
      <div className="ingredient-chips" role="list">
        {sorted.map(({ id, qty }) => {
          const meta = ITEM_META[id]
          const have = inventory[id] ?? 0
          const ok = have >= qty
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className={`ingredient-chip ${ok ? 'ok' : 'need'}`}
              disabled={ok}
              onClick={() => onNeedItem(id, qty)}
              title={
                ok
                  ? `${meta.name}: ${have}/${qty} ready`
                  : `${meta.name}: need ${qty} (have ${have}) — tap to find`
              }
            >
              <span>{meta.emoji}</span>
              <span className="ingredient-chip-meta">
                {meta.name} · {have}/{qty}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MachinesView() {
  const now = useNow()
  const xp = useGame((s) => s.xp)
  const { level } = xpProgress(xp)
  const coins = useGame((s) => s.coins)
  const unlocked = useGame((s) => s.unlocked)
  const ownedBuildings = useGame((s) => s.ownedBuildings)
  const machineQueueBonus = useGame((s) => s.machineQueueBonus)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const machineScrollTarget = useGame((s) => s.machineScrollTarget)
  const clearMachineScrollTarget = useGame((s) => s.clearMachineScrollTarget)
  const inventory = useGame((s) => s.inventory)
  const craftQueue = useGame((s) => s.craftQueue)
  const selectedBuilding = useGame((s) => s.selectedBuilding)
  const selectBuilding = useGame((s) => s.selectBuilding)
  const purchaseBuilding = useGame((s) => s.purchaseBuilding)
  const upgradeMachineQueue = useGame((s) => s.upgradeMachineQueue)
  const machineQueueCapacity = useGame((s) => s.machineQueueCapacity)
  const startCraft = useGame((s) => s.startCraft)
  const collectCraft = useGame((s) => s.collectCraft)
  const navigateToItem = useGame((s) => s.navigateToItem)

  const open =
    selectedBuilding && unlocked.includes(selectedBuilding)
      ? selectedBuilding
      : null
  const building = open ? BUILDINGS[open] : null
  const owned = open ? ownedBuildings.includes(open) : false
  const recipes = open && owned ? allRecipesForBuilding(open) : []
  const queueCap = open ? machineQueueCapacity(open) : 0
  const queueBonus = open ? (machineQueueBonus[open] ?? 0) : 0
  const queue = craftQueue
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.buildingId === open)

  useEffect(() => {
    if (!machineScrollTarget || !open || !owned) return
    if (!recipes.some((r) => r.id === machineScrollTarget)) return
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`machine-recipe-${machineScrollTarget}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearMachineScrollTarget()
    })
    return () => cancelAnimationFrame(frame)
  }, [
    machineScrollTarget,
    open,
    owned,
    recipes,
    clearMachineScrollTarget,
  ])

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Machines</h2>
        <p>Missions unlock blueprints — buy & build each machine with coins.</p>
      </div>

      {!open && (
        <div className="machine-grid">
          {sortedMachineBuildings().map((b) => {
            const blueprintLocked = !unlocked.includes(b.id)
            const isOwned = ownedBuildings.includes(b.id)
            const canBuy = !blueprintLocked && !isOwned
            return (
              <div
                key={b.id}
                className={`machine-card ${blueprintLocked ? 'locked' : ''} ${canBuy ? 'for-sale' : ''} ${!blueprintLocked && guideItemHighlights.includes(b.id) ? 'guide-pulse-frame' : ''}`}
              >
                <button
                  type="button"
                  className="machine-card-main"
                  disabled={blueprintLocked}
                  onClick={() => !blueprintLocked && selectBuilding(b.id)}
                >
                  <span className="big-emoji">{b.emoji}</span>
                  <strong>{b.name}</strong>
                  <small>
                    {blueprintLocked
                      ? '🔒 Mission blueprint'
                      : isOwned
                        ? `Built · queue ${machineQueueCapacity(b.id)}`
                        : `Blueprint ready · build for 🪙 ${b.buyCost}`}
                  </small>
                </button>
                {canBuy && (
                  <button
                    type="button"
                    className="btn full"
                    disabled={coins < b.buyCost}
                    onClick={() => purchaseBuilding(b.id)}
                  >
                    Build · 🪙 {b.buyCost}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {open && building && !owned && (
        <>
          <button
            type="button"
            className="btn ghost"
            onClick={() => selectBuilding(null)}
          >
            ← All machines
          </button>
          <div className="recipe-card highlight">
            <div className="recipe-top">
              <span className="big-emoji">{building.emoji}</span>
              <div>
                <strong>{building.name}</strong>
                <p className="muted">{building.blurb}</p>
                <p className="muted">Blueprint unlocked — purchase to start crafting.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn full"
              disabled={coins < building.buyCost}
              onClick={() => purchaseBuilding(open)}
            >
              Build machine · 🪙 {building.buyCost}
            </button>
          </div>
        </>
      )}

      {open && building && owned && (
        <>
          <button
            type="button"
            className="btn ghost"
            onClick={() => selectBuilding(null)}
          >
            ← All machines
          </button>
          <div className="panel-head">
            <h2>
              {building.emoji} {building.name}
            </h2>
            <p>
              {building.blurb} · Queue {queue.length}/{queueCap}
            </p>
          </div>

          {queueBonus < MAX_QUEUE_BONUS && (
            <button
              type="button"
              className="btn secondary full"
              disabled={coins < queueUpgradeCost(open, queueBonus)}
              onClick={() => upgradeMachineQueue(open)}
            >
              Upgrade queue +1 · 🪙 {queueUpgradeCost(open, queueBonus)} (
              {queueCap} → {queueCap + 1})
            </button>
          )}

          {queue.length > 0 && (
            <div className="queue">
              {queue.map(({ job, index }) => {
                const recipe = allRecipesForBuilding(open).find(
                  (r) => r.id === job.recipeId,
                ) ?? ITEM_META[job.recipeId as ItemId]
                const done = now >= job.doneAt
                const pct = Math.min(
                  100,
                  ((now - job.startedAt) / (job.doneAt - job.startedAt)) * 100,
                )
                const name =
                  'name' in (recipe ?? {})
                    ? (recipe as { name: string; emoji?: string }).name
                    : job.recipeId
                const emoji =
                  'emoji' in (recipe ?? {})
                    ? (recipe as { emoji?: string }).emoji
                    : '⚙️'
                return (
                  <div key={`${job.recipeId}-${job.startedAt}`} className="queue-row">
                    <span>{emoji}</span>
                    <div className="queue-body">
                      <strong>{name}</strong>
                      <div className="mini-track">
                        <div style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {done ? (
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() => collectCraft(index)}
                      >
                        Collect
                      </button>
                    ) : (
                      <span className="muted">{formatLeft(job.doneAt - now)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="card-list">
            {recipes.map((recipe) => {
              const recipeLocked = !isRecipeUnlocked(recipe.id, level)
              const missing = Object.entries(recipe.inputs).some(
                ([id, qty]) => (inventory[id as ItemId] ?? 0) < (qty ?? 0),
              )
              const queueFull = queue.length >= queueCap
              return (
                <div
                  key={recipe.id}
                  id={`machine-recipe-${recipe.id}`}
                  className={`recipe-card ${recipeLocked ? 'locked' : ''} ${machineScrollTarget === recipe.id || guideItemHighlights.includes(recipe.id) || guideItemHighlights.includes(recipe.output) ? 'guide-pulse-frame' : ''}`}
                >
                  <div className="recipe-top">
                    <span className="big-emoji">{recipe.emoji}</span>
                    <div>
                      <strong>{recipe.name}</strong>
                      <p className="muted">
                        {recipeLocked
                          ? `🔒 Level ${recipe.unlockLevel}`
                          : `${formatLeft(recipe.craftMs)} · +${recipe.xp} XP`}
                      </p>
                    </div>
                  </div>
                  <IngredientBar
                    items={Object.entries(recipe.inputs).map(([id, qty]) => ({
                      id: id as ItemId,
                      qty: qty ?? 0,
                    }))}
                    inventory={inventory}
                    onNeedItem={navigateToItem}
                    label={false}
                    compact
                  />
                  {!recipeLocked && (
                    <button
                      type="button"
                      className="btn full"
                      disabled={missing || queueFull}
                      onClick={() => startCraft(recipe.id)}
                    >
                      {queueFull ? 'Queue full' : 'Start'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function AnimalsView() {
  const now = useNow()
  const animals = useGame((s) => s.animals)
  const unlocked = useGame((s) => s.unlocked)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const coins = useGame((s) => s.coins)
  const inventory = useGame((s) => s.inventory)
  const selectedAnimalBuilding = useGame((s) => s.selectedAnimalBuilding)
  const selectAnimalBuilding = useGame((s) => s.selectAnimalBuilding)
  const buyAnimal = useGame((s) => s.buyAnimal)
  const feedAnimal = useGame((s) => s.feedAnimal)
  const collectAnimal = useGame((s) => s.collectAnimal)
  const navigateToItem = useGame((s) => s.navigateToItem)

  const open =
    selectedAnimalBuilding && unlocked.includes(selectedAnimalBuilding)
      ? selectedAnimalBuilding
      : null
  const building = open ? ANIMAL_BUILDINGS[open] : null
  const def = building ? ANIMALS[building.animalTypeId] : null
  const owned = def ? animals.filter((a) => a.typeId === def.id) : []

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Animals</h2>
        <p>
          {open
            ? 'Each building holds one species — feed with the right mix.'
            : 'Chicken Coop, Cow Barn, Duck Pond & more — unlock via Missions.'}
        </p>
      </div>

      {!open && (
        <div className="machine-grid">
          {sortedAnimalBuildings().map((b) => {
            const locked = !unlocked.includes(b.id)
            const animalDef = ANIMALS[b.animalTypeId]
            const count = animals.filter((a) => a.typeId === b.animalTypeId).length
            return (
              <button
                key={b.id}
                type="button"
                className={`machine-card ${locked ? 'locked' : ''} ${!locked && guideItemHighlights.includes(b.id) ? 'guide-pulse-frame' : ''}`}
                disabled={locked}
                onClick={() => selectAnimalBuilding(b.id)}
              >
                <span className="big-emoji">{b.emoji}</span>
                <strong>{b.name}</strong>
                <small>
                  {locked
                    ? '🔒 Mission lock'
                    : `${count}/${animalDef.maxOwned} ${animalDef.name}s · ${ITEM_META[animalDef.product].emoji} ${ITEM_META[animalDef.product].name}`}
                </small>
              </button>
            )
          })}
        </div>
      )}

      {open && building && def && (
        <>
          <button
            type="button"
            className="btn ghost"
            onClick={() => selectAnimalBuilding(null)}
          >
            ← All animal homes
          </button>
          <div className="panel-head">
            <h2>
              {building.emoji} {building.name}
            </h2>
            <p>{building.blurb}</p>
          </div>

          {def.feedItem && (
            <IngredientBar
              items={[{ id: def.feedItem, qty: def.feedQty ?? 1 }]}
              inventory={inventory}
              onNeedItem={navigateToItem}
            />
          )}

          <div className="recipe-card">
            <div className="recipe-top">
              <span className="big-emoji">{def.emoji}</span>
              <div>
                <strong>{def.name}</strong>
                <p className="muted">
                  {ITEM_META[def.product].emoji} {ITEM_META[def.product].name} ·{' '}
                  {owned.length}/{def.maxOwned} owned
                </p>
                {def.feedItem && (
                  <p className="muted">
                    Feed: {ITEM_META[def.feedItem].emoji}{' '}
                    {ITEM_META[def.feedItem].name} ×{def.feedQty ?? 1}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn full"
              disabled={coins < def.buyCost || owned.length >= def.maxOwned}
              onClick={() => buyAnimal(def.id as AnimalTypeId)}
            >
              Buy {def.name} · 🪙 {def.buyCost}
            </button>

            {owned.length === 0 && (
              <p className="muted pad">No {def.name.toLowerCase()}s yet — buy one above.</p>
            )}

            {owned.map((a) => {
              const ready = animalReady(a, now)
              const prog = animalProgress(a, now)
              const needsFeed = a.startedAt == null && Boolean(def.feedItem)
              const feedMeta = def.feedItem ? ITEM_META[def.feedItem] : null
              return (
                <div key={a.id} className="animal-row">
                  <span>{def.emoji}</span>
                  <div className="queue-body">
                    {needsFeed ? (
                      <strong>Needs {feedMeta?.name ?? 'feed'}</strong>
                    ) : ready ? (
                      <strong>Ready!</strong>
                    ) : (
                      <strong>Producing…</strong>
                    )}
                    {!needsFeed && (
                      <div className="mini-track">
                        <div style={{ width: `${prog * 100}%` }} />
                      </div>
                    )}
                  </div>
                  {needsFeed ? (
                    <button
                      type="button"
                      className="btn tiny"
                      onClick={() => {
                        const need = def.feedQty ?? 1
                        const have = inventory[def.feedItem!] ?? 0
                        if (have < need) {
                          navigateToItem(def.feedItem!, need)
                        } else {
                          feedAnimal(a.id)
                        }
                      }}
                      title={
                        feedMeta
                          ? `Needs ${def.feedQty ?? 1}× ${feedMeta.name}`
                          : undefined
                      }
                    >
                      {feedMeta ? `${feedMeta.emoji} Feed` : 'Feed'}{' '}
                      ({inventory[def.feedItem!] ?? 0})
                    </button>
                  ) : ready ? (
                    <button
                      type="button"
                      className="btn tiny"
                      onClick={() => collectAnimal(a.id)}
                    >
                      Collect
                    </button>
                  ) : (
                    <span className="muted">
                      {formatLeft(
                        def.produceMs - (now - (a.startedAt ?? now)),
                      )}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function OrdersView() {
  const inventory = useGame((s) => s.inventory)
  const activeOrders = useGame((s) => s.activeOrders)
  const fulfillOrder = useGame((s) => s.fulfillOrder)
  const navigateToItem = useGame((s) => s.navigateToItem)
  const isOrdersOpen = useGame((s) => s.isOrdersOpen)
  const xp = useGame((s) => s.xp)
  const { level } = xpProgress(xp)

  if (!isOrdersOpen()) {
    return (
      <div className="panel">
        <div className="panel-head">
          <h2>Orders</h2>
          <p>
            🔒 Reach <strong>Level {ORDERS_UNLOCK_LEVEL}</strong> to unlock the
            Orders Board.
          </p>
          <p className="muted">You are Level {level}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Orders</h2>
        <p>Ship goods for coins & XP. Completed slots swap to a new order automatically.</p>
      </div>

      <div className="card-list">
        {activeOrders.map((active) => {
          const order = ORDERS.find((o) => o.id === active.orderId)
          if (!order) return null
          const can = Object.entries(order.needs).every(
            ([id, qty]) => (inventory[id as ItemId] ?? 0) >= (qty ?? 0),
          )
          return (
            <div key={`${active.slot}-${active.orderId}`} className="recipe-card">
              <div className="recipe-top">
                <span className="big-emoji">{order.emoji}</span>
                <div>
                  <strong>{order.name}</strong>
                  <p className="muted">
                    🪙 {order.rewardCoins} · +{order.rewardXp} XP
                  </p>
                </div>
              </div>
              <IngredientBar
                items={Object.entries(order.needs).map(([id, qty]) => ({
                  id: id as ItemId,
                  qty: qty ?? 0,
                }))}
                inventory={inventory}
                onNeedItem={navigateToItem}
                label={false}
                compact
              />
              <button
                type="button"
                className="btn full"
                disabled={!can}
                onClick={() => fulfillOrder(active.slot)}
              >
                Fulfill
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type PostableItem = {
  kind: MarketItemKind
  id: string
  qty: number
  emoji: string
  name: string
}

function buildPostableItems(
  inventory: Partial<Record<ItemId, number>>,
  seeds: Partial<Record<CropId, number>>,
  materials: Partial<Record<MaterialId, number>>,
): PostableItem[] {
  const items: PostableItem[] = []
  for (const [id, qty] of Object.entries(inventory)) {
    if ((qty ?? 0) <= 0) continue
    const meta = ITEM_META[id as ItemId]
    items.push({
      kind: 'goods',
      id,
      qty: qty ?? 0,
      emoji: meta?.emoji ?? '📦',
      name: meta?.name ?? id,
    })
  }
  for (const [id, qty] of Object.entries(seeds)) {
    if ((qty ?? 0) <= 0) continue
    const crop = CROPS[id as CropId]
    items.push({
      kind: 'seeds',
      id,
      qty: qty ?? 0,
      emoji: crop?.emoji ?? '🌱',
      name: `${crop?.name ?? id} seeds`,
    })
  }
  for (const [id, qty] of Object.entries(materials)) {
    if ((qty ?? 0) <= 0) continue
    const meta = MATERIAL_META[id as MaterialId]
    items.push({
      kind: 'materials',
      id,
      qty: qty ?? 0,
      emoji: meta?.emoji ?? '✨',
      name: meta?.name ?? id,
    })
  }
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

function PlayerNameModal({
  title,
  subtitle,
  buttonLabel,
  onSave,
}: {
  title: string
  subtitle: string
  buttonLabel: string
  onSave: (name: string) => void
}) {
  const [name, setName] = useState('')

  return (
    <div className="popup-backdrop" role="presentation">
      <div
        className="popup-card kind-market_name"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-name-title"
      >
        <h3 id="player-name-title">{title}</h3>
        <p className="muted">{subtitle}</p>
        <input
          className="market-input"
          type="text"
          maxLength={24}
          placeholder="Your farmer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          className="btn full"
          disabled={name.trim().length < 2}
          onClick={() => onSave(name.trim())}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

function GlobalChatDock() {
  const xp = useGame((s) => s.xp)
  const isMarketOpen = useGame((s) => s.isMarketOpen)
  const { level } = xpProgress(xp)
  const chatUnlocked = isMarketOpen()

  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [chatError, setChatError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [needsName, setNeedsName] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const playerId = getPlayerId()
  const playerName = getPlayerName() ?? 'Farmer'

  useEffect(() => {
    if (!chatUnlocked || !isSupabaseConfigured()) return
    setChatError(null)
    return subscribeToChat(setMessages, (err) => setChatError(err.message))
  }, [chatUnlocked])

  useEffect(() => {
    if (!expanded) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, expanded])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const latest = messages[messages.length - 1]
  const preview = latest
    ? `${latest.player_name}: ${latest.body}`
    : chatUnlocked
      ? 'Tap to chat with other farmers'
      : `Chat unlocks at Level ${MARKET_UNLOCK_LEVEL}`

  const handleBarClick = () => {
    if (!chatUnlocked) {
      useGame.setState({
        toast: `Chat unlocks at Level ${MARKET_UNLOCK_LEVEL} (you are Level ${level})`,
      })
      return
    }
    if (!isSupabaseConfigured()) {
      useGame.setState({ toast: 'Chat is not configured on this deploy' })
      return
    }
    if (!getPlayerName()) {
      setNeedsName(true)
      return
    }
    setExpanded((open) => !open)
  }

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await sendChatMessage(playerId, playerName, text)
      setDraft('')
      setChatError(null)
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`chat-dock ${expanded ? 'expanded' : ''}`}>
      {needsName && (
        <PlayerNameModal
          title="Join the valley chat"
          subtitle="Choose a display name so other farmers know who you are."
          buttonLabel="Start chatting"
          onSave={(name) => {
            setPlayerName(name)
            setNeedsName(false)
            setExpanded(true)
          }}
        />
      )}
      {expanded && chatUnlocked && (
        <div className="chat-dock-panel">
          <div className="chat-dock-panel-head">
            <strong>Valley chat</strong>
            <button
              type="button"
              className="btn ghost tiny"
              onClick={() => setExpanded(false)}
            >
              Close
            </button>
          </div>
          {chatError && (
            <p className="market-error" role="alert">
              {chatError}
            </p>
          )}
          <div ref={scrollRef} className="chat-dock-log" aria-live="polite">
            {messages.length === 0 && (
              <p className="muted">No messages yet — say hello!</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-dock-row ${msg.player_id === playerId ? 'mine' : ''}`}
              >
                <strong>{msg.player_name}</strong>
                <span>{msg.body}</span>
              </div>
            ))}
          </div>
          <form
            className="chat-dock-form"
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
          >
            <input
              className="market-input"
              type="text"
              maxLength={280}
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="btn"
              disabled={sending || !draft.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className={`chat-dock-bar ${chatUnlocked ? '' : 'locked'}`}
        onClick={handleBarClick}
        aria-expanded={expanded}
        aria-label={chatUnlocked ? 'Farmer chat' : `Chat unlocks at level ${MARKET_UNLOCK_LEVEL}`}
      >
        <span className="chat-dock-icon" aria-hidden>
          💬
        </span>
        <span className="chat-dock-preview">{preview}</span>
        {chatUnlocked && (
          <span className="chat-dock-chevron" aria-hidden>
            {expanded ? '▼' : '▲'}
          </span>
        )}
      </button>
    </div>
  )
}

function MarketView() {
  const inventory = useGame((s) => s.inventory)
  const seeds = useGame((s) => s.seeds)
  const materials = useGame((s) => s.materials)
  const coins = useGame((s) => s.coins)
  const xp = useGame((s) => s.xp)
  const isMarketOpen = useGame((s) => s.isMarketOpen)
  const createMarketListing = useGame((s) => s.createMarketListing)
  const buyMarketListing = useGame((s) => s.buyMarketListing)
  const cancelMarketListing = useGame((s) => s.cancelMarketListing)
  const syncMarketPayouts = useGame((s) => s.syncMarketPayouts)
  const { level } = xpProgress(xp)

  const [listings, setListings] = useState<MarketListing[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [needsName, setNeedsName] = useState(() => !getPlayerName())
  const [postIndex, setPostIndex] = useState(0)
  const [postQty, setPostQty] = useState(1)
  const [postPrice, setPostPrice] = useState(1)
  const [busy, setBusy] = useState(false)
  const [marketPane, setMarketPane] = useState<'buy' | 'sell'>('buy')

  const playerId = getPlayerId()
  const postable = buildPostableItems(inventory, seeds, materials)
  const selectedPost = postable[postIndex] ?? null
  const priceBounds = selectedPost
    ? marketPriceBounds(selectedPost.kind, selectedPost.id)
    : null

  useEffect(() => {
    if (!isMarketOpen()) return
    void syncMarketPayouts()
  }, [isMarketOpen, syncMarketPayouts])

  useEffect(() => {
    if (!isMarketOpen() || !isSupabaseConfigured()) return
    setLoadError(null)
    return subscribeToListings(setListings, (err) => setLoadError(err.message))
  }, [isMarketOpen])

  useEffect(() => {
    if (!selectedPost || !priceBounds) return
    setPostQty(1)
    setPostPrice(priceBounds.base)
  }, [selectedPost?.kind, selectedPost?.id, priceBounds?.base])

  if (!isMarketOpen()) {
    return (
      <div className="panel">
        <div className="panel-head">
          <h2>Market</h2>
          <p>
            🔒 Reach <strong>Level {MARKET_UNLOCK_LEVEL}</strong> to unlock the
            Market Board.
          </p>
          <p className="muted">You are Level {level}.</p>
        </div>
      </div>
    )
  }

  if (needsName) {
    return (
      <PlayerNameModal
        title="Welcome to the Market"
        subtitle="Choose a display name for trading with other players."
        buttonLabel="Enter Market"
        onSave={(name) => {
          setPlayerName(name)
          setNeedsName(false)
        }}
      />
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="panel">
        <div className="panel-head">
          <h2>Market</h2>
          <p className="muted">
            Market backend is not configured on this deploy. In Vercel, add{' '}
            <strong>VITE_SUPABASE_URL</strong> and{' '}
            <strong>VITE_SUPABASE_PUBLISHABLE_KEY</strong>, then redeploy (env
            vars only apply after a new build).
          </p>
        </div>
      </div>
    )
  }

  const myListings = listings.filter((l) => l.seller_id === playerId)
  const browseListings = listings.filter((l) => l.seller_id !== playerId)

  const handlePost = async () => {
    if (!selectedPost || busy) return
    setBusy(true)
    await createMarketListing(
      selectedPost.kind,
      selectedPost.id,
      postQty,
      postPrice,
    )
    setBusy(false)
  }

  const handleBuy = async (listingId: string) => {
    if (busy) return
    setBusy(true)
    await buyMarketListing(listingId)
    setBusy(false)
  }

  const handleCancel = async (listingId: string) => {
    if (busy) return
    setBusy(true)
    await cancelMarketListing(listingId)
    setBusy(false)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Market</h2>
        <p>Trade goods, seeds, and materials with other farmers.</p>
        <p className="muted">Your coins: 🪙 {coins}</p>
      </div>

      {loadError && (
        <p className="market-error" role="alert">
          {loadError}
        </p>
      )}

      <div className="pane-tabs" role="tablist" aria-label="Market">
        <button
          type="button"
          role="tab"
          aria-selected={marketPane === 'buy'}
          className={marketPane === 'buy' ? 'active' : ''}
          onClick={() => setMarketPane('buy')}
        >
          🛒 Buy
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={marketPane === 'sell'}
          className={marketPane === 'sell' ? 'active' : ''}
          onClick={() => setMarketPane('sell')}
        >
          📤 Sell
        </button>
      </div>

      {marketPane === 'buy' && (
        <>
          <h3 className="section-label">From other farmers</h3>
          <div className="card-list">
            {browseListings.length === 0 && (
              <p className="muted">No listings yet — check back later.</p>
            )}
            {browseListings.map((listing) => {
              const meta = marketItemLabel(listing.item_kind, listing.item_id)
              const total = listing.quantity * listing.price_per_unit
              const canBuy = coins >= total
              return (
                <div key={listing.id} className="recipe-card">
                  <div className="recipe-top">
                    <span className="big-emoji">{meta.emoji}</span>
                    <div>
                      <strong>
                        {listing.quantity}× {meta.name}
                      </strong>
                      <p className="muted">
                        🪙 {listing.price_per_unit}/ea · {total} total · by{' '}
                        {listing.seller_name}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn full"
                    disabled={!canBuy || busy}
                    onClick={() => void handleBuy(listing.id)}
                  >
                    {canBuy ? `Buy · 🪙 ${total}` : `Need 🪙 ${total}`}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {marketPane === 'sell' && (
        <>
          <h3 className="section-label">Post a listing</h3>
          {postable.length === 0 ? (
            <p className="muted">Nothing to sell — stock your bag first.</p>
          ) : (
            <div className="recipe-card market-post">
              <label className="market-field">
                Item
                <select
                  className="market-input"
                  value={postIndex}
                  onChange={(e) => setPostIndex(Number(e.target.value))}
                >
                  {postable.map((item, i) => (
                    <option key={`${item.kind}-${item.id}`} value={i}>
                      {item.emoji} {item.name} ({item.qty})
                    </option>
                  ))}
                </select>
              </label>
              <label className="market-field">
                Quantity
                <input
                  className="market-input"
                  type="number"
                  min={1}
                  max={selectedPost?.qty ?? 1}
                  value={postQty}
                  onChange={(e) =>
                    setPostQty(
                      Math.max(
                        1,
                        Math.min(
                          selectedPost?.qty ?? 1,
                          Number(e.target.value) || 1,
                        ),
                      ),
                    )
                  }
                />
              </label>
              <label className="market-field">
                Price per unit
                {priceBounds && (
                  <span className="muted">
                    {' '}
                    ({priceBounds.min}–{priceBounds.max})
                  </span>
                )}
                <input
                  className="market-input"
                  type="number"
                  min={priceBounds?.min ?? 1}
                  max={priceBounds?.max ?? 9999}
                  value={postPrice}
                  onChange={(e) =>
                    setPostPrice(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </label>
              <button
                type="button"
                className="btn full"
                disabled={busy || !selectedPost}
                onClick={() => void handlePost()}
              >
                Post listing
              </button>
            </div>
          )}

          <h3 className="section-label">Your listings</h3>
          <div className="card-list">
            {myListings.length === 0 && (
              <p className="muted">You have no active listings.</p>
            )}
            {myListings.map((listing) => {
              const meta = marketItemLabel(listing.item_kind, listing.item_id)
              const total = listing.quantity * listing.price_per_unit
              return (
                <div key={listing.id} className="recipe-card">
                  <div className="recipe-top">
                    <span className="big-emoji">{meta.emoji}</span>
                    <div>
                      <strong>
                        {listing.quantity}× {meta.name}
                      </strong>
                      <p className="muted">
                        🪙 {listing.price_per_unit}/ea · {total} total
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn full secondary"
                    disabled={busy}
                    onClick={() => void handleCancel(listing.id)}
                  >
                    Cancel listing
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function SellConfirmDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingSell | null
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!pending) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, onConfirm, onCancel])

  if (!pending) return null

  const total = pending.unitPrice * pending.amount

  return (
    <div className="popup-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="popup-card kind-sell_confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-sparkle" aria-hidden>
          {pending.emoji}
        </div>
        <h2 id="sell-confirm-title" className="popup-title">
          Sell {pending.name}?
        </h2>
        <p className="popup-sub">
          Sell {pending.amount}× for 🪙 {total} ({pending.unitPrice} each)
        </p>
        <div className="popup-actions">
          <button type="button" className="btn full popup-btn" onClick={onConfirm}>
            Sell · 🪙 {total}
          </button>
          <button
            type="button"
            className="btn ghost full popup-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

type PendingSell = {
  kind: 'goods' | 'seeds' | 'material'
  id: string
  amount: number
  emoji: string
  name: string
  unitPrice: number
}

function SellableCell({
  emoji,
  name,
  qty,
  unitPrice,
  onSell,
}: {
  emoji: string
  name: string
  qty: number
  unitPrice: number
  onSell: (amount: number) => void
}) {
  return (
    <div className="inv-cell sellable">
      <span>{emoji}</span>
      <strong>{qty}</strong>
      <small>{name}</small>
      <span className="sell-price">🪙 {unitPrice}</span>
      <div className="inv-sell-actions">
        <button type="button" className="btn tiny" onClick={() => onSell(1)}>
          1
        </button>
        <button type="button" className="btn tiny" onClick={() => onSell(qty)}>
          All
        </button>
      </div>
    </div>
  )
}

function BagView() {
  const inventory = useGame((s) => s.inventory)
  const materials = useGame((s) => s.materials)
  const gearInventory = useGame((s) => s.gearInventory)
  const seeds = useGame((s) => s.seeds)
  const sellGoods = useGame((s) => s.sellGoods)
  const sellSeeds = useGame((s) => s.sellSeeds)
  const sellMaterial = useGame((s) => s.sellMaterial)
  const resetGame = useGame((s) => s.resetGame)
  const [pendingSell, setPendingSell] = useState<PendingSell | null>(null)
  const items = Object.entries(inventory).filter(([, n]) => (n ?? 0) > 0)
  const matItems = Object.entries(materials).filter(([, n]) => (n ?? 0) > 0)
  const seedItems = Object.entries(seeds).filter(([, n]) => (n ?? 0) > 0)
  const looseGear = gearInventory.filter((g) => !g.equippedBy)

  const confirmSell = () => {
    if (!pendingSell) return
    const { kind, id, amount } = pendingSell
    if (kind === 'goods') sellGoods(id as ItemId, amount)
    else if (kind === 'seeds') sellSeeds(id as CropId, amount)
    else sellMaterial(id as MaterialId, amount)
    setPendingSell(null)
  }

  return (
    <div className="panel">
      <SellConfirmDialog
        pending={pendingSell}
        onConfirm={confirmSell}
        onCancel={() => setPendingSell(null)}
      />
      <div className="panel-head">
        <h2>Bag</h2>
        <p>Sell harvests & goods for a fair profit. Orders still pay best.</p>
      </div>

      <h3 className="section-label">Seeds</h3>
      <div className="inv-grid">
        {seedItems.length === 0 && <p className="muted">No seeds yet.</p>}
        {seedItems.map(([id, qty]) => {
          const crop = CROPS[id as CropId]
          const count = qty ?? 0
          return (
            <SellableCell
              key={id}
              emoji={crop?.emoji ?? '🌱'}
              name={crop?.name ?? id}
              qty={count}
              unitPrice={seedSellPrice(id as CropId)}
              onSell={(amount) =>
                setPendingSell({
                  kind: 'seeds',
                  id,
                  amount,
                  emoji: crop?.emoji ?? '🌱',
                  name: crop?.name ?? id,
                  unitPrice: seedSellPrice(id as CropId),
                })
              }
            />
          )
        })}
      </div>

      <h3 className="section-label">Goods</h3>
      <div className="inv-grid">
        {items.length === 0 && <p className="muted">Harvest something!</p>}
        {items.map(([id, qty]) => {
          const meta = ITEM_META[id as ItemId]
          const count = qty ?? 0
          return (
            <SellableCell
              key={id}
              emoji={meta?.emoji ?? '📦'}
              name={meta?.name ?? id}
              qty={count}
              unitPrice={itemSellPrice(id as ItemId)}
              onSell={(amount) =>
                setPendingSell({
                  kind: 'goods',
                  id,
                  amount,
                  emoji: meta?.emoji ?? '📦',
                  name: meta?.name ?? id,
                  unitPrice: itemSellPrice(id as ItemId),
                })
              }
            />
          )
        })}
      </div>

      <h3 className="section-label">Adventure materials</h3>
      <div className="inv-grid">
        {matItems.length === 0 && (
          <p className="muted">Send parties exploring for ore & essence.</p>
        )}
        {matItems.map(([id, qty]) => {
          const meta = MATERIAL_META[id as keyof typeof MATERIAL_META]
          const count = qty ?? 0
          return (
            <SellableCell
              key={id}
              emoji={meta?.emoji ?? '✨'}
              name={meta?.name ?? id}
              qty={count}
              unitPrice={materialSellPrice(id as MaterialId)}
              onSell={(amount) =>
                setPendingSell({
                  kind: 'material',
                  id,
                  amount,
                  emoji: meta?.emoji ?? '✨',
                  name: meta?.name ?? id,
                  unitPrice: materialSellPrice(id as MaterialId),
                })
              }
            />
          )
        })}
      </div>

      <h3 className="section-label">Loose gear</h3>
      <div className="inv-grid">
        {looseGear.length === 0 && (
          <p className="muted">Craft gear in Adventure → Workshop.</p>
        )}
        {looseGear.map((g) => {
          const bp = GEAR_BLUEPRINT_BY_ID[g.blueprintId]
          if (!bp) return null
          const stats = gearInstanceStats(g)
          return (
            <div key={g.id} className="inv-cell">
              <span>{bp.emoji}</span>
              <strong>+{stats.skillBonus}</strong>
              <small>
                {bp.name} · {QUALITY_LABEL[bp.quality]}
              </small>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="btn danger ghost full"
        onClick={() => {
          if (window.confirm('Reset all progress?')) resetGame()
        }}
      >
        Reset save
      </button>
    </div>
  )
}

function RecruitCard({
  recruitId,
  busy,
}: {
  recruitId: string
  busy: boolean
}) {
  const gearInventory = useGame((s) => s.gearInventory)
  const recruitedNpcs = useGame((s) => s.recruitedNpcs)
  const r = recruitedNpcs.find((n) => n.id === recruitId)
  if (!r) return null
  const def = NPCS[r.npcId]
  if (!def) return null
  const combat = npcCombatStats(r, gearInventory)
  const effSkill = npcEffectiveSkill(r, def.skill, gearInventory)

  return (
    <div className="recipe-card recruit-card">
      <div className="recipe-top">
        <span className="big-emoji">{def.emoji}</span>
        <div>
          <strong>
            {def.name} · {def.title}
          </strong>
          <p className="muted">
            Skill {effSkill} (base {def.skill}
            {combat.skillBonus > 0 ? ` + ${combat.skillBonus} gear` : ''}) · ⚔️{' '}
            {combat.attack} 🛡️ {combat.defense} ❤️ {combat.hp}
          </p>
          <p className="muted">
            {busy ? 'Exploring…' : 'Idle · tap gear slots to equip'}
          </p>
        </div>
      </div>
      {!busy && (
        <div className="gear-slots gear-slots-5">
          {GEAR_SLOT_ORDER.map((slot) => (
            <GearSlotPicker key={slot} npcInstanceId={r.id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  )
}

function GearSlotPicker({
  npcInstanceId,
  slot,
}: {
  npcInstanceId: string
  slot: GearSlot
}) {
  const gearInventory = useGame((s) => s.gearInventory)
  const equipGear = useGame((s) => s.equipGear)
  const unequipGear = useGame((s) => s.unequipGear)
  const equipped = gearForNpc(npcInstanceId, gearInventory).find(
    (g) => GEAR_BLUEPRINT_BY_ID[g.blueprintId]?.slot === slot,
  )
  const bp = equipped ? GEAR_BLUEPRINT_BY_ID[equipped.blueprintId] : null
  const available = gearInventory.filter(
    (g) =>
      !g.equippedBy &&
      GEAR_BLUEPRINT_BY_ID[g.blueprintId]?.slot === slot,
  )

  return (
    <div className="gear-slot">
      <small className="gear-slot-label">{GEAR_SLOT_LABEL[slot]}</small>
      {equipped && bp ? (
        <button
          type="button"
          className="gear-slot-btn filled"
          onClick={() => unequipGear(equipped.id)}
          title="Tap to unequip"
        >
          <span>{bp.emoji}</span>
        </button>
      ) : (
        <span className="gear-slot-btn empty">+</span>
      )}
      {available.length > 0 && (
        <div className="gear-slot-options">
          {available.map((g) => {
            const opt = GEAR_BLUEPRINT_BY_ID[g.blueprintId]
            if (!opt) return null
            const st = gearInstanceStats(g)
            return (
              <button
                key={g.id}
                type="button"
                className="btn tiny"
                onClick={() => equipGear(g.id, npcInstanceId)}
                title={`${opt.name} · skill +${st.skillBonus}`}
              >
                {opt.emoji}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ShopView() {
  const coins = useGame((s) => s.coins)
  const buySeed = useGame((s) => s.buySeed)
  const isCropAvailable = useGame((s) => s.isCropAvailable)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const shopScrollTarget = useGame((s) => s.shopScrollTarget)
  const clearShopScrollTarget = useGame((s) => s.clearShopScrollTarget)

  useEffect(() => {
    if (!shopScrollTarget) return
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`shop-seed-${shopScrollTarget}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearShopScrollTarget()
    })
    return () => cancelAnimationFrame(frame)
  }, [shopScrollTarget, clearShopScrollTarget])

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Seed shop</h2>
        <p>New crops unlock as you progress through missions.</p>
      </div>
      <div className="card-list">
        {SORTED_CROP_LIST.map((crop) => {
          const locked = !isCropAvailable(crop.id)
          return (
            <div
              key={crop.id}
              id={`shop-seed-${crop.id}`}
              className={`recipe-card ${locked ? 'locked' : ''} ${!locked && (guideItemHighlights.includes(crop.id) || shopScrollTarget === crop.id) ? 'guide-pulse-frame' : ''}`}
            >
              <div className="recipe-top">
                <span className="big-emoji">{crop.emoji}</span>
                <div>
                  <strong>{crop.name}</strong>
                  <p className="muted">
                    {locked
                      ? '🔒 Unlock via missions'
                      : `Grows in ${formatLeft(crop.growMs)} · ×${crop.harvestQty}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn full"
                disabled={locked || coins < crop.seedCost}
                onClick={() => buySeed(crop.id, 1)}
              >
                Buy seed · 🪙 {crop.seedCost}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdventureView() {
  const now = useNow()
  const xp = useGame((s) => s.xp)
  const coins = useGame((s) => s.coins)
  const { level } = xpProgress(xp)
  const tavernOpen = useGame((s) => s.unlocked.includes('tavern'))
  const adventurePane = useGame((s) => s.adventurePane)
  const setAdventurePane = useGame((s) => s.setAdventurePane)
  const recruitedNpcs = useGame((s) => s.recruitedNpcs)
  const activeAdventures = useGame((s) => s.activeAdventures)
  const gearInventory = useGame((s) => s.gearInventory)
  const gearCraftQueue = useGame((s) => s.gearCraftQueue)
  const inventory = useGame((s) => s.inventory)
  const materials = useGame((s) => s.materials)
  const unlocked = useGame((s) => s.unlocked)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const selectedGearBuilding = useGame((s) => s.selectedGearBuilding)
  const selectGearBuilding = useGame((s) => s.selectGearBuilding)
  const recruitNpc = useGame((s) => s.recruitNpc)
  const startAdventure = useGame((s) => s.startAdventure)
  const collectAdventure = useGame((s) => s.collectAdventure)
  const startGearCraft = useGame((s) => s.startGearCraft)
  const collectGearCraft = useGame((s) => s.collectGearCraft)
  const [partyPick, setPartyPick] = useState<Record<string, string[]>>({})

  const idle = idleRecruits(recruitedNpcs, activeAdventures)
  const availableAdventures = adventuresForLevel(level)
  const gearOpen =
    selectedGearBuilding && unlocked.includes(selectedGearBuilding)
      ? selectedGearBuilding
      : null
  const gearBuilding = gearOpen ? GEAR_BUILDINGS[gearOpen] : null
  const gearRecipes = gearOpen ? blueprintsForBuilding(gearOpen, level) : []
  const gearQueue = gearCraftQueue
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.buildingId === gearOpen)

  const togglePartyMember = (adventureId: string, npcInstanceId: string) => {
    const adv = ADVENTURES.find((a) => a.id === adventureId)
    if (!adv) return
    setPartyPick((prev) => {
      const cur = prev[adventureId] ?? []
      if (cur.includes(npcInstanceId)) {
        return {
          ...prev,
          [adventureId]: cur.filter((id) => id !== npcInstanceId),
        }
      }
      if (cur.length >= adv.maxNpcs) return prev
      return { ...prev, [adventureId]: [...cur, npcInstanceId] }
    })
  }

  if (!tavernOpen) {
    return (
      <div className="panel">
        <div className="panel-head">
          <h2>Adventure</h2>
          <p>
            🔒 Reach <strong>Level {TAVERN_UNLOCK_LEVEL}</strong> to unlock the
            Tavern & Adventure Land.
          </p>
          <p className="muted">You are Level {level}.</p>
        </div>
        <div className="recipe-card locked">
          <div className="recipe-top">
            <span className="big-emoji">🍺</span>
            <div>
              <strong>Tavern</strong>
              <p className="muted">Recruit NPC adventurers for your valley.</p>
            </div>
          </div>
        </div>
        <div className="recipe-card locked">
          <div className="recipe-top">
            <span className="big-emoji">🗺️</span>
            <div>
              <strong>Adventure Land</strong>
              <p className="muted">Send recruits on timed expeditions.</p>
            </div>
          </div>
        </div>
        <div className="recipe-card locked">
          <div className="recipe-top">
            <span className="big-emoji">⚒️</span>
            <div>
              <strong>Gear Workshop</strong>
              <p className="muted">Craft weapons, armor & charms like a cozy titan.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Adventure</h2>
        <p>Recruit heroes, craft gear, send parties exploring.</p>
      </div>

      <div className="pane-tabs pane-tabs-4" role="tablist" aria-label="Adventure areas">
        <button
          type="button"
          role="tab"
          aria-selected={adventurePane === 'tavern'}
          className={adventurePane === 'tavern' ? 'active' : ''}
          onClick={() => setAdventurePane('tavern')}
        >
          🍺 Tavern
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={adventurePane === 'recruits'}
          className={adventurePane === 'recruits' ? 'active' : ''}
          onClick={() => setAdventurePane('recruits')}
        >
          🧑‍🤝‍🧑 Recruits
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={adventurePane === 'workshop'}
          className={adventurePane === 'workshop' ? 'active' : ''}
          onClick={() => setAdventurePane('workshop')}
        >
          ⚒️ Workshop
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={adventurePane === 'lands'}
          className={adventurePane === 'lands' ? 'active' : ''}
          onClick={() => setAdventurePane('lands')}
        >
          🗺️ Lands
        </button>
      </div>

      {adventurePane === 'tavern' && (
        <>
          <p className="muted pad">
            Hire heroes from the valley — they move to Recruits once hired (
            {recruitedNpcs.length}/{MAX_RECRUITED_NPCS} roster).
          </p>
          <h3 className="section-label">Available to recruit</h3>
          {NPC_LIST.filter(
            (npc) => !recruitedNpcs.some((r) => r.npcId === npc.id),
          ).length === 0 ? (
            <p className="muted pad">
              No one left at the tavern — check Recruits or wait for new visitors.
            </p>
          ) : (
            <div className="card-list">
              {NPC_LIST.filter(
                (npc) => !recruitedNpcs.some((r) => r.npcId === npc.id),
              ).map((npc) => (
                <div key={npc.id} className="recipe-card">
                  <div className="recipe-top">
                    <span className="big-emoji">{npc.emoji}</span>
                    <div>
                      <strong>
                        {npc.name} · {npc.title}
                      </strong>
                      <p className="muted">{npc.blurb}</p>
                      <p className="muted">Skill {npc.skill}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn full"
                    disabled={
                      coins < npc.hireCost ||
                      recruitedNpcs.length >= MAX_RECRUITED_NPCS
                    }
                    onClick={() => recruitNpc(npc.id)}
                  >
                    Recruit · 🪙 {npc.hireCost}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {adventurePane === 'recruits' && (
        <>
          <p className="muted pad">
            Roster: {recruitedNpcs.length}/{MAX_RECRUITED_NPCS} · 5 gear slots each
          </p>
          {recruitedNpcs.length === 0 ? (
            <p className="muted pad">
              No recruits yet — visit the Tavern to hire your first hero.
            </p>
          ) : (
            <div className="card-list">
              {recruitedNpcs.map((r) => {
                const busy = !idle.some((n) => n.id === r.id)
                return (
                  <RecruitCard key={r.id} recruitId={r.id} busy={busy} />
                )
              })}
            </div>
          )}
        </>
      )}

      {adventurePane === 'workshop' && (
        <>
          {!gearOpen && (
            <div className="machine-grid">
              {GEAR_BUILDING_LIST.map((b) => {
                const locked = !unlocked.includes(b.id)
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`machine-card ${locked ? 'locked' : ''} ${!locked && guideItemHighlights.includes(b.id) ? 'guide-pulse-frame' : ''}`}
                    disabled={locked}
                    onClick={() => selectGearBuilding(b.id)}
                  >
                    <span className="big-emoji">{b.emoji}</span>
                    <strong>{b.name}</strong>
                    <small>{locked ? '🔒 Level 15' : b.blurb}</small>
                  </button>
                )
              })}
            </div>
          )}

          {gearOpen && gearBuilding && (
            <>
              <button
                type="button"
                className="btn ghost"
                onClick={() => selectGearBuilding(null)}
              >
                ← All workshops
              </button>
              <div className="panel-head">
                <h2>
                  {gearBuilding.emoji} {gearBuilding.name}
                </h2>
                <p>{gearBuilding.blurb}</p>
              </div>

              {gearQueue.length > 0 && (
                <div className="queue">
                  {gearQueue.map(({ job, index }) => {
                    const bp = GEAR_BLUEPRINT_BY_ID[job.blueprintId]
                    if (!bp) return null
                    const done = now >= job.doneAt
                    const pct = Math.min(
                      100,
                      ((now - job.startedAt) / (job.doneAt - job.startedAt)) *
                        100,
                    )
                    return (
                      <div key={`${job.blueprintId}-${job.startedAt}`} className="queue-row">
                        <span>{bp.emoji}</span>
                        <div className="queue-body">
                          <strong>{bp.name}</strong>
                          <div className="mini-track">
                            <div style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        {done ? (
                          <button
                            type="button"
                            className="btn tiny"
                            onClick={() => collectGearCraft(index)}
                          >
                            Collect
                          </button>
                        ) : (
                          <span className="muted">
                            {formatLeft(job.doneAt - now)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="card-list">
                {gearRecipes.map((bp) => {
                  const stats = scaledStats(bp)
                  const missing = Object.entries(bp.inputs).some(([id, qty]) => {
                    if (id in MATERIAL_META) {
                      return (
                        (materials[id as keyof typeof MATERIAL_META] ?? 0) <
                        (qty ?? 0)
                      )
                    }
                    return (inventory[id as ItemId] ?? 0) < (qty ?? 0)
                  })
                  return (
                    <div key={bp.id} className="recipe-card">
                      <div className="recipe-top">
                        <span className="big-emoji">{bp.emoji}</span>
                        <div>
                          <strong>{bp.name}</strong>
                          <p className="muted">
                            {QUALITY_LABEL[bp.quality]} · {GEAR_SLOT_LABEL[bp.slot]} ·{' '}
                            {formatLeft(bp.craftMs)}
                          </p>
                          <p className="muted">
                            ⚔️ {stats.attack} 🛡️ {stats.defense} ❤️ {stats.hp} ·
                            skill +{stats.skillBonus}
                          </p>
                        </div>
                      </div>
                      <ul className="need-list">
                        {Object.entries(bp.inputs).map(([id, qty]) => {
                          const meta = resourceMeta(id)
                          const have =
                            id in MATERIAL_META
                              ? (materials[id as keyof typeof MATERIAL_META] ?? 0)
                              : (inventory[id as ItemId] ?? 0)
                          const ok = have >= (qty ?? 0)
                          return (
                            <li key={id} className={ok ? 'ok' : 'no'}>
                              {meta.emoji} {qty} {meta.name}{' '}
                              <span>({have})</span>
                            </li>
                          )
                        })}
                      </ul>
                      <button
                        type="button"
                        className="btn full"
                        disabled={missing}
                        onClick={() => startGearCraft(bp.id)}
                      >
                        Craft blueprint
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {adventurePane === 'lands' && (
        <>
          {activeAdventures.length > 0 && (
            <>
              <h3 className="section-label">Active expeditions</h3>
              <div className="queue">
                {activeAdventures.map((job) => {
                  const adv = ADVENTURES.find((a) => a.id === job.adventureId)
                  if (!adv) return null
                  const ready = adventureReady(job, now)
                  const pct = adventureProgress(job, now) * 100
                  const party = job.npcInstanceIds
                    .map((id) => recruitedNpcs.find((r) => r.id === id))
                    .filter(Boolean)
                  return (
                    <div key={job.id} className="queue-row">
                      <span>{adv.emoji}</span>
                      <div className="queue-body">
                        <strong>{adv.name}</strong>
                        <p className="muted small">
                          {party
                            .map((p) => NPCS[p!.npcId]?.emoji)
                            .join(' ')}
                        </p>
                        <div className="mini-track">
                          <div style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {ready ? (
                        <button
                          type="button"
                          className="btn tiny"
                          onClick={() => collectAdventure(job.id)}
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="muted">
                          {formatLeft(job.doneAt - now)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <h3 className="section-label">Expeditions</h3>
          <div className="card-list">
            {ADVENTURES.map((adv) => {
              const locked = level < adv.unlockLevel
              const picked = partyPick[adv.id] ?? []
              const skill = partyEffectiveSkill(
                picked,
                recruitedNpcs,
                gearInventory,
                (npcId) => NPCS[npcId]?.skill ?? 0,
              )
              const canSend =
                !locked &&
                picked.length >= adv.minNpcs &&
                picked.length <= adv.maxNpcs &&
                skill >= adv.minSkill
              return (
                <div
                  key={adv.id}
                  className={`recipe-card ${locked ? 'locked' : ''}`}
                >
                  <div className="recipe-top">
                    <span className="big-emoji">{adv.emoji}</span>
                    <div>
                      <strong>{adv.name}</strong>
                      <p className="muted">{adv.blurb}</p>
                      <p className="muted">
                        {locked
                          ? `🔒 Level ${adv.unlockLevel}`
                          : `${formatLeft(adv.durationMs)} · ${adv.minNpcs}–${adv.maxNpcs} recruits · skill ${adv.minSkill}+`}
                      </p>
                      <p className="muted">
                        🪙 {adv.rewardCoins} · +{adv.rewardXp} XP
                      </p>
                    </div>
                  </div>
                  {!locked && (
                    <>
                      <p className="muted small">
                        Pick party ({picked.length}/{adv.maxNpcs}) · skill{' '}
                        {skill}/{adv.minSkill}
                      </p>
                      <div className="party-pick">
                        {idle.length === 0 && (
                          <p className="muted">No idle recruits — check Tavern.</p>
                        )}
                        {idle.map((r) => {
                          const def = NPCS[r.npcId]
                          if (!def) return null
                          const active = picked.includes(r.id)
                          const eff = npcEffectiveSkill(
                            r,
                            def.skill,
                            gearInventory,
                          )
                          return (
                            <button
                              key={r.id}
                              type="button"
                              className={`seed-chip ${active ? 'active' : ''}`}
                              onClick={() => togglePartyMember(adv.id, r.id)}
                            >
                              <span className="seed-emoji">{def.emoji}</span>
                              <span className="seed-meta">
                                <strong>{def.name}</strong>
                                <small>Skill {eff}</small>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        className="btn full"
                        disabled={!canSend}
                        onClick={() => {
                          startAdventure(adv.id, picked)
                          setPartyPick((prev) => ({ ...prev, [adv.id]: [] }))
                        }}
                      >
                        Send expedition
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {availableAdventures.length === 0 && (
            <p className="muted pad">More lands open as you level up.</p>
          )}
        </>
      )}
    </div>
  )
}

function TabNav() {
  const tab = useGame((s) => s.tab)
  const setTab = useGame((s) => s.setTab)
  const guideTabPulses = useGame((s) => s.guideTabPulses)
  const contextGuideTab = useGame((s) => s.contextGuideTab)
  return (
    <nav className="tabnav" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${tab === t.id ? 'active' : ''} ${tabShouldPulse(t.id, guideTabPulses, contextGuideTab) ? 'guide-pulse-frame' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span aria-hidden>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const tab = useGame((s) => s.tab)
  const darkMode = useGame((s) => s.darkMode)
  const syncMarketPayouts = useGame((s) => s.syncMarketPayouts)

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    void syncMarketPayouts()
  }, [syncMarketPayouts])

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : ''}`}>
      <div className="sky" aria-hidden />
      <div className="meadow" aria-hidden />
      <div className="app">
        <TopBar />
        <main className="main">
          {tab === 'missions' && <MissionsView />}
          {tab === 'farm' && <FarmView />}
          {tab === 'machines' && <MachinesView />}
          {tab === 'animals' && <AnimalsView />}
          {tab === 'adventure' && <AdventureView />}
          {tab === 'orders' && <OrdersView />}
          {tab === 'market' && <MarketView />}
          {tab === 'bag' && <BagView />}
          {tab === 'shop' && <ShopView />}
        </main>
        <div className="app-bottom">
          <GlobalChatDock />
          <TabNav />
        </div>
        <Toast />
        <CelebrationPopup />
      </div>
    </div>
  )
}

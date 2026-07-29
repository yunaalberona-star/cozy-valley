import { useEffect, useState } from 'react'
import { ANIMALS } from './game/data/animals'
import {
  ANIMAL_BUILDING_LIST,
  ANIMAL_BUILDINGS,
} from './game/data/animalBuildings'
import {
  BUILDING_LIST,
  BUILDINGS,
  ITEM_META,
  MAX_QUEUE_BONUS,
  ORDERS_UNLOCK_LEVEL,
  queueUpgradeCost,
  recipesForBuilding,
} from './game/data/buildings'
import { CROPS, CROP_LIST, xpProgress } from './game/data/crops'
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
} from './game/data/missions'
import { MAX_RECRUITED_NPCS, NPC_LIST, NPCS } from './game/data/npcs'
import { ORDERS } from './game/data/orders'
import {
  itemSellPrice,
  materialSellPrice,
  seedSellPrice,
} from './game/data/sellPrices'
import { unlockLabel } from './game/unlocks'
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
import type {
  AnimalTypeId,
  CropId,
  GearSlot,
  ItemId,
  MaterialId,
  TabId,
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
          <p className="brand-sub">missions unlock the farm</p>
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

  useEffect(() => {
    if (!popup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') dismissPopup()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popup, dismissPopup])

  if (!popup) return null

  return (
    <div
      className="popup-backdrop"
      role="presentation"
      onClick={dismissPopup}
    >
      <div
        className={`popup-card kind-${popup.kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-sparkle" aria-hidden>
          ✨
        </div>
        <h2 id="popup-title" className="popup-title">
          {popup.title}
        </h2>
        {popup.subtitle && <p className="popup-sub">{popup.subtitle}</p>}
        <ul className="popup-items">
          {popup.items.map((item) => (
            <li key={item.name}>
              <span className="popup-item-emoji">{item.emoji}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn full popup-btn" onClick={dismissPopup}>
          {popup.kind === 'level_up' ? 'Nice!' : 'Got it!'}
        </button>
      </div>
    </div>
  )
}

function GoalList({
  parentId,
  progress,
}: {
  parentId: string
  progress: Record<string, number>
}) {
  const mission = MISSION_BY_ID[parentId]
  const event = EVENT_BY_ID[parentId]
  const goals = mission?.goals ?? event?.goals ?? []
  return (
    <ul className="need-list">
      {goals.map((g) => {
        const cur = missionGoalProgress(progress, parentId, g.id)
        const ok = cur >= g.amount
        return (
          <li key={g.id} className={ok ? 'ok' : 'no'}>
            {g.label}{' '}
            <span>
              ({Math.min(cur, g.amount)}/{g.amount})
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function MissionsView() {
  const now = useNow(1000)
  const activeMissionId = useGame((s) => s.activeMissionId)
  const missionProgress = useGame((s) => s.missionProgress)
  const completedMissions = useGame((s) => s.completedMissions)
  const claimMission = useGame((s) => s.claimMission)
  const activeEventId = useGame((s) => s.activeEventId)
  const eventEndsAt = useGame((s) => s.eventEndsAt)
  const eventProgress = useGame((s) => s.eventProgress)
  const startEvent = useGame((s) => s.startEvent)
  const claimEvent = useGame((s) => s.claimEvent)
  const unlocked = useGame((s) => s.unlocked)

  const mission = activeMissionId ? MISSION_BY_ID[activeMissionId] : null
  const missionDone =
    mission &&
    mission.goals.every(
      (g) =>
        missionGoalProgress(missionProgress, mission.id, g.id) >= g.amount,
    )

  const event = activeEventId ? EVENT_BY_ID[activeEventId] : null
  const eventExpired = eventEndsAt != null && now > eventEndsAt
  const eventDone =
    event &&
    !eventExpired &&
    event.goals.every(
      (g) => missionGoalProgress(eventProgress, event.id, g.id) >= g.amount,
    )

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Missions</h2>
        <p>Complete tasks to unlock machines, animals & more.</p>
      </div>

      {mission ? (
        <div className="recipe-card highlight">
          <div className="recipe-top">
            <span className="big-emoji">{mission.emoji}</span>
            <div>
              <strong>{mission.name}</strong>
              <p className="muted">{mission.story}</p>
            </div>
          </div>
          <GoalList parentId={mission.id} progress={missionProgress} />
          <p className="unlock-line">
            Unlocks:{' '}
            {mission.unlocks.map((u) => unlockLabel(u)).join(', ') || '—'}
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
        </div>
      ) : (
        <p className="muted pad">All story missions complete. Nice work!</p>
      )}

      <h3 className="section-label">Events</h3>
      {event ? (
        <div className="recipe-card">
          <div className="recipe-top">
            <span className="big-emoji">{event.emoji}</span>
            <div>
              <strong>{event.name}</strong>
              <p className="muted">
                {eventExpired
                  ? 'Expired'
                  : `Ends in ${formatLeft((eventEndsAt ?? now) - now)}`}
              </p>
            </div>
          </div>
          <GoalList parentId={event.id} progress={eventProgress} />
          <button
            type="button"
            className="btn full"
            disabled={!eventDone && !eventExpired}
            onClick={claimEvent}
          >
            {eventExpired
              ? 'Dismiss'
              : eventDone
                ? `Claim · 🪙 ${event.rewardCoins}`
                : 'Event active…'}
          </button>
        </div>
      ) : (
        <div className="card-list">
          {EVENTS.map((ev) => (
            <div key={ev.id} className="recipe-card">
              <div className="recipe-top">
                <span className="big-emoji">{ev.emoji}</span>
                <div>
                  <strong>{ev.name}</strong>
                  <p className="muted">{ev.blurb}</p>
                </div>
              </div>
              <button
                type="button"
                className="btn full"
                onClick={() => startEvent(ev.id)}
              >
                Start · {formatLeft(ev.durationMs)}
              </button>
            </div>
          ))}
        </div>
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
          Completed: {completedMissions.length} missions
        </p>
      )}
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
  const available = CROP_LIST.filter((c) => isCropAvailable(c.id))

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

function MachinesView() {
  const now = useNow()
  const coins = useGame((s) => s.coins)
  const unlocked = useGame((s) => s.unlocked)
  const ownedBuildings = useGame((s) => s.ownedBuildings)
  const machineQueueBonus = useGame((s) => s.machineQueueBonus)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const inventory = useGame((s) => s.inventory)
  const craftQueue = useGame((s) => s.craftQueue)
  const selectedBuilding = useGame((s) => s.selectedBuilding)
  const selectBuilding = useGame((s) => s.selectBuilding)
  const purchaseBuilding = useGame((s) => s.purchaseBuilding)
  const upgradeMachineQueue = useGame((s) => s.upgradeMachineQueue)
  const machineQueueCapacity = useGame((s) => s.machineQueueCapacity)
  const startCraft = useGame((s) => s.startCraft)
  const collectCraft = useGame((s) => s.collectCraft)

  const open =
    selectedBuilding && unlocked.includes(selectedBuilding)
      ? selectedBuilding
      : null
  const building = open ? BUILDINGS[open] : null
  const owned = open ? ownedBuildings.includes(open) : false
  const recipes = open && owned ? recipesForBuilding(open) : []
  const queueCap = open ? machineQueueCapacity(open) : 0
  const queueBonus = open ? (machineQueueBonus[open] ?? 0) : 0
  const queue = craftQueue
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.buildingId === open)

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Machines</h2>
        <p>Missions unlock blueprints — buy & build each machine with coins.</p>
      </div>

      {!open && (
        <div className="machine-grid">
          {BUILDING_LIST.map((b) => {
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
                const recipe = recipesForBuilding(open).find(
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
              const missing = Object.entries(recipe.inputs).some(
                ([id, qty]) => (inventory[id as ItemId] ?? 0) < (qty ?? 0),
              )
              const queueFull = queue.length >= queueCap
              return (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-top">
                    <span className="big-emoji">{recipe.emoji}</span>
                    <div>
                      <strong>{recipe.name}</strong>
                      <p className="muted">
                        {formatLeft(recipe.craftMs)} · +{recipe.xp} XP
                      </p>
                    </div>
                  </div>
                  <ul className="need-list">
                    {Object.entries(recipe.inputs).map(([id, qty]) => {
                      const meta = ITEM_META[id as ItemId]
                      const have = inventory[id as ItemId] ?? 0
                      const ok = have >= (qty ?? 0)
                      return (
                        <li key={id} className={ok ? 'ok' : 'no'}>
                          {meta?.emoji} {qty} {meta?.name}{' '}
                          <span>({have})</span>
                        </li>
                      )
                    })}
                  </ul>
                  <button
                    type="button"
                    className="btn full"
                    disabled={missing || queueFull}
                    onClick={() => startCraft(recipe.id)}
                  >
                    {queueFull ? 'Queue full' : 'Start'}
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
          {ANIMAL_BUILDING_LIST.map((b) => {
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
                      onClick={() => feedAnimal(a.id)}
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
  const refreshOrders = useGame((s) => s.refreshOrders)
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
      <div className="panel-head row">
        <div>
          <h2>Orders</h2>
          <p>Ship goods for coins & XP.</p>
        </div>
        <button type="button" className="btn ghost" onClick={refreshOrders}>
          Refresh
        </button>
      </div>

      <div className="card-list">
        {activeOrders.map((active) => {
          const order = ORDERS.find((o) => o.id === active.orderId)
          if (!order) return null
          const can = Object.entries(order.needs).every(
            ([id, qty]) => (inventory[id as ItemId] ?? 0) >= (qty ?? 0),
          )
          return (
            <div key={active.slot} className="recipe-card">
              <div className="recipe-top">
                <span className="big-emoji">{order.emoji}</span>
                <div>
                  <strong>{order.name}</strong>
                  <p className="muted">
                    🪙 {order.rewardCoins} · +{order.rewardXp} XP
                  </p>
                </div>
              </div>
              <ul className="need-list">
                {Object.entries(order.needs).map(([id, qty]) => {
                  const meta = ITEM_META[id as ItemId]
                  const have = inventory[id as ItemId] ?? 0
                  const ok = have >= (qty ?? 0)
                  return (
                    <li key={id} className={ok ? 'ok' : 'no'}>
                      {meta?.emoji} {qty} {meta?.name} <span>({have})</span>
                    </li>
                  )
                })}
              </ul>
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
  const items = Object.entries(inventory).filter(([, n]) => (n ?? 0) > 0)
  const matItems = Object.entries(materials).filter(([, n]) => (n ?? 0) > 0)
  const seedItems = Object.entries(seeds).filter(([, n]) => (n ?? 0) > 0)
  const looseGear = gearInventory.filter((g) => !g.equippedBy)

  return (
    <div className="panel">
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
              onSell={(amount) => sellSeeds(id as CropId, amount)}
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
              onSell={(amount) => sellGoods(id as ItemId, amount)}
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
              onSell={(amount) => sellMaterial(id as MaterialId, amount)}
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

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Seed shop</h2>
        <p>New crops unlock as you progress through missions.</p>
      </div>
      <div className="card-list">
        {CROP_LIST.map((crop) => {
          const locked = !isCropAvailable(crop.id)
          return (
            <div
              key={crop.id}
              className={`recipe-card ${locked ? 'locked' : ''} ${!locked && guideItemHighlights.includes(crop.id) ? 'guide-pulse-frame' : ''}`}
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

      <div className="pane-tabs pane-tabs-3" role="tablist" aria-label="Adventure areas">
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
            Roster: {recruitedNpcs.length}/{MAX_RECRUITED_NPCS}
          </p>
          {recruitedNpcs.length > 0 && (
            <>
              <h3 className="section-label">Party & gear</h3>
              <div className="card-list">
                {recruitedNpcs.map((r) => {
                  const def = NPCS[r.npcId]
                  if (!def) return null
                  const busy = !idle.some((n) => n.id === r.id)
                  const combat = npcCombatStats(r, gearInventory)
                  const effSkill = npcEffectiveSkill(
                    r,
                    def.skill,
                    gearInventory,
                  )
                  return (
                    <div key={r.id} className="recipe-card">
                      <div className="recipe-top">
                        <span className="big-emoji">{def.emoji}</span>
                        <div>
                          <strong>
                            {def.name} · {def.title}
                          </strong>
                          <p className="muted">
                            Skill {effSkill} (base {def.skill}
                            {combat.skillBonus > 0
                              ? ` + ${combat.skillBonus} gear`
                              : ''}
                            ) · ⚔️ {combat.attack} 🛡️ {combat.defense} ❤️{' '}
                            {combat.hp}
                          </p>
                          <p className="muted">
                            {busy ? 'Exploring…' : 'Idle · ready to equip'}
                          </p>
                        </div>
                      </div>
                      {!busy && (
                        <div className="gear-slots">
                          <GearSlotPicker npcInstanceId={r.id} slot="weapon" />
                          <GearSlotPicker npcInstanceId={r.id} slot="armor" />
                          <GearSlotPicker
                            npcInstanceId={r.id}
                            slot="accessory"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
          <h3 className="section-label">Available to recruit</h3>
          <div className="card-list">
            {NPC_LIST.map((npc) => {
              const owned = recruitedNpcs.some((r) => r.npcId === npc.id)
              return (
                <div
                  key={npc.id}
                  className={`recipe-card ${owned ? 'locked' : ''}`}
                >
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
                      owned ||
                      coins < npc.hireCost ||
                      recruitedNpcs.length >= MAX_RECRUITED_NPCS
                    }
                    onClick={() => recruitNpc(npc.id)}
                  >
                    {owned ? 'Recruited' : `Recruit · 🪙 ${npc.hireCost}`}
                  </button>
                </div>
              )
            })}
          </div>
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
  const isTabPulsing = useGame((s) => s.isTabPulsing)
  return (
    <nav className="tabnav" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${tab === t.id ? 'active' : ''} ${isTabPulsing(t.id) ? 'guide-pulse-frame' : ''}`}
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

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', darkMode)
  }, [darkMode])

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
          {tab === 'bag' && <BagView />}
          {tab === 'shop' && <ShopView />}
        </main>
        <TabNav />
        <Toast />
        <CelebrationPopup />
      </div>
    </div>
  )
}

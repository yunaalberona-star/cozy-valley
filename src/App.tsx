import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  MAX_MACHINE_QUEUE,
  ORDERS_UNLOCK_LEVEL,
  queueUpgradeCost,
} from './game/data/buildings'
import { CROPS, SORTED_CROP_LIST, levelFromXp, xpProgress } from './game/data/crops'
import {
  ADVENTURES,
  adventuresForLevel,
  MAX_ADVENTURE_PARTY,
  scaledAdventure,
  TAVERN_UNLOCK_LEVEL,
} from './game/data/adventures'
import {
  allBlueprintsForBuilding,
  formatRecipeStars,
  GEAR_BLUEPRINT_BY_ID,
  GEAR_BUILDINGS,
  GEAR_BUILDINGS_PREMIUM,
  GEAR_BUILDINGS_STANDARD,
  GEAR_SLOT_LABEL,
  gearForNpc,
  gearInstanceQuality,
  gearInstanceStats,
  isGearRecipeUnlocked,
  MATERIAL_META,
  QUALITY_LABEL,
  recipeStar,
  recipeUnlockProgress,
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
import {
  DAILY_ALL_BONUS,
  DAILY_GOALS_PARENT_ID,
  WEEKLY_ALL_BONUS,
  WEEKLY_GOALS_PARENT_ID,
  allSlotsClaimed,
  msUntilDailyReset,
  msUntilWeeklyReset,
  slotComplete,
  WEEKLY_RESET_LABEL,
  dayKeysInRankingWeek,
  periodDayKey,
  periodWeekKey,
  type GoalBonus,
  type ScheduledGoalSlot,
} from './game/data/scheduledGoals'
import {
  RANKING_TIERS,
  rankingPointsForRank,
  rankingTierLabel,
  type GoalPeriodKind,
} from './game/data/rankingTiers'
import {
  ACHIEVEMENTS,
  achievementProgressValue,
  achievementsReadyToClaim,
  isAchievementClaimed,
  isAchievementComplete,
} from './game/data/achievements'
import {
  fetchGoalRankingLeaderboard,
  fetchRankingWeekPointsLeaderboard,
  RankingError,
  type GoalRankingRow,
  type RankingPointsRow,
} from './game/rankingClient'
import { buildingUnlockLevel } from './game/data/levelUnlocks'
import {
  GATHER_SITE_MAX_SLOTS,
  GATHER_SITES,
  gatherSlotCost,
  gatherYieldMultiplier,
  materialRecipeYield,
} from './game/data/gatherSites'
import { MAX_RECRUITED_NPCS, NPC_LIST, NPCS } from './game/data/npcs'
import {
  npcPower,
  npcTotalStats,
  partyPower,
  recruitXpProgress,
} from './game/data/recruits'
import { ORDERS } from './game/data/orders'
import {
  formatShipCountdown,
  msUntilShipRefresh,
  shipItemLabel,
} from './game/data/shipOrders'
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
  subscribeToSellerPayouts,
  type ChatMessage,
  type MarketListing,
} from './game/marketClient'
import { unlockLabel } from './game/unlocks'
import { tabShouldPulse } from './game/guides'
import { SORTED_TREE_LIST, TREES } from './game/data/trees'
import {
  animalSpeedUpgradeCost,
  effectiveMs,
  farmSpeedUpgradeCost,
  machineSpeedUpgradeCost,
  MAX_SPEED_LEVEL,
  speedLevelLabel,
} from './game/data/upgrades'
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
  treeProgress,
  treeReady,
  treeSlotUnlockCost,
  MAX_PLOTS,
  MAX_TREE_SLOTS,
  useGame,
} from './game/store'
import {
  GEAR_SLOT_ORDER,
  type AnimalTypeId,
  type CropId,
  type CraftResourceId,
  type GearBuildingDef,
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

function GearIcon({
  blueprint,
  className,
}: {
  blueprint: { emoji: string; icon?: string; name: string }
  className?: string
}) {
  if (blueprint.icon) {
    return (
      <img
        src={blueprint.icon}
        alt=""
        aria-hidden
        className={['gear-icon', className].filter(Boolean).join(' ')}
      />
    )
  }
  return <span className={className}>{blueprint.emoji}</span>
}

function BuildingIcon({
  building,
  className,
}: {
  building: { emoji: string; icon?: string; name: string }
  className?: string
}) {
  if (building.icon) {
    return (
      <img
        src={building.icon}
        alt=""
        aria-hidden
        className={['gear-icon', className].filter(Boolean).join(' ')}
      />
    )
  }
  return (
    <span className={['gear-icon', className].filter(Boolean).join(' ')}>
      {building.emoji}
    </span>
  )
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

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function RankingPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<'week' | 'weekly' | 'daily'>('week')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weekPoints, setWeekPoints] = useState<RankingPointsRow[]>([])
  const [weeklyFinish, setWeeklyFinish] = useState<GoalRankingRow[]>([])
  const [dailyFinish, setDailyFinish] = useState<GoalRankingRow[]>([])

  const rankingWeekPoints = useGame((s) => s.rankingWeekPoints)
  const rankingPoints = useGame((s) => s.rankingPoints)
  const weeklyGoalsPeriodKey = useGame((s) => s.weeklyGoalsPeriodKey)
  const dailyGoalsPeriodKey = useGame((s) => s.dailyGoalsPeriodKey)
  const playerId = getPlayerId()
  const playerName = getPlayerName() ?? 'Farmer'

  const myWeekRow = weekPoints.find((r) => r.player_id === playerId)
  const myWeeklyRow = weeklyFinish.find((r) => r.player_id === playerId)
  const myDailyRow = dailyFinish.find((r) => r.player_id === playerId)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    if (!isSupabaseConfigured()) {
      setError('Ranking is not configured on this server.')
      setWeekPoints([])
      setWeeklyFinish([])
      setDailyFinish([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const dayKeys = dayKeysInRankingWeek()
        const weekKey = weeklyGoalsPeriodKey || periodWeekKey()
        const dayKey = dailyGoalsPeriodKey || periodDayKey()
        const [wp, wf, df] = await Promise.all([
          fetchRankingWeekPointsLeaderboard(weekKey, dayKeys),
          fetchGoalRankingLeaderboard('weekly', weekKey),
          fetchGoalRankingLeaderboard('daily', dayKey),
        ])
        if (cancelled) return
        setWeekPoints(wp)
        setWeeklyFinish(wf)
        setDailyFinish(df)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof RankingError
            ? err.message
            : 'Could not load rankings.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, weeklyGoalsPeriodKey, dailyGoalsPeriodKey])

  if (!open) return null

  return (
    <div className="popup-backdrop" role="presentation" onClick={onClose}>
      <div
        className="popup-card ranking-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ranking-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ranking-panel-head">
          <h2 id="ranking-title" className="popup-title">
            🏆 Rankings
          </h2>
          <button
            type="button"
            className="btn ghost ranking-close"
            onClick={onClose}
            aria-label="Close rankings"
          >
            ✕
          </button>
        </div>

        <div className="recipe-card highlight ranking-you">
          <strong>{playerName}</strong>
          <p className="muted small">
            This week: 🏆 {rankingWeekPoints} pts
            {myWeekRow ? ` · Leaderboard #${myWeekRow.rank}` : ''}
          </p>
          <p className="muted small">All-time: 🏆 {rankingPoints} pts</p>
          {!getPlayerName() && (
            <p className="muted small">
              Set your farmer name in Market chat to appear on the board.
            </p>
          )}
        </div>

        <div className="pane-tabs pane-tabs-3 ranking-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'week'}
            className={tab === 'week' ? 'active' : ''}
            onClick={() => setTab('week')}
          >
            Week pts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'weekly'}
            className={tab === 'weekly' ? 'active' : ''}
            onClick={() => setTab('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'daily'}
            className={tab === 'daily' ? 'active' : ''}
            onClick={() => setTab('daily')}
          >
            Today
          </button>
        </div>

        {tab === 'week' && (
          <p className="muted small ranking-tab-note">
            Total ranking points this week (daily + weekly bonuses). Resets{' '}
            {WEEKLY_RESET_LABEL}.
          </p>
        )}
        {tab === 'weekly' && (
          <p className="muted small ranking-tab-note">
            Who finished all weekly goals fastest this period
            {myWeeklyRow
              ? ` — you: #${myWeeklyRow.rank} (${rankingTierLabel(myWeeklyRow.rank)})`
              : ''}
            .
          </p>
        )}
        {tab === 'daily' && (
          <p className="muted small ranking-tab-note">
            Who finished all daily goals fastest today
            {myDailyRow
              ? ` — you: #${myDailyRow.rank} (${rankingTierLabel(myDailyRow.rank)})`
              : ''}
            .
          </p>
        )}

        {loading && <p className="muted pad small">Loading rankings…</p>}
        {error && !loading && (
          <p className="muted pad small ranking-error">{error}</p>
        )}

        {!loading && !error && tab === 'week' && (
          <ol className="ranking-list">
            {weekPoints.length === 0 ? (
              <li className="ranking-empty muted">No entries yet this week.</li>
            ) : (
              weekPoints.map((row) => (
                <li
                  key={row.player_id}
                  className={row.player_id === playerId ? 'is-you' : ''}
                >
                  <span className="ranking-pos">{rankMedal(row.rank)}</span>
                  <span className="ranking-name">{row.player_name}</span>
                  <span className="ranking-pts">🏆 {row.points}</span>
                </li>
              ))
            )}
          </ol>
        )}

        {!loading && !error && tab === 'weekly' && (
          <ol className="ranking-list">
            {weeklyFinish.length === 0 ? (
              <li className="ranking-empty muted">No weekly finishes yet.</li>
            ) : (
              weeklyFinish.map((row) => (
                <li
                  key={row.player_id}
                  className={row.player_id === playerId ? 'is-you' : ''}
                >
                  <span className="ranking-pos">{rankMedal(row.rank)}</span>
                  <span className="ranking-name">{row.player_name}</span>
                  <span className="ranking-pts">
                    🏆 {rankingPointsForRank('weekly', row.rank)}
                  </span>
                </li>
              ))
            )}
          </ol>
        )}

        {!loading && !error && tab === 'daily' && (
          <ol className="ranking-list">
            {dailyFinish.length === 0 ? (
              <li className="ranking-empty muted">No daily finishes yet.</li>
            ) : (
              dailyFinish.map((row) => (
                <li
                  key={row.player_id}
                  className={row.player_id === playerId ? 'is-you' : ''}
                >
                  <span className="ranking-pos">{rankMedal(row.rank)}</span>
                  <span className="ranking-name">{row.player_name}</span>
                  <span className="ranking-pts">
                    🏆 {rankingPointsForRank('daily', row.rank)}
                  </span>
                </li>
              ))
            )}
          </ol>
        )}

        <button type="button" className="btn full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function AchievementPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const achievementProgress = useGame((s) => s.achievementProgress)
  const claimedAchievements = useGame((s) => s.claimedAchievements)
  const claimAchievement = useGame((s) => s.claimAchievement)
  const ready = achievementsReadyToClaim(achievementProgress, claimedAchievements)
  const claimedCount = claimedAchievements.length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="popup-backdrop" role="presentation" onClick={onClose}>
      <div
        className="popup-card ranking-panel achievement-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ranking-panel-head">
          <h2 id="achievement-title" className="popup-title">
            🎖️ Achievements
          </h2>
          <button
            type="button"
            className="btn ghost ranking-close"
            onClick={onClose}
            aria-label="Close achievements"
          >
            ✕
          </button>
        </div>

        <p className="muted small">
          {claimedCount}/{ACHIEVEMENTS.length} badges claimed
          {ready.length > 0 ? ` · ${ready.length} ready to claim` : ''}
        </p>

        <div className="achievement-list">
          {ACHIEVEMENTS.map((ach) => {
            const cur = achievementProgressValue(achievementProgress, ach.id)
            const claimed = isAchievementClaimed(ach.id, claimedAchievements)
            const complete = isAchievementComplete(ach, achievementProgress)
            const pct = Math.min(100, (cur / ach.amount) * 100)
            return (
              <div
                key={ach.id}
                className={`achievement-card${claimed ? ' claimed' : ''}${complete && !claimed ? ' ready' : ''}`}
              >
                <div className="achievement-badge" aria-hidden>
                  {ach.badge}
                </div>
                <div className="achievement-body">
                  <strong>{ach.title}</strong>
                  <p className="muted small">{ach.description}</p>
                  {!claimed && (
                    <div className="achievement-bar" aria-hidden>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  <p className="achievement-meta">
                    {claimed ? (
                      'Claimed ✓'
                    ) : (
                      <>
                        {Math.min(cur, ach.amount)}/{ach.amount} · 🪙{' '}
                        {ach.rewardCoins}
                      </>
                    )}
                  </p>
                </div>
                {complete && !claimed && (
                  <button
                    type="button"
                    className="btn tiny achievement-claim"
                    onClick={() => claimAchievement(ach.id)}
                  >
                    Claim
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button type="button" className="btn full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function TopBar() {
  const coins = useGame((s) => s.coins)
  const xp = useGame((s) => s.xp)
  const darkMode = useGame((s) => s.darkMode)
  const toggleDarkMode = useGame((s) => s.toggleDarkMode)
  const rankingWeekPoints = useGame((s) => s.rankingWeekPoints)
  const achievementProgress = useGame((s) => s.achievementProgress)
  const claimedAchievements = useGame((s) => s.claimedAchievements)
  const readyAchievements = achievementsReadyToClaim(
    achievementProgress,
    claimedAchievements,
  ).length
  const [rankingOpen, setRankingOpen] = useState(false)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const { level, into, need } = xpProgress(xp)
  const pct = Math.min(100, (into / need) * 100)

  return (
    <>
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
            <div className="topbar-icon-row">
              <button
                type="button"
                className={`theme-toggle${readyAchievements > 0 ? ' has-badge' : ''}`}
                onClick={() => setAchievementsOpen(true)}
                aria-label="View achievements"
                title={
                  readyAchievements > 0
                    ? `${readyAchievements} achievement(s) ready`
                    : 'Achievements'
                }
              >
                🎖️
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setRankingOpen(true)}
                aria-label="View rankings"
                title={`Rankings · ${rankingWeekPoints} pts this week`}
              >
                🏆
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleDarkMode}
                aria-label={
                  darkMode ? 'Switch to light mode' : 'Switch to dark mode'
                }
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
            <div className="stat level">
              <span className="lvl">Lv {level}</span>
              <div className="xp-track" aria-hidden>
                <div className="xp-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>
      <RankingPanel open={rankingOpen} onClose={() => setRankingOpen(false)} />
      <AchievementPanel
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />
    </>
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

function ScheduledGoalCard({
  slot,
  parentId,
  progress,
  onClaim,
}: {
  slot: ScheduledGoalSlot
  parentId: string
  progress: Record<string, number>
  onClaim: () => void
}) {
  const navigateToMissionGoal = useGame((s) => s.navigateToMissionGoal)
  const cur = missionGoalProgress(progress, parentId, slot.slotId)
  const done = cur >= slot.amount
  const goal = {
    id: slot.slotId,
    kind: slot.kind,
    target: slot.target,
    amount: slot.amount,
    label: slot.label,
  }

  return (
    <div className={`recipe-card scheduled-goal${slot.claimed ? ' claimed' : ''}${done && !slot.claimed ? ' ready' : ''}`}>
      <div className="recipe-top">
        <div>
          <strong>{slot.label}</strong>
          <p className="muted small">
            {slot.claimed ? (
              'Claimed ✓'
            ) : (
              <>
                Progress {Math.min(cur, slot.amount)}/{slot.amount}
              </>
            )}
          </p>
          <p className="unlock-line">
            🪙 {slot.rewardCoins} · ⭐ {slot.rewardXp} XP
          </p>
        </div>
      </div>
      {slot.claimed ? null : done ? (
        <button type="button" className="btn full" onClick={onClaim}>
          Claim reward
        </button>
      ) : (
        <button
          type="button"
          className="btn secondary full"
          onClick={() => navigateToMissionGoal(goal)}
        >
          Go do it
        </button>
      )}
    </div>
  )
}

function RankingTierTable({ period }: { period: GoalPeriodKind }) {
  return (
    <ul className="ranking-tier-list muted small">
      {RANKING_TIERS.map((tier) => (
        <li key={tier.label}>
          <strong>{tier.label}</strong>
          <span>
            🏆 {period === 'daily' ? tier.pointsDaily : tier.pointsWeekly} pts
          </span>
        </li>
      ))}
    </ul>
  )
}

function ScheduledGoalsSection({
  title,
  period,
  resetInMs,
  resetNote,
  parentId,
  goals,
  progress,
  bonusClaimed,
  bonus,
  rankingRank,
  bonusLoading,
  onClaimGoal,
  onClaimBonus,
}: {
  title: string
  period: GoalPeriodKind
  resetInMs: number
  resetNote?: string
  parentId: string
  goals: ScheduledGoalSlot[]
  progress: Record<string, number>
  bonusClaimed: boolean
  bonus: GoalBonus
  rankingRank: number | null
  bonusLoading: boolean
  onClaimGoal: (slotId: string) => void
  onClaimBonus: () => void
}) {
  const allClaimed = allSlotsClaimed(goals)
  const allComplete = goals.every((slot) =>
    slot.claimed || slotComplete(slot, progress, parentId),
  )

  return (
    <section className="scheduled-goals-section">
      <div className="scheduled-goals-head">
        <h3>{title}</h3>
        <p className="muted small">
          Resets in {formatLeft(resetInMs)}
          {resetNote ? ` · ${resetNote}` : ''}
        </p>
      </div>
      <div className="card-list">
        {goals.map((slot) => (
          <ScheduledGoalCard
            key={slot.slotId}
            slot={slot}
            parentId={parentId}
            progress={progress}
            onClaim={() => onClaimGoal(slot.slotId)}
          />
        ))}
      </div>
      <div className="recipe-card highlight scheduled-bonus">
        <div className="recipe-top">
          <div>
            <strong>All-goals bonus</strong>
            <p className="muted small">
              Faster finishers earn more ranking points. Set your farmer name
              (Market chat) to register on the leaderboard.
            </p>
            <p className="unlock-line">
              🪙 {bonus.rewardCoins} · ⭐ {bonus.rewardXp} XP
            </p>
            <RankingTierTable period={period} />
            {bonusClaimed && rankingRank != null && (
              <p className="muted small">
                Your finish: #{rankingRank} ({rankingTierLabel(rankingRank)})
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn full"
          disabled={bonusClaimed || !allClaimed || bonusLoading}
          onClick={onClaimBonus}
        >
          {bonusLoading
            ? 'Submitting rank…'
            : bonusClaimed
              ? 'Bonus claimed ✓'
              : allClaimed
                ? 'Claim bonus & rank'
                : allComplete
                  ? 'Claim individual rewards first'
                  : 'Complete all goals'}
        </button>
      </div>
    </section>
  )
}

function ScheduledGoalsPane() {
  const now = useNow(1000)
  const [dailyBonusLoading, setDailyBonusLoading] = useState(false)
  const [weeklyBonusLoading, setWeeklyBonusLoading] = useState(false)
  const dailyGoals = useGame((s) => s.dailyGoals)
  const dailyGoalProgress = useGame((s) => s.dailyGoalProgress)
  const dailyBonusClaimed = useGame((s) => s.dailyBonusClaimed)
  const dailyRankingRank = useGame((s) => s.dailyRankingRank)
  const weeklyGoals = useGame((s) => s.weeklyGoals)
  const weeklyGoalProgress = useGame((s) => s.weeklyGoalProgress)
  const weeklyBonusClaimed = useGame((s) => s.weeklyBonusClaimed)
  const weeklyRankingRank = useGame((s) => s.weeklyRankingRank)
  const rankingPoints = useGame((s) => s.rankingPoints)
  const rankingWeekPoints = useGame((s) => s.rankingWeekPoints)
  const claimScheduledGoal = useGame((s) => s.claimScheduledGoal)
  const claimScheduledBonus = useGame((s) => s.claimScheduledBonus)

  const claimDailyBonus = async () => {
    setDailyBonusLoading(true)
    try {
      await claimScheduledBonus('daily')
    } finally {
      setDailyBonusLoading(false)
    }
  }

  const claimWeeklyBonus = async () => {
    setWeeklyBonusLoading(true)
    try {
      await claimScheduledBonus('weekly')
    } finally {
      setWeeklyBonusLoading(false)
    }
  }

  return (
    <>
      <div className="recipe-card highlight ranking-summary">
        <div className="recipe-top">
          <div>
            <strong>Ranking points</strong>
            <p className="muted small">
              Claim the all-goals bonus to register your finish time. Earlier
              finishers earn more points (1st, 2nd–3rd, 4th–10th, 11th–50th,
              then the same base for everyone else).
            </p>
            <p className="unlock-line">
              This week: 🏆 {rankingWeekPoints} · All-time: 🏆 {rankingPoints}
            </p>
          </div>
        </div>
      </div>
      <p className="muted pad small">
        Daily and weekly tasks refresh on a timer. Progress counts from actions
        you take in the valley — same as story missions.
      </p>
      <ScheduledGoalsSection
        title="Daily goals"
        period="daily"
        resetInMs={msUntilDailyReset(now)}
        parentId={DAILY_GOALS_PARENT_ID}
        goals={dailyGoals}
        progress={dailyGoalProgress}
        bonusClaimed={dailyBonusClaimed}
        bonus={DAILY_ALL_BONUS}
        rankingRank={dailyRankingRank}
        bonusLoading={dailyBonusLoading}
        onClaimGoal={(slotId) => claimScheduledGoal('daily', slotId)}
        onClaimBonus={claimDailyBonus}
      />
      <ScheduledGoalsSection
        title="Weekly goals"
        period="weekly"
        resetInMs={msUntilWeeklyReset(now)}
        resetNote={WEEKLY_RESET_LABEL}
        parentId={WEEKLY_GOALS_PARENT_ID}
        goals={weeklyGoals}
        progress={weeklyGoalProgress}
        bonusClaimed={weeklyBonusClaimed}
        bonus={WEEKLY_ALL_BONUS}
        rankingRank={weeklyRankingRank}
        bonusLoading={weeklyBonusLoading}
        onClaimGoal={(slotId) => claimScheduledGoal('weekly', slotId)}
        onClaimBonus={claimWeeklyBonus}
      />
    </>
  )
}

function MissionsView() {
  const [pane, setPane] = useState<'story' | 'events' | 'goals'>('story')
  const activeEventId = useGame((s) => s.activeEventId)
  const refreshScheduledGoals = useGame((s) => s.refreshScheduledGoals)

  useEffect(() => {
    refreshScheduledGoals()
  }, [refreshScheduledGoals])

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Missions</h2>
        <p>Story chapters, daily goals, and limited-time events.</p>
      </div>

      <div className="pane-tabs pane-tabs-3" role="tablist" aria-label="Mission areas">
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
          aria-selected={pane === 'goals'}
          className={pane === 'goals' ? 'active' : ''}
          onClick={() => setPane('goals')}
        >
          🎯 Goals
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
      {pane === 'goals' && <ScheduledGoalsPane />}
      {pane === 'events' && <EventsPane />}
    </div>
  )
}

function FarmPlotsPane() {
  const now = useNow()
  const coins = useGame((s) => s.coins)
  const plots = useGame((s) => s.plots)
  const farmSpeedLevel = useGame((s) => s.farmSpeedLevel)
  const seeds = useGame((s) => s.seeds)
  const selectedCrop = useGame((s) => s.selectedCrop)
  const selectCrop = useGame((s) => s.selectCrop)
  const plant = useGame((s) => s.plant)
  const harvest = useGame((s) => s.harvest)
  const unlockPlot = useGame((s) => s.unlockPlot)
  const isCropAvailable = useGame((s) => s.isCropAvailable)
  const available = SORTED_CROP_LIST.filter((c) => isCropAvailable(c.id))
  const plotCost = plotUnlockCost(plots.length)

  return (
    <>
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
          const ready = isReady(plot, now, farmSpeedLevel)
          const progress = plotProgress(plot, now, farmSpeedLevel)
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
                  {!ready && plot.plantedAt != null && crop && (
                    <span className="plot-time">
                      {formatLeft(
                        effectiveMs(crop.growMs, farmSpeedLevel) -
                          (now - plot.plantedAt),
                      )}
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
        <button
          type="button"
          className="btn secondary full"
          disabled={coins < plotCost}
          onClick={unlockPlot}
        >
          Unlock plot slot · 🪙 {plotCost} ({plots.length}/{MAX_PLOTS})
        </button>
      )}
    </>
  )
}

function FarmTreesPane() {
  const now = useNow()
  const coins = useGame((s) => s.coins)
  const farmSpeedLevel = useGame((s) => s.farmSpeedLevel)
  const treeSlots = useGame((s) => s.treeSlots)
  const saplings = useGame((s) => s.saplings)
  const selectedTree = useGame((s) => s.selectedTree)
  const selectTree = useGame((s) => s.selectTree)
  const plantTree = useGame((s) => s.plantTree)
  const harvestTree = useGame((s) => s.harvestTree)
  const unlockTreeSlot = useGame((s) => s.unlockTreeSlot)
  const isTreeAvailable = useGame((s) => s.isTreeAvailable)
  const available = SORTED_TREE_LIST.filter((t) => isTreeAvailable(t.id))
  const treeCost = treeSlotUnlockCost(treeSlots.length)

  return (
    <>
      <p className="muted pad small">
        Trees stay planted after harvest — only the growth timer resets.
      </p>

      <div className="seed-row" role="listbox" aria-label="Selected sapling">
        {available.map((tree) => {
          const count = saplings[tree.id] ?? 0
          const active = selectedTree === tree.id
          return (
            <button
              key={tree.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`seed-chip ${active ? 'active' : ''}`}
              onClick={() => selectTree(tree.id)}
            >
              <span className="seed-emoji">{tree.emoji}</span>
              <span className="seed-meta">
                <strong>{tree.name}</strong>
                <small>{count} saplings</small>
              </span>
            </button>
          )
        })}
      </div>

      <div className="plot-grid tree-grid">
        {treeSlots.map((slot, i) => {
          const tree = slot.treeId ? TREES[slot.treeId] : null
          const empty = !tree
          const ready = !empty && treeReady(slot, now, farmSpeedLevel)
          const progress = treeProgress(slot, now, farmSpeedLevel)
          const stage = empty
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
              className={`plot tree-slot stage-${stage} ${ready ? 'pulse' : ''}`}
              onClick={() => {
                if (empty) plantTree(i)
                else if (ready) harvestTree(i)
              }}
              aria-label={
                tree
                  ? ready
                    ? `Harvest ${tree.name} — tree stays`
                    : `${tree.name} growing`
                  : 'Empty tree slot'
              }
            >
              <span className="plot-soil tree-soil" />
              {tree ? (
                <>
                  <span className="plot-crop tree-crop">{tree.emoji}</span>
                  {!ready && slot.plantedAt != null && (
                    <span className="plot-bar">
                      <span style={{ width: `${progress * 100}%` }} />
                    </span>
                  )}
                  {ready && <span className="plot-ready">Ready</span>}
                  {!ready && slot.plantedAt != null && tree && (
                    <span className="plot-time">
                      {formatLeft(
                        effectiveMs(tree.growMs, farmSpeedLevel) -
                          (now - slot.plantedAt),
                      )}
                    </span>
                  )}
                  <span className="tree-persist" title="Tree stays after harvest">
                    🌳
                  </span>
                </>
              ) : (
                <span className="plot-empty">+</span>
              )}
            </button>
          )
        })}
      </div>

      {treeSlots.length < MAX_TREE_SLOTS && (
        <button
          type="button"
          className="btn secondary full"
          disabled={coins < treeCost}
          onClick={unlockTreeSlot}
        >
          Unlock tree slot · 🪙 {treeCost} ({treeSlots.length}/{MAX_TREE_SLOTS})
        </button>
      )}
    </>
  )
}

function FarmView() {
  const farmPane = useGame((s) => s.farmPane)
  const setFarmPane = useGame((s) => s.setFarmPane)

  return (
    <div className="panel farm-panel">
      <div className="panel-head">
        <h2>Your farm</h2>
        <p>
          {farmPane === 'plots'
            ? 'Tap empty soil to plant. Crops never wither.'
            : 'Plant saplings from the shop — trees persist after every harvest.'}
        </p>
      </div>

      <div className="pane-tabs pane-tabs-2" role="tablist" aria-label="Farm areas">
        <button
          type="button"
          role="tab"
          aria-selected={farmPane === 'plots'}
          className={farmPane === 'plots' ? 'active' : ''}
          onClick={() => setFarmPane('plots')}
        >
          🌱 Plots
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={farmPane === 'trees'}
          className={farmPane === 'trees' ? 'active' : ''}
          onClick={() => setFarmPane('trees')}
        >
          🌳 Trees
        </button>
      </div>

      {farmPane === 'plots' && <FarmPlotsPane />}
      {farmPane === 'trees' && <FarmTreesPane />}
    </div>
  )
}

function IngredientBar({
  items,
  inventory,
  materials = {},
  onNeedResource,
  label = 'Required items',
  compact = false,
}: {
  items: { id: CraftResourceId; qty: number }[]
  inventory: Partial<Record<ItemId, number>>
  materials?: Partial<Record<MaterialId, number>>
  onNeedResource: (id: CraftResourceId, qty: number) => void
  label?: string | false
  compact?: boolean
}) {
  if (items.length === 0) return null

  const haveQty = (id: CraftResourceId) =>
    id in MATERIAL_META
      ? (materials[id as MaterialId] ?? 0)
      : (inventory[id as ItemId] ?? 0)

  const sorted = [...items].sort((a, b) => {
    const aOk = haveQty(a.id) >= a.qty
    const bOk = haveQty(b.id) >= b.qty
    if (aOk === bOk) return a.id.localeCompare(b.id)
    return aOk ? 1 : -1
  })

  return (
    <div className={`ingredient-bar ${compact ? 'compact' : ''}`}>
      {label !== false && <p className="ingredient-bar-label">{label}</p>}
      <div className="ingredient-chips" role="list">
        {sorted.map(({ id, qty }) => {
          const meta = resourceMeta(id)
          const have = haveQty(id)
          const ok = have >= qty
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className={`ingredient-chip ${ok ? 'ok' : 'need'}`}
              disabled={ok}
              onClick={() => onNeedResource(id, qty)}
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
  const isBlueprintAvailable = useGame((s) => s.isBlueprintAvailable)
  const activeMission = useGame((s) =>
    s.activeMissionId ? MISSION_BY_ID[s.activeMissionId] : null,
  )
  const ownedBuildings = useGame((s) => s.ownedBuildings)
  const machineQueueBonus = useGame((s) => s.machineQueueBonus)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const machineScrollTarget = useGame((s) => s.machineScrollTarget)
  const clearMachineScrollTarget = useGame((s) => s.clearMachineScrollTarget)
  const inventory = useGame((s) => s.inventory)
  const materials = useGame((s) => s.materials)
  const craftQueue = useGame((s) => s.craftQueue)
  const selectedBuilding = useGame((s) => s.selectedBuilding)
  const selectBuilding = useGame((s) => s.selectBuilding)
  const purchaseBuilding = useGame((s) => s.purchaseBuilding)
  const upgradeMachineQueue = useGame((s) => s.upgradeMachineQueue)
  const machineQueueCapacity = useGame((s) => s.machineQueueCapacity)
  const startCraft = useGame((s) => s.startCraft)
  const collectCraft = useGame((s) => s.collectCraft)
  const gatherSlots = useGame((s) => s.gatherSlots)
  const navigateToResource = useGame((s) => s.navigateToResource)

  const open =
    selectedBuilding && isBlueprintAvailable(selectedBuilding)
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
            const blueprintLocked = !isBlueprintAvailable(b.id)
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
                  <BuildingIcon building={b} className="machine-card-icon" />
                  <strong className="machine-card-name">{b.name}</strong>
                  <small className="machine-card-status">
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
              <BuildingIcon building={building} className="building-icon-lg" />
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
            <h2 className="panel-head-with-icon">
              <BuildingIcon building={building} className="panel-head-icon" />
              {building.name}
            </h2>
            <p>
              {building.blurb} · Queue {queue.length}/{queueCap}
            </p>
          </div>

          {queueCap < MAX_MACHINE_QUEUE && (
            <button
              type="button"
              className="btn secondary full"
              disabled={coins < queueUpgradeCost(open, queueBonus)}
              onClick={() => upgradeMachineQueue(open)}
            >
              Upgrade queue +1 · 🪙 {queueUpgradeCost(open, queueBonus)} (
              {queueCap} → {queueCap + 1}, max {MAX_MACHINE_QUEUE})
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
              const recipeLocked = !isRecipeUnlocked(
                recipe.id,
                level,
                activeMission,
              )
              const missing = Object.entries(recipe.inputs).some(([id, qty]) => {
                const need = qty ?? 0
                if (id in MATERIAL_META) {
                  return (materials[id as MaterialId] ?? 0) < need
                }
                return (inventory[id as ItemId] ?? 0) < need
              })
              const queueFull = queue.length >= queueCap
              return (
                <div
                  key={recipe.id}
                  id={`machine-recipe-${recipe.id}`}
                  className={`recipe-card ${recipeLocked ? 'locked' : ''} ${machineScrollTarget === recipe.id || guideItemHighlights.includes(recipe.id) || (recipe.output && guideItemHighlights.includes(recipe.output)) ? 'guide-pulse-frame' : ''}`}
                >
                  <div className="recipe-top">
                    <span className="big-emoji">{recipe.emoji}</span>
                    <div>
                      <strong>{recipe.name}</strong>
                      <p className="muted">
                        {recipeLocked
                          ? `🔒 Level ${recipe.unlockLevel}`
                          : `${formatLeft(recipe.craftMs)} · +${recipe.xp} XP${
                              recipe.materialOutput &&
                              (recipe.buildingId === 'miner' ||
                                recipe.buildingId === 'wood_cutter')
                                ? ` · yields ${materialRecipeYield(recipe, gatherSlots)}× ${MATERIAL_META[recipe.materialOutput].name}`
                                : ''
                            }`}
                      </p>
                    </div>
                  </div>
                  <IngredientBar
                    items={Object.entries(recipe.inputs).map(([id, qty]) => ({
                      id: id as CraftResourceId,
                      qty: qty ?? 0,
                    }))}
                    inventory={inventory}
                    materials={materials}
                    onNeedResource={navigateToResource}
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
  const navigateToResource = useGame((s) => s.navigateToResource)
  const animalSpeedLevel = useGame((s) => s.animalSpeedLevel)

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
            const canBuy =
              !locked && count < animalDef.maxOwned && coins >= animalDef.buyCost
            return (
              <div
                key={b.id}
                className={`machine-card ${locked ? 'locked' : ''} ${canBuy ? 'for-sale' : ''} ${!locked && guideItemHighlights.includes(b.id) ? 'guide-pulse-frame' : ''}`}
              >
                <button
                  type="button"
                  className="machine-card-main"
                  disabled={locked}
                  onClick={() => !locked && selectAnimalBuilding(b.id)}
                >
                  <span className="big-emoji">{b.emoji}</span>
                  <strong>{b.name}</strong>
                  <small>
                    {locked
                      ? '🔒 Mission lock'
                      : `${count}/${animalDef.maxOwned} ${animalDef.name}s · ${
                          animalDef.materialProduct
                            ? `${MATERIAL_META[animalDef.materialProduct].emoji} ${MATERIAL_META[animalDef.materialProduct].name}`
                            : animalDef.product
                              ? `${ITEM_META[animalDef.product].emoji} ${ITEM_META[animalDef.product].name}`
                              : '—'
                        }`}
                  </small>
                </button>
                {!locked && count < animalDef.maxOwned && (
                  <button
                    type="button"
                    className="btn full"
                    disabled={coins < animalDef.buyCost}
                    onClick={() => buyAnimal(animalDef.id as AnimalTypeId)}
                  >
                    Buy {animalDef.name} · 🪙 {animalDef.buyCost}
                  </button>
                )}
              </div>
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
              onNeedResource={navigateToResource}
            />
          )}

          <div className="recipe-card">
            <div className="recipe-top">
              <span className="big-emoji">{def.emoji}</span>
              <div>
                <strong>{def.name}</strong>
                <p className="muted">
                  {def.materialProduct
                    ? `${MATERIAL_META[def.materialProduct].emoji} ${MATERIAL_META[def.materialProduct].name}`
                    : def.product
                      ? `${ITEM_META[def.product].emoji} ${ITEM_META[def.product].name}`
                      : '—'}{' '}
                  · {owned.length}/{def.maxOwned} owned
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
              const speedLevel = animalSpeedLevel[a.typeId] ?? 0
              const produceMs = effectiveMs(def.produceMs, speedLevel)
              const ready = animalReady(a, now, speedLevel)
              const prog = animalProgress(a, now, speedLevel)
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
                          navigateToResource(def.feedItem!, need)
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
                      {formatLeft(produceMs - (now - (a.startedAt ?? now)))}
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

function StoreOrdersPane() {
  const inventory = useGame((s) => s.inventory)
  const activeOrders = useGame((s) => s.activeOrders)
  const fulfillOrder = useGame((s) => s.fulfillOrder)
  const navigateToResource = useGame((s) => s.navigateToResource)

  return (
    <>
      <p className="muted orders-pane-desc">
        Regular store orders — completed slots swap to a new order automatically.
      </p>
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
                onNeedResource={navigateToResource}
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
    </>
  )
}

function ShipOrdersPane() {
  const now = useNow(1000)
  const inventory = useGame((s) => s.inventory)
  const activeShipOrders = useGame((s) => s.activeShipOrders)
  const shipBoardComplete = useGame((s) => s.shipBoardComplete)
  const fillShipOrder = useGame((s) => s.fillShipOrder)
  const shipCrate = useGame((s) => s.shipCrate)
  const refreshShipOrders = useGame((s) => s.refreshShipOrders)
  const navigateToResource = useGame((s) => s.navigateToResource)
  const msLeft = msUntilShipRefresh(now)

  useEffect(() => {
    refreshShipOrders()
  }, [refreshShipOrders])

  useEffect(() => {
    if (msLeft <= 1000) refreshShipOrders()
  }, [msLeft, refreshShipOrders])

  const filledCount = activeShipOrders.filter((o) => o.filled).length
  const allFilled =
    activeShipOrders.length > 0 &&
    activeShipOrders.every((o) => o.filled)
  const totalCoins = activeShipOrders.reduce((sum, o) => sum + o.rewardCoins, 0)
  const totalXp = activeShipOrders.reduce((sum, o) => sum + o.rewardXp, 0)

  return (
    <>
      <p className="muted orders-pane-desc">
        Export crate — fill all 6 slots, then ship together. New shipment in{' '}
        <strong>{formatShipCountdown(msLeft)}</strong>
        {filledCount > 0 && !shipBoardComplete && (
          <> · {filledCount}/{activeShipOrders.length} filled</>
        )}
        {shipBoardComplete && <> · Shipment sent</>}
      </p>
      <div className="card-list">
        {activeShipOrders.map((order) => {
          const meta = ITEM_META[order.itemId]
          const canFill =
            !shipBoardComplete &&
            !order.filled &&
            (inventory[order.itemId] ?? 0) >= order.qty
          return (
            <div
              key={`ship-${order.slot}-${order.itemId}`}
              className={`recipe-card${order.filled || shipBoardComplete ? ' is-complete' : ''}`}
            >
              <div className="recipe-top">
                <span className="big-emoji">{meta?.emoji ?? '📦'}</span>
                <div>
                  <strong>{shipItemLabel(order.itemId, order.qty)}</strong>
                  <p className="muted">
                    🪙 {order.rewardCoins} · +{order.rewardXp} XP
                  </p>
                </div>
              </div>
              {!order.filled && !shipBoardComplete && (
                <>
                  <IngredientBar
                    items={[{ id: order.itemId, qty: order.qty }]}
                    inventory={inventory}
                    onNeedResource={navigateToResource}
                    label={false}
                    compact
                  />
                  <button
                    type="button"
                    className="btn full"
                    disabled={!canFill}
                    onClick={() => fillShipOrder(order.slot)}
                  >
                    Fill
                  </button>
                </>
              )}
              {order.filled && !shipBoardComplete && (
                <p className="muted ship-fulfilled">✓ Filled</p>
              )}
              {shipBoardComplete && (
                <p className="muted ship-fulfilled">✓ Shipped</p>
              )}
            </div>
          )
        })}
      </div>
      {!shipBoardComplete && (
        <div className="ship-crate-footer">
          <p className="muted">
            Crate reward: 🪙 {totalCoins} · +{totalXp} XP
          </p>
          <button
            type="button"
            className="btn full ship-crate-btn"
            disabled={!allFilled}
            onClick={() => shipCrate()}
          >
            Ship
          </button>
        </div>
      )}
    </>
  )
}

function OrdersView() {
  const [pane, setPane] = useState<'store' | 'ship'>('store')
  const isOrdersOpen = useGame((s) => s.isOrdersOpen)
  const xp = useGame((s) => s.xp)
  const activeShipOrders = useGame((s) => s.activeShipOrders)
  const shipBoardComplete = useGame((s) => s.shipBoardComplete)
  const { level } = xpProgress(xp)
  const shipReady =
    !shipBoardComplete &&
    activeShipOrders.length > 0 &&
    (activeShipOrders.some((o) => !o.filled) ||
      activeShipOrders.every((o) => o.filled))

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
        <p>Fulfill store orders or ship export crates for coins & XP.</p>
      </div>

      <div className="pane-tabs pane-tabs-2" role="tablist" aria-label="Order types">
        <button
          type="button"
          role="tab"
          aria-selected={pane === 'store'}
          className={pane === 'store' ? 'active' : ''}
          onClick={() => setPane('store')}
        >
          🏪 Store
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pane === 'ship'}
          className={`${pane === 'ship' ? 'active' : ''}${shipReady ? ' has-active' : ''}`}
          onClick={() => setPane('ship')}
        >
          🚢 Ship
        </button>
      </div>

      {pane === 'store' && <StoreOrdersPane />}
      {pane === 'ship' && <ShipOrdersPane />}
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

function clampMarketNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function parseMarketDraft(raw: string, min: number, max: number): number {
  const trimmed = raw.trim()
  if (trimmed === '') return min
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return min
  return clampMarketNumber(n, min, max)
}

function MarketNumberStepper({
  value,
  min,
  max,
  onChange,
  label,
  hint,
  id,
}: {
  value: number
  min: number
  max: number
  onChange: (next: number) => void
  label: ReactNode
  hint?: string
  id?: string
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commitDraft = (raw: string) => {
    const next = parseMarketDraft(raw, min, max)
    onChange(next)
    setDraft(String(next))
  }

  const step = (delta: number) => {
    const next = clampMarketNumber(value + delta, min, max)
    onChange(next)
    setDraft(String(next))
  }

  return (
    <label className="market-field" htmlFor={id}>
      {label}
      <div className="market-stepper">
        <button
          type="button"
          className="btn tiny market-stepper-btn"
          disabled={value <= min}
          aria-label="Decrease"
          onClick={() => step(-1)}
        >
          −
        </button>
        <input
          id={id}
          className="market-input market-stepper-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={() => commitDraft(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft(draft)
          }}
        />
        <button
          type="button"
          className="btn tiny market-stepper-btn"
          disabled={value >= max}
          aria-label="Increase"
          onClick={() => step(1)}
        >
          +
        </button>
      </div>
      {hint && <span className="muted small market-stepper-hint">{hint}</span>}
    </label>
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
  const refreshMarketSales = useGame((s) => s.refreshMarketSales)
  const claimMarketSale = useGame((s) => s.claimMarketSale)
  const unclaimedMarketSales = useGame((s) => s.unclaimedMarketSales)
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
    void refreshMarketSales()
  }, [isMarketOpen, refreshMarketSales])

  useEffect(() => {
    if (!isMarketOpen() || !isSupabaseConfigured()) return
    setLoadError(null)
    return subscribeToListings(setListings, (err) => setLoadError(err.message))
  }, [isMarketOpen])

  useEffect(() => {
    if (!selectedPost) return
    const bounds = marketPriceBounds(selectedPost.kind, selectedPost.id)
    setPostQty(1)
    setPostPrice(bounds.min)
  }, [selectedPost?.kind, selectedPost?.id])

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
  const hasUnclaimedSales = unclaimedMarketSales.length > 0

  const handlePost = async () => {
    if (!selectedPost || busy || !priceBounds) return
    const qty = clampMarketNumber(postQty, 1, selectedPost.qty)
    const price = clampMarketNumber(
      postPrice,
      priceBounds.min,
      priceBounds.max,
    )
    setPostQty(qty)
    setPostPrice(price)
    setBusy(true)
    await createMarketListing(
      selectedPost.kind,
      selectedPost.id,
      qty,
      price,
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

  const handleClaimSale = async (payoutId: string) => {
    if (busy) return
    setBusy(true)
    await claimMarketSale(payoutId)
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
          className={`${marketPane === 'sell' ? 'active' : ''} ${hasUnclaimedSales ? 'market-sale-pulse' : ''}`}
          onClick={() => setMarketPane('sell')}
        >
          📤 Sell
          {hasUnclaimedSales ? ` (${unclaimedMarketSales.length})` : ''}
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
              <MarketNumberStepper
                id="market-post-qty"
                label="Quantity"
                min={1}
                max={selectedPost?.qty ?? 1}
                value={postQty}
                onChange={setPostQty}
              />
              <MarketNumberStepper
                id="market-post-price"
                label={
                  <>
                    Price per unit
                    {priceBounds && (
                      <span className="muted">
                        {' '}
                        ({priceBounds.min}–{priceBounds.max})
                      </span>
                    )}
                  </>
                }
                hint={
                  priceBounds
                    ? `Suggested 🪙 ${priceBounds.base} · min ${priceBounds.min}, max ${priceBounds.max}`
                    : undefined
                }
                min={priceBounds?.min ?? 1}
                max={priceBounds?.max ?? 9999}
                value={postPrice}
                onChange={setPostPrice}
              />
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

          {hasUnclaimedSales && (
            <>
              <h3 className="section-label">Sold — tap to claim</h3>
              <div className="card-list">
                {unclaimedMarketSales.map(({ payoutId, amount, listing }) => {
                  const meta = marketItemLabel(listing.item_kind, listing.item_id)
                  return (
                    <div
                      key={payoutId}
                      className="recipe-card market-sale-claim market-sale-pulse"
                    >
                      <div className="recipe-top">
                        <span className="big-emoji">{meta.emoji}</span>
                        <div>
                          <strong>
                            Sold {listing.quantity}× {meta.name}
                          </strong>
                          <p className="muted">Claim your coins from this sale</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn full"
                        disabled={busy}
                        onClick={() => void handleClaimSale(payoutId)}
                      >
                        Claim · 🪙 {amount}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
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

function InvSellQtyRow({
  value,
  max,
  onChange,
  onSell,
}: {
  value: number
  max: number
  onChange: (next: number) => void
  onSell: () => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commitDraft = (raw: string) => {
    const next = parseMarketDraft(raw, 1, max)
    onChange(next)
    setDraft(String(next))
  }

  const step = (delta: number) => {
    const next = clampMarketNumber(value + delta, 1, max)
    onChange(next)
    setDraft(String(next))
  }

  return (
    <div className="inv-sell-qty">
      <div className="inv-sell-stepper">
        <button
          type="button"
          className="btn tiny"
          disabled={value <= 1}
          aria-label="Decrease quantity"
          onClick={() => step(-1)}
        >
          −
        </button>
        <input
          className="inv-sell-stepper-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Quantity to sell"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={() => commitDraft(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitDraft(draft)
              onSell()
            }
          }}
        />
        <button
          type="button"
          className="btn tiny"
          disabled={value >= max}
          aria-label="Increase quantity"
          onClick={() => step(1)}
        >
          +
        </button>
      </div>
      <button type="button" className="btn tiny inv-sell-qty-btn" onClick={onSell}>
        Sell
      </button>
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
  const [customQty, setCustomQty] = useState(1)

  useEffect(() => {
    setCustomQty((prev) => clampMarketNumber(prev, 1, qty))
  }, [qty])

  const sellCustom = () => {
    onSell(clampMarketNumber(customQty, 1, qty))
  }

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
      <InvSellQtyRow
        value={customQty}
        max={qty}
        onChange={setCustomQty}
        onSell={sellCustom}
      />
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
              <GearIcon blueprint={bp} />
              <strong>+{stats.skillBonus}</strong>
              <small>
                {bp.name} · {QUALITY_LABEL[gearInstanceQuality(g)]} · Lv{' '}
                {g.level}
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
  const equipGear = useGame((s) => s.equipGear)
  const unequipGear = useGame((s) => s.unequipGear)
  const [activeSlot, setActiveSlot] = useState<GearSlot | null>(null)
  const r = recruitedNpcs.find((n) => n.id === recruitId)
  if (!r) return null
  const def = NPCS[r.npcId]
  if (!def) return null
  const stats = npcTotalStats(r, gearInventory)
  const xpInfo = recruitXpProgress(r.xp)
  const equippedForSlot = (slot: GearSlot) =>
    gearForNpc(r.id, gearInventory).find(
      (g) => GEAR_BLUEPRINT_BY_ID[g.blueprintId]?.slot === slot,
    )
  const availableForSlot = (slot: GearSlot) =>
    gearInventory.filter(
      (g) =>
        !g.equippedBy &&
        GEAR_BLUEPRINT_BY_ID[g.blueprintId]?.slot === slot,
    )

  return (
    <div className="recipe-card recruit-card">
      <div className="recipe-top">
        <span className="big-emoji">{def.emoji}</span>
        <div>
          <strong>
            {def.name} · Lv {xpInfo.level}
          </strong>
          <p className="muted">
            {def.title} · Skill {stats.skill} · ⚔️ {stats.attack} 🛡️{' '}
            {stats.defense} ❤️ {stats.hp}
          </p>
          <div className="mini-track recruit-xp-bar">
            <div style={{ width: `${xpInfo.pct}%` }} />
          </div>
          <p className="muted small">
            {busy
              ? 'Exploring…'
              : `${xpInfo.toNext} XP to Lv ${xpInfo.level + 1} · tap a slot to equip`}
          </p>
        </div>
      </div>
      {!busy && (
        <>
          <div className="gear-slots gear-slots-5">
            {GEAR_SLOT_ORDER.map((slot) => {
              const equipped = equippedForSlot(slot)
              const bp = equipped
                ? GEAR_BLUEPRINT_BY_ID[equipped.blueprintId]
                : null
              const isActive = activeSlot === slot
              return (
                <button
                  key={slot}
                  type="button"
                  className={`gear-slot ${isActive ? 'active' : ''}`}
                  onClick={() =>
                    setActiveSlot(isActive ? null : slot)
                  }
                >
                  <small className="gear-slot-label">{GEAR_SLOT_LABEL[slot]}</small>
                  <span
                    className={`gear-slot-btn ${equipped ? 'filled' : 'empty'}${equipped ? ` quality-${gearInstanceQuality(equipped)}` : ''}`}
                  >
                    {bp ? <GearIcon blueprint={bp} /> : '+'}
                  </span>
                </button>
              )
            })}
          </div>
          {activeSlot && (
            <div className="gear-pick-row">
              <small className="gear-pick-label">
                {GEAR_SLOT_LABEL[activeSlot]}
              </small>
              <div className="gear-pick-scroll">
                {equippedForSlot(activeSlot) && (
                  <button
                    type="button"
                    className="gear-pick-chip unequip"
                    onClick={() => {
                      unequipGear(equippedForSlot(activeSlot)!.id)
                      setActiveSlot(null)
                    }}
                  >
                    ✕ Unequip
                  </button>
                )}
                {availableForSlot(activeSlot).length === 0 &&
                  !equippedForSlot(activeSlot) && (
                    <span className="muted small gear-pick-empty">
                      No gear for this slot — craft in Workshop
                    </span>
                  )}
                {availableForSlot(activeSlot).map((g) => {
                  const opt = GEAR_BLUEPRINT_BY_ID[g.blueprintId]
                  if (!opt) return null
                  const st = gearInstanceStats(g)
                  const qual = gearInstanceQuality(g)
                  const upgraded = qual !== opt.quality
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`gear-pick-chip quality-${qual}`}
                      onClick={() => {
                        equipGear(g.id, r.id)
                        setActiveSlot(null)
                      }}
                      title={`${opt.name} · skill +${st.skillBonus}`}
                    >
                      <GearIcon blueprint={opt} className="gear-pick-emoji" />
                      <span className="gear-pick-meta">
                        <strong>{opt.name}</strong>
                        <small>
                          Lv {g.level} · {QUALITY_LABEL[qual]}
                          {upgraded ? ' ✨' : ''}
                        </small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ShopSeedPane() {
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
  )
}

function ShopTreePane() {
  const coins = useGame((s) => s.coins)
  const buySapling = useGame((s) => s.buySapling)
  const isTreeAvailable = useGame((s) => s.isTreeAvailable)
  const guideItemHighlights = useGame((s) => s.guideItemHighlights)
  const shopTreeScrollTarget = useGame((s) => s.shopTreeScrollTarget)
  const clearShopTreeScrollTarget = useGame((s) => s.clearShopTreeScrollTarget)

  useEffect(() => {
    if (!shopTreeScrollTarget) return
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`shop-tree-${shopTreeScrollTarget}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearShopTreeScrollTarget()
    })
    return () => cancelAnimationFrame(frame)
  }, [shopTreeScrollTarget, clearShopTreeScrollTarget])

  return (
    <div className="card-list">
      {SORTED_TREE_LIST.map((tree) => {
        const locked = !isTreeAvailable(tree.id)
        const productMeta = ITEM_META[tree.product]
        return (
          <div
            key={tree.id}
            id={`shop-tree-${tree.id}`}
            className={`recipe-card ${locked ? 'locked' : ''} ${!locked && (guideItemHighlights.includes(tree.id) || shopTreeScrollTarget === tree.id) ? 'guide-pulse-frame' : ''}`}
          >
            <div className="recipe-top">
              <span className="big-emoji">{tree.emoji}</span>
              <div>
                <strong>{tree.name}</strong>
                <p className="muted">
                  {locked
                    ? `🔒 Level ${tree.unlockLevel}`
                    : `Yields ${productMeta.emoji} ${productMeta.name} · ${formatLeft(tree.growMs)} · ×${tree.harvestQty} · tree persists`}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn full"
              disabled={locked || coins < tree.saplingCost}
              onClick={() => buySapling(tree.id, 1)}
            >
              Buy sapling · 🪙 {tree.saplingCost}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function ShopUpgradePane() {
  const coins = useGame((s) => s.coins)
  const farmSpeedLevel = useGame((s) => s.farmSpeedLevel)
  const ownedBuildings = useGame((s) => s.ownedBuildings)
  const machineSpeedLevel = useGame((s) => s.machineSpeedLevel)
  const animals = useGame((s) => s.animals)
  const animalSpeedLevel = useGame((s) => s.animalSpeedLevel)
  const upgradeFarmSpeed = useGame((s) => s.upgradeFarmSpeed)
  const upgradeMachineSpeed = useGame((s) => s.upgradeMachineSpeed)
  const upgradeAnimalSpeed = useGame((s) => s.upgradeAnimalSpeed)

  const ownedAnimalTypes = [
    ...new Set(animals.map((a) => a.typeId)),
  ] as AnimalTypeId[]
  const farmCost = farmSpeedUpgradeCost(farmSpeedLevel)

  return (
    <div className="card-list">
      <p className="muted pad small">
        Permanent timer speed-ups — pricey, but they stack up to {MAX_SPEED_LEVEL}{' '}
        tiers (12% faster per tier). Queue slot upgrades stay on each machine.
      </p>

      <div className="recipe-card highlight">
        <div className="recipe-top">
          <span className="big-emoji">🌾</span>
          <div>
            <strong>Farm growth speed</strong>
            <p className="muted">
              Level {farmSpeedLevel}/{MAX_SPEED_LEVEL} · {speedLevelLabel(farmSpeedLevel)}{' '}
              · crops & orchard trees
            </p>
          </div>
        </div>
        {farmSpeedLevel < MAX_SPEED_LEVEL ? (
          <button
            type="button"
            className="btn full"
            disabled={coins < farmCost}
            onClick={upgradeFarmSpeed}
          >
            Upgrade farm speed · 🪙 {farmCost}
          </button>
        ) : (
          <p className="muted pad small">Farm speed maxed.</p>
        )}
      </div>

      {ownedBuildings.length > 0 && (
        <>
          <h3 className="section-label">Machines</h3>
          {[...ownedBuildings]
            .sort((a, b) => BUILDINGS[a].name.localeCompare(BUILDINGS[b].name))
            .map((id) => {
              const building = BUILDINGS[id]
              const level = machineSpeedLevel[id] ?? 0
              const cost = machineSpeedUpgradeCost(id, level)
              return (
                <div key={id} className="recipe-card">
                  <div className="recipe-top">
                    <BuildingIcon building={building} className="building-icon-lg" />
                    <div>
                      <strong>{building.name}</strong>
                      <p className="muted">
                        Craft speed Lv {level}/{MAX_SPEED_LEVEL} ·{' '}
                        {speedLevelLabel(level)}
                      </p>
                    </div>
                  </div>
                  {level < MAX_SPEED_LEVEL ? (
                    <button
                      type="button"
                      className="btn full"
                      disabled={coins < cost}
                      onClick={() => upgradeMachineSpeed(id)}
                    >
                      Upgrade craft speed · 🪙 {cost}
                    </button>
                  ) : (
                    <p className="muted pad small">Max speed.</p>
                  )}
                </div>
              )
            })}
        </>
      )}

      {ownedAnimalTypes.length > 0 && (
        <>
          <h3 className="section-label">Animals</h3>
          {ownedAnimalTypes
            .sort((a, b) => ANIMALS[a].name.localeCompare(ANIMALS[b].name))
            .map((typeId) => {
              const def = ANIMALS[typeId]
              const level = animalSpeedLevel[typeId] ?? 0
              const cost = animalSpeedUpgradeCost(typeId, level)
              const count = animals.filter((a) => a.typeId === typeId).length
              return (
                <div key={typeId} className="recipe-card">
                  <div className="recipe-top">
                    <span className="big-emoji">{def.emoji}</span>
                    <div>
                      <strong>{def.name}</strong>
                      <p className="muted">
                        {count} owned · Produce speed Lv {level}/{MAX_SPEED_LEVEL} ·{' '}
                        {speedLevelLabel(level)}
                      </p>
                    </div>
                  </div>
                  {level < MAX_SPEED_LEVEL ? (
                    <button
                      type="button"
                      className="btn full"
                      disabled={coins < cost}
                      onClick={() => upgradeAnimalSpeed(typeId)}
                    >
                      Upgrade produce speed · 🪙 {cost}
                    </button>
                  ) : (
                    <p className="muted pad small">Max speed.</p>
                  )}
                </div>
              )
            })}
        </>
      )}

      {ownedBuildings.length === 0 && ownedAnimalTypes.length === 0 && (
        <p className="muted pad small">
          Build machines or buy animals to unlock their speed upgrades here.
        </p>
      )}
    </div>
  )
}

function ShopView() {
  const shopPane = useGame((s) => s.shopPane)
  const setShopPane = useGame((s) => s.setShopPane)

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Shop</h2>
        <p>Seeds, orchard saplings, and timer speed upgrades.</p>
      </div>

      <div className="pane-tabs pane-tabs-3" role="tablist" aria-label="Shop">
        <button
          type="button"
          role="tab"
          aria-selected={shopPane === 'seed'}
          className={shopPane === 'seed' ? 'active' : ''}
          onClick={() => setShopPane('seed')}
        >
          🌾 Seeds
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={shopPane === 'tree'}
          className={shopPane === 'tree' ? 'active' : ''}
          onClick={() => setShopPane('tree')}
        >
          🌳 Trees
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={shopPane === 'upgrade'}
          className={shopPane === 'upgrade' ? 'active' : ''}
          onClick={() => setShopPane('upgrade')}
        >
          ⬆️ Upgrades
        </button>
      </div>

      {shopPane === 'seed' && <ShopSeedPane />}
      {shopPane === 'tree' && <ShopTreePane />}
      {shopPane === 'upgrade' && <ShopUpgradePane />}
    </div>
  )
}

function WorkshopCard({
  building,
  locked,
  unlockLevel,
  highlighted,
  onSelect,
}: {
  building: GearBuildingDef
  locked: boolean
  unlockLevel: number
  highlighted: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`machine-card ${locked ? 'locked' : ''} ${!locked && highlighted ? 'guide-pulse-frame' : ''}`}
      disabled={locked}
      onClick={onSelect}
    >
      <span className="big-emoji">{building.emoji}</span>
      <strong>{building.name}</strong>
      <small className="muted">
        {building.workerName} · {building.profession}
        {building.tier === 'premium' ? ' · Premium' : ''}
      </small>
      <small>
        {locked ? `🔒 Level ${unlockLevel}` : building.blurb}
      </small>
    </button>
  )
}

function MaterialsView() {
  const coins = useGame((s) => s.coins)
  const unlocked = useGame((s) => s.unlocked)
  const ownedBuildings = useGame((s) => s.ownedBuildings)
  const materialsPane = useGame((s) => s.materialsPane)
  const gatherSlots = useGame((s) => s.gatherSlots)
  const setMaterialsPane = useGame((s) => s.setMaterialsPane)
  const purchaseGatherSlot = useGame((s) => s.purchaseGatherSlot)
  const setTab = useGame((s) => s.setTab)
  const selectBuilding = useGame((s) => s.selectBuilding)

  const site = GATHER_SITES[materialsPane]
  const owned = gatherSlots[materialsPane]
  const multiplier = gatherYieldMultiplier(materialsPane, owned)
  const machineUnlocked = unlocked.includes(site.machineId)
  const machineBuilt = ownedBuildings.includes(site.machineId)
  const canExpand = owned < GATHER_SITE_MAX_SLOTS
  const nextCost = gatherSlotCost(materialsPane, owned)
  const recipes = machineUnlocked
    ? allRecipesForBuilding(site.machineId).filter((r) => r.materialOutput)
    : []

  return (
    <>
      <div
        className="pane-tabs pane-tabs-2 sub-pane-tabs"
        role="tablist"
        aria-label="Material sites"
      >
        <button
          type="button"
          role="tab"
          aria-selected={materialsPane === 'mountain'}
          className={materialsPane === 'mountain' ? 'active' : ''}
          onClick={() => setMaterialsPane('mountain')}
        >
          ⛰️ Mountain
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={materialsPane === 'forest'}
          className={materialsPane === 'forest' ? 'active' : ''}
          onClick={() => setMaterialsPane('forest')}
        >
          🌲 Forest
        </button>
      </div>

      <div className="recipe-card highlight">
        <div className="recipe-top">
          <span className="big-emoji">{site.emoji}</span>
          <div>
            <strong>{site.name}</strong>
            <p className="muted">{site.blurb}</p>
            <p className="muted">
              {machineUnlocked
                ? `${site.machineName} yield ×${multiplier} per queue collect · ${owned}/${GATHER_SITE_MAX_SLOTS} slots`
                : `🔒 Unlock ${site.machineName} via Missions to expand this site`}
            </p>
          </div>
        </div>
      </div>

      {machineUnlocked && (
        <>
          <h3 className="section-label">Gather slots</h3>
          <p className="muted pad small">
            Each slot multiplies {site.machineName} output when you collect a
            finished craft. Slot 1 is free — buy more to boost every recipe.
          </p>
          <div className="gather-slot-grid">
            {Array.from({ length: GATHER_SITE_MAX_SLOTS }, (_, i) => {
              const slotNum = i + 1
              const active = slotNum <= owned
              const isNext = slotNum === owned + 1
              return (
                <div
                  key={slotNum}
                  className={`gather-slot ${active ? 'active' : ''} ${isNext && canExpand ? 'buyable' : ''}`}
                >
                  <span className="gather-slot-num">{slotNum}</span>
                  {active ? (
                    <span className="gather-slot-label">Active</span>
                  ) : isNext && canExpand ? (
                    <button
                      type="button"
                      className="btn tiny full"
                      disabled={coins < nextCost}
                      onClick={() => purchaseGatherSlot(materialsPane)}
                    >
                      🪙 {nextCost}
                    </button>
                  ) : (
                    <span className="gather-slot-label muted">—</span>
                  )}
                </div>
              )
            })}
          </div>

          {canExpand && (
            <button
              type="button"
              className="btn secondary full"
              disabled={coins < nextCost}
              onClick={() => purchaseGatherSlot(materialsPane)}
            >
              Buy slot {owned + 1} · 🪙 {nextCost} (yield ×{owned + 1})
            </button>
          )}

          {recipes.length > 0 && (
            <>
              <h3 className="section-label">Current yields</h3>
              <div className="card-list compact-list">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-card compact">
                    <div className="recipe-top">
                      <span className="big-emoji">{recipe.emoji}</span>
                      <div>
                        <strong>{recipe.name}</strong>
                        <p className="muted">
                          {materialRecipeYield(recipe, gatherSlots)}×{' '}
                          {recipe.materialOutput
                            ? MATERIAL_META[recipe.materialOutput].name
                            : 'output'}{' '}
                          per collect
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            className="btn ghost full"
            disabled={!machineUnlocked}
            onClick={() => {
              setTab('machines')
              selectBuilding(site.machineId)
            }}
          >
            {machineBuilt
              ? `Open ${site.machineName} →`
              : `Build ${site.machineName} in Machines →`}
          </button>
        </>
      )}
    </>
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
  const gearRecipeCraftCount = useGame((s) => s.gearRecipeCraftCount)
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
  const navigateToResource = useGame((s) => s.navigateToResource)
  const [partyPick, setPartyPick] = useState<Record<string, string[]>>({})

  const idle = idleRecruits(recruitedNpcs, activeAdventures)
  const availableAdventures = adventuresForLevel(level)
  const gearOpen =
    selectedGearBuilding && unlocked.includes(selectedGearBuilding)
      ? selectedGearBuilding
      : null
  const gearBuilding = gearOpen ? GEAR_BUILDINGS[gearOpen] : null
  const gearRecipes = gearOpen ? allBlueprintsForBuilding(gearOpen) : []
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
              <strong>Gear Workshops</strong>
              <p className="muted">
                Fourteen artisan workshops unlock as you level — each run by a
                specialist crafter like Shop Titans.
              </p>
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

      <div className="pane-tabs pane-tabs-5" role="tablist" aria-label="Adventure areas">
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
          aria-selected={adventurePane === 'materials'}
          className={adventurePane === 'materials' ? 'active' : ''}
          onClick={() => setAdventurePane('materials')}
        >
          🪨 Materials
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
          <p className="muted pad">
            Fourteen artisan workshops — each run by a specialist crafter. Unlock
            more as you level up.
          </p>
          {!gearOpen && (
            <>
              <h3 className="section-label">Standard Workshops</h3>
              <div className="machine-grid">
                {GEAR_BUILDINGS_STANDARD.map((b) => (
                  <WorkshopCard
                    key={b.id}
                    building={b}
                    locked={!unlocked.includes(b.id)}
                    unlockLevel={buildingUnlockLevel(b.id)}
                    highlighted={guideItemHighlights.includes(b.id)}
                    onSelect={() => selectGearBuilding(b.id)}
                  />
                ))}
              </div>
              <h3 className="section-label">Premium Workshops</h3>
              <div className="machine-grid">
                {GEAR_BUILDINGS_PREMIUM.map((b) => (
                  <WorkshopCard
                    key={b.id}
                    building={b}
                    locked={!unlocked.includes(b.id)}
                    unlockLevel={buildingUnlockLevel(b.id)}
                    highlighted={guideItemHighlights.includes(b.id)}
                    onSelect={() => selectGearBuilding(b.id)}
                  />
                ))}
              </div>
            </>
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
                <p>
                  {gearBuilding.workerName} · {gearBuilding.profession}
                  {gearBuilding.tier === 'premium' ? ' · Premium' : ''}
                </p>
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
                        <GearIcon blueprint={bp} />
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
                  const unlocked = isGearRecipeUnlocked(
                    bp,
                    gearRecipeCraftCount,
                  )
                  const star = recipeStar(gearRecipeCraftCount[bp.id] ?? 0)
                  const unlockHint = recipeUnlockProgress(
                    bp,
                    gearRecipeCraftCount,
                  )
                  const stats = scaledStats(bp, undefined, star)
                  const missing = unlocked
                    ? Object.entries(bp.inputs).some(([id, qty]) => {
                        if (id in MATERIAL_META) {
                          return (
                            (materials[id as keyof typeof MATERIAL_META] ?? 0) <
                            (qty ?? 0)
                          )
                        }
                        return (inventory[id as ItemId] ?? 0) < (qty ?? 0)
                      })
                    : false
                  return (
                    <div
                      key={bp.id}
                      className={`recipe-card${!unlocked ? ' locked level-gated' : ''}`}
                    >
                      <div className="recipe-top">
                        <GearIcon blueprint={bp} className="big-emoji" />
                        <div>
                          <strong>{bp.name}</strong>
                          <p className="muted recipe-stars">
                            {formatRecipeStars(star)}
                            {star > 0 && (
                              <> · crafted {gearRecipeCraftCount[bp.id] ?? 0}×</>
                            )}
                          </p>
                          <p className="muted">
                            Base {QUALITY_LABEL[bp.quality]} ·{' '}
                            {GEAR_SLOT_LABEL[bp.slot]} ·{' '}
                            {formatLeft(bp.craftMs)}
                          </p>
                          {unlocked ? (
                            <p className="muted">
                              ⚔️ {stats.attack} 🛡️ {stats.defense} ❤️{' '}
                              {stats.hp} · skill +{stats.skillBonus}
                            </p>
                          ) : unlockHint ? (
                            <p className="muted">
                              🔒 Craft {unlockHint.prevName}{' '}
                              {unlockHint.current}/{unlockHint.required}× to
                              unlock
                            </p>
                          ) : (
                            <p className="muted">🔒 Locked</p>
                          )}
                        </div>
                      </div>
                      {unlocked && (
                        <>
                          <IngredientBar
                            items={Object.entries(bp.inputs).map(
                              ([id, qty]) => ({
                                id: id as CraftResourceId,
                                qty: qty ?? 0,
                              }),
                            )}
                            inventory={inventory}
                            materials={materials}
                            onNeedResource={navigateToResource}
                            label={false}
                            compact
                          />
                          <button
                            type="button"
                            className="btn full"
                            disabled={missing}
                            onClick={() => startGearCraft(bp.id)}
                          >
                            Craft blueprint
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {adventurePane === 'materials' && <MaterialsView />}

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
              const scaled = scaledAdventure(adv, level)
              const picked = partyPick[adv.id] ?? []
              const power = partyPower(picked, recruitedNpcs, gearInventory)
              const canSend =
                !locked &&
                picked.length >= adv.minNpcs &&
                picked.length <= adv.maxNpcs &&
                power >= scaled.minPower
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
                          : `${formatLeft(adv.durationMs)} · ${adv.minNpcs}–${MAX_ADVENTURE_PARTY} recruits · power ${scaled.minPower}+`}
                      </p>
                      <p className="muted">
                        🪙 {scaled.rewardCoins} · +{scaled.rewardXp} player XP ·
                        +{scaled.recruitXp} recruit XP
                      </p>
                    </div>
                  </div>
                  {!locked && (
                    <>
                      <p className="muted small">
                        Pick party ({picked.length}/{MAX_ADVENTURE_PARTY}) · power{' '}
                        {power}/{scaled.minPower}
                      </p>
                      <div className="party-pick">
                        {idle.length === 0 && (
                          <p className="muted">No idle recruits — check Tavern.</p>
                        )}
                        {idle.map((r) => {
                          const def = NPCS[r.npcId]
                          if (!def) return null
                          const active = picked.includes(r.id)
                          const pwr = npcPower(r, gearInventory)
                          const rlv = recruitXpProgress(r.xp).level
                          return (
                            <button
                              key={r.id}
                              type="button"
                              className={`seed-chip ${active ? 'active' : ''}`}
                              onClick={() => togglePartyMember(adv.id, r.id)}
                            >
                              <span className="seed-emoji">{def.emoji}</span>
                              <span className="seed-meta">
                                <strong>
                                  {def.name} Lv {rlv}
                                </strong>
                                <small>Power {pwr}</small>
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
  const unclaimedMarketSales = useGame((s) => s.unclaimedMarketSales)
  const marketSalePulse = unclaimedMarketSales.length > 0
  return (
    <nav className="tabnav" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${tab === t.id ? 'active' : ''} ${tabShouldPulse(t.id, guideTabPulses, contextGuideTab) ? 'guide-pulse-frame' : ''} ${t.id === 'market' && marketSalePulse ? 'market-sale-pulse' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span aria-hidden>{t.emoji}</span>
          {t.label}
          {t.id === 'market' && marketSalePulse
            ? ` (${unclaimedMarketSales.length})`
            : ''}
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const tab = useGame((s) => s.tab)
  const darkMode = useGame((s) => s.darkMode)
  const refreshMarketSales = useGame((s) => s.refreshMarketSales)

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', darkMode)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', darkMode ? '#080510' : '#ddd0f5')
  }, [darkMode])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    void refreshMarketSales()
    return subscribeToSellerPayouts(getPlayerId(), () => {
      void refreshMarketSales()
    })
  }, [refreshMarketSales])

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

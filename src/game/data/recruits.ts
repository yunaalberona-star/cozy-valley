import { NPCS } from './npcs'
import { gearForNpc, gearInstanceStats } from './gear'
import type { GearInstance, RecruitedNpc } from '../types'

const XP_PER_LEVEL = 40

export function xpToReachRecruitLevel(level: number): number {
  if (level <= 1) return 0
  return XP_PER_LEVEL * ((level - 1) * level) / 2
}

export function recruitLevelFromXp(xp: number): number {
  let level = 1
  while (xpToReachRecruitLevel(level + 1) <= xp) level++
  return level
}

export function recruitXpProgress(xp: number) {
  const level = recruitLevelFromXp(xp)
  const curFloor = xpToReachRecruitLevel(level)
  const nextFloor = xpToReachRecruitLevel(level + 1)
  const span = nextFloor - curFloor
  const pct = span > 0 ? ((xp - curFloor) / span) * 100 : 100
  return { level, xp, pct, toNext: nextFloor - xp }
}

export interface RecruitStats {
  attack: number
  defense: number
  hp: number
  skill: number
}

/** Base stats from recruit level (before gear). */
export function recruitBaseStats(npc: RecruitedNpc): RecruitStats {
  const def = NPCS[npc.npcId]
  const level = recruitLevelFromXp(npc.xp)
  const tier = level - 1
  const skillBase = def?.skill ?? 1
  return {
    skill: skillBase + tier,
    attack: Math.floor(tier / 2) + (skillBase >= 4 ? 1 : 0),
    defense: Math.floor(tier / 2) + 1,
    hp: 10 + tier * 6,
  }
}

/** Total recruit stats including equipped gear. */
export function npcTotalStats(
  npc: RecruitedNpc,
  gearInventory: GearInstance[],
): RecruitStats {
  const base = recruitBaseStats(npc)
  const gear = gearForNpc(npc.id, gearInventory)
  return gear.reduce(
    (acc, g) => {
      const s = gearInstanceStats(g)
      acc.attack += s.attack
      acc.defense += s.defense
      acc.hp += s.hp
      acc.skill += s.skillBonus
      return acc
    },
    { ...base },
  )
}

export function npcPower(
  npc: RecruitedNpc,
  gearInventory: GearInstance[],
): number {
  const s = npcTotalStats(npc, gearInventory)
  return s.attack + s.defense + s.hp + s.skill
}

export function partyPower(
  npcInstanceIds: string[],
  recruited: RecruitedNpc[],
  gearInventory: GearInstance[],
): number {
  return npcInstanceIds.reduce((sum, id) => {
    const npc = recruited.find((n) => n.id === id)
    if (!npc) return sum
    return sum + npcPower(npc, gearInventory)
  }, 0)
}

export function grantRecruitXp(
  recruited: RecruitedNpc[],
  npcInstanceIds: string[],
  amount: number,
): RecruitedNpc[] {
  const ids = new Set(npcInstanceIds)
  return recruited.map((r) =>
    ids.has(r.id) ? { ...r, xp: r.xp + amount } : r,
  )
}

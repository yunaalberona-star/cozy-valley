import type { GearInstance } from '../types'
import type { CropId, ItemId, MaterialId, StoragePartId, TreeId } from '../types'
import {
  bagItemCategory,
  bagMaterialCategory,
  type BagPaneId,
} from './bagCategories'

export const STORAGE_PART_META: Record<
  StoragePartId,
  { name: string; emoji: string; sellPrice: number }
> = {
  storage_nail: { name: 'Barn Nail', emoji: '🔩', sellPrice: 48 },
  storage_screw: { name: 'Barn Screw', emoji: '🔧', sellPrice: 52 },
  storage_tape: { name: 'Duct Tape', emoji: '📎', sellPrice: 56 },
}

export const STORAGE_PART_IDS = Object.keys(STORAGE_PART_META) as StoragePartId[]

export const BAG_PANE_LABEL: Record<BagPaneId, string> = {
  seeds: 'Seed bin',
  farm: 'Farm silo',
  machine: 'Craft barn',
  animal: 'Animal shed',
  gear: 'Gear rack',
}

const BASE_CAPACITY: Record<BagPaneId, number> = {
  seeds: 30,
  farm: 40,
  machine: 40,
  animal: 35,
  gear: 8,
}


export const BAG_CAPACITY_PER_LEVEL: Record<BagPaneId, number> = {
  seeds: 10,
  farm: 10,
  machine: 10,
  animal: 10,
  gear: 4,
}

export const MAX_BAG_STORAGE_LEVEL = 30

/** Upgrade parts required for level → level+1 (cycles like Hay Day). */
const UPGRADE_PATTERN: Partial<Record<StoragePartId, number>>[] = [
  { storage_nail: 2 },
  { storage_screw: 2 },
  { storage_tape: 2 },
  { storage_nail: 3, storage_screw: 1 },
  { storage_screw: 3, storage_tape: 1 },
  { storage_tape: 3, storage_nail: 1 },
  { storage_nail: 4, storage_screw: 2 },
  { storage_screw: 4, storage_tape: 2 },
  { storage_tape: 4, storage_nail: 2, storage_screw: 1 },
  { storage_nail: 5, storage_screw: 3, storage_tape: 2 },
]

export type BagContentsSlice = {
  inventory: Partial<Record<ItemId, number>>
  materials: Partial<Record<MaterialId, number>>
  seeds: Partial<Record<CropId, number>>
  saplings: Partial<Record<TreeId, number>>
  gearInventory: GearInstance[]
  bagCapacityLevel: Partial<Record<BagPaneId, number>>
}

export function bagStorageLevel(
  levels: Partial<Record<BagPaneId, number>>,
  pane: BagPaneId,
): number {
  return Math.min(MAX_BAG_STORAGE_LEVEL, levels[pane] ?? 0)
}

export function bagTabCapacity(
  levels: Partial<Record<BagPaneId, number>>,
  pane: BagPaneId,
): number {
  const level = bagStorageLevel(levels, pane)
  return BASE_CAPACITY[pane] + level * BAG_CAPACITY_PER_LEVEL[pane]
}

export function sumRecord(values: Record<string, number | undefined>): number {
  return Object.values(values).reduce<number>((sum, n) => sum + (n ?? 0), 0)
}

export function bagTabUsage(slice: BagContentsSlice, pane: BagPaneId): number {
  if (pane === 'seeds') {
    return sumRecord(slice.seeds as Record<string, number>) +
      sumRecord(slice.saplings as Record<string, number>)
  }
  if (pane === 'gear') {
    return slice.gearInventory.filter((g) => !g.equippedBy).length
  }
  if (pane === 'farm') {
    let total = 0
    for (const [id, qty] of Object.entries(slice.inventory)) {
      if ((qty ?? 0) <= 0) continue
      if (bagItemCategory(id as ItemId) === 'farm') total += qty ?? 0
    }
    return total
  }
  if (pane === 'animal') {
    let total = 0
    for (const [id, qty] of Object.entries(slice.inventory)) {
      if ((qty ?? 0) <= 0) continue
      if (bagItemCategory(id as ItemId) === 'animal') total += qty ?? 0
    }
    for (const [id, qty] of Object.entries(slice.materials)) {
      if ((qty ?? 0) <= 0) continue
      if (bagMaterialCategory(id as MaterialId) === 'animal') total += qty ?? 0
    }
    return total
  }
  // machine
  let total = 0
  for (const [id, qty] of Object.entries(slice.inventory)) {
    if ((qty ?? 0) <= 0) continue
    if (bagItemCategory(id as ItemId) === 'machine') total += qty ?? 0
  }
  for (const [id, qty] of Object.entries(slice.materials)) {
    if ((qty ?? 0) <= 0) continue
    if (bagMaterialCategory(id as MaterialId) === 'machine') total += qty ?? 0
  }
  return total
}

export function bagUpgradeCost(
  levels: Partial<Record<BagPaneId, number>>,
  pane: BagPaneId,
): Partial<Record<StoragePartId, number>> | null {
  const level = bagStorageLevel(levels, pane)
  if (level >= MAX_BAG_STORAGE_LEVEL) return null
  const pattern = UPGRADE_PATTERN[level % UPGRADE_PATTERN.length]!
  return { ...pattern }
}

export function hasStorageParts(
  owned: Partial<Record<StoragePartId, number>>,
  cost: Partial<Record<StoragePartId, number>>,
): boolean {
  for (const [id, need] of Object.entries(cost)) {
    if ((owned[id as StoragePartId] ?? 0) < (need ?? 0)) return false
  }
  return true
}

export function takeStorageParts(
  owned: Partial<Record<StoragePartId, number>>,
  cost: Partial<Record<StoragePartId, number>>,
): Partial<Record<StoragePartId, number>> {
  const next = { ...owned }
  for (const [id, need] of Object.entries(cost)) {
    const partId = id as StoragePartId
    const left = (next[partId] ?? 0) - (need ?? 0)
    if (left <= 0) delete next[partId]
    else next[partId] = left
  }
  return next
}

export function addStorageParts(
  owned: Partial<Record<StoragePartId, number>>,
  grant: Partial<Record<StoragePartId, number>>,
): Partial<Record<StoragePartId, number>> {
  if (!grant) return owned
  const next = { ...owned }
  for (const [id, qty] of Object.entries(grant)) {
    if (!qty) continue
    const partId = id as StoragePartId
    next[partId] = (next[partId] ?? 0) + qty
  }
  return next
}

export type BagGrant = {
  inventory?: Partial<Record<ItemId, number>>
  materials?: Partial<Record<MaterialId, number>>
  seeds?: Partial<Record<CropId, number>>
  saplings?: Partial<Record<TreeId, number>>
  gearAdd?: number
}

export function grantDeltaUsage(grant: BagGrant): Record<BagPaneId, number> {
  const delta: Record<BagPaneId, number> = {
    seeds: 0,
    farm: 0,
    machine: 0,
    animal: 0,
    gear: 0,
  }
  if (grant.seeds) delta.seeds += sumRecord(grant.seeds as Record<string, number>)
  if (grant.saplings) delta.seeds += sumRecord(grant.saplings as Record<string, number>)
  if (grant.gearAdd) delta.gear += grant.gearAdd
  if (grant.inventory) {
    for (const [id, qty] of Object.entries(grant.inventory)) {
      if (!qty) continue
      const cat = bagItemCategory(id as ItemId)
      delta[cat] += qty
    }
  }
  if (grant.materials) {
    for (const [id, qty] of Object.entries(grant.materials)) {
      if (!qty) continue
      const cat = bagMaterialCategory(id as MaterialId)
      delta[cat] += qty
    }
  }
  return delta
}

export function canGrantBag(
  slice: BagContentsSlice,
  grant: BagGrant,
): { ok: true } | { ok: false; pane: BagPaneId } {
  const delta = grantDeltaUsage(grant)
  for (const pane of Object.keys(delta) as BagPaneId[]) {
    const add = delta[pane]
    if (add <= 0) continue
    const used = bagTabUsage(slice, pane)
    const cap = bagTabCapacity(slice.bagCapacityLevel, pane)
    if (used + add > cap) return { ok: false, pane }
  }
  return { ok: true }
}

/** Minimum storage level per tab so existing saves fit after migration. */
export function minLevelsForContents(slice: BagContentsSlice): Record<BagPaneId, number> {
  const levels: Record<BagPaneId, number> = {
    seeds: 0,
    farm: 0,
    machine: 0,
    animal: 0,
    gear: 0,
  }
  for (const pane of Object.keys(levels) as BagPaneId[]) {
    const used = bagTabUsage(slice, pane)
    let level = 0
    while (bagTabCapacity({ ...levels, [pane]: level }, pane) < used && level < MAX_BAG_STORAGE_LEVEL) {
      level += 1
    }
    levels[pane] = level
  }
  return levels
}

const PART_POOL: StoragePartId[] = ['storage_nail', 'storage_screw', 'storage_tape']

export function rollOrderStorageDrop(): Partial<Record<StoragePartId, number>> | null {
  if (Math.random() > 0.18) return null
  const part = PART_POOL[Math.floor(Math.random() * PART_POOL.length)]!
  return { [part]: 1 }
}

export function rollShipStorageDrop(): Partial<Record<StoragePartId, number>> {
  const out: Partial<Record<StoragePartId, number>> = {}
  if (Math.random() < 0.55) {
    const part = PART_POOL[Math.floor(Math.random() * PART_POOL.length)]!
    out[part] = (out[part] ?? 0) + 1
  }
  if (Math.random() < 0.28) {
    const part = PART_POOL[Math.floor(Math.random() * PART_POOL.length)]!
    out[part] = (out[part] ?? 0) + 1
  }
  return out
}

export function rollAdventureStorageDrop(
  playerLevel: number,
): Partial<Record<StoragePartId, number>> | null {
  const chance = 0.12 + Math.min(0.15, playerLevel * 0.004)
  if (Math.random() > chance) return null
  const part = PART_POOL[Math.floor(Math.random() * PART_POOL.length)]!
  const bonus = playerLevel >= 30 && Math.random() < 0.35 ? 1 : 0
  return { [part]: 1 + bonus }
}

export function formatStoragePartCost(
  cost: Partial<Record<StoragePartId, number>>,
): string {
  return Object.entries(cost)
    .map(([id, qty]) => {
      const meta = STORAGE_PART_META[id as StoragePartId]
      return `${qty}× ${meta.emoji} ${meta.name}`
    })
    .join(' · ')
}

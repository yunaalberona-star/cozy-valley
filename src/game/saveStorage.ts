/** Stable localStorage key — never change after launch or testers lose saves. */
export const SAVE_STORAGE_KEY = 'cozy-valley-save'

/** Bump when save shape changes; run migrations, do not rename SAVE_STORAGE_KEY. */
export const SAVE_VERSION = 33

const LEGACY_SAVE_KEYS = [
  'cozy-valley-save-v7',
  'cozy-valley-save-v6',
  'cozy-valley-save-v5',
  'cozy-valley-save-v4',
  'cozy-valley-save-v3',
  'cozy-valley-save-v2',
  'cozy-valley-save-v1',
] as const

/** Copy the newest legacy save into the stable key if needed. */
export function adoptLegacySaveIfNeeded(): void {
  try {
    if (typeof localStorage === 'undefined') return
    if (localStorage.getItem(SAVE_STORAGE_KEY)) return
    for (const key of LEGACY_SAVE_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) {
        localStorage.setItem(SAVE_STORAGE_KEY, legacy)
        return
      }
    }
  } catch {
    // Storage blocked (private mode, etc.)
  }
}

export type PersistedSlice = Record<string, unknown>

export function mergePersistedSlice(
  persisted: unknown,
  defaults: PersistedSlice,
): PersistedSlice {
  if (!persisted || typeof persisted !== 'object') return defaults
  const p = persisted as PersistedSlice
  return {
    ...defaults,
    ...p,
    seeds:
      p.seeds != null && typeof p.seeds === 'object'
        ? { ...(p.seeds as object) }
        : { ...((defaults.seeds as object) ?? {}) },
    inventory: { ...((p.inventory as object) ?? {}) },
    materials: { ...((p.materials as object) ?? {}) },
    machineQueueBonus: { ...((p.machineQueueBonus as object) ?? {}) },
    missionProgress: { ...((p.missionProgress as object) ?? {}) },
    eventProgress: { ...((p.eventProgress as object) ?? {}) },
    saplings:
      p.saplings != null && typeof p.saplings === 'object'
        ? { ...(p.saplings as object) }
        : { ...((defaults.saplings as object) ?? {}) },
  }
}

import { useGame } from '../game/store'

declare global {
  interface Window {
    __cozyDev?: {
      setLevel: (level: number) => void
      addCoins?: (amount: number) => void
      purchaseAll?: () => void
    }
  }
}

/** Localhost dev helpers — tree-shaken from production via main.tsx guard. */
export function installLocalDevTools(): void {
  if (typeof window === 'undefined') return
  if (window.location.hostname !== 'localhost') return

  window.__cozyDev = {
    setLevel: (level) => useGame.getState().devSetPlayerLevel(level),
  }

  const pending = sessionStorage.getItem('cozy-valley-pending-level')
  if (pending) {
    sessionStorage.removeItem('cozy-valley-pending-level')
    const level = Number(pending)
    if (Number.isFinite(level) && level >= 1) {
      useGame.getState().devSetPlayerLevel(level)
    }
  }
}

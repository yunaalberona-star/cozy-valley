import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (import.meta.env.DEV) {
  void import('./dev/localDev.ts').then(async ({ installLocalDevTools }) => {
    installLocalDevTools()
    const privateModules = import.meta.glob<{ installPrivateDevTools?: () => void }>(
      './dev/localDev.private.ts',
    )
    const loadPrivate = privateModules['./dev/localDev.private.ts']
    if (loadPrivate) {
      const mod = await loadPrivate()
      mod.installPrivateDevTools?.()
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

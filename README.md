# Cozy Valley

A cozy farming & crafting game (React + TypeScript + Vite). Saves live in the browser (`localStorage`).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173/

Share on your LAN or via a tunnel:

```bash
npm run dev:share
```

## Deploy for testers

Push this repo to GitHub, then connect it on **Vercel** or **Netlify** (both free). The config files in this repo are already set up — no extra build settings needed.

### Vercel (recommended)

1. Push the project to GitHub ([create a repo](https://github.com/new), then `git push`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Leave defaults (Vite is auto-detected via `vercel.json`).
4. Click **Deploy**. You get a URL like `https://cozy-valley.vercel.app`.

Every push to `main` redeploys automatically.

### Netlify

1. Push the project to GitHub.
2. Go to [app.netlify.com/start](https://app.netlify.com/start) and import the repository.
3. Netlify reads `netlify.toml` — build command `npm run build`, publish folder `dist`.
4. Click **Deploy**. You get a URL like `https://cozy-valley.netlify.app`.

### Manual preview (same Wi‑Fi only)

```bash
npm run build
npm run preview
```

Share the **Network** URL from the terminal.

## Notes for testers

- Each browser keeps its own save; progress is not synced between devices.
- Works on phone browsers — add to home screen for an app-like feel.

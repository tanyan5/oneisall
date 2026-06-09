# OneIsAll — Agent Guide

## Commands

- `npm install` — install dependencies (includes native `better-sqlite3`)
- `npm run dev` — development with hot reload
- `npm run build` — compile to `out/`
- `npm run dist` — Windows installer via electron-builder
- `node scripts/gen-icons.mjs` — regenerate built-in PNG/ICO assets

## Layout

- `src/main/` — Electron main process (window, tray, clipboard store, plugins, shortcuts)
- `src/preload/` — IPC bridge (`index.ts`, `launcher.ts`)
- `src/renderer/` — React UI (shell, launcher overlay, plugin views)
- `src/shared/` — types and helpers shared across processes
- `plugins/` — built-in tool manifests (`plugin.json`) and optional `main.ts`
- `resources/` — icons, brand SVG, home promo/announcement JSON
- `scripts/` — build utilities
- `openspec/` — product specs and archived change history

## Built-in tools

| id | UI | Notes |
|----|-----|-------|
| `clipboard` | `src/renderer/plugins/clipboard/` | SQLite history, watcher in main process |
| `shankai` | `src/renderer/plugins/shankai/` | App launcher modules |
| `demo` | `src/renderer/plugins/demo/` | Sample plugin |

Register new React views in `ToolboxShell` → `PLUGIN_VIEWS`.

## Conventions

- TypeScript strict mode
- New tools: add `plugins/<id>/plugin.json`, optional `main.ts`, renderer view, and map in `PLUGIN_VIEWS`
- User data lives under `%APPDATA%/OneIsAll/` (production) or `%APPDATA%/OneIsAll-dev/` (dev)
- Manual QA checklist: `TESTING.md`

## Default shortcuts

Defined in `src/shared/shortcuts.ts`:

- `openClipboard`: `Ctrl+Shift+V`
- `openLauncher`: `Ctrl+Shift+Space`

User overrides persist in `settings.json`.

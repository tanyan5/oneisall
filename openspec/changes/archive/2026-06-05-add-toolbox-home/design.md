## Context

OneIsAll currently defaults `activeId` to `clipboard` in `ToolboxShell` and opens the main window without a dedicated overview. The user wants a collection-first experience: open the app → see available tools → pick one. Power paths (clipboard shortcut, tray menu item) must remain one step.

Existing pieces: `tools:list` IPC, sidebar nav, `showMainWindow(toolId?)` + `navigate-tool` event in main process.

## Goals / Non-Goals

**Goals:**

- Built-in `HomeView` React component (not a plugin) at route id `home`.
- Sidebar: 「主页」 + existing tools; default `activeId = 'home'`.
- `showMainWindow()` with no argument → Home; with `'clipboard'` → clipboard (unchanged).
- Home UI: responsive card grid, tool name, optional `description` from manifest (new optional field in `plugin.json`).
- Persist `lastUsedToolId` in `%APPDATA%/OneIsAll/settings.json` for a subtle "最近使用" badge on Home.

**Non-Goals:**

- Full settings page, plugin enable/disable UI, search across tools.
- Replacing sidebar with Home-only navigation.
- Changing plugin activation model in main process.

## Decisions

### 1. Home is host-built-in, not a plugin

**Choice:** `HomeView` lives in `src/renderer/shell/HomeView.tsx`; `PLUGIN_VIEWS` uses special case `activeId === 'home'`.

**Rationale:** Home is shell chrome, not uninstallable tooling. Avoids manifest collision and empty `main.ts` for home.

**Alternative:** Home as `plugins/home` — rejected; conflates discoverable tools with shell.

### 2. Hybrid entry points (from explore)

| Entry | Target |
|-------|--------|
| Tray「打开主窗口」| `showMainWindow()` → `home` |
| Tray「打开剪贴板」/ `Ctrl+Shift+V` | `showMainWindow('clipboard')` |
| Sidebar「主页」| `activeId = 'home'` |

**Rationale:** Matches user preference for collection on open while preserving clipboard fast path.

### 3. Optional manifest `description`

**Choice:** Extend `PluginManifest` + `ToolMeta` with optional `description?: string` for card subtitle; fallback to empty or generic text.

**Rationale:** Low cost, scales as tools grow; no new IPC channel needed.

### 4. Last-used persistence

**Choice:** Main process writes `lastUsedToolId` on `tools:setActive` when id !== `home`; expose via `tools:getLastUsed` or include in list response.

**Rationale:** Single source of truth; renderer stays thin.

## Risks / Trade-offs

- **[Extra click for clipboard-only users]** Opening main window no longer lands on clipboard → Mitigation: shortcuts and tray item unchanged; users who live in clipboard use those.
- **[Empty Home with few tools]** Only 2 cards may feel sparse → Mitigation: add welcome line + shortcut hints; acceptable for v1.
- **[Plugin id `home`]** Collision → Mitigation: filter in `PluginHost.scanManifests`.

## Migration Plan

1. Ship UI + default route change in one release.
2. No data migration; `settings.json` created on first tool use.
3. Update README navigation section.

## Open Questions

- Card vs list layout on narrow windows — default to CSS grid `auto-fill minmax(200px, 1fr)`.
- Whether double-click tray should open Home or last-used tool — **proposal: Home** (consistent with「打开主窗口」); can revisit.

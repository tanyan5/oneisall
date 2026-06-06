## Context

OneIsAll has a single main `BrowserWindow`, `tools:list` IPC, and `SettingsStore` with only `lastUsedToolId`. Users want a Raycast-style overlay: search + recent 10, global summon key, direct tool open. `add-shortcut-settings` introduces `ShortcutManager` and configurable bindings; this change adds `openLauncher` and the overlay itself.

## Goals / Non-Goals

**Goals:**

- `LauncherWindow`: ~560×auto height, `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`, centered on active display.
- Separate renderer entry `src/renderer/launcher/` (or `launcher.html`) to keep overlay UI isolated from main shell.
- Search tiers implemented in renderer with shared `searchTools(query, tools)` scoring `name` + `description`.
- `recentTools: { id, lastUsedAt }[]` max 10 in `SettingsStore`; replace `lastUsedToolId` reads in Home with recent list head or keep both during migration.
- `openLauncher` shortcut toggles show/hide launcher (v1: show + focus; hide on Esc or after selection).
- Selection flow: `recordRecent(id)` → `hideLauncher()` → `showMainWindow(id)`.

**Non-Goals:**

- Embedding full tool UIs inside launcher.
- Pinyin / `keywords[]` in manifest (v2).
- Click-outside-to-dismiss (optional later).
- Launcher inside main window resize mode.

## Decisions

### 1. Second BrowserWindow vs main window mode

**Choice:** dedicated `LauncherWindow` + optional separate Vite entry via `electron-vite` multi-page config.

**Rationale:** Independent size/position/lifecycle; main shell unchanged.

### 2. Empty vs search layout

| Query | Section 1 label | Section 2 |
|-------|-----------------|-----------|
| empty | 近期常用 (recent 10) | hidden |
| non-empty | 模糊匹配 (score ≥ threshold or top N) | 其他匹配 (rest of matches) |

Scoring (v1): lowercase substring in `name` (+3 prefix, +2 contains), `description` (+1 contains). Sort desc; top half or score ≥ max-1 → section 1.

### 3. Recent tools migration

```json
{
  "recentTools": [{ "id": "clipboard", "lastUsedAt": 1710000000 }],
  "shortcuts": {
    "openClipboard": "CommandOrControl+Shift+V",
    "openLauncher": "CommandOrControl+Shift+Space"
  }
}
```

On load: if `recentTools` empty but `lastUsedToolId` set, seed one entry.

Update recent on any `tools:setActive` where id ∉ {home, settings}.

### 4. Shortcut integration

Extend `ShortcutActionId` with `openLauncher`. Handler: `toggleLauncher()`.

Settings UI (from `add-shortcut-settings`) gains second row for launcher shortcut.

**Apply order:** `add-shortcut-settings` then `add-launcher-overlay`, or merge if settings not yet implemented.

### 5. IPC

| Channel | Purpose |
|---------|---------|
| `launcher:hide` | Hide overlay |
| `launcher:openTool` | recent + hide + showMainWindow |
| `tools:list` | Reuse existing |
| `tools:getRecent` | Return recent 10 metadata-enriched |

### 6. Focus and blur

On show: `showInactive()` then `focus()` + `webContents.send('launcher:focus')` to focus input.

Windows: `setVisibleOnAllWorkspaces(true)` optional for multi-monitor — defer.

## Risks / Trade-offs

- **[Two renderers]** Slightly more build config → acceptable for clarity.
- **[Shortcut toggle vs main window]** Both visible briefly on tool open — acceptable.
- **[Fuzzy quality]** Simple scoring may mis-rank — sufficient for <20 tools.

## Migration Plan

1. Ship launcher window + recentTools + openLauncher default.
2. Update HomeView to use `getRecent` for badge (optional, same session).
3. README: document launcher shortcut and interaction.

## Open Questions

- Toggle same shortcut to hide launcher when already open — **yes for v1** on second press of openLauncher.

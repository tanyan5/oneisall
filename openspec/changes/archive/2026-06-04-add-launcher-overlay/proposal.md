## Why

Power users need a keyboard-first way to open tools without navigating the full main window or tray. A compact launcher overlay with search and recent tools matches the collection mental model established by the Home page, while keeping clipboard and other high-frequency paths on dedicated shortcuts.

## What Changes

- Add a separate **Launcher overlay** `BrowserWindow` (frameless, always-on-top, centered) toggled by a configurable global shortcut (`openLauncher`, default `Ctrl+Shift+Space`).
- **No keyword**: show only **recent 10** plugins in the **first section**; second section hidden.
- **With keyword**: **first section** = top fuzzy-search matches; **second section** = remaining matches (deduplicated); hide second section if empty.
- **Select plugin**: close overlay, update recent LRU, open main window directly on that tool (`showMainWindow(toolId)`).
- Extend `SettingsStore` with `recentTools` (max 10 LRU); migrate from single `lastUsedToolId`.
- Keyboard: focus search on open, `↑/↓` navigate, `Enter` open, `Esc` close.
- Depends on **`add-shortcut-settings`** (or equivalent) for `ShortcutManager` and `openLauncher` binding in Settings UI.

## Capabilities

### New Capabilities

- `toolbox-launcher`: Overlay window, search tiers, recent tools, selection opens plugin.

### Modified Capabilities

- `toolbox`: System integration — global `openLauncher` shortcut; recent-tool persistence contract.
- `toolbox-settings`: Add configurable `openLauncher` shortcut alongside `openClipboard` (if `add-shortcut-settings` not yet applied, implement both in one apply order).

## Impact

- **Main**: `LauncherWindow.ts`, fuzzy search utility, `SettingsStore` recentTools, `ShortcutManager` handler for `openLauncher`.
- **Renderer**: dedicated launcher entry (`launcher.html` or route), `LauncherView.tsx`, styles.
- **Preload**: `launcher.*` IPC bridge (may share `tools:list`).
- **Non-breaking** for plugins; optional `keywords` in manifest deferred to v2.

## Dependencies

- Implement **`add-shortcut-settings`** first, or include shortcut settings scope when applying this change.

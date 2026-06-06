## 0. Prerequisite

- [x] 0.1 Ensure `add-shortcut-settings` is applied (ShortcutManager + Settings UI), or implement shortcut settings as part of this change

## 1. Recent tools persistence

- [x] 1.1 Extend `SettingsStore` with `recentTools` array (max 10 LRU)
- [x] 1.2 Migrate existing `lastUsedToolId` into `recentTools` on first load
- [x] 1.3 Update `tools:setActive` to push recent entry for tool ids (exclude home/settings)
- [x] 1.4 Add IPC `tools:getRecent` returning `ToolMeta[]` in recent order

## 2. Launcher window (main process)

- [x] 2.1 Create `LauncherWindow.ts` with frameless always-on-top centered window
- [x] 2.2 Implement `toggleLauncher()`, `hideLauncher()`, `openToolFromLauncher(id)`
- [x] 2.3 Wire `ShortcutManager` action `openLauncher` (default `Ctrl+Shift+Space`)

## 3. Launcher renderer

- [x] 3.1 Add launcher Vite entry (`launcher.html` + `launcher/main.tsx`) and electron-vite config
- [x] 3.2 Create `LauncherView.tsx`: search input, section 1/2, empty states
- [x] 3.3 Implement `searchTools()` fuzzy scoring on name + description
- [x] 3.4 Empty query: section 1 = recent 10 only; hide section 2
- [x] 3.5 Non-empty query: section 1 primary matches, section 2 secondary; hide section 2 if empty
- [x] 3.6 Keyboard: arrows, Enter, Esc; preload bridge for IPC

## 4. Selection and integration

- [x] 4.1 On select: `launcher:openTool` → update recent, hide launcher, `showMainWindow(toolId)`
- [x] 4.2 Add launcher-specific styles (compact overlay theme)

## 5. Settings extension

- [x] 5.1 Add `openLauncher` to Settings shortcuts UI and defaults
- [x] 5.2 Update HomeView hint chip to mention launcher shortcut

## 6. Documentation and verification

- [x] 6.1 Update `README.md` with launcher behavior and shortcuts table
- [x] 6.2 Manual test: empty launcher shows recent 10 in section 1 only
- [x] 6.3 Manual test: search two-tier results; Enter opens tool in main window
- [x] 6.4 Manual test: Esc closes launcher; openLauncher shortcut toggles

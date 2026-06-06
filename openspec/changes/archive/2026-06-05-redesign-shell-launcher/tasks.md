## 1. Unified branding & app icon

- [x] 1.1 Extend `scripts/gen-icons.mjs` to emit `resources/icon.ico` (multi-size from cyber lion artwork)
- [x] 1.2 Configure `package.json` `build.win.icon` and `BrowserWindow` `icon` in `window.ts`
- [x] 1.3 Verify taskbar and tray icons match; unify titles/tooltip to OneIsAll branding

## 2. Frameless shell & Esc stack

- [x] 2.1 Set main window `frame: false`; no min/max/close UI in any view
- [x] 2.2 Implement `useEscapeStack` in shell: popover → exit plugin/settings to home → hide window to tray
- [x] 2.3 Immersive layout: hide sidebar when `activeId` is a plugin or `settings`; content full-window

## 3. Shell & Home master-detail

- [x] 3.1 Remove sidebar「主页」nav item; brand click returns to `home` overview
- [x] 3.2 Refactor `HomeView` to left tool list + right preview (row1 description, row2 keyword chips, Open button)
- [x] 3.2a Add `KeywordChipDropdown`: click keyword → actions +「固定到搜索框」
- [x] 3.3 Sidebar plugin click selects preview on Home without opening; Open enters immersive plugin view (no sidebar)
- [x] 3.4 Add styles for `.home-split`, `.home-list`, `.home-preview`, `.home-open-btn`
- [x] 3.5 Update `showMainWindow` / tray paths to land on home overview

## 4. Launch keywords data & pinning

- [x] 4.0 Extend `PluginManifest` / `ToolMeta` with optional `launchKeywords`; parse in `PluginHost`
- [x] 4.0a Add `pinnedSearchKeywords` to `SettingsStore` + IPC pin/unpin/get
- [x] 4.0b Add `launchKeywords` to builtin `clipboard`, `shankai`, `demo` plugin.json examples

## 5. Launcher UX

- [x] 5.1 `LauncherWindow.ts`: close on `blur` (with short debounce)
- [x] 5.2 Recent section: horizontal row layout; hide description and kind labels for empty-search recents
- [x] 5.3 Add `JellyfishHomeButton` with breathing glow CSS beside search input
- [x] 5.4 IPC `launcher:openHome` + preload `launcher.openHome`; wire click to hide launcher and show main home
- [x] 5.5 Show pinned keyword chips in launcher search area; click fills search and filters results

## 6. Tray menu

- [x] 6.1 Simplify `tray.ts` context menu to only「设置」and「退出」; remove open-main, clipboard, pause/resume items
- [x] 6.2 Keep double-click tray → open Home (optional); decouple menu from `ClipboardWatcher` rebuild

## 7. Documentation & verification

- [x] 7.1 Update `README.md` (tray menu, home preview, launchKeywords, pin to search, entry table)
- [x] 7.2 Manual test: tray menu items, immersive plugin, Esc layers, launcher dismiss
- [x] 7.3 `npm run build` succeeds

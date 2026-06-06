## 1. Plugin icons — main process

- [x] 1.1 Extend `PluginManifest` / `ToolMeta` with optional icon path resolution
- [x] 1.2 Implement `ToolIconService` (manifest icon, default `icon.png`, data URL)
- [x] 1.3 Add IPC `tools:getIcon(toolId)` and preload bridge
- [x] 1.4 Add `icon.png` for builtin plugins `clipboard`, `shankai`, `demo`
- [x] 1.5 Add built-in nav icons for `home` and `settings`

## 2. Shankai icon fix

- [x] 2.1 Enhance `getTargetIconDataUrl` with `.lnk` → `readShortcutLink` → target icon
- [x] 2.2 Add in-memory icon path cache in main process
- [x] 2.3 Verify `ShankaiView` loads icons after add/list refresh

## 3. Home view UI

- [x] 3.1 Update `HomeView` to fetch and display per-tool icons with fallback
- [x] 3.2 Add `.home-card-icon` styles (layout: icon above name)

## 4. Sidebar UI

- [x] 4.1 Update `ToolboxShell` sidebar: icon + label for home, tools, settings
- [x] 4.2 Add `.tool-nav-icon` styles; reuse shared icon loader or `tools:getIcon`

## 5. Launcher UI

- [x] 5.1 Extend launcher preload: `getToolIcon`, `getAppIcon` (delegate to main IPC)
- [x] 5.2 Ensure search/recent app items include `targetPath` for icon fetch
- [x] 5.3 Update `LauncherView` rows with lazy-loaded icons + fallback
- [x] 5.4 Add `.launcher-item-icon` styles

## 6. Documentation and verification

- [x] 6.1 Update `README.md` plugin `icon` field note
- [x] 6.2 Manual test: Home, sidebar, Launcher, Shankai all show icons (exe + lnk)
- [x] 6.3 `npm run build` succeeds

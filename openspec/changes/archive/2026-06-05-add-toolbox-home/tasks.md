## 1. Main process navigation defaults

- [x] 1.1 Change default `activeToolId` to `home` in `src/main/index.ts`
- [x] 1.2 Ensure `showMainWindow()` without argument sends `navigate-tool` with `home` (or clears pending tool to home)
- [x] 1.3 Keep `showMainWindow('clipboard')` and `Ctrl+Shift+V` behavior unchanged
- [x] 1.4 Reject or skip plugin manifests with `id: "home"` in `PluginHost`

## 2. Settings and tool metadata

- [x] 2.1 Add optional `description` to `PluginManifest` / `ToolMeta` and manifest files
- [x] 2.2 Persist `lastUsedToolId` in user settings on `tools:setActive` (when not `home`)
- [x] 2.3 Expose last-used tool to renderer (extend `tools:list` or add `tools:getLastUsed` IPC)

## 3. Home view UI

- [x] 3.1 Create `src/renderer/shell/HomeView.tsx` with tool card grid from `tools:list`
- [x] 3.2 Card click navigates to tool via existing `setActive` / shell state
- [x] 3.3 Show welcome line, shortcut hints, and optional "最近使用" badge
- [x] 3.4 Add styles for home grid and cards in `styles.css`

## 4. Shell integration

- [x] 4.1 Add sidebar「主页」entry; default `activeId` to `home` in `ToolboxShell`
- [x] 4.2 Route `activeId === 'home'` to `HomeView`; tools unchanged in `PLUGIN_VIEWS`
- [x] 4.3 Handle `navigate-tool` IPC for `home` and tool ids consistently

## 5. Documentation and verification

- [x] 5.1 Update `README.md` navigation / entry points section
- [x] 5.2 Manual test: tray「打开主窗口」→ Home;「打开剪贴板」/ shortcut → clipboard
- [x] 5.3 Run `openspec sync` or archive delta after implementation (if using sync workflow)

## 1. Settings data and shortcut manager

- [x] 1.1 Extend `SettingsStore` with `shortcuts` map and defaults for `openClipboard`
- [x] 1.2 Create `ShortcutManager` with `registerAll`, handlers for `openClipboard` → `showMainWindow('clipboard')`
- [x] 1.3 Replace inline `registerShortcuts()` in `index.ts` with `ShortcutManager` on bootstrap and before-quit unregister

## 2. IPC and preload

- [x] 2.1 Add `settings:get`, `settings:saveShortcuts`, `settings:resetShortcuts` IPC handlers
- [x] 2.2 Expose `window.toolbox.settings` on preload with TypeScript types

## 3. Settings UI and shell routing

- [x] 3.1 Create `SettingsView.tsx` with shortcut list, capture control, save, restore defaults, error display
- [x] 3.2 Add sidebar「设置」and route `activeId === 'settings'` in `ToolboxShell`
- [x] 3.3 Reject plugin manifest id `settings` in `PluginHost` (mirror `home` policy)
- [x] 3.4 Add styles for settings form and shortcut capture state

## 4. Tray integration

- [x] 4.1 Add tray menu item「设置」→ `showMainWindow('settings')`
- [x] 4.2 Ensure `showMainWindow('settings')` sends `navigate-tool` with `settings`

## 5. Documentation and verification

- [x] 5.1 Update `README.md` with configurable shortcuts and settings entry points
- [x] 5.2 Manual test: change clipboard shortcut, verify behavior; simulate conflict and verify error UI
- [x] 5.3 Manual test: tray and sidebar both open Settings

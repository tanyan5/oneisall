## Context

`src/main/index.ts` registers `CommandOrControl+Shift+V` inline; failures log to console only. `SettingsStore` holds `lastUsedToolId` only. Tray menu has no settings entry. User needs configurable shortcuts before a future launcher overlay adds a second global binding.

## Goals / Non-Goals

**Goals:**

- Reserved shell routes: `settings` (builtin Settings view).
- `SettingsStore` extended with `shortcuts: Record<ShortcutActionId, string>`; v1 action id: `openClipboard`.
- `ShortcutManager`: `registerAll()`, `applyBinding(id, accelerator)`, returns `{ ok, error? }` per action.
- `SettingsView`: list shortcuts, capture UI, save, restore defaults, show registration errors.
- Tray「设置」→ `showMainWindow('settings')`.
- Sidebar「设置」at bottom of `ToolboxShell`.

**Non-Goals:**

- Launcher overlay window or `openLauncher` shortcut behavior (schema may reserve key for follow-up change).
- System-wide shortcut conflict detection beyond Electron `register` failure.
- Per-plugin custom global shortcuts.

## Decisions

### 1. Shortcut action registry (main process)

```ts
type ShortcutActionId = 'openClipboard' // | 'openLauncher' later

const DEFAULT_SHORTCUTS: Record<ShortcutActionId, string> = {
  openClipboard: 'CommandOrControl+Shift+V'
}
```

Handlers live in `ShortcutManager`; settings only store accelerators.

### 2. Save flow with validation

1. User captures combo in renderer → sends accelerator string to main.
2. Main calls `globalShortcut.register` in a **test** path (or unregister-all + register-all trial).
3. On failure: return error to UI, keep previous persisted value.
4. On success: persist `settings.json`, keep registrations active.

**Alternative:** save first then register — rejected; avoid persisting broken bindings.

### 3. Shortcut capture UI

Renderer listens `keydown` while capture mode active; build Electron accelerator (`CommandOrControl`, `Shift`, `Alt`, key). Ignore lone modifier keys. Display localized label (e.g. `Ctrl+Shift+V`).

### 4. IPC surface

| Channel | Purpose |
|---------|---------|
| `settings:get` | Full settings including shortcuts |
| `settings:saveShortcuts` | Validate, persist, re-register |
| `settings:resetShortcuts` | Restore defaults and re-register |

### 5. Tray and sidebar entry

Tray menu order: 打开主窗口, 打开剪贴板, separator, **设置**, separator, pause clipboard, separator, 退出.

Sidebar: tools + 主页; **设置** pinned at bottom above hint text.

## Risks / Trade-offs

- **[Unregister on save flicker]** Brief window where no shortcut works → register all in one batch.
- **[Invalid accelerators]** User captures unsupported combos → validate minimum one non-modifier key.
- **[Multiple instances]** Single-instance lock already exists; shortcut owned by one process.

## Migration Plan

1. On first load, merge `DEFAULT_SHORTCUTS` into existing `settings.json`.
2. Replace hardcoded `registerShortcuts()` with `ShortcutManager.registerAll()`.
3. Update README shortcut section.

## Open Questions

- Whether to show「即将支持」placeholder for launcher shortcut in Settings — **deferred** to launcher change.

## Why

Global shortcuts are currently hardcoded (`Ctrl+Shift+V`) with only a console warning when registration fails. Users cannot recover from conflicts with other apps or Windows shortcuts. A settings surface is required before adding more global hotkeys (e.g. a future launcher overlay).

## What Changes

- Add a built-in **Settings** view in the main window (sidebar + route id `settings`).
- Add **托盘菜单「设置」** that opens the main window on the Settings view.
- Persist user-defined **global shortcut** bindings in `settings.json` (v1: open clipboard tool).
- Introduce **ShortcutManager** in the main process: load bindings from settings, register on startup, re-register on save, return per-key success/failure to the UI.
- Settings UI: capture shortcut combos, show human-readable labels, **restore defaults**, and display errors when a binding cannot be registered.
- Extensible shortcut schema so a future **launcher** binding can be added without redesign.

## Capabilities

### New Capabilities

- `toolbox-settings`: Settings page, shortcut persistence, shortcut capture UI, and registration feedback.

### Modified Capabilities

- `toolbox`: System integration — tray menu includes Settings; global shortcuts are user-configurable instead of fixed strings.

## Impact

- **Main**: `SettingsStore`, new `ShortcutManager`, `index.ts` bootstrap, `tray.ts` menu.
- **Renderer**: `SettingsView.tsx`, `ToolboxShell` route for `settings`, styles.
- **Preload**: `settings.get` / `settings.save` / `settings.testRegister` IPC (or equivalent).
- **Specs**: New `toolbox-settings`; delta on `toolbox` system integration.
- **Non-breaking** for plugins; reserved route id `settings` (same pattern as `home`).

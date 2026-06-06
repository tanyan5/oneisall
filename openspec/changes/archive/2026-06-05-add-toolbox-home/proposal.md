## Why

As OneIsAll grows into a multi-tool collection, opening the app directly into a single tool (clipboard) does not match the mental model of "pick a utility first." A lightweight home page gives users a clear entry point to discover and launch tools without adding friction to power-user shortcuts that skip straight to a specific tool.

## What Changes

- Add a built-in **Home** view in the main shell: tool cards grid/list sourced from existing `tools:list` IPC.
- Change the **default landing** when opening the main window (tray "打开主窗口", app activate) to Home instead of clipboard.
- Add a **「主页」** item at the top of the sidebar; selecting it shows the Home view.
- Keep **direct tool entry** unchanged: tray "打开剪贴板", `Ctrl+Shift+V`, and `navigate-tool` IPC still open the target tool directly (skip Home).
- Optional on Home: show last-used tool highlight and global shortcut hints (no settings page in this change).

## Capabilities

### New Capabilities

- `toolbox-home`: Lightweight home/overview view for browsing and launching enabled tools.

### Modified Capabilities

- `toolbox`: Shell navigation defaults, sidebar structure, and entry-point behavior (main window vs shortcut).

## Impact

- **Renderer**: `ToolboxShell.tsx`, new `HomeView.tsx`, styles; `PLUGIN_VIEWS` / routing for `home` id.
- **Main**: `activeToolId` default and `showMainWindow()` without tool id; tray menu behavior unchanged for clipboard-specific actions.
- **IPC**: Possibly extend `ToolMeta` with optional `description` for card subtitles (from manifest, optional field).
- **Specs**: Delta for `toolbox`; new `toolbox-home` capability spec.
- **Non-breaking** for plugins: existing tools require no changes; Home is host-built-in.

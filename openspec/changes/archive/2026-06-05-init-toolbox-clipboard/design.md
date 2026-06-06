# Design: init-toolbox-clipboard

## Architecture

- **Main process**: PluginHost, ClipboardStore (better-sqlite3), ClipboardWatcher (500ms poll), Tray, IPC.
- **Preload**: `window.toolbox` bridge.
- **Renderer**: ToolboxShell + per-tool React views.

## Plugin discovery

Scan `plugins/*/plugin.json` from project dir, packaged `plugins/`, and `%APPDATA%/OneIsAll/plugins/`. Built-in clipboard plugin registers via `ClipboardPlugin` class.

## Clipboard capture order

1. Files (CF_HDROP)
2. Image
3. HTML (if distinct from text)
4. Plain text

## Risks

- Clipboard capture uses polling (500ms) for broad Electron compatibility.
- CF_HDROP write-back may not work in all targets → user copies then pastes manually.

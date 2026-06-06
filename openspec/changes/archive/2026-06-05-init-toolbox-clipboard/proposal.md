# Proposal: Windows Toolbox + Clipboard Plugin

## Why

Users need a single Windows utility that can grow with pluggable tools. The first tool is a clipboard manager with history, search, and one-click restore to the system clipboard.

## What

- Electron + React host with plugin manifests and tray integration.
- Clipboard plugin: capture text/HTML/image/files, SQLite persistence, list UI, keyword search, delete.

## Success criteria

- Tray + main window; `Ctrl+Shift+V` opens clipboard.
- Copy operations appear in the list; search and delete work.
- Selecting a row restores system clipboard content.

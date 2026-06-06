## 1. Taskbar icon sync

- [x] 1.1 `ToolIconService.getIconFilePath(toolId)`
- [x] 1.2 `window.ts` — `syncTaskbarIcon`, `setToolIconPathResolver`
- [x] 1.3 IPC `window:syncTaskbarIcon` (preload + types)
- [x] 1.4 `ToolboxShell` — `useEffect` sync when pinned + immersive

## 2. Immersive window chrome

- [x] 2.1 `renderChromeIcon(toolId)` with `LazyIcon` + `getCachedToolIcon`
- [x] 2.2 Remove emoji from `SURFACE_TITLES` (title strings only)
- [x] 2.3 `window-chrome.css` — `.window-chrome-tool-icon` sizing

## 3. Clipboard unpinned top bar

- [x] 3.1 `ClipboardView` — replace 📋 with `LazyIcon` + `getCachedToolIcon('clipboard')`
- [x] 3.2 `clipboard.css` — `.clipboard-title-icon` styling

## 4. Clipboard icon artwork

- [x] 4.1 `gen-icons.mjs` — redesign `drawClipboardGlyph`
- [x] 4.2 Regenerate `plugins/clipboard/icon.png`

## 5. Verify

- [x] 5.1 Unpinned clipboard top bar matches `icon.png`
- [x] 5.2 Ctrl+D pin: chrome + taskbar icons match plugin icon
- [x] 5.3 Unpin restores O-ring taskbar icon
- [x] 5.4 `npm run build` succeeds

## 1. Shared drag styles

- [x] 1.1 Add `.window-drag` / `.window-no-drag` to `styles.css` and `launcher.css`
- [x] 1.2 Apply drag regions to launcher header chrome, main sidebar brand, immersive plugin top bars; mark inputs/lists/buttons `no-drag`

## 2. Navigation stack (main process)

- [x] 2.1 Define `NavFrame` stack + push/pop helpers in main
- [x] 2.2 Push on: `launcher:openTool`, `launcher:openHome`, `tools:setActive` (non-home), tray settings, `window:openClipboard` / global shortcut paths with `backTarget: launcher`
- [x] 2.3 Add IPC: `navigation:pop` (Esc), `navigation:returnToLauncher`, `navigation:getStack` or equivalent for renderer
- [x] 2.4 Expose in `preload/index.ts` + `index.d.ts`

## 3. ToolboxShell Esc handler

- [x] 3.1 Replace immersive `goHome()` Esc with stack pop via IPC
- [x] 3.2 Keep keyword panel / modal priority before stack pop
- [x] 3.3 Update Home shell sidebar hint text (e.g. Esc 返回快捷框)

## 4. Tray changes

- [x] 4.1 Double-click tray → `showLauncher()` (remove `showMainWindow('home')`)
- [x] 4.2 Tray menu: add「显示」(showLauncher)、「隐藏」(hideLauncher)；保留设置、退出
- [x] 4.3 Tray 设置打开时 push stack frame with launcher back target

## 5. Launcher drag

- [x] 5.1 Drag regions on `LauncherView` / `launcher.css`; jellyfish and search input `no-drag`

## 6. Verification

- [x] 6.1 launcher → tool → Esc → launcher
- [x] 6.2 launcher → 水母 → home → tool → Esc → home → Esc → launcher
- [x] 6.3 Ctrl+Shift+V clipboard → Esc → launcher
- [x] 6.4 Tray 设置 → Esc → launcher; tray 双击/显示 → launcher; 隐藏 → launcher closes
- [x] 6.5 Drag launcher + main window on shell and immersive views
- [x] 6.6 `npm run build` succeeds

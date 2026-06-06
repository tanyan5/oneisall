## 1. Launcher white-flash fix



- [x] 1.1 Set `backgroundColor: '#06080f'` on launcher `BrowserWindow`

- [x] 1.2 Show launcher on `ready-to-show` when first created; verify return-from-main path

- [x] 1.3 Manual test: Esc 回快捷框、托盘显示，无白屏闪烁



## 2. Tray menu cleanup



- [x] 2.1 Remove「隐藏」from `tray.ts` menu

- [x] 2.2 Remove `onHideLauncher` from `TrayHandlers` and `index.ts` wiring

- [x] 2.3 Update spec delta (tray without hide)



## 3. Main process pin state & IPC



- [x] 3.1 Add pin state (`pinned`, `alwaysOnTop`) in main for main window

- [x] 3.2 Implement `window:togglePin`, `getPinState`, `minimize`, `maximize`, `close`, `setAlwaysOnTop`

- [x] 3.3 On pin: `setSkipTaskbar(false)`; off pin: `setSkipTaskbar(true)`; broadcast `pin-state-changed`

- [x] 3.4 Expose APIs in preload + `index.d.ts`



## 4. WindowChrome UI

- [x] 4.1 `WindowChrome.tsx` + `WindowChromeControls.tsx` + `ChromeIcons.tsx`（SVG 线框，非 emoji）
- [x] 4.2 `ToolboxShell` Ctrl+D；定住时显示控制钮
- [x] 4.3 管理中心 `mgmt-top-bar`：Logo + 搜索同一行；placeholder `搜索 {count} 款插件应用...`
- [x] 4.3b `home:getSearchCatalog`；`shell:getBrandIcon`
- [x] 4.4 剪贴板定住：搜索并入 chrome 行
- [x] 4.5 设置/其他沉浸式：定住时 `WindowChrome` 标题行
- [x] 4.6 置顶钮 active 态 `var(--text)`，避免红色 emoji



## 5. Verification



- [x] 5.1 Ctrl+D pin → taskbar entry + chrome; Ctrl+D unpin → frameless

- [x] 5.2 Chrome buttons: 置顶、最小化、最大化、关闭

- [x] 5.3 Launcher 无白闪；托盘无「隐藏」

- [x] 5.4 `npm run build` succeeds


## 1. 窗口会话管理器

- [x] 1.1 新建 `windowSessionManager.ts`：`WindowSession`、`sessions` Map、`pinnedByToolId`、`hubWindow`
- [x] 1.2 实现 `registerSession`、`spawnHiddenHub`、`ensureHubWindow`、`createToolBrowserWindow`
- [x] 1.3 实现 `togglePinForWindow`：Pin 时 Hub 分裂、unpin 时回收 Hub
- [x] 1.4 实现 `focusPinnedTool`、`ensureUnpinnedForWindow`、`closeWindow` 清除登记
- [x] 1.5 `window.ts` 改为薄 re-export，保留 deprecated 全局 API

## 2. 导航与 IPC

- [x] 2.1 `NavigationStack`：`navOpenTool` 先 `focusPinnedTool`，Hub 目标解析，`navPop(forWindow)` per-window
- [x] 2.2 `index.ts` IPC 按 `event.sender` 路由：`togglePin`、`getPinState`、`navigation:pop`、`window:hide`
- [x] 2.3 `showToolInWindow` 发送 `navigate-tool` 携带 `pinState`
- [x] 2.4 `handleOpenLauncherShortcut` 限定 Hub dismiss/restore

## 3. Renderer 同步

- [x] 3.1 `useWindowPin.ts`：`applyPinState`、`syncPinState` 监听 `window:pin-state-changed`
- [x] 3.2 `ToolboxShell.tsx`：导航时应用 `pinState`，Pin 下 Esc 不 pop

## 4. Spec 同步与验证

- [x] 4.1 更新 `openspec/specs/toolbox/spec.md` 多窗口 Pin 与 Hub 导航需求
- [x] 4.2 更新 `openspec/specs/toolbox-launcher/spec.md` Hub dismiss/restore 与聚焦定住窗口
- [x] 4.3 `npx electron-vite build` 通过

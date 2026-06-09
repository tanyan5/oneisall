## Context

此前 `src/main/window.ts` 以单一 `BrowserWindow` 承载全部 toolbox 会话，Pin 为全局布尔状态。`pin-shortcut-navigation` 在同窗口内用 `ensureUnpinned()` 切换布局；`launcher-unpinned-multi-tool` 强制 launcher 路径 unpin。这导致：

- 定住插件 A 后，从 launcher 打开插件 B 会 unpin A 或替换 A 的视图
- 无法同时在任务栏显示多个定住插件
- 关闭定住页后 `pinned` 标志未清除，再次打开仍显示定住 chrome
- IPC 与导航栈无窗口维度，多窗口后无法正确路由

## Goals / Non-Goals

**Goals:**

- 每个定住插件独立 `BrowserWindow`，各自任务栏图标
- Hub 窗口承载所有非定住会话（launcher、shortcut 不同插件、Home 导航）
- Pin Hub 上的插件时分裂出新 Hub，不中断其他定住窗口
- shortcut/launcher 打开已定住插件 → `focusPinnedTool`
- 关闭定住窗口 → 清除登记，下次打开为非定住 Hub 会话
- IPC、导航栈、Esc 均 per-window

**Non-Goals:**

- 不改变 Pin chrome UI（SVG 控件、Ctrl+D 快捷键）
- 不改变 launcher overlay 本身的行为（除 Hub dismiss/restore 范围）
- 不支持同一插件多个定住窗口（仍为一插件一登记）
- macOS/Linux 任务栏行为（当前以 Windows 为主验证）

## Decisions

### 1. `WindowSession` + `pinnedByToolId` 双索引

```typescript
interface WindowSession {
  window: BrowserWindow
  toolId: string
  pinned: boolean
  isHub: boolean
  navStack: NavFrame[]
  // ...
}
const sessions = new Map<webContentsId, WindowSession>()
const pinnedByToolId = new Map<string, BrowserWindow>()
let hubWindow: BrowserWindow | null
```

每个窗口通过 `webContents.id` 索引；定住插件额外按 `toolId` 登记以便 `focusPinnedTool`。

**备选**：单窗口 + 虚拟任务栏 — 无法实现 Windows 多任务栏图标。

### 2. Pin 时 Hub 分裂

`togglePinForWindow` 在 Hub 上 Pin 时：
1. `session.isHub = false`，`pinnedByToolId.set(toolId, win)`
2. `hubWindow = null`，`spawnHiddenHub()` 创建新隐藏 Hub

已定住窗口 unpin 时，若当前无 Hub，可将该窗口回收为 Hub（实现中：unpin 后若 `!hubWindow` 则 `session.isHub = true; hubWindow = win`）。

### 3. 导航目标解析

`navOpenTool` 流程：
1. `focusPinnedTool(id)` — shortcut/launcher 均先尝试聚焦已定住窗口
2. 否则 `resolveUnpinnedTargetWindow(from)` → 通常 `ensureHubWindow()`
3. 在目标窗口更新 `navStack` 并 `showToolInWindow`

`navPop(forWindow)` 读取该窗口 session；若 `session.pinned` 则 no-op（Esc 不 pop）。

### 4. `navigate-tool` 携带 `pinState`

`showToolInWindow` 发送 `{ toolId, pinState }`，renderer `ToolboxShell` 在导航时 `applyPinState`，避免异步 `getPinState` 竞态导致定住 chrome 闪烁或错误。

### 5. `closeWindow` 清除 Pin 登记

Chrome 关闭调用 `ensureUnpinnedForWindow` + `hideWindow`，而非仅 hide。确保 `pinnedByToolId` 删除，下次 launcher 打开走 Hub。

`win.on('close')` 仍 `preventDefault` + hide（托盘应用惯例）；真正销毁仅在 `forceQuitAllWindows`。

### 6. `window.ts` 薄 re-export + deprecated 全局 API

保留 `getMainWindow()`、`ensureUnpinned()` 等 deprecated 包装，供未迁移调用方使用；新代码使用 `*ForWindow` 变体。

### 7. openLauncher 仅作用于 Hub

`handleOpenLauncherShortcut` 使用 `isHubVisibleWithUnpinnedPlugin()` / `getHubToolId()`，定住窗口可见时走常规 `toggleLauncher()`，不 dismiss 定住会话。

## Risks / Trade-offs

- **[Risk] 内存与窗口数量** → 定住窗口隐藏不销毁；典型用户 1–3 个定住插件，可接受
- **[Risk] Hub 分裂时短暂双窗口** → 新 Hub 隐藏创建，用户无感知
- **[Risk] deprecated API 误用** → 逐步迁移；`getMainWindow()` 回退逻辑可能选错窗口
- **[Risk] renderer Pin 状态与 main 不同步** → `window:pin-state-changed` 广播 + `navigate-tool` 携带 pinState 双保险

## Migration Plan

单 PR 部署，无数据迁移。行为变更即时生效。回滚需还原 `windowSessionManager` 并恢复单窗口 `window.ts`。

## Open Questions

（无 — 已在会话中验证通过）

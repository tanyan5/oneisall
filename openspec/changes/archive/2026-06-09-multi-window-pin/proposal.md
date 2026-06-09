## Why

`pin-shortcut-navigation` 与 `launcher-unpinned-multi-tool` 在单主窗口模型上优化了 Pin、Esc 与快捷框行为，但无法满足「多个插件同时定住、各自出现在任务栏」的真实办公场景：定住剪贴板后再从快捷框打开闪开会替换定住页；关闭定住页后再次打开仍误入定住状态；同一插件的定住会话无法与其他插件的临时会话并行。需要将窗口会话从「单主窗口 + 全局 Pin 标志」升级为「Hub 非定住会话 + 按插件登记的定住窗口」。

## What Changes

- **多窗口会话管理**：引入 `windowSessionManager`，每个 `BrowserWindow` 独立维护 `toolId`、`pinned`、`navStack`；定住插件登记在 `pinnedByToolId`，Hub 窗口专用于非定住/快捷框会话。
- **Pin 时分裂 Hub**：用户在 Hub 上 Pin 当前插件时，将该窗口转为定住窗口并自动生成新的隐藏 Hub，后续 launcher/shortcut 打开其他插件走 Hub，不影响已定住窗口。
- **聚焦已定住插件**：shortcut 或 launcher 打开某插件时，若该插件已有定住窗口，则聚焦该窗口而非新建非定住会话。
- **关闭定住页清除登记**：Chrome 关闭定住窗口时调用 `ensureUnpinnedForWindow`，清除 `pinnedByToolId` 登记，后续打开该插件使用 Hub 非定住会话。
- **按窗口 IPC**：`togglePin`、`getPinState`、`navigation:pop`、`window:hide` 等 IPC 按 `event.sender` 所属窗口处理，不再依赖全局「主窗口」。
- **导航携带 Pin 状态**：`navigate-tool` 事件携带 `pinState`，renderer 在切换工具时同步定住 chrome，避免竞态显示错误布局。
- **BREAKING**：「主窗口」语义拆分为 Hub 窗口与多个定住窗口；`openLauncher` dismiss/restore 仅作用于 Hub；`ensureUnpinned()` 全局 API 废弃，改为 per-window API。

## Capabilities

### New Capabilities

（无 — 为既有能力的架构升级）

### Modified Capabilities

- `toolbox`：多窗口 Pin 登记、Hub 会话、per-window 导航栈与 Esc、关闭定住页清除登记、任务栏多图标
- `toolbox-launcher`：快捷框打开已定住插件时聚焦定住窗口；打开其他插件走 Hub 非定住；`openLauncher` dismiss/restore 限定 Hub

## Impact

- `src/main/window/windowSessionManager.ts` — 新建，核心会话与 Pin 登记
- `src/main/window.ts` — 薄 re-export 层
- `src/main/navigation/NavigationStack.ts` — `focusPinnedTool`、`navPop(forWindow)`、Hub 目标解析
- `src/main/index.ts` — per-window IPC handlers
- `src/main/launcher/handleOpenLauncherShortcut.ts` — Hub 专用 dismiss/restore
- `src/renderer/shell/useWindowPin.ts`、`ToolboxShell.tsx` — `applyPinState`、`navigate-tool` 同步
- `openspec/specs/toolbox/spec.md`、`openspec/specs/toolbox-launcher/spec.md` — 需求更新

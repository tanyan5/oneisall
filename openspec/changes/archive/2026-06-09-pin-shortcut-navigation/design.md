## Context

OneIsAll 主窗口支持 Pin 定住模式（任务栏驻留 + WindowChrome），全局快捷键可打开剪贴板/快捷框，Esc 负责导航返回。当前实现中：

- `ToolboxShell` 无条件监听 Esc 并调用 `navigation.pop()`
- `navOpenTool(..., 'shortcut')` 总是调用 `ensureUnpinned()`，即使同一插件已 Pin 打开
- `openLauncher` 快捷键仅 `toggleLauncher()`，与主窗口插件会话无关
- 剪贴板 Enter 只复制，不关窗

用户希望 Pin 模式更「稳」（Esc 不误关）、快捷键更「智能」（同插件保持 Pin、快捷框键切换非定住会话）、剪贴板键盘流更「快」（Enter 即粘贴）。

## Goals / Non-Goals

**Goals:**

- Pin 模式下 Esc 不关闭主窗口（overlay 仍可先关）
- 同插件快捷键在已 Pin 打开时聚焦并保持 Pin
- 非定住插件打开时，`openLauncher` 先 dismiss/restore 插件会话
- 剪贴板 Enter 复制后隐藏主窗口

**Non-Goals:**

- 不改变 Pin 模式下 Chrome 关闭按钮行为（已有）
- 不改变从启动器 overlay 内打开工具时的 Pin 保留逻辑
- 不改变托盘双击/显示菜单打开启动器的行为
- 不为 Home / Settings 实现 openLauncher dismiss/restore（仅沉浸式 plugin tool 视图）
- 不改变 Pin 模式下 openLauncher 行为（Pin 窗口仍由 Chrome 关闭；openLauncher 走 overlay toggle）

## Decisions

### 1. Esc 拦截位置：Renderer + Pin 状态

在 `ToolboxShell` Esc handler 中读取 `pinState.pinned`；若为 true 且无可关闭 overlay，则 `preventDefault` 并 return，不调用 `navigation.pop()`。

**备选**：Main 进程拦截 — 拒绝，Esc 已在 renderer 统一处理 overlay 优先级，改一处即可。

### 2. 同插件快捷键：Main 进程 `navOpenTool` 分支

```typescript
// 伪代码
if (from === 'shortcut') {
  const win = getMainWindow()
  const pinned = getPinState().pinned
  if (pinned && activeToolId === id && win?.isVisible()) {
    win.focus()
    return id  // 不 ensureUnpinned，不重建 stack
  }
  ensureUnpinned()
}
```

**备选**：始终 unpin — 与用户「定住办公」诉求冲突。

### 3. openLauncher 三态逻辑：Main 进程统一入口

新增模块级状态 `dismissedUnpinnedToolId: string | null`。

替换 `ShortcutManager` 中 `openLauncher: () => toggleLauncher()` 为 `handleOpenLauncherShortcut()`：

| 条件 | 行为 |
|------|------|
| 主窗口可见 + 非 Pin + activeToolId 为 plugin | hideMainWindow，设 dismissed = activeToolId |
| 主窗口隐藏 + dismissed 有值 + launcher 不可见 | showMainWindow(dismissed)，清 dismissed |
| 其他 | toggleLauncher() |

Pin 模式或 Home/Settings 不走 dismiss 分支。

**备选**：Renderer 侧判断 — 拒绝，全局快捷键必须在 main 进程，且需读 window/pin/activeToolId。

### 4. 剪贴板 Enter 关闭：复制成功后 hide

在 `ClipboardView` Enter handler 中，`handleCopy` 成功后调用 `window.toolbox.window.hide()`（已有 IPC `window:hide`）。

仅 Enter 路径触发关窗；单击行复制、工具栏 C 键保持原样（用户可能继续浏览）。

**备选**：Enter 调用 `navigation.pop()` — 会显示 launcher，不符合「快速粘贴」；hide 更直接。

### 5. dismissed 会话与 navigation stack

Dismiss 时 **不** pop stack，保留原 stack 以便 Esc 等行为仍一致；restore 时 `showMainWindow(toolId)` 并同步 `activeToolId`。

若用户在 dismissed 期间用其他方式打开工具，清除 dismissed 状态。

## Risks / Trade-offs

- **[Risk] openLauncher 语义变化用户不适应** → 仅影响「主窗口非定住插件可见」场景；托盘/启动器路径不变；可在设置页补充说明（非本 change 范围）
- **[Risk] dismissed 状态与 Esc 返回冲突** → dismiss 不 pop stack；restore 后 Esc 仍按原 stack 返回 launcher
- **[Risk] Pin 下 Esc 无法快速退出** → 设计意图；用户用 Chrome 关闭
- **[Risk] 剪贴板 Enter 误关窗** → 仅 Enter 且复制成功时关；失败保留窗口并 toast

## Migration Plan

单 PR 部署，无数据迁移。行为变更为即时生效。若需回滚，还原 NavigationStack / ToolboxShell / Shortcut handler / ClipboardView 四处即可。

## Open Questions

（无 — 需求已由用户四点明确）

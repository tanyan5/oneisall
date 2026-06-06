## Context

- 主窗口 `frame: false`；定住前靠 `-webkit-app-region` 拖拽。
- 管理中心参考 uTools：顶栏 Logo + 搜索一行，定住后右侧窗口钮。
- 原 WindowChrome 使用 📌 emoji，Windows 下呈红色，与 UI 不符。

## Goals / Non-Goals

**Goals:**

- 快捷框返回无白闪；托盘无「隐藏」
- Ctrl+D 定住 → 任务栏 + 顶栏控制钮
- 定住 **不改** 下方内容布局（见 `home-hub-layout` 两栏）
- 窗口按钮：**SVG 线框**（`ChromeIcons`），颜色 `var(--muted)`，hover/active `var(--text)`

**Non-Goals:**

- 快捷框定住；未定住时管理中心也显示窗口钮（仅定住时显示）

## Decisions

### 1. 快捷框白屏修复

（不变：`backgroundColor: '#06080f'`、`ready-to-show` 后 `showLauncher`。）

### 2. 托盘

（不变：显示 / 设置 / 退出。）

### 3. 定住架构

定住仅叠加顶栏控制区；`home-hub-layout` 两栏 + Hub 默认页不变。

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  搜索 {count} 款插件应用...     [置顶][—][□][×]     │  ← pinned
├──────────────┬─────────────────────────────────────────────┤
│ 已安装列表   │  Hub / 插件详情 / 搜索结果                    │
└──────────────┴─────────────────────────────────────────────┘
```

未定住时顶栏仅 `[Logo] + 搜索`，无右侧窗口钮。

### 4. Window chrome 控件

| 组件 | 说明 |
|------|------|
| `ChromeIcons.tsx` | `PinTopIcon`、`MinimizeIcon`、`MaximizeIcon`、`RestoreIcon`、`CloseIcon` |
| `WindowChromeControls.tsx` | 四钮组合，复用于 `WindowChrome` 与 `HomeTopBar` |
| 置顶 | toggle `setAlwaysOnTop`；`.window-chrome-pin.active` → `color: var(--text)` |
| 关闭 hover | 红色背景 `rgba(239,68,68,0.85)`，非默认红色图标 |

**Ctrl+D**：主窗口 `togglePin`；快捷框不注册。

### 5. 表面顶栏

| 表面 | 顶栏 |
|------|------|
| 管理中心 | `mgmt-top-bar`：Logo + 搜索；pinned + `WindowChromeControls` |
| 剪贴板 | pinned：`WindowChrome` + 搜索槽；未 pinned 原顶栏 |
| 设置/其他 | pinned：`WindowChrome` 图标 + 标题 |

搜索 placeholder：`搜索 {count} 款插件应用...`（管理中心）。

### 6. IPC

（不变：`window:togglePin`、`getPinState`、`minimize`、`maximize`、`close`、`setAlwaysOnTop`、`pin-state-changed`。）

## Open Questions

（无）

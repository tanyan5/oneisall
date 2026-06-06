## Context

- `mainWindowPinned` 在 `window.ts` 中跨会话保持；用户曾 Ctrl+D 定住后，再用 `openClipboard` 快捷键仍会带 chrome + 任务栏插件图标
- `navOpenTool(id, 'shortcut')` 已区分来源，但未联动 pin 状态
- 剪贴板 `.clipboard-main` 为 `list-pane | toolbar` 横向 flex；滚动仅发生在 `list-pane`，工具栏带 `border-left` 占 48px 列
- Launcher 已有 cyber 滚动条样式（`scrollbar-width: thin` + webkit thumb）

## Goals / Non-Goals

**Goals**

- 快捷键（`shortcut` 来源）打开任意工具插件时，窗口处于**未定住**状态
- 剪贴板列表滚动条与 OneIsAll 深色 cyber UI 一致
- 工具栏浮动在列表内容区右侧、滚动条轨道左侧，不挤占独立列
- 列表默认选中首行，支持方向键浏览与工具栏快捷键

**Non-Goals**

- 改变 Launcher / Home 打开插件时的 pin 状态（用户可保持定住）
- 修改工具栏按钮功能或顺序（仅增加键盘触发）
- 钉住模式下剪贴板 chrome 合并搜索行的行为（已有 `hideTopBar`）
- 可配置/全局自定义剪贴板快捷键（固定绑定写入 UI tooltip）

## Decisions

### 1. `ensureUnpinned()` 调用点

在 `window.ts` 新增 `ensureUnpinned()`：

- 若 `mainWindowPinned` 为 true → 设为 false、`setSkipTaskbar(true)`、`syncTaskbarIcon(null)`、`broadcastPinState()`
- 在 `navOpenTool(..., 'shortcut')` 内、`showMainWindow` 之前调用
- `navOpenClipboard` 与 `ShortcutManager` 的 `openClipboard` 回调均经此路径

**备选**：在 renderer 收到 `navigate-tool` 时取消定住 — 拒绝，pin 状态由 main 进程权威管理。

### 2. 剪贴板布局结构

```
.clipboard-main (position: relative; flex: 1)
  .clipboard-list-pane (overflow-y: auto; padding-right: toolbar_gutter)
    .clipboard-list
  .clipboard-toolbar (position: absolute; right: scrollbar_gutter; top: ...; float card)
```

- `scrollbar_gutter` ≈ 10–12px（为原生/自定义滚动条留位）
- `toolbar_gutter` ≈ 56–64px（48px 工具条 + 间距）
- 工具栏 `pointer-events: auto`，列表可滚动至工具栏下方（toolbar 不阻断滚动命中）

### 3. 滚动条样式

复用 Launcher 模式，提取或复制到 `.clipboard-list-pane`：

- `scrollbar-width: thin`
- `scrollbar-color: rgba(34, 211, 238, 0.25) transparent`
- `::-webkit-scrollbar` width 6–8px，thumb 圆角半透明 cyan

### 4. 浮动工具栏视觉

- 移除 `border-left` 全高分隔
- `background: var(--surface)` 或半透明 `var(--bg)` + `box-shadow` + `border: 1px solid var(--border)` + `border-radius`
- 垂直 `top: 12px; bottom: 12px` 或 `top: 50%; transform` 居中（首选 `top/bottom` 留边距）

### 5. 列表键盘导航

`ClipboardView` 在列表区注册 `keydown`（`window` 或列表容器），满足以下条件才处理：

- 无详情/编辑/确认弹窗打开
- 焦点不在搜索 `input` / `textarea` / `contenteditable`

**选中逻辑**

- `load()` 或 `items` 变化后：若列表非空且当前 `activeId` 不在列表中 → 设为 `items[0].id`（默认第一条）
- `ArrowUp` / `ArrowDown`：在当前 `items` 中移动 `activeId` 索引 ±1，边界 clamp；**不**调用 `copyToSystem`
- 变更选中行时 `scrollIntoView({ block: 'nearest' })` 保持行可见
- `Enter`：对当前 `activeId` 执行与工具栏「复制」相同的 `handleCopy`

**与鼠标行为差异**：单击行仍立即复制；键盘仅移动高亮，Enter 才复制（避免方向键连发反复写系统剪贴板）。

### 6. 工具栏快捷键

列表区有焦点且非输入框时，使用**单字母**（无 Ctrl/Alt/Shift/Meta）触发工具栏动作，助记与英文首字母对齐：

| 快捷键 | 动作 |
|--------|------|
| `P` | 置顶 (Pin) |
| `V` | 查询详情 (View) |
| `C` | 复制 (Copy) |
| `M` | 多选 (Multi) |
| `F` | 收藏 (Favorite) |
| `X` | 删除 (delete) |
| `E` | 编辑 (Edit) |
| `S` | 另存为 (Save) |
| `L` | 清空历史 (cLear) |

实现：`CLIPBOARD_SHORTCUT_KEY_TO_ACTION` 映射；`handleToolbar(action)` 复用；`ClipboardToolbar` 的 `title` 显示如 `置顶 (P)`。搜索框/弹窗聚焦时不拦截字母键。

## Risks / Trade-offs

- **[Risk] 窄窗口工具栏遮挡列表** → `padding-right` 与 `max-width` 保证末列预览仍可读
- **[Risk] 定住后 toolbar 与 chrome 重叠** → 钉住时布局不变，仅未钉住/列表区调整；钉住时 `hideTopBar` 已有搜索并入 chrome
- **[Risk] ensureUnpinned 误伤** → 仅 `from === 'shortcut'` 触发，launcher/home/tray 不受影响
- **[Risk] 单字母与搜索框冲突** → 仅在非输入聚焦时处理；弹窗打开时禁用
- **[Risk] 键盘选中与单击复制行为不一致** → 文档化：鼠标点击即复制，键盘 Enter 复制

## Migration

无数据迁移。行为变更仅影响快捷键入口，现有用户若依赖「快捷键保持定住」需手动再按 Ctrl+D（符合产品意图）。

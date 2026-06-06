## Context

- 快捷框宽度固定 `LAUNCHER_WIDTH = 620`。
- 原实现：近期项固定宽 72px + gap，单行约 **6–7** 项；`.launcher-recent-row` 使用 `overflow-x: auto`；`.launcher-body` 始终 `overflow-y: auto`，空搜索时右侧也会出现滚动条。
- 底部 `.launcher-footer` 含 kbd 提示与 `openLauncher` 文案（已移除）。
- 数据源：`launcher:getRecent()` 合并工具箱 `recentTools` 与闪开 `recentLaunches`，按 `lastUsedAt` 排序；各源各存最多 10 条，合并后 **slice(0, 20)**。

## Goals / Non-Goals

**Goals:**

- 默认单行近期 dock，**固定显示 10 个**，无滚动条
- 超过 10 个时左上「**展开全部**」显示全部近期（grid 多行）
- 空搜索态快捷框 **右侧无纵向滚动条**
- 去掉 footer
- `resizeLauncher` 随展开/收起更新高度

**Non-Goals:**

- 改变近期排序规则
- 展开态下仍用滚动条承载近期项
- 移除键盘 ↑↓ Enter Esc 功能
- 调整各源 `recentTools` / `recentLaunches` 的独立存储上限（仍为 10）

## Decisions

### 1. 单行折叠数量 — 固定 10

使用常量 `RECENT_ROW_VISIBLE = 10`，**不**再用 `ResizeObserver` 按像素动态计算。

- 收起态：`displayRecentItems = recentItems.slice(0, 10)`
- 仅当 `recentItems.length > 10` 时显示「展开全部」
- 合并列表上限 `MAX_RECENT = 20`（`launcherMerge.ts`），使工具+应用混排后可超过 10 条

### 2. 布局 — 10 列 grid

```
收起（默认，≤10 项或仅显示前 10）:
┌──────────────────────────────────────────────────────────┐
│ [展开全部]  近期常用                                      │  ← 仅当 >10 项
│ [1][2][3][4][5][6][7][8][9][10]                          │  ← 10 列 grid，无滚动
└──────────────────────────────────────────────────────────┘

展开（>10 项）:
┌──────────────────────────────────────────────────────────┐
│ [收起]  近期常用                                          │
│ [1][2][3][4][5][6][7][8][9][10]                          │
│ [11][12]...                                              │  ← grid 自动换行，无滚动
└──────────────────────────────────────────────────────────┘
```

- CSS：`.launcher-recent-row` → `display: grid; grid-template-columns: repeat(10, minmax(0, 1fr))`
- 项宽 `width: 100%`，图标约 30px，名称 10px，适配 620px 宽度
- 展开按钮位于 `launcher-section-head` 左侧（按钮 + 标题）
- 移除 `overflow-x: auto` 与 `.launcher-recent-row--expanded` flex-wrap 方案

### 3. 移除 body 右侧滚动条（空搜索）

- 默认 `.launcher-body { overflow: hidden }`
- 有搜索词时加 `.launcher-body--scrollable { overflow-y: auto }`
- `.launcher-panel { height: auto }`（非 `height: 100%`），使 `resizeLauncher(scrollHeight)` 按内容增高，避免面板填满窗口后 body 内部滚动

### 4. 移除 footer

- 删除 `launcher-footer` DOM 与相关样式
- 键盘导航逻辑保留；不再展示底部提示

### 5. 自适应高度

- `ResizeObserver`（panel）依赖项含 `recentExpanded`
- 展开后窗口增高；近期区本身不滚动
- 搜索有结果且超 max height 时，仅 `launcher-body--scrollable` 可滚动

### 6. 键盘与展开

- 展开/收起仅影响可见近期项集合；`flatItems` 与可见项一致
- 收起时 ↑↓ 仅在前 10 个可见项间循环

## Risks / Trade-offs

- **[Risk] 展开 20 项过高** → 受 `LAUNCHER_MAX_HEIGHT` 限制；搜索列表区仍可滚动
- **[Risk] ≤10 项时无展开按钮** → 符合预期；单行已展示全部
- **[Risk] 用户不知键盘操作** → 接受移除 footer；依赖习惯

## Open Questions

（无）

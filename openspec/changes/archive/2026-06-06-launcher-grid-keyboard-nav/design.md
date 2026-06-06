## Context

- `LauncherView.tsx` 维护 `highlight` 索引与 `flatItems` 线性列表；keydown 仅处理 `ArrowUp`/`ArrowDown`（线性 ±1 循环）。
- 近期常用为 **10 列 grid**（`RECENT_ROW_VISIBLE = 10`），视觉为二维布局，线性 ↑↓ 不符合用户预期（例如第 1 项按 ↓ 会到第 2 项而非正下方第 11 项）。
- 打开快捷框时 `highlight` 已重置为 0，但需保证第一项始终有可见高亮样式。

## Goals / Non-Goals

**Goals:**

- 打开或列表变化时默认高亮 **第一项**（index 0）
- 近期 grid：**↑↓←→** 按二维位置移动高亮
- 搜索结果 / 推荐芯片：↑↓ 线性移动；←→ 在线性列表中移动 ±1（与横向 chip 布局一致）
- **Enter** 打开当前高亮项；**Escape** 关闭

**Non-Goals:**

- 方向键在搜索框内移动光标的特殊边界处理（v1 统一用于项导航，`preventDefault`）
- 跨 section 导航（近期 → 推荐）
- 展开全部按钮的键盘激活

## Decisions

### 1. 导航模式按 section 区分

| Section | 布局 | ← | → | ↑ | ↓ |
|---------|------|---|---|---|---|
| `recent` | 10 列 grid | col-1 | col+1 | row-1（index-COLS） | row+1（index+COLS） |
| `recommend` | flex wrap | index-1 | index+1 | index-COLS* | index+COLS* |
| `primary` / `secondary` | 纵向列表 | index-1 | index+1 | index-1 | index+1 |

\* 推荐区 v1 按 **线性** ±1 处理 ←→，↑↓ 同列表 ±1；与 chip 横排习惯一致。

`COLS = RECENT_ROW_VISIBLE`（10）。

### 2. Grid 边界行为

- **近期 grid**：目标 index 超出 `[0, length)` 或目标列 ≥ 当前行实际列数时 **保持不动**（不循环、不折行到下一行首列）。
- 最后一行不足 10 列时，→ 到行末停止；↓ 到末行停止。
- 收起态仅 10 项时，grid 为单行，←→ 在行内移动，↑↓ 在边界停止。

### 3. 默认选中

- `useEffect` 在 `query`、`flatItems` 变化时将 `highlight` 设为 `0`。
- `onFocus` 回调后列表 reload，同样落到 0。
- 渲染时对 `highlight === index` 应用 `.highlighted`（已有）。

### 4. 实现结构

- 抽取 `moveHighlight(direction, flatItems, section, highlight) => number` 纯函数，便于单测。
- `flatItems` 保留线性顺序（行优先，与 DOM grid 顺序一致）；grid 导航基于 `index` 与 `COLS` 换算行列。
- keydown 监听增加 `ArrowLeft`/`ArrowRight`；四项均 `preventDefault` 当成功移动或 Enter/Esc。

### 5. 搜索框焦点

- v1：方向键始终驱动项高亮（与 Raycast 类启动器一致），不用于 input 内光标移动。

## Risks / Trade-offs

- **[Risk] 搜索框无法用方向键移光标** → v1 接受；用户主要靠键盘选结果
- **[Risk] 推荐区 ←→ 与视觉折行不完全一致** → v1 线性；后续可按宽度计算列数
- **[Risk] 展开后多行近期 ↑↓ 跨行** → 严格按 10 列矩阵计算

## Open Questions

（无）

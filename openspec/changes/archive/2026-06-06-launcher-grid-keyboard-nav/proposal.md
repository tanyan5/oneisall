## Why

快捷框近期常用已改为 **10 列 grid** 单行展示，但键盘导航仍按线性列表仅支持 ↑↓ 循环，与视觉布局不一致，且打开时第一个项未明确保持选中高亮。用户希望 **默认选中第一项**，并可用 **方向键上下左右** 在可见项间移动，**回车** 打开当前高亮插件或应用。

## What Changes

- **默认选中第一项**：快捷框打开或列表变化时，高亮索引重置为 **0**（第一个可见项），并展示选中样式
- **四向方向键导航**：在近期 grid（10 列）、推荐芯片、搜索结果列表等当前可见项集合中，支持 ↑↓←→ 移动高亮；边界处停止或循环（见 design）
- **回车确认**：Enter 打开当前高亮项（工具进入主窗口插件视图，应用直接启动）
- **保留**：Escape 关闭；鼠标悬停仍可切换高亮；搜索框输入不受方向键干扰（焦点在 input 时的行为见 design）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox-launcher`：扩展键盘导航为四向 grid 感知，明确默认选中第一项

## Impact

- **Renderer**：`LauncherView.tsx`（导航状态、keydown 处理、grid 列数常量复用）
- **Specs**：`toolbox-launcher` delta（keyboard navigation requirement）

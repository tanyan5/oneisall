## Why

快捷框「近期常用」当前为可横向滚动的多列 dock，小屏下需要滑动才能看到更多项，底部快捷键提示条也占用空间。用户希望常用项默认 **单行展示 10 个**、超过 10 个时通过「展开全部」查看更多，且 **快捷框右侧不出现滚动条**，并 **去掉底部提示**。

## What Changes

- **近期常用默认单行 10 个**：空搜索时，近期插件/应用以 **10 列 grid** 单行展示，收起态最多显示 10 项（超出隐藏）
- **展开全部/收起**：近期项 **超过 10 个** 时，区域 **左上** 提供「展开全部」；点击后展示全部近期项（grid 自动换行），按钮切换为「收起」；再次点击恢复单行 10 个
- **无滚动条**：近期区域与空搜索态 `.launcher-body` 均不使用纵向/横向滚动条；展开时通过窗口自适应增高容纳内容
- **搜索态可滚动**：仅在有搜索关键词时，body 区允许纵向滚动以承载长结果列表
- **移除底部提示**：去掉快捷框底部 footer（↑↓/Enter/Esc 提示与「唤起快捷键」文案）
- **数据源**：`launcher:getRecent()` 合并上限由 10 提升至 **20**（工具 + 应用各源最多 10，合并后 slice 20），以支持「超过 10 展开」
- **保留**：搜索、固定关键字、推荐试试（无近期时）、键盘导航行为（无 footer 仍可 ↑↓ Enter Esc）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox-launcher`：近期常用单行 10 列 + 展开全部交互；空搜索无 body 滚动条；移除 footer；自适应高度配合展开

## Impact

- **Renderer**：`LauncherView.tsx`、`launcher.css`（`RECENT_ROW_VISIBLE = 10`、grid 布局、`launcher-body--scrollable`）
- **Main**：`launcherMerge.ts`（`MAX_RECENT = 20`）；`LauncherWindow.ts` 自适应高度（展开后增高，仍受 max height 约束）
- **Specs**：`toolbox-launcher` delta

## Why

剪贴板插件当前采用表格式布局（时间 / 类型 / 详细信息分列）+ 顶部独立标题与暂停按钮，信息密度低、操作分散，与参考产品（分类 Tab + 右侧竖向工具栏）的浏览与批量操作体验差距较大。需要重塑沉浸式插件主页，提升检索效率并集中常用操作。

## What Changes

### 顶部栏

- **标题与检索框合并为一行**：左侧剪贴板标识/标题，中间宽搜索框（如「检索 N 条剪贴板历史」），去掉右侧 **暂停记录** 按钮（`setPaused` IPC 保留，仅移除 UI 入口）。

### 分类 Tab 与列表

- 新增横向 Tab：**全部**、**文本**、**图片**、**文件**、**收藏**。
- 列表改为**按当前 Tab 过滤**的流式行：每行仅展示 **相对时间** + **复制内容预览**（文本摘录 / 图片缩略图 / 文件名等），去掉独立的类型列、详细信息列、行内删除按钮。
- **收藏** Tab 仅显示用户标记收藏的记录；**文本** Tab 包含 `text` 与 `html` 类型。

### 右侧竖向工具栏

- 在内容区右侧固定竖条工具栏（参考附图），自上而下 9 项功能 + **预留扩展位**：
  1. 置顶
  2. 查询详情
  3. 复制
  4. 多选
  5. 收藏
  6. 删除
  7. 编辑
  8. 另存为文件
  9. 清空剪贴板历史
- 工具栏操作作用于**当前活动行**（最后一次单击复制的行）；多选模式下删除等作用于勾选集合。
- **保留单击行即复制**（与现版一致）；多选模式下单击改为勾选。
- 图片类记录在**列表行内**展示缩略图（非独立缩略图预览页）；详情弹层查看大图。
- **一次实现**全部 9 个工具栏功能（不分期）。

### 数据与 API（新增能力）

- SQLite 扩展字段：`pinned`、`favorite`（及排序：置顶优先）。
- 新 IPC：置顶/取消置顶、收藏/取消收藏、查询详情、编辑（v1 文本/HTML）、另存为、清空历史、批量删除。
- 列表 IPC 支持 `type` / `favorite` / `tab` 过滤参数。

### 不变

- 剪贴板捕获、200 条上限、去重、写回系统剪贴板核心逻辑。
- 全局快捷键打开剪贴板入口不变。

## Capabilities

### New Capabilities

（无独立新 capability；变更归入 `clipboard`。）

### Modified Capabilities

- `clipboard`: 列表 UI（Tab 分类 + 双列时间/内容）、合并顶栏、右侧工具栏九项操作、收藏/置顶数据模型与 IPC；移除插件内暂停记录按钮。

## Impact

- **Renderer**：`ClipboardView.tsx` 重构；新建 `clipboard.css`；组件 `ClipboardToolbar`、`ClipboardDetailModal` 等
- **Main**：`ClipboardStore.ts` schema 迁移；`index.ts` 新 IPC handlers
- **Shared**：`ClipboardItem` 类型扩展 `pinned`/`favorite`；list 查询参数
- **Preload**：`toolbox.clipboard.*` API 扩展
- **Specs**：`openspec/specs/clipboard/spec.md` delta

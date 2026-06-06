## Context

- `ClipboardView`：独立 `view-header`（标题 + 暂停按钮）+ `search-bar` + 四列表格（时间/类型/详细信息/删除）。
- `ClipboardStore`：`clipboard_items` 表无 `pinned`/`favorite`；`list()` 仅支持关键字 `q`。
- 沉浸式全屏插件视图（`ToolboxShell`），无窗口级 min/max/close。
- 用户参考图：顶栏一体搜索、Tab 分类、列表「时间 | 内容」、右侧图标竖栏。

## Goals / Non-Goals

**Goals:**

- 顶栏一行：标题区 + 搜索框；移除暂停记录按钮。
- Tab：全部 / 文本 / 图片 / 文件 / 收藏；切换即过滤列表。
- 列表行：左相对时间，右内容预览（类型化渲染）；无表头分列。
- 右侧固定竖向工具栏 9 功能 + 2–3 个占位槽（disabled 或 `…`）便于扩展。
- 支持置顶排序、收藏筛选、多选批量删除、详情弹层、另存为、清空历史。

**Non-Goals:**

- 云同步、账户、通知铃铛（参考图其他元素）。
- 暂停记录 UI（API 保留，后续可进设置页）。
- 图片在线编辑；编辑 v1 限文本/HTML 条目。
- 重写捕获管线或更换数据库。

## Decisions

### 1. 布局结构

```
┌──────────────────────────────────────────────────────────┬──┐
│ [📋] 剪贴板   [ 检索 200 条剪贴板历史……………………… ]          │▲│
├──────────────────────────────────────────────────────────┤││
│ 全部 | 文本 | 图片 | 文件 | 收藏                          │││
├──────────────────────────────────────────────────────────┤││
│ 4分钟前  │  /opsx:apply …                               │││
│ 1小时前  │  [thumb]                                     │││
│ ...      │  ...                                         │▼│
└──────────────────────────────────────────────────────────┴──┘
  ↑ list scroll                           toolbar (fixed) ──┘
```

- `.clipboard-view`：`display: flex; flex-direction: column; height: 100%`
- `.clipboard-main`：`flex: 1; display: flex; min-height: 0`
- `.clipboard-list-pane`：`flex: 1; overflow-y: auto`
- `.clipboard-toolbar`：固定宽 ~48px，竖排 icon buttons

### 2. Tab 与过滤映射

| Tab | 过滤条件 |
|-----|----------|
| 全部 | 无类型过滤 |
| 文本 | `type IN ('text','html')` |
| 图片 | `type = 'image'` |
| 文件 | `type = 'files'` |
| 收藏 | `favorite = 1` |

- 搜索 `q` 与 Tab 过滤 AND 组合。
- 排序：`pinned DESC, created_at DESC`（置顶项在当前 Tab 内置顶）。

### 3. 数据模型迁移

```sql
ALTER TABLE clipboard_items ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE clipboard_items ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_clipboard_pinned ON clipboard_items(pinned, created_at DESC);
```

- `ClipboardItem` 增加 `pinned: boolean`, `favorite: boolean`。
- 启动时 `initSchema` 检测列缺失则迁移（`PRAGMA table_info`）。

### 4. 工具栏行为（一次实现全部 9 项）

| # | 图标 | 行为 | 说明 |
|---|------|------|------|
| 1 | pin | `clipboard:setPinned(id, toggle)` | 对**当前活动行**切换置顶；置顶上限 5 条 |
| 2 | eye | `ClipboardDetailModal` | 全文/元数据；图片详情显示大图（非列表缩略图） |
| 3 | copy | `copyToSystem(activeId)` | 与单击行复制同一目标 |
| 4 | check-square | 切换 `multiSelectMode` | 进入后行首 checkbox，单击改勾选 |
| 5 | star | `clipboard:setFavorite` | 切换收藏；行内显示 ★ 角标 |
| 6 | trash | `delete` / `deleteMany` | 单条或批量；需确认 |
| 7 | pencil | `clipboard:update` | 仅 text/html |
| 8 | save | `clipboard:saveAs` + dialog | 图片/文件/文本导出 |
| 9 | broom | `clipboard:clearAll` | 二次确认（建议输入「清空」） |

- **活动行**（`activeId`）：用户最后一次单击复制的行；工具栏 1–8 均作用于 `activeId`（多选时 6 作用于勾选集合）。
- 无活动行时：1–8 disabled；**多选切换**、**清空历史**始终可用。
- 底部预留 2 个 `toolbar-spacer` 占位槽（非可点击按钮）。

### 5. 列表行交互（已确认：保留单击复制）

- **单击行（非多选模式）**：立即 `copyToSystem` + toast，并设为 `activeId`（高亮 + ★/📌 角标）。
- **多选模式**：单击行切换 checkbox，**不**触发复制。
- 图片行内容区：列表内嵌**缩略图**（见 §8）；不设独立缩略图预览面板。

### 8. 列表内图片缩略图

- `list` / `getImagePreview` 为 image 类型返回 `imageDataUrl`（main 读 `payload_path` PNG → base64）或专用 IPC `clipboard:getImagePreview(id)`。
- 列表行渲染固定高度缩略图（如 48–64px），失败时回退 `[图片] WxH` 文字。
- 「查询详情」弹层可显示更大预览，与列表缩略图职责分离。

### 6. 顶栏

- 移除 `togglePause` 与 `header-actions` 暂停按钮。
- 搜索 placeholder 动态：`检索 {count} 条剪贴板历史`（`clipboard:count` 或 list length）。

### 7. IPC 扩展

```ts
clipboard.list({ q?, type?, favorite?, limit?, offset? })
clipboard.setPinned(id, pinned)
clipboard.setFavorite(id, favorite)
clipboard.update(id, { text })
clipboard.saveAs(id) // returns path or opens dialog in main
clipboard.clearAll()
clipboard.deleteMany(ids[])
clipboard.getImagePreview(id) // image → data URL for list thumbnail
```

- `saveAs`：main 进程 `dialog.showSaveDialog` + 写文件。
- `clearAll`：删除所有行及关联 payload 文件。

## Risks / Trade-offs

- **[Risk] 去掉行内删除** → 工具栏删除 + 多选批量。
- **[Risk] 单击复制与工具栏「活动行」** → 每次单击即复制并更新 `activeId`；置顶/收藏前先单击目标行即可。
- **[Risk] 列表缩略图性能** → 懒加载 / 仅图片 Tab 与可见行请求 `getImagePreview`。
- **[Risk] Schema 迁移** → 启动迁移脚本，旧数据默认 pinned/favorite=0。
- **[Risk] 编辑非文本** → 按钮对 image/files disabled。

## Migration Plan

- 自动 DB 列迁移；无用户操作。
- 移除暂停按钮不影响已有 `isPaused` 状态；后续可在设置页补暂停入口。

## Open Questions

- （已关闭）**单击交互**：保留单击复制 + `activeId` 供工具栏使用。
- （已关闭）**图片展示**：列表内嵌缩略图；详情弹层大图；无独立缩略图预览功能。
- （已关闭）**工具栏范围**：一次实现全部 9 项。

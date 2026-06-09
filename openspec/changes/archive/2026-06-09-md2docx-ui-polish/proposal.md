## Why

「Markdown 转 Word」插件已可用，但当前视图样式与 OneIsAll 沉浸式主窗口（剪贴板、闪开等工具）视觉语言不一致：硬编码颜色、独立顶栏与 shell 割裂；工具图标仍使用 `toolId` 首字母 **M** 的纯色 fallback，与 clipboard / shankai / demo 的 cyber 系列图标格格不入。更严重的是内容区设置了 `max-width: 640px` 且滚动容器在窄列上，导致垂直滚动条出现在窗口中部而非右缘，体验明显异常。

## What Changes

- **布局修复**：滚动条贴窗口右缘；内容采用「全宽滚动 + 居中限宽列」或等价结构，消除「滚动条在中间」问题。
- **视觉统一**：复用全局 CSS 变量（`--bg`、`--surface`、`--border`、`--accent`、`--muted`、`--radius`），按钮/输入/卡片与工具箱其他视图一致。
- **沉浸式 chrome 对齐**：非 pinned 时使用 `immersive-drag-strip`；pinned 时依赖 `WindowChrome`（与剪贴板/闪开一致），移除或条件隐藏插件内重复 `view-header`。
- **组件样式**：拖拽区、预设选择、成功/错误状态、最近列表改用与 shell 一致的 surface/border/hover 模式。
- **响应式**：宽窗口内容居中；窄窗口仍可读，不出现横向滚动条。
- **Cyber 图标**：为 `md2docx` 生成与内置插件一致的 cyber PNG（`plugins/md2docx/icon.png`）——中心 glyph 为 **双页 + 箭头**（左 Markdown 窄页、右 Word 宽页、中间转换箭头）；accent **琥珀 `#fbbf24`**（文档/纸质感）；替换当前字母 M fallback。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `md2docx`: 插件视图布局与视觉规范——全宽滚动、样式与主窗口一致、沉浸式 chrome 行为、cyber 系列工具图标。

## Impact

- **Renderer**：`src/renderer/plugins/md2docx/Md2DocxView.tsx`、`md2docx.css`
- **Shell（可选）**：`ToolboxShell.tsx` 若需为 md2docx 传递 pinned/hideTopBar 类 props（与 clipboard 模式对齐）
- **Icons**：`scripts/gen-icons.mjs`（新增 `drawMd2DocxGlyph`）、`plugins/md2docx/icon.png`
- **Specs**：`openspec/specs/md2docx/spec.md` 增量（若主 spec 尚未同步，delta 写在 change 内）

## Context

`Md2DocxView` 当前结构：

```
.md2docx-view (height 100%)
  header.view-header          ← 与 immersive shell 重复
  .md2docx-body (max-width 640px, overflow-y auto)  ← 滚动条在 640px 处
```

`ToolboxShell` 沉浸式布局：

```
.shell-immersive
  immersive-drag-strip | WindowChrome (pinned)
  .content-immersive (overflow hidden)
    <PluginView />
```

剪贴板通过 `hideTopBar={pinState.pinned}` 隐藏内部顶栏；闪开无独立 `view-header`，内容全宽滚动。

## Goals / Non-Goals

**Goals:**

- 滚动条在 `.content-immersive` 右缘。
- 内容区 max-width ~560–640px 居中，外层负责滚动。
- 颜色/圆角/按钮复用 `styles.css` token。
- pinned / unpinned 与 `WindowChrome`、drag strip 行为一致。
- `md2docx` 使用与 clipboard / shankai / demo 同系列的 cyber PNG 图标，消除字母 M fallback。

**Non-Goals:**

- 不改转换逻辑、IPC、预设功能。
- 不做闪开式动态背景（md2docx 保持简洁工具页）。
- 不重设计全局 shell。

## Decisions

### 1. 布局：外层滚动 + 内层居中列

```tsx
<div className="md2docx-root">           {/* height 100%, overflow-y auto */}
  {!hideTopBar && <div className="immersive-drag-strip window-drag" />}
  <div className="md2docx-inner">        {/* max-width, margin auto, padding */}
    ...controls...
  </div>
</div>
```

- **滚动**放在 `.md2docx-root`（占满 `content-immersive` 宽度）。
- **限宽**放在 `.md2docx-inner`（`max-width: 560px; margin: 0 auto`）。
- 删除 `.md2docx-body` 上的 `overflow-y` 与 `max-width`。

### 2. 移除重复顶栏

- 删除 `<header className="view-header">`。
- `ToolboxShell` 为 md2docx 传入 `hideTopBar={pinState.pinned}`（与 clipboard 相同模式）；unpinned 仅显示 `immersive-drag-strip`。
- pinned 时标题由 `WindowChrome` + `SURFACE_TITLES.md2docx` 提供（已存在）。

可选：扩展 `Md2DocxView` props：

```ts
interface Md2DocxViewProps {
  hideTopBar?: boolean
}
```

### 3. 视觉 token 映射

| 元素 | 当前 | 改为 |
|------|------|------|
| 页面背景 | 透明/继承 | `var(--bg)` 或继承 content |
| 卡片/拖拽区 | `rgba(255,255,255,0.02)` | `var(--surface)` + `var(--border)` |
| 主按钮 | 自定义渐变 | `var(--accent)` / hover `--accent-hover` |
| 次要文字 | `#94a3b8` | `var(--muted)` |
| 圆角 | 8–12px 混用 | `var(--radius)` |
| 错误 | `#f87171` | `var(--danger)` |
| 成功块 | 自定义 green rgba | surface + accent green border（与 settings 提示风格接近） |

参考 `clipboard.css`、`SettingsView` 按钮类名；能复用全局 `.btn` 类则复用，否则 md2docx 专用类但 token 一致。

### 4. 拖拽区与表单

- Drop zone：虚线 `var(--border)`，active 时 `var(--accent)` 描边 + 浅 accent 背景。
- `<select>`：与 `search-bar input` / settings 表单一致（surface、border、focus ring）。
- 最近列表：行 hover 用 `rgba(99,102,241,0.12)` 或 sidebar nav hover 同款。

### 5. ToolboxShell 改动

```tsx
if (activeId === 'md2docx') {
  return <Md2DocxView hideTopBar={pinState.pinned} />
}
```

`renderImmersiveChrome` 已覆盖 generic pinned chrome（md2docx 非 clipboard 走 default `WindowChrome` 分支）——无需额外分支。

### 6. Cyber 工具图标（双页 + 箭头，琥珀 accent）

当前 `plugins/md2docx/` 无 `icon.png`，`ToolIconService` 降级为 `toolId[0]` → **M** 纯色方块，与 cyber 系列不一致。

**决策（已确认）：**

| 项 | 选择 |
|---|---|
| Glyph | **A — 双页 + 箭头**：左窄页（`#` + 横线，Markdown）；右略宽页（横线，Word）；中间霓虹箭头 |
| Accent | **琥珀 `#fbbf24`** — 文档/纸质感，与 clipboard 青蓝、shankai 紫、demo 绿区分 |
| 产出路径 | `plugins/md2docx/icon.png`（48px，与现有内置插件一致） |
| 生成方式 | 扩展 `scripts/gen-icons.mjs`：`drawMd2DocxGlyph` + `ICON_DEFS` 条目；`node scripts/gen-icons.mjs` |

**Glyph 示意（48px 中心区域）：**

```
   ┌─┐      →      ┌──┐
   │#│              │══│
   │─│              │══│
   └─┘              └──┘
   md 页           docx 页
```

复用现有 `drawCyberBase` + `drawCornerBracket`；`ToolIconService` **无需改 API**，放置 PNG 后自动解析。

可选：`LETTER_COLORS.md2docx = '#fbbf24'`，仅作 PNG 缺失时的 fallback 色调对齐。

## Risks / Trade-offs

- **[Risk] 去掉 view-header 后 unpinned 无标题** → 依赖 sidebar 高亮 + 窗口标题；与闪开一致，可接受。
- **[Risk] 居中列过窄** → max-width 560px，与 settings 表单宽度接近。

## Migration Plan

- 纯 UI 变更，无数据迁移。

## Open Questions

| 问题 | 决策 |
|------|------|
| 是否加 subtle 背景 | v1 不加，仅用 token 统一 |
| max-width | 560px |
| md2docx icon glyph | 双页 + 箭头（A） |
| md2docx icon accent | 琥珀 `#fbbf24` |

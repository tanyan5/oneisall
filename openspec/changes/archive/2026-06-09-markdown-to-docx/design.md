## Context

OneIsAll 插件模型：`plugins/<id>/plugin.json` + 可选 `main.ts`（主进程 IPC）+ `src/renderer/plugins/<id>/`（React 视图），在 `PluginHost` 与 `ToolboxShell.PLUGIN_VIEWS` 注册。现有插件（如闪开）已建立文件选择、拖拽路径解析（`webUtils.getPathForFile`）、`shell.openPath` 等模式，可复用。

本插件需在主进程完成 Markdown → DOCX 转换，避免渲染进程直接读写磁盘，并确保打包后无需外部二进制（如 Pandoc）。

## Goals / Non-Goals

**Goals:**

- 插件 `md2docx`，名称「Markdown 转 Word」，描述「将 Markdown 文件转换为 Word 文档」。
- **输入区**：拖拽 `.md`/`.markdown` 或点击选择文件；显示当前源路径。
- **输出策略**：默认 `{basename}.docx` 与源文件同目录；可选「另存为」指定输出路径。
- **转换**：主进程读取 UTF-8 源文件，调用纯 JS 库生成 DOCX；转换过程 UI 显示 loading，禁止重复提交。
- **结果操作**：成功后可「打开文件」「打开文件夹」；失败 toast/内联错误。
- **近期**：`data/md2docx.json` 存最多 10 条 `{ sourcePath, convertedAt }`。
- **Launcher**：`launchKeywords` 含「Markdown」「转 Word」「docx」等。
- **样式**：与工具箱现有沉浸式顶栏 + 内容区一致，拖拽区有明确视觉反馈。
- **目标场景 B**：10 页以上汇报/方案类材料，默认启用「商务汇报」预设（目录 + 页码 + 正式排版）。

**Non-Goals (v1):**

- 批量转换多个文件、文件夹监视。
- 用户上传自定义 `.docx` 模板、可视化模板编辑器。
- 封面页独立设计（v1 以 TOC 页 + 正文为主；封面可 v2）。
- 图片本地路径嵌入（远程 URL 可选后续）。
- DOCX → Markdown 反向转换。
- 与剪贴板/launcher 应用级混排（仅工具级关键词）。

## Decisions

### 1. 转换库：`@mohtasham/md-to-docx`

| 方案 | 优点 | 缺点 |
|------|------|------|
| **@mohtasham/md-to-docx** | 纯 TS/JS、API 简单、专用于 MD→DOCX | 复杂扩展语法覆盖有限 |
| Pandoc | 格式最全 | 需捆绑二进制，安装包体积与打包复杂 |
| markdown-it + docx 手写 AST | 完全可控 | 开发量大，易漏 edge case |

**决策**：v1 使用 `@mohtasham/md-to-docx`。封装为 `Md2DocxConverter.convert(sourcePath, outputPath, options?)`，便于日后替换实现。长材料场景使用 `documentType: "report"` + `template`/`sections` 实现 TOC 与页码。

### 2. 目标场景与默认预设：「商务汇报」

主场景为 **10 页以上领导阅读材料**，默认 preset `business-report`：

| 属性 | 值 | 说明 |
|------|-----|------|
| 正文字体 | 微软雅黑 | 中文办公可读性 |
| 正文字号 | 12pt (`paragraphSize: 24`) | 半磅单位 |
| 行距 | 1.5 | `lineSpacing: 1.5` |
| 对齐 | 正文两端对齐 | `paragraphAlignment: "JUSTIFIED"` |
| H1 | 22pt，居中 | 文档总标题 |
| H2 | 16pt，左对齐 | 一级章节 |
| H3 | 14pt | 二级小节 |
| TOC 分级 | H1–H3 进目录，H1/H2 加粗 | `tocHeading1Bold` 等 |

UI 提供样式预设下拉，v1 仅实现「商务汇报」一项（后续可加「简洁备忘录」等）。预设 ID 与 style 配置存于 `src/main/md2docx/presets.ts`，用户上次选择持久化到 `md2docx.json`。

### 3. 目录（TOC）

库支持在 Markdown 中写 `[TOC]` 生成可点击目录。转换器行为：

1. 读取源 Markdown。
2. 提取首个 `# ` 标题作为 `documentTitle`（供页眉）；若无 H1 则用文件名（去扩展名）。
3. 若源文不含 `[TOC]`，在正文最前自动插入 `[TOC]\n\n`。
4. 配置 `toc: { title: "目 录", headingLevelRange: [1, 3] }`（H4 以下不进目录，避免过长材料目录膨胀）。

目录页单独成节：**无页码**（`pageNumbering: { display: "none" }`），目录后分页进入正文。

### 4. 页眉页脚与页码

使用 `sections` 两节结构：

```
Section 1 — 目录
  markdown: "[TOC]"
  footers: { default: null }
  pageNumbering: { display: "none" }

Section 2 — 正文
  markdown: <源文件正文（已去掉重复 [TOC]）>
  headers: { default: { text: documentTitle, alignment: "CENTER" } }
  footers: { default: { text: "— ", pageNumberDisplay: "current", alignment: "CENTER" } }
  pageNumbering: { start: 1, formatType: "decimal" }
```

页眉居中显示文档标题；页脚居中「— 3 —」样式（页码两侧短横线）。正文节 `start: 1` 使目录不计入页码或目录单独不计数——目录无页码，正文从 1 起。

若源文已含 `[TOC]`，仍拆为两节：第一节仅 TOC，第二节为剩余正文。

### 5. 转换入口示例

```ts
import { convertMarkdownToDocx } from '@mohtasham/md-to-docx'

const preset = getPreset('business-report')
const { tocMarkdown, bodyMarkdown, documentTitle } = prepareSections(rawMd, sourcePath)

const blob = await convertMarkdownToDocx('', {
  documentType: 'report',
  style: preset.style,
  toc: preset.toc,
  template: preset.template,
  sections: [
    {
      markdown: tocMarkdown,
      footers: { default: null },
      pageNumbering: { display: 'none' },
      type: 'NEXT_PAGE'
    },
    {
      markdown: bodyMarkdown,
      headers: { default: { text: documentTitle, alignment: 'CENTER' } },
      footers: {
        default: { text: '— ', pageNumberDisplay: 'current', alignment: 'CENTER' }
      },
      pageNumbering: { start: 1, formatType: 'decimal' }
    }
  ]
})
```

### 6. 数据模型 `md2docx.json`

```ts
type Md2DocxPresetId = 'business-report'  // v1 only

interface Md2DocxRecentEntry {
  sourcePath: string
  convertedAt: number
}

interface Md2DocxData {
  recent: Md2DocxRecentEntry[]  // max 10, newest first
  presetId: Md2DocxPresetId     // default 'business-report'
}
```

路径：`%APPDATA%/OneIsAll/data/md2docx.json`（dev 为 `OneIsAll-dev`）。

### 7. 输出路径规则

```ts
function defaultOutputPath(sourcePath: string): string {
  const { dir, name } = path.parse(sourcePath)
  return path.join(dir, `${name}.docx`)
}
```

用户点击「另存为」时 `dialog.showSaveDialog`，filters: `[{ name: 'Word', extensions: ['docx'] }]`，默认文件名同上。

### 8. IPC

```
md2docx:pickSource() → string | null
md2docx:pickOutput(defaultPath: string) → string | null
md2docx:convert({ sourcePath, outputPath?, presetId? }) → { ok: true, outputPath } | { ok: false, error: string }
md2docx:getPreset() → Md2DocxPresetId
md2docx:setPreset(presetId) → void
md2docx:openFile(outputPath) → void        // shell.openPath
md2docx:revealInFolder(outputPath) → void  // shell.showItemInFolder
md2docx:listRecent() → Md2DocxRecentEntry[]
md2docx:resolveDroppedFile(file) → string  // preload webUtils.getPathForFile
```

`convert` 成功时写入 recent；同路径重复转换更新 `convertedAt` 并置顶。

### 9. 插件结构

```
plugins/md2docx/
  plugin.json
  main.ts              # Md2DocxPlugin IPC
src/main/md2docx/
  Md2DocxStore.ts      # recent + preset persistence
  Md2DocxConverter.ts  # conversion wrapper + section split
  presets.ts           # business-report style/toc/template
  prepareSections.ts   # [TOC] inject, H1 extract, body split
src/shared/md2docx.ts  # shared types
src/renderer/plugins/md2docx/
  Md2DocxView.tsx
  md2docx.css
```

`PluginHost` 注册 `Md2DocxPlugin`（与 `ShankaiPlugin` 同级 import）。

### 10. Renderer 布局

```
┌─ 顶栏（window-drag）Markdown 转 Word ─────────────┐
│  样式预设：[ 商务汇报 ▼ ]  （含目录与页码）         │
│  ┌─ 拖拽区 ─────────────────────────────────┐   │
│  │  拖入 .md 文件，或 [选择文件]              │   │
│  │  当前：D:\docs\Q2-report.md                │   │
│  └───────────────────────────────────────────┘   │
│  输出：D:\docs\Q2-report.docx  [另存为…]          │
│  [ 转换为 Word ]                                  │
│  ── 最近转换 ──                                   │
│  • Q2-report.md  (2026-06-09)                    │
└───────────────────────────────────────────────────┘
```

转换成功后显示结果条 +「打开文件」「打开文件夹」按钮。

### 11. 拖拽与校验

- 复用闪开模式：`dragover` 设 `dropEffect: copy`，drop 时 `resolveDroppedFile`。
- 扩展名校验：`.md`、`.markdown`（大小写不敏感）。
- 非法文件：内联提示，不清空已有有效选择。

### 12. plugin.json

```json
{
  "id": "md2docx",
  "name": "Markdown 转 Word",
  "version": "1.0.0",
  "description": "将 Markdown 文件转换为 Word 文档",
  "launchKeywords": [
    {
      "id": "md2docx-main",
      "label": "Markdown 转 Word",
      "actions": [{ "id": "open", "label": "打开工具" }]
    }
  ]
}
```

## Risks / Trade-offs

- **[Risk] 转换库语法覆盖不全** → 文档说明 v1 支持常见语法；复杂 GFM/插件语法可能降级为纯文本。
- **[Risk] 大文件阻塞主进程** → v1 同步转换 + loading；超大文件（>5MB）可后续改 worker。
- **[Risk] 输出文件已存在被覆盖** → 转换前可选确认（v1 直接覆盖，与多数 CLI 行为一致）。
- **[Risk] 路径含特殊字符** → 使用 Node `fs` 与 Electron dialog 原生路径，不做手动编码。

## Migration Plan

- 新插件与数据文件，无迁移。
- 新增 npm 依赖 `@mohtasham/md-to-docx`，随应用一起打包。

## Resolved Questions

| 问题 | 决策 |
|------|------|
| 主要阅读场景 | **B — 10 页以上长材料** |
| 目录 | v1 默认生成，源文无 `[TOC]` 时自动插入 |
| 页码 | 目录页无页码；正文页脚居中「— N —」，从 1 起 |
| 页眉 | 居中显示首个 H1 标题 |
| 中文字体 | 商务汇报预设：微软雅黑 + 层级字号 |
| 图片相对路径 | v1 不嵌入本地图片 |
| 覆盖确认 | v1 静默覆盖 |

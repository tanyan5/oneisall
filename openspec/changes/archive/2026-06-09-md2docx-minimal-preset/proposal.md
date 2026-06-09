## Why

「Markdown 转 Word」目前仅提供「商务汇报」预设，面向领导长材料（目录、页眉页脚、分节）。用户还有另一类需求：笔记、方案草稿、轻量文档——希望 **按 Markdown 原样** 转成清新、干净的 Word，**不插入目录页、不强制分节**，由 Word 根据排版自然分页。缺少这一预设会让工具在「正式汇报」与「日常写作」之间缺少选择。

## What Changes

- **新增预设「极简风」**（id：`minimal-clean`）：UI 样式下拉可选；选择持久化到 `md2docx.json`。
- **单节连续文档**：不生成 `[TOC]` 目录页、不插入 `NEXT_PAGE` 分节符、无页眉页脚、无页码；整份 Markdown 正文一次转换，Word 按页面高度与样式 **自动分页**。
- **清新排版**：微软雅黑、适中字号、左对齐正文、适度行距与段间距；保留 Markdown 标题层级与列表结构，不做汇报式居中大标题等强化。
- **与商务汇报并存**：默认仍为「商务汇报」；两种预设语义与输出结构不同，UI 需区分说明（极简风不含目录/页码）。
- **转换器重构（小）**：预设携带 `layout` 策略（`report-sections` vs `continuous`），由 `Md2DocxConverter` 按策略组装 `Options`。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `md2docx`：新增「极简风」样式预设及连续文档转换行为；预设选择与 UI 文案随预设变化。

## Impact

- **Main**：`src/main/md2docx/presets.ts`、`Md2DocxConverter.ts`、`prepareSections.ts`（或等价 layout 分支）
- **Shared**：`src/shared/md2docx.ts`（`Md2DocxPresetId`、标签、预设描述）
- **Renderer**：`Md2DocxView.tsx`（下拉选项与预设说明文案）
- **Store**：`Md2DocxStore` 已支持 preset id 持久化，需接受新 id
- **Specs**：`openspec/changes/md2docx-minimal-preset/specs/md2docx/spec.md`（delta）

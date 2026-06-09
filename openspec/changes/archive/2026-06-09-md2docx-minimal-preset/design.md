## Context

`md2docx` 当前仅注册 `business-report` 预设。`Md2DocxConverter` 固定使用两节 `sections`：第一节 `[TOC]`（无页码），第二节正文（页眉标题 + 页脚页码）。`prepareSections` 始终注入 `[TOC]`。

用户需要第二种输出模式：**连续单节**、无目录/页眉页脚/分节，Markdown 原样排版，Word 自然分页。

## Goals / Non-Goals

**Goals:**

- 新增 `minimal-clean` 预设与清新 typography
- 连续文档转换路径：单节、无 TOC、无 headers/footers/pageNumbering
- UI 下拉展示两种预设及差异化说明
- 预设 id 持久化（已有 store 机制）

**Non-Goals:**

- 第三套以上预设、用户自定义模板
- 极简风下仍自动生成目录（用户可在 Markdown 手写 `[TOC]`——v1 不特殊处理，按库默认行为；若源无 `[TOC]` 则不生成目录页）
- 修改商务汇报预设行为
- 导出 PDF 或其它格式

## Decisions

### 1. 预设模型：增加 `layout` 字段

在 `Md2DocxPreset` 增加：

```ts
layout: 'report-sections' | 'continuous'
```

| Preset id | layout | 说明 |
|-----------|--------|------|
| `business-report` | `report-sections` | 现有两节 + TOC + 页眉页脚 |
| `minimal-clean` | `continuous` | 单节正文，无页 chrome |

`getPreset` / `listPresets` 不变；converter 按 `layout` 分支。

### 2. 连续模式转换选项

`continuous` 路径：

```ts
const bodyMarkdown = stripTocMarker(rawMd) // 去掉用户自写 [TOC]，不注入

const options: Options = {
  documentType: 'document',  // 非 report，避免库侧 report 默认行为
  style: preset.style,
  // 不传 toc、不传 sections、不传 template pageNumbering
}

await convertMarkdownToBuffer(bodyMarkdown, options)
```

**不**使用 `sections` 数组（避免 `NEXT_PAGE` 分节）。**不**设置 `pageNumbering`、`headers`、`footers`。Word 引擎按页面尺寸与段落样式自动分页——满足「根据排版自动分割页」。

### 3. 极简风 typography（`MINIMAL_CLEAN_STYLE`）

清新、轻量，与商务汇报对比：

| 属性 | 商务汇报 | 极简风 |
|------|----------|--------|
| `paragraphAlignment` | JUSTIFIED | LEFT |
| `heading1Alignment` | CENTER | LEFT |
| `lineSpacing` | 1.5 | 1.25 |
| `paragraphSpacing` | 200 | 120 |
| `headingSpacing` | 240 | 180 |
| `titleSize` / H1 | 44 | 36 |
| `heading2Size` | 32 | 28 |
| `heading3Size` | 28 | 24 |
| `paragraphSize` | 24 | 22 |
| `fontFamily` | 微软雅黑 | 微软雅黑 |

不设 `toc` 配置（continuous 路径不使用）。

### 4. `prepareSections` 职责调整

保留 `prepareSections` 供 `report-sections` 使用。新增 `prepareContinuousBody(rawMd, sourcePath)` 或参数化：

```ts
prepareMarkdownForPreset(rawMd, sourcePath, layout)
```

- `report-sections` → 现有 `{ tocMarkdown, bodyMarkdown, documentTitle }`
- `continuous` → 仅 `stripTocMarker(rawMd)`，不生成 tocMarkdown

### 5. UI 文案

`MD2DOCX_PRESET_DESCRIPTIONS`：

```ts
{
  'business-report': '含目录与页码，适合领导阅读',
  'minimal-clean': '连续排版，无目录页码，清新简洁'
}
```

下拉 option：`{label}（{description}）`，替换当前硬编码「含目录与页码」。

### 6. 共享类型

```ts
export type Md2DocxPresetId = 'business-report' | 'minimal-clean'
```

Store 校验：未知 id 回退 `business-report`。

## Risks / Trade-offs

- **[Risk] 用户 Markdown 含 `[TOC]`** → `stripTocMarker` 移除标记；连续模式不渲染目录页（符合极简语义）
- **[Risk] `documentType: 'document'` 与库版本差异** → 实现时对照 `@mohtasham/md-to-docx` README；若无效则省略，仅靠不传 sections/toc
- **[Risk] 两预设输出差异大，用户误选** → UI 描述文案 + 预设持久化降低重复选择成本

## Migration Plan

- 无数据迁移；旧 `md2docx.json` 中 `business-report` 仍有效
- 若 JSON 被手动改为非法 id，store 回退默认预设

## Open Questions

| 问题 | 决策 |
|------|------|
| 极简风默认对齐 | 左对齐正文与标题 |
| 是否保留源文件 `[TOC]` | 连续模式 strip，不生成目录 |
| 预设 id 命名 | `minimal-clean` |

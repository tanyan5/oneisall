## Why

用户经常需要将 Markdown 笔记、方案、复盘等材料转为 Word（`.docx`）呈报领导阅读。领导侧典型场景是 **10 页以上的长材料**，需要目录便于跳转、页码便于打印/批注，且排版应接近正式汇报而非开发者笔记。OneIsAll 作为桌面工具箱，适合提供「选文件 → 按领导阅读样式转 docx → 打开输出」的闭环能力。

## What Changes

- 新增内置插件 **Markdown 转 Word**（`id: md2docx`），在侧边栏与主页工具网格中与其他工具并列。
- **输入**：用户通过文件选择器或拖拽选择一个 `.md` / `.markdown` 文件；可选指定输出路径，默认与源文件同目录、同名 `.docx`。
- **转换**：主进程读取 Markdown 内容，调用纯 JS 转换库生成 `.docx`；支持常见 Markdown 语法（标题、段落、列表、粗体/斜体、代码块、链接、引用、表格）。
- **领导阅读样式（默认）**：内置「商务汇报」预设——微软雅黑、层级字号、1.5 倍行距、正文两端对齐；适合 10 页以上长材料扫读。
- **目录（TOC）**：转换时自动生成可点击目录页（基于 Markdown 标题结构）；源文件未写 `[TOC]` 时由转换器自动插入。
- **页码**：正文节页脚显示阿拉伯数字页码（如「— 3 —」）；目录页不显示页码；页眉显示文档标题（取自 Markdown 首个 `#` 标题）。
- **输出**：转换成功后展示结果路径，并提供「打开文件」「打开所在文件夹」操作；失败时展示可读错误信息。
- **近期记录**：可选记住最近转换的源文件路径（最多 10 条），便于重复转换。
- **Launcher 联动**：注册 `launchKeywords`，可通过全局启动器搜索「Markdown」「转 Word」等关键词打开本工具。

## Capabilities

### New Capabilities

- `md2docx`: Markdown 文件选择与拖拽、主进程转换、领导阅读样式预设、自动 TOC、页眉页脚页码、输出路径策略、成功/失败反馈、近期记录与 Launcher 关键词注册。

### Modified Capabilities

- （无）本变更不修改现有 toolbox、launcher 等 spec 级行为，仅新增插件。

## Impact

- **plugins/md2docx/**：`plugin.json`、可选 `main.ts`（IPC 与转换逻辑）
- **Main**：`Md2DocxPlugin`、转换服务、文件对话框 IPC
- **Renderer**：`Md2DocxView.tsx`、`md2docx.css`
- **Preload**：`toolbox.md2docx.*` API
- **Shared**：转换请求/结果类型
- **Dependencies**：新增 Markdown→DOCX 纯 JS 库（如 `@mohtasham/md-to-docx` 或等价方案）
- **注册**：`PluginHost`、`ToolboxShell.PLUGIN_VIEWS`、`SURFACE_TITLES`

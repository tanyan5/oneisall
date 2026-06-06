## Why

`add-tool-icons` 落地后，内置插件与导航图标由 `scripts/gen-icons.mjs` 生成纯色方块占位，识别度低且与闪开「赛博网格」视觉语言不一致。需要换成带图案的赛博风图标，提升主页、侧边栏与 Launcher 的扫视体验与品牌感。

## What Changes

- **替换内置图标资源**：`plugins/clipboard`、`shankai`、`demo` 的 `icon.png` 改为赛博风图案（非纯色）。
- **替换导航图标**：`resources/nav/home.png`、`settings.png` 改为同套赛博视觉。
- **图标生成管线**：升级 `scripts/gen-icons.mjs`（或等价脚本）从 SVG 模板/程序化图案输出 48×48 PNG，便于后续调整。
- **可选文档**：在 README 或脚本注释中简述内置图标风格约定（深色底、霓虹描边、网格/扫描线元素）。
- **不变**：`ToolIconService`、IPC、`LazyIcon` 加载逻辑不改；仍使用现有 `icon.png` 路径约定。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `toolbox`: 内置插件与 Shell 导航图标须为可识别的赛博风图案资源，非纯色占位。

## Impact

- **Assets**：`plugins/*/icon.png`、`resources/nav/*.png`；可选 `scripts/icons/*.svg` 源文件
- **Scripts**：`scripts/gen-icons.mjs`
- **Docs**：`README.md` 插件图标说明（风格一句）
- **无 API / IPC / UI 组件变更**

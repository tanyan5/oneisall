## Why

插件页面、沉浸式顶栏与 Windows 任务栏的图标来源不一致：未钉住时剪贴板顶栏使用 emoji，钉住时 `WindowChrome` 曾用 `SURFACE_TITLES` emoji，而任务栏已通过 `syncTaskbarIcon` 切换为插件 `icon.png`。用户难以在任务栏与页面之间识别同一工具，且剪贴板内置图标质量不足。

## What Changes

- **钉住任务栏图标**：沉浸式插件视图钉住（Ctrl+D）时，任务栏/窗口图标切换为当前插件的 `plugins/<id>/icon.png`；管理中心与未钉住时恢复 O 环品牌标
- **沉浸式顶栏图标**：`ToolboxShell` 的 `WindowChrome` 左上角显示与任务栏相同的插件图标（`LazyIcon` + `getCachedToolIcon`），不再使用 emoji
- **剪贴板未钉住顶栏**：`ClipboardView` 自建顶栏标题区使用同一插件图标路径，与钉住后 `WindowChrome` 一致
- **剪贴板图标重绘**：`gen-icons.mjs` 重绘 `drawClipboardGlyph`（板 + 夹 + 叠卡），重新生成 `plugins/clipboard/icon.png`

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox`：钉住模式下任务栏与沉浸式 chrome 显示插件图标；默认品牌仍为 O 环
- `clipboard`：顶栏标题区使用插件 PNG 图标，禁止 emoji 占位

## Impact

- **Main**：`window.ts`（`syncTaskbarIcon`、`setToolIconPathResolver`）、`ToolIconService.getIconFilePath`
- **Preload / types**：`window:syncTaskbarIcon` IPC
- **Renderer**：`ToolboxShell.tsx`、`ClipboardView.tsx`、`window-chrome.css`、`clipboard.css`
- **Scripts**：`gen-icons.mjs`（`drawClipboardGlyph`）
- **Resources**：`plugins/clipboard/icon.png`

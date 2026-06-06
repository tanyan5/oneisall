## Why

主页、侧边栏、Launcher 与闪开模块内的入口目前以文字为主（闪开虽有图标逻辑但 `.lnk` 等目标常显示占位符），视觉识别弱。统一在**所有工具入口**展示图标，可提升扫视效率与界面一致性。

## What Changes

- **主页**：工具卡片显示插件图标（名称与描述保留）。
- **侧边栏**：「主页」、各插件、「设置」导航项显示图标 + 文字。
- **Launcher**：近期列表与搜索结果行显示图标——插件用 `tools:getIcon`，闪开应用用增强后的 `shankai:getIcon`（含 `targetPath`）。
- **闪开**：修复应用图标提取（`.lnk` 解析真实目标后再取图标）。
- **插件清单**：`plugin.json` 可选 `icon` 字段；内置插件附带 `icon.png`。
- **图标 API**：`tools:getIcon(toolId)`；复用/增强 `shankai:getIcon(targetPath)`；Launcher preload 桥接图标获取。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `toolbox`: 插件 manifest 可选 `icon`；Shell 侧边栏展示工具图标。
- `toolbox-home`: 主页卡片须展示工具图标。
- `toolbox-launcher`: 列表项（近期与搜索）须展示插件/应用图标。
- `shankai`: 应用快捷方式须可靠显示目标程序图标（含 `.lnk`）。

## Impact

- **plugins/**：内置 `icon.png`；`plugin.json` 扩展
- **Main**：`ToolIconService`；`ShankaiLauncher` `.lnk` 图标解析
- **Renderer**：`HomeView`、`ToolboxShell`、侧边栏样式；`LauncherView`；`ShankaiView`
- **Preload**：`toolbox.tools.getIcon`；`launcher.getToolIcon` / `launcher.getAppIcon`（或等价统一 API）

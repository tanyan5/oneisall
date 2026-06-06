## Why

从主窗口 Esc 回快捷框时会出现短暂白屏闪烁。托盘「隐藏」使用率低。用户希望主窗口支持 **Ctrl+D 定住**（任务栏 + 自定义标题栏）。管理中心顶栏需 Logo 与搜索同一行；窗口控制按钮使用与深色 UI 一致的 **SVG 线框图标**（非 emoji 置顶钮）。

## What Changes

- **快捷框**：`backgroundColor`、`ready-to-show`，消除白闪
- **托盘**：移除「隐藏」
- **定住（Ctrl+D）**：任务栏可见 + 顶栏窗口控制（置顶、最小化、最大化、关闭）
- **管理中心顶栏**：`mgmt-top-bar` 始终显示 Logo+搜索；**仅定住时**右侧显示 `WindowChromeControls`
- **Window chrome**：`ChromeIcons` + `WindowChromeControls` SVG 图标；置顶激活为浅色高亮，非红色 emoji
- **沉浸式插件**：定住时剪贴板搜索并入 chrome 行

## Capabilities

### Modified Capabilities

- `toolbox`：定住模式、SVG 窗口 chrome、托盘精简
- `toolbox-launcher`：无白闪；水母按钮「打开管理中心」

## Impact

- **Renderer**：`WindowChrome.tsx`、`WindowChromeControls.tsx`、`ChromeIcons.tsx`、`HomeTopBar`（`mgmt-top-bar`）
- **Main / Preload**：`window:*` IPC、`shell:getBrandIcon`

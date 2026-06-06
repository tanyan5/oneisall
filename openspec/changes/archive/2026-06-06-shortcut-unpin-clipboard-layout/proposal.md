## Why

全局快捷键（如 Ctrl+Shift+V 打开剪贴板）应直接进入**未定住**的插件页面，便于快速使用后 Esc 回到快捷框；若沿用上次 Ctrl+D 定住状态，会出现任务栏图标、窗口 chrome 与预期不符。剪贴板列表区滚动条仍为系统默认样式，与 cyber 主题不一致；右侧工具栏占独立列且位于滚动条外侧，布局生硬，需改为滚动条左侧的浮动工具条。打开剪贴板后无默认选中行，无法用方向键快速浏览，工具栏九项操作也缺少键盘触发方式。

## What Changes

- **快捷键打开插件时强制取消定住**：`from === 'shortcut'` 的导航（含 `openClipboard` 全局快捷键）在展示主窗口前清除 pin 状态（`skipTaskbar`、隐藏 `WindowChrome`、恢复 O 环任务栏图标），展示插件自建顶栏
- **剪贴板列表滚动条**：`.clipboard-list-pane` 使用与 Launcher / Home 一致的细窄自定义滚动条（透明轨道、半透明 accent thumb）
- **剪贴板浮动工具栏**：工具栏从 flex 侧栏改为叠在列表区域右侧、位于滚动条**左侧**的浮动面板（圆角、阴影/描边），列表保留右侧内边距避免内容被遮挡
- **剪贴板键盘操作**：打开或有可见列表时默认高亮第一条；`↑`/`↓` 移动选中行（不自动复制）；`Enter` 复制当前行；单字母 `P/V/C/M/F/X/E/S/L` 对应工具栏九项功能（搜索框/弹窗聚焦时不拦截）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox`：全局快捷键打开工具时清除 pin 模式
- `clipboard`：列表滚动条样式；浮动工具栏；列表键盘导航与工具栏快捷键

## Impact

- **Main**：`window.ts`（`ensureUnpinned` / 导航钩子）、`NavigationStack.ts`、`index.ts`（快捷键回调）
- **Renderer**：`ClipboardView.tsx`、`ClipboardToolbar.tsx`、`clipboard.css`（布局、scrollbar、toolbar float、keydown）
- **Specs**：`toolbox`、`clipboard` delta

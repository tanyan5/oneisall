## Why

OneIsAll 当前品牌呈现不一致：任务栏使用 Electron 默认图标，托盘为赛博狮子头；主页与快速启动器的交互模式偏「传统桌面应用」，与工具箱「快捷键唤起 → 选工具 → 进入」的心智不符。需要统一名称与图标，并重塑主页（插件目录 + 说明预览）与 Launcher（横排近期、点击外部关闭、水母入口）体验。

## What Changes

### 品牌与图标统一

- 统一应用显示名称为 **OneIsAll**（窗口标题、托盘提示、打包 `productName` 等保持一致）。
- 任务栏 / 窗口 / 安装包图标与托盘赛博狮子头同源（生成 `icon.ico` 等多尺寸资源，`electron-builder` 配置引用）。
- 扩展 `scripts/gen-icons.mjs`（或等价脚本）输出 Windows 应用图标。

### Launcher（快速启动浮层）

- 浮层失去焦点或用户点击浮层外区域时**自动关闭**（恢复 blur/outside-click 关闭行为）。
- 无搜索词时「近期常用」改为**横向排列**（图标 + 名称），不显示插件/应用说明与类型副标题。
- 搜索栏**右侧**增加「水母呼吸灯」荧光图标按钮；点击后关闭 Launcher 并打开主窗口**主页**。

### 主页与 Shell

- 主窗口**全程不显示**最小化 / 最大化 / 关闭按钮（无边框；关闭窗口通过 **Esc 逐层退出** 或托盘，不用标题栏按钮）。
- 点击「打开」或从 Launcher 进入插件后，**全屏展示该插件页面**，隐藏侧边栏与其他插件列表，不与其他插件并列显示。
- **Esc 逐层关闭**：先关浮层/下拉（若有）→ 插件/设置页退回主页 → 主页隐藏窗口到托盘；Launcher 内 Esc 关闭浮层（已有）。
- 侧边栏**移除**顶部「主页」导航项；保留插件列表与底部「设置」。
- 主页改为**左右分栏**：左侧为插件列表（与侧边栏同步选中）；右侧预览区**第一行**展示插件说明，**第二行**展示该插件的**快捷启动关键字**（可点击）；点击关键字展开**功能下拉列表**（含插件定义动作与「固定到搜索框」）；另提供**「打开」**按钮进入插件视图。
- **固定到搜索框**：用户可将某关键字固定到 Launcher 搜索框区域，下次唤起快速启动时以芯片/快捷项显示，便于一键检索或执行。
- **托盘右键菜单**仅保留「设置」与「退出」；移除「打开主窗口」「打开剪贴板」「暂停/恢复剪贴板」等项（打开主页改由双击托盘或 Launcher 水母等入口）。
- Launcher 水母按钮等入口仍落点主页分栏视图。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `toolbox`: 统一应用图标与名称；主页无边框 window chrome；侧边栏去掉「主页」项；`plugin.json` 可选快捷启动关键字与功能定义。
- `toolbox-home`: 主页 master-detail；预览区说明 + 关键字行 + 功能下拉 + 打开按钮。
- `toolbox-launcher`: 点击外部关闭；近期横排无说明；水母按钮打开主页；展示用户固定的搜索框关键字。
- `toolbox-settings`: 托盘菜单仅设置 + 退出。

## Impact

- **Main**: `tray.ts`（精简菜单）、`window.ts`（frameless）、`LauncherWindow.ts`（blur 关闭）、`index.ts`（`launcher:openHome` IPC）
- **Renderer**: `ToolboxShell.tsx`、`HomeView.tsx`（master-detail）、`LauncherView.tsx` + `launcher.css`、新 `JellyfishHomeButton` 组件
- **Assets**: `resources/icon.ico`、`gen-icons.mjs`
- **Build**: `package.json` `build.win.icon`
- **Preload**: `launcher.openHome`；settings/launcher 读取固定关键字
- **Settings**: `settings.json` 持久化 `pinnedSearchKeywords`
- **plugins/**: 内置插件补充 `launchKeywords` 示例
- **Specs/README**: 入口与 UI 描述更新

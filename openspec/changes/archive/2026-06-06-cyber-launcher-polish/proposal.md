## Why

OneIsAll 快速启动浮层（Launcher）在 `redesign-shell-launcher` 后功能完整，但视觉仍偏通用深色面板，与托盘狮子头、插件赛博图标及闪开「赛博网格」风格不一致；固定 440px 高度在近期项较少时中间留白过大，新用户无近期记录时空状态冷清，难以形成使用习惯。需要在不改变唤起/关闭/搜索核心行为的前提下，强化赛博风、做内容自适应布局，并增加**品牌识别**与**空状态导流**，让 Launcher 既「眼前一亮」又更容易被反复使用。

## What Changes

### 档 1 — 视觉与布局基底

- **赛博视觉升级**：霓虹青/紫配色、微网格/扫描线背景、发光描边，与品牌赛博语言对齐。
- **呼吸灯边框**：面板外框持续柔和脉冲光晕（breathing glow）。
- **自适应高度**：根据近期项、固定关键字、推荐区、搜索结果动态收缩或扩展浮层高度；保留最小/最大高度上限。
- **底部快捷键栏**：通栏布局，**kbd chip** 样式，并从设置读取**真实** `openLauncher` 快捷键显示。
- **搜索框**：command 风格（`>` 前缀）+ 明确中文 placeholder + 赛博 `::placeholder` 样式。

### 档 2 — 眼前一亮 & 提高使用频率

- **极简品牌顶栏**：搜索区上方仅展示**小狮子标**（与托盘 `resources/tray` 同源），无长文案标题；配合轻量入场动效（scale + glow，约 150ms，每会话一次）。
- **空状态导流（推荐 + 引导固定关键字）**：无近期记录且搜索为空时，展示**内置工具推荐 chip**（如剪贴板、闪开、演示）可一键打开；并显示引导文案/ghost chip，提示用户从主页预览「固定到搜索框」以在 Launcher 显示关键字快捷项。
- **近期横排 dock 感**：空搜索时近期项 neon 底座与选中脉冲，工具/应用角标区分（青/紫点），强化展台感。
- **搜索区 command 感**：focus 时边框扫光，强化「指挥台」心智。

### 不变

- 全局快捷键、blur/Esc 关闭、水母回主页、固定关键字数据模型、横排近期、两级搜索、直接打开工具/应用等行为逻辑不改。
- 不做首次安装托盘气泡（留待后续 change）。
- 不做 Launcher 主题切换。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `toolbox-launcher`: 赛博风视觉、呼吸边框、自适应高度、极简狮子顶栏、空状态推荐与固定关键字引导、command 搜索框、动态快捷键底栏、入场微动效。

## Impact

- **Renderer**：`LauncherView.tsx`、`launcher.css`；可选 `LauncherBrandMark` 组件（狮子标）；推荐工具列表来自已有 `getSearchItems` / 内置 enabled tools
- **Main**：`LauncherWindow.ts`（`resizeLauncher` + IPC）
- **Preload**：`launcher:resize`；footer 需读取 shortcuts — 复用 `settings:get` 或轻量 `launcher:getShortcuts` IPC
- **Assets**：顶栏狮子标复用 `resources/tray/tray-32.png` 或内联 SVG（与 gen-icons 同源）
- **Docs**：`README.md` Launcher 空状态与固定关键字引导一句（可选）

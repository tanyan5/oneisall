## Why

用户经常在桌面、开始菜单和安装目录之间寻找要打开的软件。OneIsAll 已有全局快速启动器，但缺少按个人习惯**分类管理本机应用**并一键打开的能力。「闪开」以极简积木模块主页承载用户自建分类，并与 Launcher 近期列表混排，实现「分类浏览 + 键盘直达」两条路径。

## What Changes

- 新增内置插件 **闪开**（`id: shankai`），侧边栏与主页与其他工具并列。
- **积木模块主页**：用户创建命名模块（分类），在每个模块内通过文件选择器或**从桌面拖入**添加 `.exe` / `.lnk`；模块为毛玻璃卡片；背景可在「赛博网格」与「Aurora 流光」两套主题间随时切换并持久化。
- **多模块叠层**：模块菜单与应用删除控件在多层模块布局下须保持可点击，不被相邻模块遮挡。
- **全局互斥**：同一 `targetPath` 只能属于一个模块；添加冲突时可**移动到其他模块**。
- **模块管理**：模块可重命名；**非空模块禁止删除**（须先移除其中全部应用）。
- **应用条目**：模块内展示图标 + 名称；单击启动；删除需确认；改路径须删后重加（无启动参数）。
- **排序**：模块内应用按 `createdAt` 降序；模块按 `order` 排列。
- **Launcher 联动（方案 A）**：`Ctrl+Shift+Space` 空搜索「近期常用」混排最多 10 条**工具箱插件 + 闪开应用**（按 `lastUsedAt`）；搜索时插件与应用混合模糊匹配；选应用直接启动，选插件打开主窗口对应视图。
- 数据持久化：`%APPDATA%/OneIsAll/data/shankai.json`；启动失败可读 toast。

## Capabilities

### New Capabilities

- `shankai`: 模块 CRUD、应用快捷方式 CRUD/移动、互斥校验、图标提取、一键启动、近期启动记录供 Launcher 消费。

### Modified Capabilities

- `toolbox-launcher`: 近期列表与搜索扩展为插件 + 闪开应用混排；应用项直接启动行为。

## Impact

- **plugins/shankai/**：`plugin.json`、`main.ts`
- **Main**：`ShankaiStore`、`ShankaiLauncher`、IPC；`SettingsStore` 或 shankai 内 `recentLaunches` 与工具 recent 合并供 Launcher
- **Renderer**：`ShankaiView.tsx`（模块积木 UI + AI 背景）、`shankai.css`
- **Launcher**：`LauncherView.tsx`、`LauncherWindow` IPC、`searchTools` 或新合并搜索
- **Preload**：`toolbox.shankai.*`（含 `resolveDroppedFile`）；launcher 桥接扩展
- **数据**：`data/shankai.json`

## Why

管理中心（原 Home）目前仅为「侧栏选工具 + 单插件预览」，信息密度低。用户需要类似插件中心的浏览体验：进入时默认看到公告、公益与推荐等内容；顶栏 Logo 与搜索同一行；点击左侧插件后才显示详情。

## What Changes

- 主页更名为 **管理中心**，快捷框水母按钮进入
- **两栏布局**：左（已安装插件应用列表）/ 右（主内容区）
- **默认主内容**：公告、公益、近期常用、推荐等（`HomeHubPanel`），**不**默认选中第一个插件
- **选中插件后**：右侧显示该插件详情（`HomeView`：说明、关键字、打开）
- 顶栏 **`mgmt-top-bar`**：应用 Logo + 搜索框同一行；定住时右侧追加窗口控制按钮
- 左栏标题：`已安装插件应用 ({count})`；搜索 placeholder：`搜索 {count} 款插件应用...`
- 搜索：fuzzy 过滤（与快捷框同一目录）；有搜索词时主内容区显示命中列表
- 公告 v1 本地 JSON；公益位 v1 本地 `promo.json`，`PromoProvider` 预留远程拉取
- 与 `pin-window-chrome-polish` 协作：定住仅叠加顶栏按钮，正文布局不变

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox-home`：两栏管理中心、顶栏 Logo+搜索、Hub 默认内容、插件详情按需展示、公告与公益位

## Impact

- **Main**：`AnnouncementProvider`、`PromoProvider`、`home:*` IPC、`shell:getBrandIcon`
- **Renderer**：`HomeTopBar`（`mgmt-top-bar`）、`HomeHubPanel`、`HomeView`、`ToolboxShell`
- **Resources**：`announcements.json`、`promo.json`
- **Settings**：`dismissedAnnouncementIds`、`dismissedPromos`、`showPromo`
- **Launcher**：水母按钮文案「打开管理中心」

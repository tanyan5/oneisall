## 1. Management center layout shell

- [x] 1.1 `HomeTopBar` / `mgmt-top-bar`：Logo + 搜索同一行，placeholder `搜索 {count} 款插件应用...`
- [x] 1.2 两栏：`ToolboxShell` 左栏已安装列表 + 右栏主内容（非三栏）
- [x] 1.3 默认 `previewToolId = null`，进入显示 `HomeHubPanel`
- [x] 1.4 点击左侧插件 → 右栏 `HomeView` 详情；搜索 → `HomeSearchResults`
- [x] 1.5 左栏标题 `已安装插件应用 ({count})`；Logo 点击回 Hub

## 2. Search catalog IPC

- [x] 2.1 `home:getSearchCatalog`
- [x] 2.2 fuzzy 过滤左栏 + 主内容搜索结果
- [x] 2.3 preload + `index.d.ts`
- [x] 2.4 `shell:getBrandIcon` 顶栏 Logo

## 3. Hub panel

- [x] 3.1 `HomeHubPanel` + `home-hub.css`（替代 `HomeRightRail`）
- [x] 3.2 近期常用、推荐、公告、公益、固定关键字、快捷提示
- [x] 3.3 无数据模块隐藏；Hub 内点插件 → 预览非直接打开

## 4. Announcements

- [x] 4.1 `AnnouncementProvider`
- [x] 4.2 IPC `home:getAnnouncements` / `dismissAnnouncement`
- [x] 4.3 `dismissedAnnouncementIds`
- [x] 4.4 Hub 公告卡片 UI

## 5. Promo / 公益位

- [x] 5.1 `PromoProvider` + `PromoItem`
- [x] 5.2 v1 本地 `promo.json`
- [x] 5.3 v2 远程拉取 stub + 缓存
- [x] 5.4 IPC + settings
- [x] 5.5 Hub 公益单卡

## 6. Naming & launcher

- [x] 6.1 水母按钮 / 文案「管理中心」
- [x] 6.2 Esc 回快捷框；回管理中心清除插件选中

## 7. Integration with pin-window-chrome-polish

- [x] 7.1 定住时顶栏右侧 `WindowChromeControls`，Logo+搜索行不变
- [x] 7.2 定住前后主内容布局一致

## 8. Verification

- [x] 8.1 进入管理中心 → 两栏 + Hub 默认，无插件详情
- [x] 8.2 点击插件 → 详情；搜索过滤正常
- [x] 8.3 公告/公益 dismiss；`npm run build` 通过

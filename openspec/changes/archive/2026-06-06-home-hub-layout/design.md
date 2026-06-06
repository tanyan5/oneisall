## Context

- 快捷框承担「快速唤起」；**管理中心**经水母按钮进入，适合浏览、公告、公益与插件发现。
- 已定：定住仅叠加顶栏窗口按钮，正文布局不变（见 `pin-window-chrome-polish` design §3）。
- 用户确认：**两栏**（非三栏）；默认不展示插件详情；点击左侧项才显示详情。

## Goals / Non-Goals

**Goals:**

- 管理中心两栏：左（已安装）/ 右（Hub 或插件详情或搜索结果）
- 默认右侧为 **Hub**（公告、公益、近期、推荐、固定关键字引导、快捷提示）
- 顶栏 Logo + 搜索合成一行（参考 uTools 管理中心截图）
- 公益位长远 **远程拉取**；v1 本地 JSON，`PromoProvider` 接口预留

**Non-Goals:**

- 三栏布局（已废弃）
- 进入即选中第一个插件并展示详情
- 虚假插件数量（`count` 必须为真实可搜总数）
- 快捷框内展示公告或公益卡
- v1 第三方广告 SDK

## Decisions

### 1. 两栏布局（管理中心）

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  搜索 {count} 款插件应用...          [置顶][—][□][×] │  ← 定住时右侧窗口钮
├──────────────┬─────────────────────────────────────────────┤
│ 已安装插件   │  主内容区                                    │
│ 应用 (count) │  默认：HomeHubPanel（公告/公益/推荐…）        │
│              │  选中插件：HomeView 详情                      │
│ 插件列表     │  搜索中：HomeSearchResults                    │
│ + 设置       │                                              │
└──────────────┴─────────────────────────────────────────────┘
```

- **顶栏 `mgmt-top-bar`**：圆形应用 Logo（点击回 Hub 默认页）+ 全宽搜索；定住时 `WindowChromeControls` 追加右侧。
- **左栏**：标题 `已安装插件应用 ({count})`；`tool-nav` 列出已启用工具；搜索时过滤并显示匹配闪开应用。
- **右栏（主内容）**：
  - 无搜索、无选中 → `HomeHubPanel`
  - 点击左侧插件 → `HomeView` 预览（图标、说明、关键字、打开）
  - 有搜索词 → `HomeSearchResults`
- **不默认选中**：`previewToolId` 初始为 `null`；Esc/Logo/水母回管理中心时清除选中。

### 2. Hub 模块（`HomeHubPanel`，网格卡片）

| 模块 | 优先级 | 数据源 | 空状态 |
|------|--------|--------|--------|
| **公告** | P1 | `AnnouncementProvider` | 无则隐藏 |
| **公益位** | P1 | `PromoProvider` | 无则隐藏 |
| **近期常用** | P1 | `home:getRecent` | 无则隐藏 |
| **推荐试试** | P2 | `RECOMMENDED_TOOL_IDS` | 无则隐藏 |
| **固定关键字引导** | P2 | settings pinned keywords | 有则 chips，无则短提示 |
| **快捷提示** | P3 | settings shortcuts | 常驻 |

原则：无内容不占位。Hub 内点击插件 → 选中并显示 `HomeView`（非直接打开沉浸式）。

### 3. 公告与公益

（同 v1 设计：本地 JSON、`dismissedAnnouncementIds`、公益单卡、远程拉取预留。展示位置由右栏第三列改为 **主内容区 Hub**。）

### 4. 与快捷框分工

| | 快捷框 | 管理中心 |
|--|--------|----------|
| 目的 | 秒开、键盘流 | 浏览、公告、公益、插件详情 |
| 入口 | 全局快捷键 | 水母按钮 |
| 公告/公益 | ✗ | ✓（Hub 默认） |

### 5. IPC

```ts
home:getSearchCatalog() => { items, count }
home:getRecent() => LauncherRecentRow[]
home:getAnnouncements() / dismissAnnouncement
home:getPromo() / dismissPromo
shell:getBrandIcon() => data URL  // 顶栏 Logo
```

## Risks / Trade-offs

- **[Risk] Hub 内容过多** → 主内容区 `overflow-y: auto`，卡片网格 `auto-fill`
- **[Risk] 远程 promo 安全** → HTTPS only、缓存 fallback

## Migration Plan

- 已实现：`HomeRightRail` 合并为 `HomeHubPanel`；三栏改两栏；命名「管理中心」

## Open Questions

（无）

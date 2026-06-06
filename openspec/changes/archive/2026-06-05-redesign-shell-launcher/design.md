## Context

- 托盘图标：赛博狮子头（`resources/tray/`），任务栏仍为 Electron 默认图标（`package.json` 未配置 `win.icon`）。
- 主窗口：标准 `frame: true`，有关闭→隐藏托盘逻辑。
- Launcher：`frame: false`，`blur` 当前**不**关闭；近期列表为纵向行 + 描述 + 类型标签。
- 主页：`HomeView` 卡片网格，侧边栏含「主页」项，点击卡片直接进入插件。

## Goals / Non-Goals

**Goals:**

- 任务栏 / 安装包 / 托盘同源狮子头品牌图标（`icon.ico`）。
- Launcher：外部点击与失焦关闭；近期横排（图标+名）；搜索栏右侧水母呼吸灯 → 打开主页。
- 主页：无边框、无标题栏按钮；左右分栏（列表 + 说明 + 关键字 + 打开）；侧边栏去掉「主页」。
- 插件/设置：**沉浸式全屏**（隐藏侧边栏与插件列表），无 min/max/close；Esc 退回上一层。
- 插件快捷启动关键字可固定到 Launcher 搜索框。
- 名称统一 OneIsAll。

**Non-Goals:**

- macOS / Linux 打包图标（可后续）。
- 任何视图的最小化/最大化/关闭标题按钮（统一 Esc + 托盘）。
- Launcher 搜索有词时的横排（仅空搜索近期改横排；搜索结果可保持列表）。

## Decisions

### 1. 应用图标

- `gen-icons.mjs` 从 `tray-48` 或专用 `app-256` 绘制输出 `resources/icon.ico`（含 16/32/48/256）。
- `package.json` → `build.win.icon: resources/icon.ico`。
- 开发模式：`app.dock` 不适用；Windows 用 `BrowserWindow` `icon` 选项指向同一 `icon.ico`。
- 托盘继续用 `tray-16.png`（与 ico 同源）。

### 2. 主窗口 chrome 与 Esc 栈

- 主窗口 `frame: false`，**不实现**自定义最小化/最大化/关闭按钮（任何路由均无标题栏控件）。
- 关闭主窗口：主页按 **Esc** → `hide()` 到托盘；系统关闭按钮行为仍拦截为 hide（`window.on('close')`）。
- **Esc 逐层关闭**（主窗口 renderer 统一 `useEscapeStack`）：

| 层级（先处理） | Esc 行为 |
|----------------|----------|
| 打开的下拉菜单 / 关键字 popup | 关闭 popup |
| 插件视图或设置视图 | 退回 `home` 概览（恢复侧边栏 + master-detail） |
| 主页概览 | 隐藏主窗口到托盘 |

- Launcher 独立窗口：Esc 关闭 Launcher（不变）。
- 从 Launcher/托盘直达某插件时：直接进入沉浸式插件视图（无侧边栏）。

### 3. 沉浸式插件视图

- `activeId !== 'home'` 且非 settings 预览态时：`ToolboxShell` **不渲染** `sidebar`；`content` 100% 宽高展示插件 React 视图。
- 设置页同理：进入设置时全屏设置视图，无侧边栏（从主页或 Esc 返回）。

### 4. 主页 master-detail（仅 `activeId === 'home'`）

```
┌──────────┬─────────────────────────────┐
│ sidebar  │ HomeView                     │
│ plugins  │ ┌────────┬────────────────┐ │
│ settings │ │ list   │ 说明行1        │ │
│ (footer) │ │ icons  │ 关键字行2 ▼    │ │
│          │ │        │ [打开]         │ │
│          │ └────────┴────────────────┘ │
└──────────┴─────────────────────────────┘

打开插件后 → 侧边栏与左列表均隐藏：

┌──────────────────────────────────────┐
│         PluginView (fullscreen)       │
└──────────────────────────────────────┘
```

- 左侧列表可与 sidebar 联动：点 sidebar 插件 → 若未「打开」可只高亮；点 Home 内列表 → 更新 preview。
- v1 简化：**侧边栏点插件仍直接进入插件**；Home 内列表仅用于 preview + 打开。或统一：侧边栏点插件在 Home 时只选中 preview，需点打开才进入——用户明确要求「点击左侧插件，右侧展示说明并添加打开按钮」，指 Home 区域左侧列表。侧边栏保留快捷进入：设计为侧边栏点击仍直接打开插件，Home 内左栏为浏览态。  
- **修订（对齐用户）**：用户说「左侧插件应用列表保留去掉上面的主页栏」——指 Shell 侧边栏去掉主页，侧边栏列表点击应在右侧展示说明而非直接进入。即 **侧边栏 + Home 合并为同一 Shell**：侧边栏选插件 → 右侧 preview；点「打开」→ `activeId` 切到插件视图。

最终交互：

| 操作 | 结果 |
|------|------|
| 打开主窗口 | `activeId = 'home'`，右侧 preview 默认选第一项 |
| 侧边栏点插件 | `homeSelectedToolId` 更新，右侧 preview，**不**进入插件 |
| Preview 点「打开」 | `activeId = toolId`，沉浸式全屏插件（无侧边栏） |
| 侧边栏点设置 | 沉浸式全屏设置（无侧边栏） |
| 插件/设置内 Esc | 退回 `home` 概览 |
| 主页 Esc | 隐藏窗口到托盘 |

- 侧边栏不再有 home 按钮；品牌区点击可回 Home overview（仅主页态可见品牌栏）。

### 5. 托盘右键菜单

- 上下文菜单**仅两项**：`设置`、`退出`（中间可无分隔线或保留一条分隔线，按 UI 微调）。
- **移除**：打开主窗口、打开剪贴板、暂停/恢复剪贴板。
- **保留非菜单入口**：双击托盘图标 → 显示主窗口主页（可选，与 README 一致）；单击仅显示菜单（Windows 默认右键/左键行为按平台惯例）。
- `createTray` 不再依赖 `ClipboardWatcher` 重建菜单；暂停剪贴板改由剪贴板插件内或设置页控制（若已有则不变，仅去托盘入口）。
- 托盘「设置」→ `showMainWindow('settings')` 沉浸式设置页。

### 6. Launcher 关闭

- `LauncherWindow.ts`：`on('blur')` → `hideLauncher()`（debounce 50ms 避免子菜单误关）。
- 可选：`setIgnoreMouseEvents` 全屏透明层——v1 仅用 blur + 点击 document 外（blur 已覆盖）。

### 7. 近期横排

- `.launcher-recent-row`：`display: flex; flex-direction: row; gap: 8px; overflow-x: auto`。
- 每项：纵向图标+名称，固定宽度 ~72px，无 `description` / `kind` 行（应用与工具仅图标区分或角标）。

### 8. 水母按钮

- 组件 `JellyfishHomeButton.tsx`：CSS `@keyframes` 呼吸荧光（cyan/purple glow pulse）。
- 简化为抽象水母/发光圆点 SVG + `box-shadow` 动画。
- 点击：`window.launcher.openHome()` → IPC `launcher:openHome` → `hideLauncher()` + `showMainWindow()`（home）。

### 9. activeId 模型

- 保留 `home` 作为 overview 路由。
- `home` 时渲染 sidebar + `HomeView` master-detail。
- `activeId` 为插件 id 或 `settings` 时仅渲染对应全屏视图。

### 10. 快捷启动关键字与固定到搜索框

**数据模型**（`plugin.json` 可选 `launchKeywords`）：

```json
"launchKeywords": [
  {
    "id": "clipboard-main",
    "label": "剪贴板",
    "actions": [
      { "id": "open", "label": "打开工具" },
      { "id": "search", "label": "搜索历史" }
    ]
  }
]
```

- `ToolMeta` / IPC `tools:list` 携带解析后的 `launchKeywords`。
- 内置插件提供示例关键字；无定义时预览区第二行可隐藏或仅显示工具名。

**主页预览区布局**：

1. **第一行**：`description`（无则版本/占位）。
2. **第二行**：关键字 chip 列表；点击 chip 打开下拉菜单。
3. 下拉项 = 该关键字的 `actions` + 分隔线 + **「固定到搜索框」**。
4. 选择 action：v1 可映射为「打开插件并带意图」（如 `open` → 打开工具；`search` → 打开工具并聚焦搜索——插件内后续扩展）；最小实现：`open` 等同打开按钮，其余 action 记录 TODO 或打开插件。
5. 选择「固定到搜索框」：写入 `SettingsStore.pinnedSearchKeywords`（`{ toolId, keywordId, label }[]`，上限如 8 条，去重）。

**Launcher 搜索框固定项**：

- 搜索输入下方或内部左侧显示 pinned chips（图标可选 + 关键字 label）。
- 点击 chip：将关键字填入搜索框并触发搜索，或直接执行该关键字默认 `open` action（v1：填入搜索框并过滤 Launcher 结果）。
- IPC：`launcher:getPinnedKeywords` / `settings:pinKeyword` / `settings:unpinKeyword`（或合并到 settings get/save）。

**UI 组件**：`KeywordChipDropdown.tsx`（主页预览复用）。

## Risks / Trade-offs

- **[Risk] blur 关闭与 Launcher 内交互** → debounce；Esc 仍可用。
- **[Risk] 无边框窗口拖拽** → 明确 drag 区域。
- **[Risk] 侧边栏不再一键进插件** → 多一次「打开」；符合用户预览需求。
- **[Risk] ICO 生成零依赖** → gen-icons 写多尺寸 PNG 嵌入 ICO 结构，或 dev 依赖 `png-to-ico` 脚本；优先纯 Node ICO writer。

## Migration Plan

- 无数据迁移。
- README 更新入口与主页交互说明。

## Open Questions

- 关键字 action 的深层插件意图（如剪贴板「搜索历史」）v1 先打开插件，后续由各插件注册 handler。
- 插件内部若已有 Esc 绑定（如 Launcher 式列表），需约定是否优先消费 Esc 或仅在没有内部弹层时冒泡到 Shell（v1：插件无弹层时 Esc 退回主页）。

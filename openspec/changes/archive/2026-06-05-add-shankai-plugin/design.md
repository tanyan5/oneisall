## Context

OneIsAll 插件：`plugins/<id>/` + `PluginHost` + `ToolboxShell.PLUGIN_VIEWS`。全局 Launcher 已有插件级 `recentTools`（`settings.json`）与模糊搜索（`tools:list`）。

「闪开」是首个用户自建结构化数据插件，并与 Launcher 打通应用级近期与搜索。

## Goals / Non-Goals

**Goals:**

- 插件 `shankai`，名称「闪开」，描述「电脑软件快捷启动」。
- **极简积木主页**：仅模块卡片 +「新建模块」虚线块；无顶栏长文案、无页内全局搜索（搜索交给 Launcher）。
- **模块**：`id`, `name`, `order`, `createdAt`；可重命名；**非空不可删**。
- **应用**：`id`, `moduleId`, `name`, `targetPath`, `createdAt`；`targetPath` **全局唯一**；冲突添加时提供**移到当前模块**。
- **展示**：模块内每个应用显示**图标 + 名称**；模块内按 `createdAt` 降序。
- **添加**：模块内 `[+]` → `dialog` 选 `.exe`/`.lnk`；或从桌面/资源管理器**拖拽** `.exe`/`.lnk` 到目标模块（`webUtils.getPathForFile`）；默认名称为文件名（去扩展名）。
- **叠层与交互**：多模块 flex 布局下，打开 `⋯` 菜单或 hover 应用 `×` 时抬高当前模块 `z-index`；菜单 `z-index` 高于邻块；点击菜单外关闭；页面 `overflow-y: auto`。
- **启动**：`.lnk` → `shell.openPath`；`.exe` → `spawn` detached；无 `args`。
- **删除应用**：hover `×` + 确认；改路径 = 删后在该模块重加。
- **近期**：每次成功启动写入 `recentLaunches`；Launcher 与 `recentTools` **混排共 10 条**按 `lastUsedAt`。
- **Launcher 搜索**：插件（name/description）+ 全部闪开应用（name）混合两级结果；条目带类型标签「工具」「应用」；应用 → `launch` 后隐藏 Launcher；插件 → 现有 `openTool` 流程。
- **AI 感背景（双主题可切换）**：用户可在闪开页随时切换 **赛博网格（cyber-grid）** 与 **Aurora 流光（aurora）**；偏好持久化；v1 纯 CSS 动画，无 Canvas。

**Non-Goals (v1):**

- 开始菜单扫描、UWP、工作目录、启动参数。
- 模块拖拽排序（`order` 按创建递增即可）。
- 应用重命名 UI（删后重加或 v2）。
- 闪开页内全局搜索条。

## Decisions

### 1. 数据模型 `shankai.json`

```ts
interface ShankaiModule {
  id: string
  name: string
  order: number
  createdAt: number
}

interface ShankaiShortcut {
  id: string
  moduleId: string
  name: string
  targetPath: string  // globally unique
  createdAt: number
}

interface ShankaiRecentLaunch {
  kind: 'app'
  shortcutId: string
  lastUsedAt: number
}

// settings recentTools entries remain kind: 'tool', id: pluginId
// Launcher merges both sources, sort by lastUsedAt, slice(0, 10)

// top-level in shankai.json
theme: 'cyber-grid' | 'aurora'  // default 'aurora'
```

### 2. 模块删除规则

`removeModule(id)` 前检查 `shortcuts.filter(s => s.moduleId === id).length === 0`；否则返回错误「请先移除模块内全部应用」。

### 3. 移动应用

`moveShortcut({ shortcutId, toModuleId })` 或 add 时 `forceMove: true`：更新 `moduleId`，保留 `createdAt` 或刷新为移动时间（建议刷新以便在新模块置顶）。

添加重复 `targetPath` 时 UI：

```
该应用已在「游戏」中
[ 取消 ]  [ 移到本模块 ]
```

### 4. 主页布局

```
┌─ AI background ─────────────────────────────────┐
│  [模块: 办公  +]  [模块: 游戏  +]  [+ 新建模块] │
│   icon+name 行    icon+name 行                   │
└─────────────────────────────────────────────────┘
```

- 模块标题可点击重命名（inline 或 micro modal）。
- 模块 `⋯`：重命名、删除（仅当空）。
- 新建模块：默认名「未命名模块」，立即可用。

### 5. Launcher 混排近期

IPC `launcher:getRecent` 返回统一项：

```ts
type LauncherRecentItem =
  | { kind: 'tool'; id: string; name: string; lastUsedAt: number }
  | { kind: 'app'; shortcutId: string; name: string; iconPath: string; lastUsedAt: number }
```

空搜索第一节标签仍为「近期常用」，内容混排。

搜索：`searchLauncherItems(query)` 合并 tool scores + app name scores，再 `splitSearchResults` 逻辑分 primary/secondary。

### 6. IPC（闪开）

```
shankai:listModules() / createModule / renameModule / removeModule
shankai:listShortcuts(moduleId?) 
shankai:addShortcut({ moduleId, targetPath }) → shortcut | conflict
shankai:moveShortcut({ shortcutId, toModuleId })
shankai:removeShortcut(id)
shankai:launch(id) → { ok, error? }
shankai:getIcon(targetPath) → data URL
shankai:pickTarget() → path | null
shankai:resolveDroppedFile(file) → path   // preload webUtils.getPathForFile
shankai:listAllShortcuts()  // for launcher search
```

### 7. 拖拽添加入口

- 每个模块块监听 `dragover` / `drop`；仅接受 `Files` 类型。
- `dropEffect: copy`；拖入时模块高亮（`shankai-module--drop-target`）。
- 取第一个文件路径 → 复用 `addShortcut` 与冲突「移到本模块」流程。
- 与 `+` 文件选择器并列，不替代。

### 8. 多模块叠层（菜单 / 删除可点）

- 模块 `position: relative; overflow: visible`。
- 打开 `⋯` 菜单：`shankai-module--menu-open` → `z-index: 50`；菜单 `z-index: 100`。
- hover 应用行：`:has(.shankai-app:hover)` 抬高模块 `z-index: 40`；应用 `×` 在 tile 内 `z-index: 20`。
- 点击菜单外（document mousedown）关闭菜单。
- 根容器 `overflow-y: auto`，避免下拉被父级裁切。

### 9. 视觉主题（双套可切换）

持久化字段：`shankai.json` → `theme: 'cyber-grid' | 'aurora'`（默认 `aurora`）。

切换控件：闪开页右上角极简切换器（两枚 pill / 图标按钮），**即时生效**，无需重启。

根容器 class：`shankai-root shankai-theme-{cyber-grid|aurora}`。

| 层 | 共用 |
|----|------|
| 模块卡 | `rgba(255,255,255,0.04)` + `backdrop-blur(12px)` + 细发光描边 |
| 应用格 | 图标 32–40px + 12px 名称，hover 轻微 lift + 外圈光晕 |

**赛博网格 `cyber-grid`**

| 层 | 处理 |
|----|------|
| 基底 | `#06080f` 深蓝黑 |
| 网格 | 透视/等距细线网格，`opacity ~0.08`，可选慢速 `background-position` 漂移 |
| 点缀 | 低饱和青色 (`#22d3ee`) 扫描线或节点高光，稀疏 |
| 气质 | 硬朗、科技、偏 Matrix / HUD |

**Aurora 流光 `aurora`**

| 层 | 处理 |
|----|------|
| 基底 | `#0a0c14` |
| 光晕 | 2–3 个大面积 `radial-gradient`（紫 `#6366f1`、品红 `#a855f7`、青 `#06b6d4`），`opacity` 低 |
| 动画 | 渐变中心缓慢位移 / 缩放（15–25s 周期） |
| 气质 | 柔和、流体、偏 AI 助手氛围 |

**无障碍**：`prefers-reduced-motion: reduce` 时两套均退化为**静态渐变 + 静态网格**，保留主题色差异。

**IPC**：`shankai:getTheme()` / `shankai:setTheme(theme)` 或在 `getSettings` 一并返回；切换时写盘。

## Risks / Trade-offs

- **[Risk] Launcher 复杂度上升** → 统一 `LauncherItem` 类型与单一路由 `onSelect(item)`。
- **[Risk] 混排近期驱逐** → 纯 LRU 10 条，行为可预期。
- **[Risk] 背景动画耗电** → `prefers-reduced-motion` 时静态渐变。
- **[Risk] 路径失效** → 卡片角标 + 启动 toast；Launcher 仍列出但启动报错。

## Migration Plan

- 新文件 `shankai.json`，无迁移。
- Launcher 行为变更：依赖本变更与 `add-shankai-plugin` 同期发布。

## Resolved Questions

| 问题 | 决策 |
|------|------|
| 添加方式 | 文件选择器 + 拖入模块 |
| 编辑路径 | 删后重加 |
| 模块内排序 | `createdAt` 降序 |
| Launcher | 方案 A，混排 10 条 |
| 启动参数 | 无 |
| 删模块 | 禁止删除非空模块 |
| 重复应用 | 可移到其他模块 |
| 应用展示 | 图标 + 名称 |
| 背景主题 | 赛博网格 / Aurora 可随时切换并持久化 |

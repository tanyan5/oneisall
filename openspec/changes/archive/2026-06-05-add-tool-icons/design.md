## Context

- 主页、侧边栏、Launcher 列表目前仅文字；闪开 `getFileIcon` 对 `.lnk` 效果差。
- 本变更统一图标服务，四处 UI 复用同一主进程解析逻辑。

## Goals / Non-Goals

**Goals:**

- 内置插件 `clipboard`、`shankai`、`demo` 提供 `plugins/<id>/icon.png`。
- `plugin.json` 可选 `"icon"`；缺省尝试 `icon.png`；再 fallback 首字母圆标。
- `tools:getIcon(toolId)` → data URL（插件图标）。
- 增强 `shankai:getIcon(targetPath)`（`.lnk` → `readShortcutLink` → 目标 exe 图标）。
- **主页** `HomeView`：48px 图标 + 名称 + 描述。
- **侧边栏** `ToolboxShell`：每项 20–24px 图标 + 标签；内置「主页」「设置」使用宿主静态图标资源。
- **Launcher** `LauncherView`：每行左侧 24–32px 图标；`kind: tool` → `tools:getIcon`；`kind: app` → `shankai:getIcon(targetPath)`；保留「工具/应用」类型标签。
- 主进程 `Map` 缓存 path/id → dataURL。

**Non-Goals:**

- 用户自定义闪开应用图标。
- SVG 插件图标（v1 PNG）。
- 托盘菜单图标（可后续）。

## Decisions

### 1. 插件图标来源（不变）

manifest `icon` → `icon.png` → 首字母 fallback。

### 2. IPC 表面

```
tools:getIcon(toolId) → string | null

shankai:getIcon(targetPath) → string | null   // 行为增强

// Launcher preload（委托主进程已有 handler）
launcher.getToolIcon(toolId) → string | null
launcher.getAppIcon(targetPath) → string | null
```

搜索/近期条目中的 app 项须携带 `targetPath`（`buildLauncherSearchItems` / `getMergedLauncherRecent` 已具备或补齐）。

### 3. `.lnk` 图标解析

```ts
if (ext === '.lnk') {
  const link = shell.readShortcutLink(targetPath)
  if (link.target && fs.existsSync(link.target)) iconPath = link.target
}
return app.getFileIcon(iconPath, { size: 'large' })
```

### 4. 侧边栏布局

```
[🏠] 主页
[📋] 剪贴板
[⚡] 闪开
...
[⚙] 设置
```

CSS：`.tool-nav-item` flex row，`gap: 10px`；`.tool-nav-icon` 20×20。

内置路由图标：`home`、`settings` 使用 `src/renderer/assets/nav/home.png` 等。

### 5. Launcher 行布局

```
[icon]  Steam          应用
[icon]  剪贴板         工具
```

`.launcher-item` 改为 flex；图标懒加载 + 内存缓存（renderer Map）。

### 6. 共享组件（可选）

提取 `ToolIcon` / `LazyIcon` 小组件，供 Home、Sidebar、Launcher 复用加载与 fallback 逻辑。

## Risks / Trade-offs

- **[Risk] Launcher 打开时批量拉图** → 懒加载 + 缓存；仅可见行优先（v1 全部懒加载可接受）。
- **[Risk] 侧边栏变宽** → 图标 20px，padding 微调。
- **[Risk] readShortcutLink 仅 Windows** → 与闪开一致。

## Migration Plan

- 无数据迁移。

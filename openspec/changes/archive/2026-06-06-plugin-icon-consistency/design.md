## Context

- 品牌 O 环已在 `brand-o-ring-logo` 落地；托盘与未钉住主窗口默认使用 O 环 `icon.ico`
- 钉住模式（`pin-window-chrome-polish`）已提供 `WindowChrome` 与任务栏可见性，但未规定插件上下文下的图标切换
- `ToolIconService` 与 `getCachedToolIcon` 已在 Home / 侧边栏 / Launcher 统一解析 `plugins/<id>/icon.png`

## Goals / Non-Goals

**Goals**

- 同一插件在「页面顶栏」「钉住 chrome」「任务栏」三处显示相同 `icon.png`
- 管理中心 / Home / 未钉住主窗口仍显示 O 环品牌标
- 剪贴板内置图标与 cyber 系列风格一致

**Non-Goals**

- 动态生成 per-session 图标
- 修改 Launcher / Home 卡片图标逻辑（已正确）
- Figma 源文件

## Decisions

### 1. 任务栏图标解析

`window.ts` 导出 `syncTaskbarIcon(activeToolId)`：

- `activeToolId` 非空且钉住 + 沉浸式 → `BrowserWindow.setIcon` 使用 `ToolIconService.getIconFilePath(toolId)`
- 否则 → 恢复 `resources/icon.ico`（O 环）

`ToolboxShell` 在 `pinState.pinned && immersive` 时通过 IPC `window:syncTaskbarIcon(toolId)` 同步。

### 2. 沉浸式 chrome 图标

`renderChromeIcon(toolId)` 统一封装：

```tsx
<LazyIcon iconKey={`chrome:${toolId}`} size={20} load={() => getCachedToolIcon(toolId)} />
```

`SURFACE_TITLES` 仅保留标题文案，不再承载 emoji。

### 3. 剪贴板双顶栏路径

| 状态 | 顶栏来源 | 图标 |
|------|----------|------|
| 未钉住 | `ClipboardView` 自建 `clipboard-top-bar` | `LazyIcon` + `getCachedToolIcon('clipboard')` |
| 钉住 | `ToolboxShell` → `WindowChrome` | `renderChromeIcon('clipboard')` |

钉住时 `hideTopBar={true}` 隐藏插件自建顶栏，避免重复。

### 4. 剪贴板 glyph

`drawClipboardGlyph`：深色底 + 霓虹描边剪贴板轮廓、顶部夹、内叠卡片与横线，与 shankai/demo 同属 cyber 系列。

## Risks / Trade-offs

- **[Risk] 非 PNG 插件无图标** → `LazyIcon` `fallbackLetter` 显示工具名首字（与侧边栏一致）
- **[Risk] setIcon 频繁调用** → 仅在 `activeId` / `pinState` 变化时 `useEffect` 同步

## Migration

无数据迁移。运行 `node scripts/gen-icons.mjs` 更新剪贴板 PNG 即可。

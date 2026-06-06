## Context

- Launcher：`BrowserWindow` 固定 `560×440`，`frame: false`，`resizable: false`。
- UI：通用深色变量；无品牌顶栏；空近期仅显示「暂无近期使用」；footer 写死 `↑↓ Enter Esc`，未展示真实唤起快捷键。
- 已有：横排近期、pinned chips、水母按钮、`launchKeywords` + 主页「固定到搜索框」。
- 闪开 `shankai.css` 提供 cyber-grid / scan 动画参考；托盘狮子头在 `resources/tray/`。

## Goals / Non-Goals

**Goals:**

- 赛博风 + 呼吸边框 + 自适应高度（档 1）。
- **极简狮子顶栏** + 会话级入场微动效（档 2）。
- **空状态**：推荐内置工具 chip + 引导固定关键字（档 2）。
- 搜索 command 风格（`>` 前缀、placeholder、focus 扫光）。
- Footer 通栏 kbd chip + **动态** `openLauncher` 快捷键文案。
- 近期横排 dock 感（neon 底座、角标、选中脉冲）。

**Non-Goals:**

- 主窗口 / 主页改版。
- 完整 `OneIsAll · COMMAND DECK` 文字顶栏（用户选择极简狮子标 only）。
- 首次安装托盘引导气泡。
- 空搜索时「推荐区」与「近期」并列双区块（v1 仅在**无近期**时显示推荐区）。
- Canvas 粒子、透明全窗口晕光。

## Decisions

### 1. 赛博视觉 token（档 1）

- `launcher.css` 扩展 `--cyber-cyan`、`--cyber-purple`、`--cyber-grid`。
- `.launcher-panel::before`：简化 cyber-grid（复用 shankai 配色，慢速 drift）。
- Header 扫描线仅扫过**顶栏+搜索区**（8s 周期），不铺满 body。

### 2. 呼吸灯边框（档 1）

- `@keyframes launcher-breathe` on `.launcher-panel`（2.5–3s）。
- `prefers-reduced-motion: reduce` → 静态霓虹边，无 pulse。

### 3. 极简品牌顶栏 + 入场动效（档 2）

```
┌──────────────────────────────┐
│ [🦁 16–20px]                 │  ← 仅狮子标，左对齐，无文字
├──────────────────────────────┤
│ > 输入名称…           [水母] │
```

- 组件 `LauncherBrandMark`：加载 `tray-32.png`（经 launcher preload 或打包路径）或内联与 gen-icons 一致的简化 SVG。
- 顶栏高度 ~28–32px，padding 紧凑。
- **入场**：`.launcher-panel` 首次 `show` 时 `animation: launcher-enter 150ms ease-out`（`scale(0.97→1)` + `opacity` + 轻微 `box-shadow` 增强）；用 `sessionStorage` 或 renderer 内 `hasEntered` 标记**每会话一次**，避免每次 toggle 闪动。

### 4. 空状态：推荐 + 固定关键字引导（档 2）

**显示条件**：`trimmed === ''` && `recentItems.length === 0`。

**布局**：

```
推荐试试
[ 剪贴板 ] [ 闪开 ] [ 演示 ]     ← enabled builtin tools，最多 3–4 个

在主页预览关键字旁选择「固定到搜索框」
[ + 固定关键字 ]                  ← ghost chip，不可点击执行；点击可选跳转主页或仅提示
```

- **推荐 chip**：从 `getSearchItems()` 筛 `kind === 'tool'` 且 `builtin` 或固定 id 列表 `['clipboard','shankai','demo']`，取 enabled 项；点击行为同 `selectItem`。
- **引导**：一行 muted 文案 + ghost chip；ghost 点击 → `launcher.openHome()` 并 hide（引导用户去主页 pin）；或仅 tooltip 说明（实现取前者，转化更高）。
- 有近期记录时：只显示「近期常用」横排，**不**重复推荐区（避免拥挤）。

**有 pinned 但无 recent**：仍显示 pinned chips（已有），推荐区可不显示（用户已进阶）。

### 5. 搜索 command 风格（档 1+2）

- 结构：`.launcher-search-cmd` 包裹 `span.launcher-cmd-prefix`（`>`）+ `input`。
- Placeholder：`输入名称，快速唤起工具或应用`。
- Focus：border cyan + 弱 `box-shadow` 扫光（CSS transition，非无限动画）。

### 6. 近期 dock 感（档 2）

- `.launcher-recent-item`：底部 `box-shadow` 霓虹底座；`.highlighted` 外圈 pulse（与边框呼吸同频或略快）。
- 角标：`.launcher-recent-badge--tool`（cyan 点）、`--app`（purple 点），替代空搜索时的文字 kind。

### 7. Footer 动态快捷键（档 2）

- 上行：kbd chip `[ ↑↓ ] 选择` `[ ↵ ] 打开` `[ Esc ] 关闭`。
- 下行：`{openLauncher}` 唤起 · 设置里可改` — 从 `settings:get` 读取 `shortcuts.openLauncher`，格式化为 Windows 显示（复用 Settings 页 formatter 或简单 `Ctrl+Shift+Space` 映射）。
- IPC：Launcher preload 增加 `getShortcuts()` 或在 `load()` 时一并拉 settings（二选一，优先复用已有 patterns）。

### 8. 自适应高度（档 1）

- Renderer `ResizeObserver` on `.launcher-panel` → `launcher.resize(h)`。
- `MIN_H` ~220px（顶栏 + 搜索 + 空状态推荐区 + footer）；`MAX_H` ~520px。
- 推荐区/引导文案计入高度；防抖 50ms，阈值 4px。

## Risks / Trade-offs

- **[Risk] 推荐区与 pinned 重复** → 仅无 recent 时显示推荐；有 pin 则省略推荐标题区。
- **[Risk] ghost chip 跳主页打断搜索** → 文案说明意图；用户主动点击才跳转。
- **[Risk] 狮子标加载失败** → fallback 菱形 `◆` 与侧边栏 brand 一致。
- **[Risk] resize + enter 动画竞态** → 入场动画结束后再允许 resize 或入场不触发 resize。

## Migration Plan

- 无数据迁移。
- 用户无配置项；固定关键字仍从主页操作。

## Open Questions

- （已关闭）顶栏：极简狮子标 only。
- （已关闭）空状态：推荐 + 引导固定关键字。

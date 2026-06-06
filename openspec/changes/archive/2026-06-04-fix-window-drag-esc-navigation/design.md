## Context

- 无边框主窗口与快捷框均无 `-webkit-app-region` 拖拽。
- 主页入口**仅**快捷框水母按钮（`launcher.openHome`）；用户不从托盘双击进 Home。
- `ToolboxShell` 沉浸式 Esc 一律 `goHome()`，与产品枢纽模型不符。
- 托盘现状：双击 → `showMainWindow('home')`；菜单仅「设置」「退出」。

## Goals / Non-Goals

**Goals:**

- 主窗口与快捷框可鼠标拖拽移动
- Esc = 导航栈后退一层；栈顶为快捷框时 Esc 关闭快捷框
- **所有主窗口沉浸式视图**（含全局快捷键 `openClipboard` 等）Esc 沿栈返回，栈空或外部直达时 **backTarget = 快捷框**（显示快捷框、隐藏主窗口）
- 托盘：双击 → 快捷框；菜单「显示」→ 快捷框，「隐藏」→ 关闭快捷框

**Non-Goals:**

- 多窗口合并为单 BrowserWindow
- 窗口 resize 手柄
- 完整浏览器级历史（前进/后退多条）

## Decisions

### 1. 导航栈（主进程或 Shell 协调）

```ts
type NavFrame =
  | { surface: 'launcher' }
  | { surface: 'home' }
  | { surface: 'tool'; id: string }
  | { surface: 'settings' }

// 栈示例：launcher → home → tool:clipboard
```

| 动作 | 栈操作 |
|------|--------|
| 显示快捷框（快捷键/托盘显示/双击） | 可选 push `launcher` 或仅显示（Esc 在快捷框上 = hide） |
| 水母 openHome | push `home`（隐式父级 launcher） |
| 打开插件（快捷框/Home/快捷键） | push `tool:id` |
| 托盘设置 | push `settings`，`backTarget = launcher` |
| Esc（无 modal） | pop 一层，渲染栈顶；若需回快捷框则 `hideMainWindow` + `showLauncher` |

**Esc 优先级**（不变）：关键字面板 → 插件 modal → 栈 pop。

**全局快捷键打开插件**：push `tool:id`，`backTarget = launcher`（无真实 launcher 帧在栈底也回快捷框）。

**备选**：单字段 `entrySource` — 无法表达 home→tool 两步后退，不采用。

### 2. Esc 与 backTarget

| 当前表面 | 栈 pop 后 |
|----------|-----------|
| 插件（父级 home） | 显示主页壳层 |
| 插件（父级 launcher / 外部 / 快捷键） | 显示快捷框，隐藏主窗口 |
| 主页 | 显示快捷框，隐藏主窗口 |
| 设置（托盘） | 显示快捷框，隐藏主窗口 |
| 快捷框 | 关闭快捷框 |

### 3. 托盘

```ts
// 双击
tray.on('double-click', () => showLauncher())

// 菜单（顺序建议）
{ label: '显示', click: () => showLauncher() }
{ label: '隐藏', click: () => hideLauncher() }  // 主窗口不动
{ label: '设置', click: () => { push settings; showMainWindow('settings') } }
{ label: '退出', ... }
```

「隐藏」仅隐藏快捷框；主窗口若打开由各自 Esc 处理。

### 4. 拖拽

共享 `.window-drag` / `.window-no-drag`；快捷框顶栏/水母行外侧、主窗口侧栏品牌区与沉浸式顶栏为拖拽区。

## Risks / Trade-offs

- **[Risk] 栈与 UI 状态不同步** → 每次 `setActive` / `openTool` / `openHome` 在主进程统一 push
- **[Risk] 托盘菜单项变多** → 仍保持精简四项；与旧 spec「仅设置+退出」冲突，delta 明确 **MODIFIED**
- **[Risk] 从快捷框进插件再 Esc 回快捷框时主窗口残留** → hide 即可，可接受

## Migration Plan

无数据迁移。用户需知：托盘双击行为从 Home 改为快捷框。

## Open Questions

（无）

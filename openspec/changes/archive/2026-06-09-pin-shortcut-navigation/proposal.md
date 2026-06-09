## Why

定住（Pin）模式与全局快捷键、Esc 返回、剪贴板键盘流之间的交互存在多处不符合实际使用习惯的问题：定住窗口被 Esc 误关、重复快捷键会意外取消定住、快捷框快捷键无法快速切换非定住插件会话、剪贴板选条目后还需手动关窗才能粘贴。需要统一优化导航与快捷键行为，让「定住办公」和「快捷复制粘贴」两条路径都更顺畅。

## What Changes

- **定住模式 Esc 豁免**：主窗口处于 Pin 模式时，Esc 不再触发导航返回或隐藏窗口；仅可通过窗口 Chrome 关闭按钮（或等效关闭操作）隐藏主窗口。
- **同插件快捷键保持定住**：若目标插件已在主窗口打开且处于 Pin 模式，再次通过该插件的全局快捷键（如 openClipboard）应聚焦当前窗口并保持 Pin 状态，不再调用 `ensureUnpinned` 重置布局。
- **快捷框快捷键切换非定住插件会话**：主窗口正在展示**非定住**的插件视图时，按「打开快捷框」全局快捷键应隐藏主窗口（关闭当前插件页），并记住被关闭的插件 id；再次按同一快捷键应直接恢复该插件视图（仍为非定住），而非弹出快捷框 overlay（除非无待恢复的插件会话）。
- **剪贴板 Enter 快速粘贴流**：在剪贴板列表中用方向键选中条目后按 Enter，除复制到系统剪贴板外，还应自动隐藏主窗口，使用户可立即在目标处 Ctrl+V 粘贴，无需额外关窗操作。
- **BREAKING（行为变更）**：修改 toolbox 导航/Esc 与 shortcut-unpin 相关既有行为；修改 openLauncher 在非定住插件打开时的语义（由「切换快捷框 overlay」变为「先切换插件会话可见性」）。

## Capabilities

### New Capabilities

（无 — 均为既有能力的行为调整）

### Modified Capabilities

- `toolbox`: Pin 模式下 Esc 不返回；同插件快捷键保持 Pin；openLauncher 在非定住插件打开时的 toggle-dismiss/restore 语义
- `clipboard`: Enter 复制后自动关闭剪贴板视图（隐藏主窗口）

## Impact

- `src/main/navigation/NavigationStack.ts` — 快捷键打开工具时的 Pin 保留与同工具聚焦逻辑
- `src/main/window.ts` — 暴露 Pin 状态查询供导航决策；可能新增 dismissed-tool 会话状态
- `src/main/index.ts` / `src/main/launcher/LauncherWindow.ts` — `openLauncher` 快捷键 handler 分支逻辑
- `src/renderer/shell/ToolboxShell.tsx` — Esc handler 在 Pin 模式下 no-op
- `src/renderer/plugins/clipboard/ClipboardView.tsx` — Enter 复制后隐藏窗口
- `openspec/specs/toolbox/spec.md`、`openspec/specs/clipboard/spec.md` — 需求更新

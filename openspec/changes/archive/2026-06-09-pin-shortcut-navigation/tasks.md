## 1. Pin 模式 Esc 豁免

- [x] 1.1 在 `ToolboxShell.tsx` Esc handler 中：当 `pinState.pinned === true` 且无 keyword overlay 时，阻止默认行为并跳过 `navigation.pop()`
- [x] 1.2 确认 Pin 模式下 keyword panel / 插件内 modal 仍可由 Esc 先关闭（overlay 优先级不变）

## 2. 同插件快捷键保持定住

- [x] 2.1 在 `NavigationStack.ts` 的 `navOpenTool` shortcut 分支：若 `getPinState().pinned`、目标 id 等于当前 `activeToolId`、主窗口可见，则 `focus()` 并 early return，不调用 `ensureUnpinned()`
- [x] 2.2 将 `activeToolId` 传入导航层或在 `navOpenTool` 增加可选 `currentToolId` 参数供比较
- [x] 2.3 其他 shortcut 打开场景保持 `ensureUnpinned()` 与非 Pin 布局

## 3. openLauncher 非定住插件 dismiss/restore

- [x] 3.1 在 main 进程新增 `dismissedUnpinnedToolId` 状态及 `handleOpenLauncherShortcut()` 三态逻辑
- [x] 3.2 替换 `ShortcutManager` 注册中 `openLauncher` 回调为 `handleOpenLauncherShortcut`
- [x] 3.3 dismiss 条件：主窗口可见 + 非 Pin + `activeToolId` 为 plugin（非 home/settings）
- [x] 3.4 restore 条件：主窗口隐藏 + dismissed 有值 + launcher 不可见 → `showMainWindow(dismissed)` 并清状态
- [x] 3.5 其他路径打开工具时清除 dismissed 状态，避免 stale restore

## 4. 剪贴板 Enter 快速粘贴

- [x] 4.1 在 `ClipboardView.tsx` Enter key handler：`handleCopy` 成功后调用 `window.toolbox.window.hide()`
- [x] 4.2 复制失败时不关窗，保留 toast 反馈
- [x] 4.3 确认单击行复制、工具栏 C 键路径不关窗（仅 Enter dismiss）

## 5. 验证

- [x] 5.1 手动验证：Pin 插件按 Esc 不关闭；Chrome 关闭按钮仍可隐藏
- [x] 5.2 手动验证：Pin 剪贴板再按 openClipboard 仍保持 Pin
- [x] 5.3 手动验证：非定住插件 → openLauncher 隐藏 → 再按 openLauncher 恢复同插件
- [x] 5.4 手动验证：剪贴板方向键 + Enter 复制并关窗，可立即 Ctrl+V 粘贴
- [x] 5.5 手动验证：托盘双击仍直接打开快捷框 overlay

## 1. 导航层：快捷框一律非定住

- [x] 1.1 在 `NavigationStack.ts` 的 `navOpenTool` 中，当 `from === 'launcher'` 时调用 `ensureUnpinned()`（位于 stack 更新与 `showMainWindow` 之前）
- [x] 1.2 确认 shortcut 分支：`currentToolId === id` 且 Pin 时 early return；否则 `ensureUnpinned()`（已满足跨插件打开）

## 2. 规范与验证

- [x] 2.1 手动验证：Pin 剪贴板 → 快捷框打开 md2docx → 非定住 md2docx 视图
- [x] 2.2 手动验证：Pin 剪贴板 → openClipboard 快捷键 → 仍保持 Pin 剪贴板
- [x] 2.3 手动验证：Pin 剪贴板 → 快捷框打开剪贴板 → 非定住剪贴板（取消 Pin）
- [x] 2.4 手动验证：Pin 剪贴板 → openMd2Docx 或其他插件 shortcut（若有）→ 非定住目标插件

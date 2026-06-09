## Why

上一版 `pin-shortcut-navigation` 允许从快捷框打开插件时保留定住状态，与「快捷框 = 临时唤起、非定住浏览」的使用习惯不符。同时用户需要在某个插件已 Pin 定住时，仍能通过其他全局快捷键或快捷框切换到别的插件，而不被当前 Pin 会话阻塞。

## What Changes

- **快捷框打开一律非定住**：从 Launcher 选择任意 toolbox 插件时，主窗口 SHALL 清除 Pin 模式并以标准非定住沉浸式布局打开目标插件（含当前已 Pin 的同一插件）。
- **Pin 会话不阻塞切换插件**：当主窗口某插件处于 Pin 模式时，用户 SHALL 仍可通过其他插件的全局快捷键打开该插件（非定住）；SHALL 仍可从快捷框打开其他（或同一）插件（非定住）。
- **同插件快捷键保持定住**（保留）：仅当通过**同一插件**的全局快捷键唤起且该插件已在 Pin 模式打开时，聚焦并保持 Pin，不切换布局。
- **BREAKING**：移除「Launcher open preserves pin state」行为；快捷框路径与 shortcut 不同-tool 路径均强制 `ensureUnpinned`。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox`：导航/Pin 与 shortcut、launcher 打开工具的分支规则
- `toolbox-launcher`：从快捷框选择插件时清除 Pin 并以非定住布局打开

## Impact

- `src/main/navigation/NavigationStack.ts` — `navOpenTool(..., 'launcher')` 调用 `ensureUnpinned()`；确认 shortcut 不同-tool 分支已覆盖
- `openspec/specs/toolbox/spec.md`、`openspec/specs/toolbox-launcher/spec.md` — 需求更新
- 与 `pin-shortcut-navigation` 归档前 delta 中「Launcher open preserves pin state」场景冲突，本 change 取代该场景

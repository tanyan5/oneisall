## Context

`pin-shortcut-navigation` 已实现：Pin 下 Esc 不关闭、同插件 shortcut 保持 Pin、shortcut 打开不同插件会 `ensureUnpinned()`、openLauncher dismiss/restore 等。但 `navOpenTool(..., 'launcher')` **未**调用 `ensureUnpinned()`，且 spec 仍保留「Launcher open preserves pin state」场景。

用户新需求：
1. 快捷框打开的插件一律非定住
2. 某插件 Pin 定住时，仍可通过其他 shortcut 或快捷框打开其他插件

第二条中 shortcut 不同-tool 路径已在代码中满足；缺 launcher 路径的 `ensureUnpinned()`。

## Goals / Non-Goals

**Goals:**

- Launcher 选择插件 → 始终 `ensureUnpinned()` 后打开
- Pin 下从 Launcher 打开其他（或同一）插件 → 切换目标并以非定住展示
- 保留：同插件 shortcut + 已 Pin → 仅 focus

**Non-Goals:**

- 不改变 Home 内打开插件的 Pin 行为（非本需求范围）
- 不改变 Pin 下 Esc / openLauncher dismiss-restore 逻辑
- 不支持多窗口同时 Pin 多个插件（单主窗口模型不变）

## Decisions

### 1. 在 `navOpenTool` launcher 分支开头调用 `ensureUnpinned()`

```typescript
export function navOpenTool(id: string, from: ToolOpenFrom, currentToolId?: string): string {
  if (from === 'shortcut') {
    // existing same-tool pinned early return + ensureUnpinned for others
  }
  if (from === 'launcher') {
    ensureUnpinned()
  }
  clearDismissedUnpinnedToolSession()
  // ... rest unchanged
}
```

**备选**：仅在 renderer/launcher IPC 层 unpin — 拒绝，导航与 Pin 状态集中在 main 进程更一致。

### 2. shortcut 不同-tool 行为：无需改动

现有逻辑：`currentToolId !== id` 时走 `ensureUnpinned()`，已满足「Pin A 时 shortcut 打开 B」。

### 3. 移除/替换 spec 场景

删除「Launcher open preserves pin state」；新增 launcher always unpinned 与 cross-tool while pinned 场景。

## Risks / Trade-offs

- **[Risk] 从快捷框重新打开已 Pin 的同一插件会取消 Pin** → 符合需求 1；用户需 Ctrl+D 再次 Pin
- **[Risk] 与 pin-shortcut-navigation 未归档 delta 冲突** → 本 change 归档时合并到 main spec

## Migration Plan

单行逻辑 + spec 更新；无数据迁移。回滚：移除 launcher 分支的 `ensureUnpinned()`。

## Open Questions

（无）

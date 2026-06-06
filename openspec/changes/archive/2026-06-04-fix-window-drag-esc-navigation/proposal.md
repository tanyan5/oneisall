## Why

主窗口与快捷启动框均为无边框窗口，但缺少可拖拽区域，用户无法移动窗口。Esc 导航语义混乱：从快捷框进入插件后 Esc 回 Home、托盘双击进 Home 等与「快捷框作为唯一枢纽」的产品结构不一致。用户期望 **Esc 沿原路后退一层**，且几乎所有主窗口会话的终点都是回到快捷框。

## What Changes

- 为主窗口与快捷启动框添加统一鼠标拖拽（`-webkit-app-region` 拖拽区 + 交互控件 `no-drag`）
- 引入**导航栈**：Esc 弹出上一层（modal/关键字面板仍优先）；主页仅由快捷框水母按钮进入
- **Esc 统一归宿**：主窗口内任意沉浸式视图（含全局快捷键直达的插件）按 Esc 最终回到快捷框；栈内路径按原路返回（插件→主页→快捷框）
- **托盘交互调整**：
  - 双击托盘 → 唤起快捷框（不再打开主窗口 Home）
  - 右键菜单新增「显示」「隐藏」→ 显示唤起快捷框，隐藏关闭快捷框
  - 托盘「设置」等仍打开主窗口，Esc 回快捷框
- 快捷框内 Esc 仍为关闭快捷框

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox`：无边框拖拽；导航栈与 Esc 后退；托盘双击/菜单项行为变更
- `toolbox-launcher`：快捷框拖拽；Esc 与导航栈的配合；作为全局默认返回目标

## Impact

- **Main**：`tray.ts`、`window.ts`、`LauncherWindow.ts`、`index.ts`（导航栈、`returnToLauncher`、托盘菜单）
- **Preload**：`index.ts` 及类型定义
- **Renderer**：`ToolboxShell.tsx`、`LauncherView.tsx`、样式与各沉浸式顶栏
- **Specs**：`toolbox`、`toolbox-launcher` delta（含托盘菜单 **BREAKING** 相对旧「仅设置+退出」描述）

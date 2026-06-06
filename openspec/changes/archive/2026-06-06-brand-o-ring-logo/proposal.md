## Why

OneIsAll 品牌资产分散（像素狮头托盘标、手写水母 SVG、◆ 占位、双主色），不利于产品化。需统一为 **O 环呼吸标**（水母伞盖抽象，契合 OneIsAll 首字母 O），气质干净专业（类 Raycast）。Figma 源文件后续再建，先落 OpenSpec 与代码实现。

## What Changes

- **品牌标**：仅 **O 环** + 可选中心高光点；无触须；大安装图标保留极简网格底（`gen-icons`）
- **组件**：`BrandMark` + `BrandHomeButton` 替代 `JellyfishHomeButton`；顶栏与快捷框同源 SVG
- **动效**：顶栏 `breathe=subtle`，快捷框 `breathe=normal`；托盘/ICO 静态
- **资源**：`gen-icons` 托盘/任务栏改为 cyan O 环（`#22D3EE`），退役狮头 glyph
- **移除**：顶栏 `◆` fallback；不再依赖 `getBrandIcon` 显示顶栏（IPC 保留供托盘 PNG 等）
- **非目标（本 change）**：Figma 文件生成、Code Connect

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `toolbox-launcher`：水母按钮改为 O 环 `BrandMark`；品牌色统一
- `toolbox`：顶栏品牌标为 O 环组件；托盘/应用图标与品牌一致

## Impact

- **Renderer**：`BrandMark.tsx`、`BrandHomeButton.tsx`、`brand-mark.css`；`HomeTopBar.tsx`、`LauncherView.tsx`
- **Scripts**：`gen-icons.mjs`（`drawBrandGlyph`）
- **Resources**：`resources/tray/*`、`resources/icon.ico`（运行 gen-icons 生成）
- **Docs**：`README.md` 品牌描述更新

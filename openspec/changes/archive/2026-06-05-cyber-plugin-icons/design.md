## Context

- `add-tool-icons` 已实现图标加载链路；当前 `scripts/gen-icons.mjs` 仅输出 48×48 纯色 PNG（约 123 字节），视觉占位性质明显。
- 闪开插件已有「赛博网格 / Aurora」主题，宿主 UI 主色为 `#6366f1` 靛紫，深色表面 `#1a1d27` / `#242836`。
- 本变更**仅替换静态资源与生成脚本**，不触及 `ToolIconService`、IPC 或 React 组件。

## Goals / Non-Goals

**Goals:**

- 五枚内置图标（clipboard、shankai、demo、home、settings）统一赛博视觉：深色底、霓虹描边、网格/扫描线/几何图案、每工具可区分的中心符号。
- 48×48 PNG，透明或深色圆角底；小尺寸（20px）仍可辨认轮廓。
- 可重复生成：`node scripts/gen-icons.mjs` 从 SVG 源或内嵌矢量定义输出全部 PNG。
- 与现有打包路径一致（`plugins/*/icon.png`、`resources/nav/*.png`）。

**Non-Goals:**

- 动画图标、SVG 运行时渲染、用户自定义图标编辑器。
- 第三方图像依赖（如 `sharp`、`canvas`）；优先零依赖 Node（SVG 字符串 + 可选 `resvg` 不考虑）或纯 SVG 文件 + 简易栅格化。
- 修改 letter-fallback 逻辑（缺失文件时仍用首字母圆标）。

## Decisions

### 1. SVG 源文件 + Node 栅格化管线

**选择**：在 `scripts/icons/` 存放 5 个手写 SVG（赛博图案），`gen-icons.mjs` 解析/合成后输出 PNG。

**理由**：SVG 便于迭代图案与颜色；比手写 PNG 像素或纯色块更有表现力。

**实现路径（零额外依赖）**：

- 使用内嵌 SVG 模板 + 按图标 id 参数化（背景色、accent、中心 path）。
- 栅格化方案 A（首选）：扩展 `gen-icons.mjs`，用 **纯 Node** 在 48×48 画布上绘制：
  - 深色渐变底 + 圆角
  - 水平/垂直细线网格（赛博网格）
  - 对角扫描线或角标高光
  - 中心白色/青色线条 pictogram（剪贴板、闪电、方块、房屋、齿轮）
- 方案 B（备选）：若纯 Node 绘制过繁，将 SVG 存为 `scripts/icons/*.svg`，开发机用一次性 `electron` 脚本 `nativeImage.createFromDataURL(svg).toPNG()` 生成——仅文档化，不加入运行时依赖。

**弃用**：继续纯色 `createSolidPng`；外部 AI 出图不入库（难以版本化与统一风格）。

### 2. 每图标图案语义

| Id | 主色 accent | 中心符号 | 赛博元素 |
|----|-------------|----------|----------|
| clipboard | `#38bdf8` 青 | 剪贴板轮廓 + 横线 | 细网格底、右上霓虹角标 |
| shankai | `#c084fc` 紫 | 闪电 / 启动箭头 | 六边形框、脉冲环 |
| demo | `#4ade80` 绿 | 立方体线框 | 斜向扫描线 |
| home | `#818cf8` 靛 | 房屋线框 | 地平线网格、门洞高光 |
| settings | `#94a3b8` 灰蓝 | 齿轮线框 | 同心圆虚线、十字准星 |

底色统一 `#141824` → `#1e2433` 径向或线性渐变，描边 1px 半透明 accent。

### 3. 尺寸与导出

- 导出 48×48 PNG，8-bit RGBA，`filter: none` 保持锐利线条。
- `resources/nav/` 与 `plugins/` 使用同一生成函数，仅图案配置不同。
- `package.json` `extraResources` 不变。

### 4. 文档

- README「添加新工具」一节补充一句：内置图标为赛博风参考，第三方插件可使用自有 `icon.png`。
- `scripts/gen-icons.mjs` 顶部注释说明风格约定与重新生成命令。

## Risks / Trade-offs

- **[Risk] 纯 Node 绘制代码较长** → 将每图标配置抽成 `ICON_DEFS` 对象，绘制函数共用 `drawCyberBase` / `drawGrid` / `drawGlyph`。
- **[Risk] 20px 下细节糊掉** → 图案以粗线框为主，避免 1px 以下细节；中心符号占画布 50–60%。
- **[Risk] 与闪开应用 exe 图标风格混杂** → 可接受；本变更只规范**工具箱内置**图标。

## Migration Plan

1. 实现新版 `gen-icons.mjs` 并运行生成 PNG。
2. 目视检查 Home / 侧边栏 / Launcher（无需改代码）。
3. `npm run build` 确认资源仍被打包。
4. 回滚：恢复旧版 `gen-icons.mjs` 或 git 还原 PNG 即可。

## Open Questions

（无。图案语义与配色已在上表固定；若产品后续要统一换肤，可再抽 `icons/theme.json`。）

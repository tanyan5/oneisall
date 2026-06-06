## Context

- 已定稿：O 环 only、极简网格大标、顶栏 subtle / 快捷框 normal 呼吸、托盘仅图标、主色 `#22D3EE`。
- 现：`JellyfishHomeButton` 触须水母；`drawTrayGlyph` 狮头；顶栏 `getBrandIcon` 或 `◆`。

## Goals / Non-Goals

**Goals:**

- 单源 SVG `viewBox="0 0 32 32"`：`BrandMark` 组件
- 托盘/ICO 与 UI 标视觉一致（O 环 + cyan）
- 呼吸 CSS 复用一套 token

**Non-Goals:**

- Figma 库、Code Connect
- 顶栏/托盘显示 OneIsAll 文字

## Decisions

### 1. BrandMark 组件

```tsx
BrandMark({ size, breathe: 'off'|'subtle'|'normal', showCore? })
```

- 母版：圆 `r=11` `stroke=2`；中心点 `r=1.2`（`size >= 20` 或 `showCore`）
- 颜色：`currentColor` = `#22D3EE`，core 用 CSS 更亮

### 2. BrandHomeButton

- 包装 `<button>` + `BrandMark`，替代 `JellyfishHomeButton`
- 快捷框：`size={22}` `breathe="normal"`

### 3. HomeTopBar

- 内嵌 `BrandMark size={28} breathe="subtle"`，移除 `getBrandIcon` 与 `◆`

### 4. gen-icons

- `drawBrandGlyph`：圆环描边 + 中心点（48px 母版）
- tray accent `#22D3EE`
- 保留 `drawCyberBase` 作托盘底（含淡网格）

### 5. 资源

- `resources/brand/o-ring.svg` 静态参考
- 运行 `node scripts/gen-icons.mjs` 更新 tray + icon.ico

## Risks / Trade-offs

- **[Risk] 16px 环过细** → gen-icons 16px 用 stroke 1.5、省略 core
- **[Risk] 旧文档提狮子** → README / openspec 同步

## Open Questions

- Figma 结构已 explore 定稿，实现阶段不阻塞

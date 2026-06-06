## 1. Recent row collapse/expand UI

- [x] 1.1 Add `recentExpanded` state and `RECENT_ROW_VISIBLE = 10` fixed cap
- [x] 1.2 Section header: 左上「展开全部」/「收起」+「近期常用」标题
- [x] 1.3 Collapsed: 10-column grid 单行，超出隐藏；Expanded: grid 自动换行显示全部
- [x] 1.4 Hide expand button when `recentItems.length <= 10`

## 2. CSS — no scrollbar

- [x] 2.1 Remove `overflow-x: auto` from `.launcher-recent-row`; use 10-column grid
- [x] 2.2 `.launcher-body` default `overflow: hidden`; `.launcher-body--scrollable` only when searching
- [x] 2.3 `.launcher-panel` `height: auto` for content-driven resize
- [x] 2.4 Style `.launcher-section-head` and expand toggle button

## 3. Remove footer

- [x] 3.1 Remove `launcher-footer` from `LauncherView.tsx`
- [x] 3.2 Remove unused `openLauncherShortcut` load if only used by footer
- [x] 3.3 Clean up footer-related CSS

## 4. Data & keyboard

- [x] 4.1 `launcherMerge.ts`: `MAX_RECENT = 20` for merged launcher recent
- [x] 4.2 Update `flatItems` to use visible recent items (first 10) when collapsed
- [x] 4.3 Include `recentExpanded` in panel ResizeObserver deps for `resizeLauncher`
- [x] 4.4 Verify ↑↓ Enter Esc still work without footer

## 5. Verification

- [x] 5.1 Default: one row of 10, no right scrollbar, 展开全部 when >10
- [x] 5.2 Collapse restores single row; window height adapts
- [x] 5.3 No bottom hint bar; `npm run build` succeeds

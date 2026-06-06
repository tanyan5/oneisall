## 1. Navigation helper

- [x] 1.1 Add `moveHighlight(direction, index, length, section, cols)` pure function
- [x] 1.2 Grid logic: recent section uses 10-column row/col math with boundary clamp
- [x] 1.3 List logic: search/recommend use linear ±1 for all four arrows

## 2. LauncherView integration

- [x] 2.1 Reset `highlight` to 0 when `flatItems` or `query` changes (verify on open/focus)
- [x] 2.2 Handle `ArrowLeft` / `ArrowRight` in keydown handler
- [x] 2.3 Pass current `flatItems[0].section` (or per-index section) into move helper
- [x] 2.4 Ensure first item renders `.highlighted` on initial paint

## 3. Verification

- [x] 3.1 Recent grid: ←→ move within row, ↑↓ move between rows when expanded
- [x] 3.2 Search results: arrows move linearly; Enter opens item; Esc closes
- [x] 3.3 `npm run build` succeeds

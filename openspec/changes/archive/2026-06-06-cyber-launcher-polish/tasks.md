## 1. Cyber visual theme & breathing border

- [x] 1.1 Extend `launcher.css` with cyber tokens (`--cyber-cyan`, `--cyber-purple`, `--cyber-grid`)
- [x] 1.2 Add simplified cyber-grid background on `.launcher-panel` (slow drift); header scan-line over brand + search area only
- [x] 1.3 Add `@keyframes launcher-breathe` border/glow on `.launcher-panel`; respect `prefers-reduced-motion`
- [x] 1.4 Style pinned chips, section titles, search result rows, and recommendation chips with neon hover/focus states

## 2. Brand header & entry animation

- [x] 2.1 Add `LauncherBrandMark` component (tray lion ~16–20px); fallback `◆` glyph if image missing
- [x] 2.2 Integrate minimal brand header in `LauncherView.tsx` above search row (icon only, no title text)
- [x] 2.3 Add `@keyframes launcher-enter` (~150ms scale + glow); play once per session via `sessionStorage` or in-memory flag
- [x] 2.4 Disable entry animation when `prefers-reduced-motion: reduce`

## 3. Command-style search field

- [x] 3.1 Wrap search in `.launcher-search-cmd` with `>` prefix span + input
- [x] 3.2 Set placeholder `输入名称，快速唤起工具或应用`; style `::placeholder` for cyber theme
- [x] 3.3 Add focus neon highlight / subtle glow transition on search field

## 4. Empty-state recommendations & pin guidance

- [x] 4.1 When `trimmed === ''` and no recents (and no pinned per design), render「推荐试试」builtin tool chips (`clipboard`, `shankai`, `demo` enabled only)
- [x] 4.2 Wire recommendation chip click to existing `selectItem` / `openTool` flow
- [x] 4.3 Add pin-guidance copy + ghost chip「+ 固定关键字」; click → `launcher.openHome()`
- [x] 4.4 When recents exist, hide recommendation section; keep recent row only

## 5. Recent dock presentation

- [x] 5.1 Add neon dock base + highlighted pulse on `.launcher-recent-item`
- [x] 5.2 Add compact kind badges (cyan dot = tool, purple dot = app) on recent items; no description/kind text in empty-search recents

## 6. Adaptive launcher height

- [x] 6.1 Add `resizeLauncher(height)` in `LauncherWindow.ts` with MIN (~220px) / MAX (~520px); debounced `setBounds` (50ms, 4px threshold)
- [x] 6.2 Add IPC `launcher:resize` + preload `launcher.resize(height)` + `launcher.d.ts`
- [x] 6.3 In `LauncherView.tsx`, `ResizeObserver` on `.launcher-panel`; resize on recents/pinned/recommendations/query changes
- [x] 6.4 Remove excess flex stretch on `.launcher-body` so empty/compact layouts do not reserve blank middle space

## 7. Dynamic footer & shortcuts IPC

- [x] 7.1 Restyle `.launcher-footer` full-width with kbd chips for ↑↓ / Enter / Esc
- [x] 7.2 Expose shortcuts to launcher renderer (`launcher:getShortcuts` or `settings:get` via preload)
- [x] 7.3 Display configured `openLauncher` shortcut in footer second line (`{shortcut} 唤起 · 设置里可改`)

## 8. Documentation & verification

- [x] 8.1 Optional: README one-liner on launcher empty-state recommendations and pin-keyword guidance
- [x] 8.2 Manual test: no recents → recommendations + pin ghost + compact height; ghost → home
- [x] 8.3 Manual test: recents → dock highlights + badges; no recommendation section
- [x] 8.4 Manual test: entry animation once per session; breathing border; reduced-motion static fallback
- [x] 8.5 Manual test: footer shows live `openLauncher` shortcut after settings change
- [x] 8.6 Manual test: many search results → taller window + body scroll
- [x] 8.7 `npm run build` succeeds

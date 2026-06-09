## 1. Layout structure

- [x] 1.1 Refactor `Md2DocxView` to outer scroll root + inner centered column; remove scroll/max-width from inner body
- [x] 1.2 Replace in-view `view-header` with `immersive-drag-strip` when unpinned; accept `hideTopBar` prop
- [x] 1.3 Pass `hideTopBar={pinState.pinned}` from `ToolboxShell` for md2docx

## 2. Visual polish

- [x] 2.1 Rewrite `md2docx.css` to use global CSS variables (`--surface`, `--border`, `--accent`, `--muted`, `--radius`, `--danger`)
- [x] 2.2 Align buttons, select, drop zone, result panel, and recent list hover states with toolbox patterns

## 3. Cyber tool icon

- [x] 3.1 Add `drawMd2DocxGlyph` to `scripts/gen-icons.mjs` — left narrow page (`#` + lines), right wider page (lines), center arrow; accent `#fbbf24`
- [x] 3.2 Register `{ id: 'md2docx', accent: '#fbbf24', out: 'plugins/md2docx/icon.png' }` in `ICON_DEFS`; run `node scripts/gen-icons.mjs`
- [x] 3.3 (Optional) Add `md2docx: '#fbbf24'` to `LETTER_COLORS` in `ToolIconService.ts` for fallback alignment

## 4. Verification

- [x] 4.1 Manual test: wide window — scrollbar at right edge, content centered
- [x] 4.2 Manual test: pinned vs unpinned chrome — no duplicate title bar
- [x] 4.3 Manual test: Home / sidebar / Launcher / pinned taskbar show amber cyber icon (not letter M)
- [x] 4.4 `npm run build` succeeds

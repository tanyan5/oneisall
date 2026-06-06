## 1. Icon generation pipeline

- [x] 1.1 Refactor `scripts/gen-icons.mjs`: remove solid-color `createSolidPng`; add shared cyber base (dark gradient, rounded rect, grid/scan lines)
- [x] 1.2 Add per-icon glyph definitions for `clipboard`, `shankai`, `demo`, `home`, `settings` (distinct accent + center pictogram)
- [x] 1.3 Export 48×48 RGBA PNG to `plugins/*/icon.png` and `resources/nav/*.png`; add script header comment with style notes

## 2. Asset verification

- [x] 2.1 Run `node scripts/gen-icons.mjs` and confirm output files are larger than placeholder (~1KB+) with visible pattern
- [x] 2.2 Visual check at 48px (Home) and 20px (sidebar): each icon distinguishable and cyber-styled

## 3. Documentation

- [x] 3.1 Update `README.md` plugin icon section: built-in icons use cyber pattern style; custom plugins may supply own `icon.png`

## 4. Build verification

- [x] 4.1 `npm run build` succeeds; packaged `plugins` and `resources/nav` paths unchanged

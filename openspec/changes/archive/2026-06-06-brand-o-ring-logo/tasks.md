## 1. OpenSpec & assets brief

- [x] 1.1 proposal / design / delta specs / tasks
- [x] 1.2 `resources/brand/o-ring.svg` reference

## 2. BrandMark component

- [x] 2.1 `BrandMark.tsx` + `brand-mark.css` (sizes, breathe subtle/normal, core)
- [x] 2.2 `BrandHomeButton.tsx` replaces `JellyfishHomeButton`

## 3. Shell integration

- [x] 3.1 `HomeTopBar` → BrandMark 28px subtle; remove ◆ fallback
- [x] 3.2 `LauncherView` → BrandHomeButton; launcher CSS aliases

## 4. Generated icons

- [x] 4.1 `gen-icons.mjs` drawBrandGlyph, accent #22D3EE
- [x] 4.2 Run gen-icons; tray + icon.ico updated

## 5. Docs & verify

- [x] 5.1 README brand wording (O-ring, not lion)
- [x] 5.2 `npm run build` succeeds

## 1. Shared types and preset definition

- [x] 1.1 Extend `Md2DocxPresetId` with `minimal-clean`; add `MD2DOCX_PRESET_DESCRIPTIONS` in `src/shared/md2docx.ts`
- [x] 1.2 Add `layout: 'report-sections' | 'continuous'` to `Md2DocxPreset`; register `minimal-clean` with `MINIMAL_CLEAN_STYLE` in `presets.ts`
- [x] 1.3 Ensure `Md2DocxStore` accepts `minimal-clean` and falls back unknown ids to `business-report`

## 2. Converter layout branching

- [x] 2.1 Add continuous-body helper in `prepareSections.ts` (strip `[TOC]`, no injection)
- [x] 2.2 Branch `Md2DocxConverter.convertMarkdownFile` by `preset.layout`: `report-sections` keeps current two-section path; `continuous` uses single `convertMarkdownToBuffer(bodyMarkdown, options)` without sections/headers/footers/toc
- [x] 2.3 Set `documentType: 'document'` for continuous path; omit pageNumbering and section breaks

## 3. UI

- [x] 3.1 Update `Md2DocxView` preset dropdown to list both presets with per-preset description text (not hardcoded「含目录与页码」)

## 4. Verification

- [x] 4.1 Manual test: minimal-clean — no TOC page, no header/footer/page numbers, content flows across pages
- [x] 4.2 Manual test: business-report — unchanged behavior (TOC + page numbers)
- [x] 4.3 Manual test: preset selection persists after restart
- [x] 4.4 `npm run build` succeeds

## 1. Dependencies and shared types

- [x] 1.1 Add `@mohtasham/md-to-docx` to `package.json` dependencies
- [x] 1.2 Add `src/shared/md2docx.ts` (convert result types, preset id, recent entry types)

## 2. Plugin scaffold

- [x] 2.1 Add `plugins/md2docx/plugin.json` (id `md2docx`, name「Markdown 转 Word」, launchKeywords)
- [x] 2.2 Register `Md2DocxPlugin` in `PluginHost` and `PLUGIN_VIEWS` / `SURFACE_TITLES` mapping

## 3. Main process — presets, sections, and converter

- [x] 3.1 Implement `presets.ts` with `business-report` style (微软雅黑, 层级字号, 1.5 行距, 两端对齐, TOC 分级样式)
- [x] 3.2 Implement `prepareSections.ts` (extract H1 title, auto-insert `[TOC]`, split TOC/body markdown)
- [x] 3.3 Implement `Md2DocxStore` (`data/md2docx.json`, recent list cap 10, presetId persistence)
- [x] 3.4 Implement `Md2DocxConverter` using two-section layout: TOC section (no page numbers) + body section (header title, footer page numbers starting at 1)
- [x] 3.5 Implement `Md2DocxPlugin` IPC: pickSource, pickOutput, convert, getPreset, setPreset, openFile, revealInFolder, listRecent

## 4. Preload bridge

- [x] 4.1 Extend `preload/index.ts` and `index.d.ts` with `toolbox.md2docx` API (including preset get/set)
- [x] 4.2 Add `resolveDroppedFile` for drag-and-drop path resolution

## 5. Renderer — conversion UI

- [x] 5.1 Create `Md2DocxView.tsx` with preset selector (商务汇报), drop zone, file picker, output path, convert button
- [x] 5.2 Add loading/disabled state during conversion and success/error result panel
- [x] 5.3 Implement post-conversion actions (open file, reveal in folder) and recent list re-select
- [x] 5.4 Add `md2docx.css` aligned with toolbox immersive view styling

## 6. Documentation and verification

- [x] 6.1 Update `AGENTS.md` built-in tools table with md2docx entry
- [x] 6.2 Manual test: long doc with H1–H3, verify TOC clickable, TOC pages have no numbers, body pages show header title and footer page numbers from 1
- [x] 6.3 Manual test: pick file, drag file, convert, open output, recent list, Launcher keyword search
- [x] 6.4 `npm run build` succeeds

## 1. Shortcut unpinned launch

- [x] 1.1 Add `ensureUnpinned()` in `window.ts` (clear pin, skipTaskbar, restore O-ring icon, broadcast)
- [x] 1.2 Call from `navOpenTool(..., 'shortcut')` before `showMainWindow`
- [x] 1.3 Verify `openClipboard` IPC and `ShortcutManager` path both use shortcut navigation

## 2. Clipboard scrollbar styling

- [x] 2.1 Add cyber thin scrollbar rules to `.clipboard-list-pane` (firefox + webkit)
- [x] 2.2 Match accent colors with launcher scroll areas

## 3. Floating clipboard toolbar

- [x] 3.1 Restructure `.clipboard-main` — list pane full width, toolbar `position: absolute`
- [x] 3.2 Position toolbar right of content, left of scrollbar gutter (~10–12px from edge)
- [x] 3.3 Floating panel styles (radius, border/shadow); remove full-height `border-left` column
- [x] 3.4 Add list pane `padding-right` for toolbar width

## 4. Clipboard keyboard navigation

- [x] 4.1 Default `activeId` to `items[0]` when list loads or filter changes
- [x] 4.2 `ArrowUp` / `ArrowDown` move active row with scroll-into-view (no copy)
- [x] 4.3 `Enter` triggers copy for active row
- [x] 4.4 Skip handler when search input, modal, or confirm dialog focused/open

## 5. Toolbar keyboard shortcuts

- [x] 5.1 Map single-letter `P/V/C/M/F/X/E/S/L` to toolbar actions via shared `handleToolbar`
- [x] 5.2 Update `ClipboardToolbar` button `title` with shortcut hints

## 6. Verification

- [x] 6.1 Pin clipboard → invoke openClipboard shortcut → opens unpinned with plugin top bar
- [x] 6.2 Launcher-open while pinned → pin state unchanged
- [x] 6.3 Scrollbar + floating toolbar visual check on long clipboard list
- [x] 6.4 Open clipboard → first row active → arrows move → Enter copies → C copies
- [x] 6.5 `npm run build` succeeds

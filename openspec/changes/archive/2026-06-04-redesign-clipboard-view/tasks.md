## 1. Data model & store

- [x] 1.1 Extend `clipboard_items` with `pinned`, `favorite` columns + migration in `ClipboardStore.initSchema`
- [x] 1.2 Extend `ClipboardItem` type with `pinned`, `favorite`
- [x] 1.3 Update `list()` with `type` / `favorite` filters and `ORDER BY pinned DESC, created_at DESC`
- [x] 1.4 Add store methods: `setPinned`, `setFavorite`, `updateText`, `deleteMany`, `clearAll`, `count`

## 2. Main IPC & preload

- [x] 2.1 Extend `clipboard:list` params; add handlers: `setPinned`, `setFavorite`, `update`, `saveAs`, `clearAll`, `deleteMany`, `count`, `getImagePreview`
- [x] 2.2 Implement `saveAs` with `dialog.showSaveDialog` in main
- [x] 2.3 Expose new APIs in `preload/index.ts` + `index.d.ts`

## 3. Clipboard layout & top bar

- [x] 3.1 Create `clipboard.css` with flex layout (list + right toolbar)
- [x] 3.2 Merge title + search into `.clipboard-top-bar`; remove pause button
- [x] 3.3 Add Tab bar: 全部 / 文本 / 图片 / 文件 / 收藏

## 4. List rows

- [x] 4.1 Replace table with `.clipboard-list` rows: time + content preview only
- [x] 4.2 Type-specific preview: text excerpt, **inline image thumbnail** via `getImagePreview`, file names
- [x] 4.3 Single-click → `copyToSystem` + set `activeId` highlight; multi-select mode toggles checkbox without copy
- [x] 4.4 Row badges for pinned (📌) and favorite (★)

## 5. Right vertical toolbar（一次实现 9 项）

- [x] 5.1 `ClipboardToolbar` component with all 9 actions + 2 spacer slots
- [x] 5.2 Wire pin, details, copy, multi-select, favorite, delete, edit, save-as, clear-all to `activeId` / checked ids
- [x] 5.3 Disable 1–8 when no `activeId`; batch delete in multi-select; pin max 5
- [x] 5.4 `ClipboardDetailModal` for details (large image preview in modal only)

## 6. Edit & confirmations

- [x] 6.1 Inline or modal edit for text/html items
- [x] 6.2 Confirm dialogs for delete, clear-all

## 7. Verification

- [x] 7.1 Manual test: each tab filter, pin sort, favorite tab, toolbar actions
- [x] 7.2 Manual test: multi-select bulk delete, save-as, clear-all
- [x] 7.3 `npm run build` succeeds

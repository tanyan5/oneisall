## 1. Shared types and plugin scaffold

- [x] 1.1 Add `plugins/shankai/plugin.json` (id `shankai`, name「闪开」)
- [x] 1.2 Add `src/shared/shankai.ts` (Module, Shortcut, LauncherItem kinds)
- [x] 1.3 Register `ShankaiPlugin` in `PluginHost` and `PLUGIN_VIEWS` mapping

## 2. Main process — Shankai store and launch

- [x] 2.1 Implement `ShankaiStore` (`data/shankai.json`: modules, shortcuts, recentLaunches)
- [x] 2.2 Enforce global `targetPath` uniqueness and non-empty module delete guard
- [x] 2.3 Implement `moveShortcut` and launch helper (`.lnk` / `.exe`, no args)
- [x] 2.4 Implement `ShankaiPlugin` IPC: module CRUD, shortcut add/move/remove, launch, getIcon, pickTarget, listAll for launcher

## 3. Launcher integration (方案 A)

- [x] 3.1 Add merged recent provider (tools + shankai apps, 10 slots by lastUsedAt)
- [x] 3.2 Extend launcher IPC/preload for mixed recent and mixed search
- [x] 3.3 Update `LauncherView` for kind labels, app launch vs tool open routing
- [x] 3.4 Extend search utility to include Shankai app names

## 4. Preload bridge

- [x] 4.1 Extend `preload/index.ts` and `index.d.ts` with `toolbox.shankai` API
- [x] 4.2 Update launcher preload if needed for new recent/search shapes

## 5. Renderer — Shankai modular home

- [x] 5.1 Create `ShankaiView.tsx` with module blocks +「新建模块」placeholder
- [x] 5.2 Implement dual themes (`cyber-grid`, `aurora`) in `shankai.css` with reduced-motion static fallback
- [x] 5.3 Add theme switcher control + `getTheme`/`setTheme` persistence in `shankai.json`
- [x] 5.4 Module rename, empty-only delete, per-module `[+]` add with move-on-duplicate dialog
- [x] 5.5 App tiles: icon + name, createdAt desc, hover delete with confirm, click launch
- [x] 5.6 Empty states (no modules, empty module)

## 6. Documentation and verification

- [x] 6.1 Update `README.md` (Shankai modules + Launcher mixed recents)
- [x] 6.2 Manual test: modules, add/move/delete rules, launch, Launcher mixed recent/search
- [x] 6.3 `npm run build` succeeds

## 7. UX follow-up (post-apply)

- [x] 7.1 Fix module menu and app remove z-index so controls are not blocked by adjacent modules
- [x] 7.2 Add drag-and-drop from desktop onto module blocks (`resolveDroppedFile` + drop handlers)
- [x] 7.3 Sync OpenSpec (proposal, design, specs) with drag-drop and overlay requirements

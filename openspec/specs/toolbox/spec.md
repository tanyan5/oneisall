# Toolbox Host Specification

## Purpose

OneIsAll is a Windows desktop toolbox that hosts multiple utility tools behind a single shell with system tray integration.
## Requirements
### Requirement: Plugin model

Tools SHALL be discovered via `plugin.json` manifests under `plugins/` and `%APPDATA%/OneIsAll/plugins/`. Each plugin SHALL expose `id`, `name`, `version`, and optional `capabilities`. The host SHALL activate enabled plugins at startup and expose tool metadata to the renderer via IPC.

#### Scenario: Tool discovery

- **WHEN** the application starts
- **THEN** enabled tools from plugin manifests are registered and exposed to the renderer

### Requirement: Shell UI

The main window SHALL show a sidebar of enabled tools and a content area for the active view. The sidebar SHALL include a **Home** entry at the top that shows the built-in Home overview. Sidebar navigation entries for Home, each enabled tool, and Settings SHALL display a recognizable icon alongside the label text. When the user opens the main window without a specific tool target, the content area SHALL default to Home. When the user selects a tool from the sidebar or Home, the content area SHALL show that tool's view. Closing the main window hides it; the app remains running in the tray.

#### Scenario: Default main window entry

- **WHEN** user opens the main window without a tool-specific entry point
- **THEN** Home is shown in the content area and the Home sidebar entry is active

#### Scenario: Sidebar tool navigation

- **WHEN** user clicks a tool in the sidebar
- **THEN** that tool's view replaces the content area

#### Scenario: Sidebar shows tool icons

- **WHEN** the sidebar lists Home, enabled tools, or Settings
- **THEN** each entry shows an icon next to its label

#### Scenario: Window hide on close

- **WHEN** user closes the main window
- **THEN** the window is hidden and the application continues running in the tray

### Requirement: Frameless window drag

The main toolbox window SHALL be movable by mouse drag despite using a frameless window chrome. Designated non-interactive regions (sidebar brand area, immersive view top bars, and equivalent shell chrome) SHALL act as drag handles via `-webkit-app-region: drag`. Interactive controls (inputs, buttons, list rows, scrollable content) SHALL use `-webkit-app-region: no-drag`.

#### Scenario: Drag main window from sidebar shell

- **WHEN** user presses and drags a designated drag region on the Home shell
- **THEN** the main window moves with the pointer

#### Scenario: Drag immersive plugin window

- **WHEN** user presses and drags the plugin top bar drag region
- **THEN** the main window moves and controls in the top bar remain usable

#### Scenario: Interactive controls do not drag

- **WHEN** user clicks or drags inside a search input, button, or list row
- **THEN** the window does not move and the control receives the interaction

### Requirement: Navigation stack and Escape back

The host SHALL maintain a per-window navigation stack for toolbox window sessions. Pressing Escape SHALL first dismiss in-view overlays (keyword panel, modals) if any; otherwise SHALL pop one stack frame and show the previous surface. When the previous surface is the launcher overlay, the window SHALL be hidden and the launcher SHALL be shown with search focused. When the current surface is the launcher overlay, Escape SHALL hide the launcher.

When a toolbox window is in **pin mode**, Escape SHALL NOT pop the navigation stack or hide that window after overlays are dismissed. The user SHALL hide a pinned window only via that window's shell window-chrome close control or an equivalent explicit close action.

Opening a tool via a global shortcut (e.g. openClipboard) SHALL record back target as the launcher overlay so Escape from that tool returns to the launcher even if the user did not open the launcher earlier in the session.

Opening a tool via a global shortcut or the launcher SHALL focus an existing **pinned** window for that same tool if one is registered, without creating a new unpinned session.

Opening a tool via a global shortcut for a **different** tool SHALL open in the standard unpinned immersive layout on the hub window (plugin top bar visible, no shell `WindowChrome`, not on taskbar).

Opening a tool from the launcher when no pinned window exists for that tool SHALL open on the hub window in unpinned immersive layout. Opening a **different** tool from the launcher while other tools remain pinned SHALL NOT affect those pinned windows.

When the hub window is visible showing an **unpinned** plugin tool view and the user presses the `openLauncher` global shortcut, the host SHALL hide the hub window, remember the dismissed tool id for restore, and SHALL NOT show the launcher overlay.

When the hub window is hidden, the launcher overlay is not visible, and a dismissed unpinned tool id is remembered, pressing `openLauncher` again SHALL restore the hub window on that tool view (still unpinned) without showing the launcher overlay, then clear the dismissed-session memory.

When neither dismiss nor restore applies, `openLauncher` SHALL toggle the launcher overlay as before.

Closing a pinned window via chrome close SHALL clear that window's pin registration and remove it from the taskbar so subsequent launcher or shortcut opens for that tool use an unpinned hub session.

#### Scenario: Escape ignored in pinned plugin

- **WHEN** user has an immersive plugin open in pin mode with no modal overlay and presses Escape
- **THEN** that window remains visible and pinned and navigation does not pop

#### Scenario: Escape still dismisses overlays in pin mode

- **WHEN** user has pin mode active and an in-view overlay such as the keyword panel is open
- **THEN** the first Escape dismisses the overlay without hiding the pinned window

#### Scenario: Same-tool shortcut or launcher focuses pinned window

- **WHEN** user invokes a global shortcut or selects a toolbox plugin in the launcher while that tool already has a pinned window on the taskbar
- **THEN** the existing pinned window is shown and focused and no new unpinned session is created

#### Scenario: Shortcut opens different tool unpinned

- **WHEN** user invokes a global shortcut for a different tool while another tool has a pinned window
- **THEN** the requested tool opens unpinned on the hub window without affecting pinned windows

#### Scenario: Launcher opens different tool while pinned

- **WHEN** user has plugin A pinned on the taskbar and selects plugin B in the launcher
- **THEN** plugin A remains pinned on the taskbar and plugin B opens unpinned on the hub window

#### Scenario: Close pinned window clears pin registration

- **WHEN** user closes a pinned plugin window via chrome close
- **THEN** that window is hidden, removed from the taskbar, and subsequent launcher opens for that tool use an unpinned hub session

#### Scenario: Escape from plugin opened via launcher

- **WHEN** user opened a plugin from the launcher in unpinned mode and presses Escape in the immersive view
- **THEN** the hub window is hidden and the launcher overlay is shown with search focused

#### Scenario: Escape from plugin opened via Home

- **WHEN** user opened Home from the launcher O-ring control, then opened a plugin from Home, and presses Escape in the plugin
- **THEN** the window shows the Home shell (sidebar + Home content)

#### Scenario: Escape from Home shell

- **WHEN** user opened Home from the launcher and presses Escape on the Home shell
- **THEN** the window is hidden and the launcher overlay is shown

#### Scenario: Escape from global shortcut tool

- **WHEN** user opened a plugin via a global shortcut in unpinned mode and presses Escape
- **THEN** the hub window is hidden and the launcher overlay is shown

#### Scenario: Escape on launcher

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: openLauncher dismisses unpinned plugin

- **WHEN** the hub window shows an unpinned plugin tool and the launcher overlay is not visible
- **THEN** pressing openLauncher hides the hub window without showing the launcher overlay

#### Scenario: openLauncher restores dismissed plugin

- **WHEN** the hub window was dismissed via openLauncher while showing an unpinned plugin and the launcher overlay is not visible
- **THEN** pressing openLauncher again shows the hub window on the same plugin still unpinned

#### Scenario: openLauncher toggles overlay when idle

- **WHEN** neither an unpinned plugin dismiss nor a dismissed-session restore applies
- **THEN** pressing openLauncher toggles the launcher overlay visibility as before

### Requirement: System integration

The system SHALL provide a system tray context menu with **显示**, **设置**, and **退出**. The menu SHALL NOT include **隐藏**. Double-clicking the tray icon SHALL show the launcher overlay.

#### Scenario: Tray menu without hide

- **WHEN** user opens the tray context menu
- **THEN** 显示, 设置, and 退出 are shown and 隐藏 is not shown

### Requirement: Recent tools persistence

The host SHALL persist a recent-tools list of up to 10 plugin ids ordered by most recent use. Each time the user opens a tool (from launcher, Home, or sidebar), the host SHALL update this list.

#### Scenario: Recent list updated on tool open

- **WHEN** user opens a plugin tool
- **THEN** that tool id is moved to the front of the recent list and the list is trimmed to 10 entries

### Requirement: Security

The renderer SHALL use `contextIsolation` with a preload bridge; `nodeIntegration` SHALL NOT be enabled in the renderer.

#### Scenario: Renderer isolation

- **WHEN** a tool view loads in the renderer
- **THEN** it accesses main-process APIs only through the preload bridge

### Requirement: Built-in home route identity

The shell SHALL treat `home` as a reserved built-in route identifier that is not backed by a `plugins/` manifest. Tool plugins SHALL NOT use the id `home`.

#### Scenario: Plugin id collision prevention

- **WHEN** a plugin manifest uses id `home`
- **THEN** the host ignores or rejects registration of that plugin (host-defined policy documented in design)

### Requirement: Built-in settings route identity

The shell SHALL treat `settings` as a reserved built-in route identifier that is not backed by a `plugins/` manifest.

#### Scenario: Settings route reserved

- **WHEN** the host initializes plugin discovery
- **THEN** plugin id `settings` is not registered as a tool plugin

### Requirement: Built-in cyber-style icon artwork

The host SHALL ship built-in PNG icons for plugins `clipboard`, `shankai`, and `demo`, and for shell navigation targets `home` and `settings`. These icons SHALL use a cohesive **cyber** visual language (dark base, neon accent lines, grid or scan-line motifs, recognizable pictogram per tool) and SHALL NOT be flat single-color placeholders. Icons SHALL remain legible when displayed at 20px (sidebar, window chrome, plugin top bars) and 48px (Home cards).

The clipboard plugin icon SHALL depict a clipboard board with clip and stacked card/lines motif consistent with the cyber icon family.

#### Scenario: Clipboard icon is recognizable cyber glyph

- **WHEN** the user views the clipboard tool in Home, sidebar, launcher, plugin top bar, or pinned taskbar
- **THEN** the icon shows a distinct clipboard pictogram on the cyber dark base, not a generic block or emoji

#### Scenario: Built-in plugin icons are patterned

- **WHEN** the user views Home, sidebar, or Launcher entries for clipboard, shankai, or demo
- **THEN** each tool shows a distinct cyber-style patterned icon rather than a solid color block

#### Scenario: Navigation icons match cyber style

- **WHEN** the user views sidebar entries for Home or Settings
- **THEN** each entry shows a cyber-style patterned icon consistent with built-in plugin icons

#### Scenario: Icon files remain on existing paths

- **WHEN** the host resolves icons via `ToolIconService`
- **THEN** built-in icons are loaded from existing paths (`plugins/<id>/icon.png` and `resources/nav/<id>.png`) without API changes

### Requirement: Application brand identity

The application SHALL use a unified **O-ring** brand mark (abstract breathing jellyfish bell as the letter O) across the management center top bar, launcher home control, system tray, and Windows application icon. The mark SHALL consist of a cyan ring stroke with an optional center highlight dot at sizes 20px and above. The mark SHALL NOT include tentacles, lion imagery, or the diamond fallback glyph.

Tray and taskbar icons SHALL be static (no animation). The management center top bar and launcher home control MAY display a subtle breathing animation on the ring per reduced-motion preferences.

The primary brand accent color SHALL be `#22D3EE` for the O-ring across UI and generated tray assets.

#### Scenario: Top bar shows O-ring brand

- **WHEN** user views the management center top bar
- **THEN** an O-ring brand icon is shown with subtle breathing animation and no text wordmark

#### Scenario: Launcher home control uses same mark

- **WHEN** user opens the launcher overlay
- **THEN** the home control beside the search field shows the same O-ring family with normal breathing animation

#### Scenario: No diamond fallback

- **WHEN** brand assets are rendered in the shell
- **THEN** the diamond ◆ placeholder is not used

#### Scenario: Tray icon matches brand

- **WHEN** the application is running in the system tray
- **THEN** the tray icon depicts the O-ring on the dark cyber base consistent with generated brand assets

### Requirement: Unified application branding

The application SHALL use the display name **OneIsAll** consistently in window titles, tray tooltip, and packaged product name. The Windows taskbar, window, and installer icon SHALL default to the **O-ring** branded asset (not the default Electron icon).

When the main window is in **pin mode** on an **immersive plugin view**, the Windows taskbar and window icon SHALL switch to that plugin's resolved `icon.png` (via `ToolIconService`). When pin mode ends or the user is on the Management Center / Home surface, the icon SHALL restore to the O-ring brand asset.

#### Scenario: Taskbar icon matches tray brand by default

- **WHEN** the application is running on Windows and no immersive plugin is pinned
- **THEN** the taskbar/window icon visually matches the O-ring tray icon family

#### Scenario: Pinned plugin shows plugin icon on taskbar

- **WHEN** user pins an immersive plugin view (e.g. clipboard) with Ctrl+D
- **THEN** the Windows taskbar and window icon show that plugin's `icon.png`, not the O-ring

#### Scenario: Unpin restores brand icon

- **WHEN** user toggles pin mode off or navigates to Management Center while pinned
- **THEN** the taskbar/window icon restores to the O-ring brand asset

#### Scenario: Consistent product name

- **WHEN** user views the main window title or tray tooltip
- **THEN** the name shown is OneIsAll (host-defined localized suffix allowed, e.g.「OneIsAll 工具集」)

### Requirement: Window pin mode

Each toolbox window (Management Center shell, immersive plugin views, and Settings) SHALL support **pin mode** toggled by **Ctrl+D** while that window is focused. The launcher overlay SHALL NOT support pin mode. When pin mode is active on a window, that window SHALL appear in the Windows taskbar (`skipTaskbar: false`) with the active plugin icon when applicable.

Multiple plugin windows MAY be pinned simultaneously; each pinned plugin SHALL have its own taskbar entry. Pinning a window SHALL spawn a separate hidden hub window for subsequent unpinned launcher sessions.

When pin mode is active, the window SHALL display window chrome controls (**pin to top**, **minimize**, **maximize/restore**, **close**) using **SVG outline icons** styled with the application muted/text colors—not emoji or system-default colored glyphs. The pin-to-top control SHALL show an active state using brighter text color when always-on-top is enabled.

On immersive plugin views in pin mode, the window chrome row SHALL display the **active plugin's icon** (same asset as taskbar and `plugins/<id>/icon.png`) at the leading position, loaded via the shared tool icon resolver—not emoji or a separate hardcoded glyph.

On the **Management Center** surface, pin mode SHALL append chrome controls to the right of the existing `mgmt-top-bar` row (brand logo + search). Pin mode SHALL NOT replace or remove the logo or search field.

The Management Center search placeholder SHALL read `搜索 {count} 款插件应用...` with live catalog count and launcher-equivalent fuzzy filtering.

Toggling pin mode off SHALL remove chrome controls from the top bar and restore the frameless layout below.

Closing a pinned window via chrome close SHALL clear pin mode for that window and remove it from the taskbar without destroying other pinned windows.

#### Scenario: Immersive chrome shows plugin icon

- **WHEN** user pins an immersive plugin view such as clipboard
- **THEN** the window chrome leading icon matches that plugin's `icon.png`

#### Scenario: Multiple pinned plugins on taskbar

- **WHEN** user pins plugin A and later pins plugin B on a separate window
- **THEN** both plugin A and plugin B appear as separate taskbar entries

#### Scenario: Toggle pin with Ctrl+D

- **WHEN** user presses Ctrl+D while a toolbox window is focused
- **THEN** pin mode toggles on that window and chrome controls appear or disappear on the top bar

#### Scenario: Pin controls use SVG icons

- **WHEN** pin mode is active
- **THEN** window controls render as SVG outline icons consistent with the dark theme, not colored emoji

#### Scenario: Pin top toggle visual state

- **WHEN** user enables always-on-top via the pin control
- **THEN** the control shows active state with brighter text color, not a red emoji pin

#### Scenario: Management center logo and search unchanged when pinned

- **WHEN** user pins the Management Center
- **THEN** brand logo and search field remain on the same top row with controls appended on the right

#### Scenario: Close pinned window

- **WHEN** user clicks close in the chrome controls on a pinned window
- **THEN** that window is hidden, pin registration is cleared, and other pinned windows remain on the taskbar


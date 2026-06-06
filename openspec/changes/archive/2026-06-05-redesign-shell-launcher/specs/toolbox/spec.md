## MODIFIED Requirements

### Requirement: Plugin model

Tools SHALL be discovered via `plugin.json` manifests under `plugins/` and `%APPDATA%/OneIsAll/plugins/`. Each plugin SHALL expose `id`, `name`, `version`, and optional `capabilities`. Plugin manifests MAY include optional `launchKeywords`: an array of quick-launch keyword entries, each with a stable `id`, display `label`, and a list of `actions` (`id` + `label`) shown in Home preview dropdowns. The host SHALL expose parsed `launchKeywords` to the renderer via tool metadata IPC. The host SHALL persist user-pinned keywords for the Launcher search area in application settings.

#### Scenario: Tool discovery

- **WHEN** the application starts
- **THEN** enabled tools from plugin manifests are registered and exposed to the renderer

#### Scenario: Launch keywords from manifest

- **WHEN** a plugin manifest defines `launchKeywords`
- **THEN** the host includes them in tool metadata for Home preview and pinning

## MODIFIED Requirements

### Requirement: Shell UI

The main window SHALL use a frameless shell without minimize, maximize, or close title-bar controls in any view. When the Home overview is active (`activeId === 'home'`), the shell SHALL show a sidebar of enabled tool plugins (without a separate **Home** nav entry) and a Home master-detail content area. The sidebar SHALL retain **Settings** in the footer. When the user opens a tool or Settings from Home preview, the shell SHALL switch to an **immersive** layout: the sidebar and plugin list SHALL be hidden and the content area SHALL show only that tool's or Settings view at full window size. When the user opens the main window without a specific tool target, the Home overview SHALL be shown. Closing the main window hides it to the tray; the app remains running in the tray.

The shell SHALL support **layered Escape dismissal** on the main window: close open Home UI popovers first; if a tool or Settings view is active, return to Home overview; if Home overview is active, hide the main window to the tray.

#### Scenario: Default main window entry

- **WHEN** user opens the main window without a tool-specific entry point
- **THEN** Home overview is shown and no tool plugin view is active

#### Scenario: Sidebar selects tool for preview

- **WHEN** user clicks a tool in the sidebar while Home overview is active
- **THEN** the Home preview updates for that tool without entering immersive plugin view

#### Scenario: Immersive plugin view

- **WHEN** user opens a tool from Home preview or from a direct entry (e.g. launcher, tray shortcut)
- **THEN** the sidebar is hidden and only that tool's view is shown full-window

#### Scenario: Escape from plugin to home

- **WHEN** a tool or Settings view is active and user presses Escape with no open Home popover
- **THEN** the shell returns to Home overview with sidebar visible

#### Scenario: Escape from home hides window

- **WHEN** Home overview is active and user presses Escape with no open popover
- **THEN** the main window is hidden to the tray

#### Scenario: Sidebar has no Home entry

- **WHEN** the sidebar is rendered
- **THEN** there is no「主页」navigation item above the plugin list

#### Scenario: Sidebar shows tool icons

- **WHEN** the sidebar lists enabled tools or Settings
- **THEN** each entry shows an icon next to its label

#### Scenario: Window hide on close

- **WHEN** user closes the main window
- **THEN** the window is hidden and the application continues running in the tray

## MODIFIED Requirements

### Requirement: System integration

The system SHALL provide a system tray context menu with **only** **Settings** (设置) and **Quit** (退出). The menu SHALL NOT include entries for opening the main window, opening the clipboard tool, or pausing/resuming clipboard capture. Configured global shortcuts SHALL continue to perform host actions: `openLauncher` toggles the launcher overlay; `openClipboard` opens the clipboard tool in the main window. Default shortcuts SHALL be `Ctrl+Shift+Space` for openLauncher and `Ctrl+Shift+V` for openClipboard until changed in Settings. The host MAY provide non-menu tray interactions (e.g. double-click to open Home) outside the context menu.

#### Scenario: Tray menu minimal items

- **WHEN** user opens the tray context menu
- **THEN** only Settings and Quit items are shown

#### Scenario: Tray open settings

- **WHEN** user selects「设置」from the tray menu
- **THEN** the main window is shown with the Settings view active

#### Scenario: Tray quit

- **WHEN** user selects「退出」from the tray menu
- **THEN** the application exits

#### Scenario: Global shortcut to launcher

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown or focused

#### Scenario: Global shortcut to clipboard

- **WHEN** user presses the configured openClipboard global shortcut
- **THEN** the main window is shown with the clipboard tool active

## ADDED Requirements

### Requirement: Unified application branding

The application SHALL use the display name **OneIsAll** consistently in window titles, tray tooltip, and packaged product name. The Windows taskbar, window, and installer icon SHALL use the same branded icon asset derived from the cyber lion tray artwork (not the default Electron icon).

#### Scenario: Taskbar icon matches tray brand

- **WHEN** the application is running on Windows
- **THEN** the taskbar/window icon visually matches the branded tray icon family

#### Scenario: Consistent product name

- **WHEN** user views the main window title or tray tooltip
- **THEN** the name shown is OneIsAll (host-defined localized suffix allowed, e.g.「OneIsAll 工具集」)

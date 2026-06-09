## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut, tray double-click, or tray **显示** menu item. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds (see adaptive height requirement). The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

When the hub window is visible showing an **unpinned** plugin tool view, the `openLauncher` global shortcut SHALL take precedence over overlay toggle and SHALL dismiss the hub session per the toolbox navigation requirement without opening the launcher overlay.

When a dismissed unpinned plugin session is pending restore, the `openLauncher` global shortcut SHALL restore that plugin on the hub window instead of toggling the launcher overlay.

Tray double-click and tray **显示** SHALL continue to open the launcher overlay directly and SHALL NOT trigger hub-session dismiss or restore.

When the launcher is shown—including when returning from the main window via navigation—the overlay SHALL NOT display a visible white flash before themed content appears. The host SHALL use a themed window background color matching the launcher panel and SHALL show the window only after content is ready to paint.

#### Scenario: Open launcher via global shortcut when idle

- **WHEN** user presses the configured openLauncher global shortcut and no unpinned plugin dismiss or restore applies
- **THEN** the launcher overlay is shown and the search field is focused without a white flash

#### Scenario: openLauncher dismisses hub plugin instead of overlay

- **WHEN** the hub window shows an unpinned plugin and user presses openLauncher
- **THEN** the hub window is hidden, the tool id is remembered for restore, and the launcher overlay is not shown

#### Scenario: openLauncher restores hub plugin instead of overlay

- **WHEN** a dismissed unpinned plugin session is pending and user presses openLauncher
- **THEN** the hub window reopens on that plugin unpinned and the launcher overlay is not shown

#### Scenario: Return to launcher from main window

- **WHEN** user navigates back to the launcher from the hub window (e.g. Escape from unpinned plugin)
- **THEN** the launcher appears with themed background immediately without a white frame flash

#### Scenario: Open launcher via tray double-click

- **WHEN** user double-clicks the tray icon
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Close launcher with Escape

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: Close launcher on outside click

- **WHEN** the launcher is visible and user clicks outside the launcher panel
- **THEN** the launcher overlay is hidden

#### Scenario: Close launcher on blur

- **WHEN** the launcher overlay loses focus to another application or desktop
- **THEN** the launcher overlay is hidden

### Requirement: Launcher tool selection opens toolbox

When the user selects a toolbox plugin from the launcher overlay, the host SHALL open that plugin. If the plugin already has a **pinned** window registered, the host SHALL focus that pinned window and hide the launcher overlay. Otherwise the host SHALL open the plugin on the hub window in unpinned immersive layout without affecting other pinned windows.

#### Scenario: Launcher focuses pinned plugin

- **WHEN** user selects a plugin in the launcher that already has a pinned window on the taskbar
- **THEN** the pinned window is shown and focused and the launcher overlay is hidden

#### Scenario: Launcher opens unpinned while others pinned

- **WHEN** user has plugin A pinned and selects plugin B in the launcher
- **THEN** plugin B opens unpinned on the hub window and plugin A remains pinned

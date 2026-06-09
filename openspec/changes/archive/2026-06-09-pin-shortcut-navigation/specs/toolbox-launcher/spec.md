## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut, tray double-click, or tray **显示** menu item. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds (see adaptive height requirement). The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

When the main window is visible showing an **unpinned** plugin tool view, the `openLauncher` global shortcut SHALL take precedence over overlay toggle and SHALL dismiss the plugin session per the main window navigation requirement (hide main window, remember tool for restore) without opening the launcher overlay.

When a dismissed unpinned plugin session is pending restore, the `openLauncher` global shortcut SHALL restore that plugin on the main window instead of toggling the launcher overlay.

Tray double-click and tray **显示** SHALL continue to open the launcher overlay directly and SHALL NOT trigger plugin-session dismiss or restore.

When the launcher is shown—including when returning from the main window via navigation—the overlay SHALL NOT display a visible white flash before themed content appears. The host SHALL use a themed window background color matching the launcher panel and SHALL show the window only after content is ready to paint.

#### Scenario: Open launcher via global shortcut when idle

- **WHEN** user presses the configured openLauncher global shortcut and no unpinned plugin dismiss or restore applies
- **THEN** the launcher overlay is shown and the search field is focused without a white flash

#### Scenario: openLauncher dismisses plugin instead of overlay

- **WHEN** the main window shows an unpinned plugin and user presses openLauncher
- **THEN** the main window is hidden, the tool id is remembered for restore, and the launcher overlay is not shown

#### Scenario: openLauncher restores plugin instead of overlay

- **WHEN** a dismissed unpinned plugin session is pending and user presses openLauncher
- **THEN** the main window reopens on that plugin unpinned and the launcher overlay is not shown

#### Scenario: Return to launcher from main window

- **WHEN** user navigates back to the launcher from the main window (e.g. Escape from unpinned plugin)
- **THEN** the launcher appears with themed background immediately without a white frame flash

#### Scenario: Open launcher via tray double-click

- **WHEN** user double-clicks the tray icon
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Close launcher with Escape

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

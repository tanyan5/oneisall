## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut, tray double-click, or tray **显示** menu item. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds (see adaptive height requirement). The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

When the launcher is shown—including when returning from the main window via navigation—the overlay SHALL NOT display a visible white flash before themed content appears. The host SHALL use a themed window background color matching the launcher panel and SHALL show the window only after content is ready to paint.

#### Scenario: Open launcher via global shortcut

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown and the search field is focused without a white flash

#### Scenario: Return to launcher from main window

- **WHEN** user navigates back to the launcher from the main window (e.g. Escape)
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

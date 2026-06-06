## MODIFIED Requirements

### Requirement: Shell UI

The main window SHALL show a sidebar of enabled tools and a content area for the active view. The sidebar SHALL include a **Home** entry at the top that shows the built-in Home overview. When the user opens the main window without a specific tool target, the content area SHALL default to Home. When the user selects a tool from the sidebar or Home, the content area SHALL show that tool's view. Closing the main window hides it; the app remains running in the tray.

#### Scenario: Default main window entry

- **WHEN** user opens the main window without a tool-specific entry point
- **THEN** Home is shown in the content area and the Home sidebar entry is active

#### Scenario: Sidebar tool navigation

- **WHEN** user clicks a tool in the sidebar
- **THEN** that tool's view replaces the content area

#### Scenario: Window hide on close

- **WHEN** user closes the main window
- **THEN** the window is hidden and the application continues running in the tray

### Requirement: System integration

The system SHALL provide a system tray menu with: open main window (lands on Home), open clipboard tool (lands on clipboard directly), pause/resume clipboard capture, and quit. The global shortcut `Ctrl+Shift+V` SHALL open the clipboard tool directly without showing Home first.

#### Scenario: Tray open main window

- **WHEN** user selects "打开主窗口" from the tray
- **THEN** the main window is shown with the Home view active

#### Scenario: Tray open clipboard

- **WHEN** user selects "打开剪贴板" from the tray
- **THEN** the main window is shown with the clipboard tool active

#### Scenario: Global shortcut to clipboard

- **WHEN** user presses `Ctrl+Shift+V`
- **THEN** the main window is shown with the clipboard tool active

## ADDED Requirements

### Requirement: Built-in home route identity

The shell SHALL treat `home` as a reserved built-in route identifier that is not backed by a `plugins/` manifest. Tool plugins SHALL NOT use the id `home`.

#### Scenario: Plugin id collision prevention

- **WHEN** a plugin manifest uses id `home`
- **THEN** the host ignores or rejects registration of that plugin (host-defined policy documented in design)

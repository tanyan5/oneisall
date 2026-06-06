## MODIFIED Requirements

### Requirement: System integration

The system SHALL provide a system tray menu with: open main window (lands on Home), open clipboard tool (lands on clipboard directly), **Settings** (lands on Settings view), pause/resume clipboard capture, and quit. Configured global shortcuts SHALL perform host actions without showing Home first when the action targets a specific tool. The default global shortcut for open-clipboard SHALL be `Ctrl+Shift+V` until the user changes it in Settings.

#### Scenario: Tray open main window

- **WHEN** user selects "打开主窗口" from the tray
- **THEN** the main window is shown with the Home view active

#### Scenario: Tray open clipboard

- **WHEN** user selects "打开剪贴板" from the tray
- **THEN** the main window is shown with the clipboard tool active

#### Scenario: Tray open settings

- **WHEN** user selects "设置" from the tray
- **THEN** the main window is shown with the Settings view active

#### Scenario: Global shortcut to clipboard

- **WHEN** user presses the configured open-clipboard global shortcut
- **THEN** the main window is shown with the clipboard tool active

## ADDED Requirements

### Requirement: Built-in settings route identity

The shell SHALL treat `settings` as a reserved built-in route identifier that is not backed by a `plugins/` manifest.

#### Scenario: Settings route reserved

- **WHEN** the host initializes plugin discovery
- **THEN** plugin id `settings` is not registered as a tool plugin

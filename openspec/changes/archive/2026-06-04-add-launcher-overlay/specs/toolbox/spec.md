## MODIFIED Requirements

### Requirement: System integration

The system SHALL provide a system tray menu with: open main window (lands on Home), open clipboard tool (lands on clipboard directly), pause/resume clipboard capture, and quit. Configured global shortcuts SHALL perform host actions: `openLauncher` toggles the launcher overlay; `openClipboard` opens the clipboard tool in the main window without showing Home first. Default shortcuts SHALL be `Ctrl+Shift+Space` for openLauncher and `Ctrl+Shift+V` for openClipboard until changed in Settings.

#### Scenario: Tray open main window

- **WHEN** user selects "打开主窗口" from the tray
- **THEN** the main window is shown with the Home view active

#### Scenario: Tray open clipboard

- **WHEN** user selects "打开剪贴板" from the tray
- **THEN** the main window is shown with the clipboard tool active

#### Scenario: Global shortcut to launcher

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown or focused

#### Scenario: Global shortcut to clipboard

- **WHEN** user presses the configured openClipboard global shortcut
- **THEN** the main window is shown with the clipboard tool active

## ADDED Requirements

### Requirement: Recent tools persistence

The host SHALL persist a recent-tools list of up to 10 plugin ids ordered by most recent use. Each time the user opens a tool (from launcher, Home, or sidebar), the host SHALL update this list.

#### Scenario: Recent list updated on tool open

- **WHEN** user opens a plugin tool
- **THEN** that tool id is moved to the front of the recent list and the list is trimmed to 10 entries

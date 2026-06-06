## MODIFIED Requirements

### Requirement: Tray menu settings entry

The system tray context menu SHALL include a「设置」item that opens the main window with the Settings view active. The tray context menu SHALL include only Settings and Quit entries (no other action items).

#### Scenario: Open settings from tray

- **WHEN** user selects「设置」from the tray menu
- **THEN** the main window is shown and the Settings view is active

#### Scenario: Tray has no other action items

- **WHEN** user opens the tray context menu
- **THEN** no items appear for opening main window, clipboard, or clipboard pause/resume

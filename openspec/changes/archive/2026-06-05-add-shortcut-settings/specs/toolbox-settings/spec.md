## ADDED Requirements

### Requirement: Settings view in main window

The shell SHALL provide a built-in Settings view accessible from the main window sidebar. The route id `settings` SHALL be reserved for the host and SHALL NOT be used by plugin manifests.

#### Scenario: Navigate to settings from sidebar

- **WHEN** user clicks「设置」in the main window sidebar
- **THEN** the Settings view is shown in the content area

#### Scenario: Plugin id collision for settings

- **WHEN** a plugin manifest uses id `settings`
- **THEN** the host ignores or rejects that plugin registration

### Requirement: Tray menu settings entry

The system tray context menu SHALL include a「设置」item that opens the main window with the Settings view active.

#### Scenario: Open settings from tray

- **WHEN** user selects「设置」from the tray menu
- **THEN** the main window is shown and the Settings view is active

### Requirement: Configurable global shortcuts

The system SHALL allow the user to configure global keyboard shortcuts for host actions stored in user settings. On application startup and after saving settings, the host SHALL register configured shortcuts using Electron `globalShortcut`.

#### Scenario: Default clipboard shortcut

- **WHEN** no custom shortcut is saved
- **THEN** the default binding for open-clipboard SHALL be `CommandOrControl+Shift+V`

#### Scenario: Save custom shortcut

- **WHEN** user saves a new shortcut for open-clipboard in Settings
- **THEN** the binding is persisted and the host re-registers global shortcuts using the new value

#### Scenario: Registration failure feedback

- **WHEN** a shortcut cannot be registered because it is already taken or invalid
- **THEN** the Settings UI SHALL show an error for that binding and SHALL NOT silently fail

#### Scenario: Restore defaults

- **WHEN** user chooses restore defaults for shortcuts
- **THEN** shortcut bindings revert to built-in defaults and the host attempts re-registration

### Requirement: Shortcut capture in settings UI

The Settings view SHALL provide a control to record a keyboard combination for each configurable shortcut without requiring manual text entry of accelerator strings.

#### Scenario: Record new shortcut

- **WHEN** user activates shortcut capture for open-clipboard and presses a key combination
- **THEN** the UI displays the captured combination in human-readable form before save

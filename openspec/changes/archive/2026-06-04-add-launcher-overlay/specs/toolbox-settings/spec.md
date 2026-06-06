## MODIFIED Requirements

### Requirement: Configurable global shortcuts

The system SHALL allow the user to configure global keyboard shortcuts for host actions stored in user settings. On application startup and after saving settings, the host SHALL register configured shortcuts using Electron `globalShortcut`. Configurable actions SHALL include at minimum `openClipboard` and `openLauncher`.

#### Scenario: Default clipboard shortcut

- **WHEN** no custom shortcut is saved
- **THEN** the default binding for open-clipboard SHALL be `CommandOrControl+Shift+V`

#### Scenario: Default launcher shortcut

- **WHEN** no custom shortcut is saved
- **THEN** the default binding for open-launcher SHALL be `CommandOrControl+Shift+Space`

#### Scenario: Save custom shortcut

- **WHEN** user saves a new shortcut for an action in Settings
- **THEN** the binding is persisted and the host re-registers global shortcuts using the new value

#### Scenario: Registration failure feedback

- **WHEN** a shortcut cannot be registered because it is already taken or invalid
- **THEN** the Settings UI SHALL show an error for that binding and SHALL NOT silently fail

#### Scenario: Restore defaults

- **WHEN** user chooses restore defaults for shortcuts
- **THEN** shortcut bindings revert to built-in defaults and the host attempts re-registration

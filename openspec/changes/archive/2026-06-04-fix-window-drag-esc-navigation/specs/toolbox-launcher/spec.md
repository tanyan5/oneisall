## ADDED Requirements

### Requirement: Launcher window drag

The launcher overlay SHALL be movable by mouse drag despite using a frameless window. Designated non-interactive regions of the launcher panel (top chrome and outer chrome around the search row) SHALL act as drag handles. The search field, jellyfish home control, result list rows, buttons, and footer shortcut chips SHALL NOT initiate window drag.

#### Scenario: Drag launcher overlay

- **WHEN** user presses and drags a designated drag region on the visible launcher panel
- **THEN** the launcher window moves with the pointer

#### Scenario: Launcher search remains interactive

- **WHEN** user clicks or types in the launcher search field
- **THEN** the launcher window does not move and the search field receives focus and input

## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut, tray double-click, or tray **显示** menu item. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds. The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut. Tray **隐藏** SHALL hide the launcher without quitting the application.

#### Scenario: Open launcher via tray double-click

- **WHEN** user double-clicks the tray icon
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Close launcher with Escape

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: Hide launcher from tray menu

- **WHEN** user selects「隐藏」from the tray menu while the launcher is visible
- **THEN** the launcher overlay is hidden

### Requirement: Selecting a tool opens it directly

When the user selects a **toolbox plugin** item from the launcher, the system SHALL record the tool in recent history, hide the launcher overlay, and open the main window on that tool's view without showing Home first. Escape from that tool view SHALL return to the launcher overlay per the main window navigation stack requirement.

When the user selects a **Shankai application** item from the launcher, the system SHALL launch the application directly, record the launch in merged recent history, and hide the launcher overlay without opening the main window.

#### Scenario: Open tool from launcher

- **WHEN** user confirms selection of a toolbox plugin in the launcher
- **THEN** the launcher hides, recent history is updated, and the main window shows that tool

#### Scenario: Escape from launcher-opened tool

- **WHEN** user opened a toolbox plugin from the launcher and presses Escape in the main window tool view
- **THEN** the launcher overlay is shown again with search focused and the main window is hidden

#### Scenario: Open Shankai app from launcher

- **WHEN** user confirms selection of a Shankai application in the launcher
- **THEN** the launcher hides, the application process is started, and merged recent history is updated

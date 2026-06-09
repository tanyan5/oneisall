## MODIFIED Requirements

### Requirement: Selecting a tool opens it directly

When the user selects a **toolbox plugin** item from the launcher, the system SHALL record the tool in recent history, hide the launcher overlay, **clear window pin mode**, and open the main window on that tool's view in the standard unpinned immersive layout without showing Home first. Escape from that tool view SHALL return to the launcher overlay per the main window navigation stack requirement.

When the user selects a **Shankai application** item from the launcher, the system SHALL launch the application directly, record the launch in merged recent history, and hide the launcher overlay without opening the main window.

#### Scenario: Open tool from launcher unpinned

- **WHEN** user confirms selection of a toolbox plugin in the launcher while pin mode was active
- **THEN** the launcher hides, recent history is updated, pin mode is cleared, and the main window shows that tool without shell WindowChrome

#### Scenario: Open different tool from launcher while pinned

- **WHEN** user has plugin A pinned on the main window and selects plugin B in the launcher
- **THEN** the launcher hides and the main window shows plugin B in unpinned layout

#### Scenario: Escape from launcher-opened tool

- **WHEN** user opened a toolbox plugin from the launcher and presses Escape in the main window tool view
- **THEN** the launcher overlay is shown again with search focused and the main window is hidden

#### Scenario: Open Shankai app from launcher

- **WHEN** user confirms selection of a Shankai application in the launcher
- **THEN** the launcher hides, the application process is started, and merged recent history is updated

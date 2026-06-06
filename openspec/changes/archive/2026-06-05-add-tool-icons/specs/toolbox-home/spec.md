## MODIFIED Requirements

### Requirement: Home view displays enabled tools

The system SHALL show a built-in Home view in the main content area that lists all enabled tools returned by the tools list API, presented as selectable cards with each tool's icon and name visible. A one-line description or version MAY appear below the name.

#### Scenario: User opens main window from tray

- **WHEN** user chooses "打开主窗口" from the tray menu
- **THEN** the main window shows the Home view with all enabled tools listed as icon cards

#### Scenario: User selects a tool from Home

- **WHEN** user clicks a tool card on the Home view
- **THEN** the shell navigates to that tool's view and the sidebar highlights the corresponding tool (or leaves Home if only content area changes per design)

#### Scenario: Tool icon on home card

- **WHEN** Home lists an enabled tool that has a resolvable icon
- **THEN** the tool card displays the icon above the tool name

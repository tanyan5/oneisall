## ADDED Requirements

### Requirement: Home view displays enabled tools

The system SHALL show a built-in Home view in the main content area that lists all enabled tools returned by the tools list API, presented as selectable cards or rows with at least the tool name visible.

#### Scenario: User opens main window from tray

- **WHEN** user chooses "打开主窗口" from the tray menu
- **THEN** the main window shows the Home view with all enabled tools listed

#### Scenario: User selects a tool from Home

- **WHEN** user clicks a tool card on the Home view
- **THEN** the shell navigates to that tool's view and the sidebar highlights the corresponding tool (or leaves Home if only content area changes per design)

### Requirement: Home is lightweight overview only

The Home view SHALL NOT duplicate full tool functionality. It SHALL only provide navigation, optional one-line descriptions, and shortcut hints. It SHALL NOT include analytics dashboards, feeds, or plugin management beyond listing tools.

#### Scenario: Home content scope

- **WHEN** Home view is displayed
- **THEN** user sees tool launch targets and optional hints only, not embedded tool UIs

### Requirement: Optional last-used tool emphasis

The system MAY highlight the most recently used tool on Home. If implemented, last-used state SHALL persist across sessions in user data.

#### Scenario: Return visit shows recent tool

- **WHEN** user has previously opened a tool in this session or a prior session (if persistence enabled)
- **THEN** Home visually indicates that tool as recently used

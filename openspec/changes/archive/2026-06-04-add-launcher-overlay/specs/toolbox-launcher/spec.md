## ADDED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened.

#### Scenario: Open launcher via global shortcut

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Close launcher with Escape

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

### Requirement: Empty search shows recent tools in first section only

When the launcher search query is empty, the launcher SHALL display only the user's recent tools (maximum 10) in the first section. The second section SHALL NOT be shown.

#### Scenario: No search query

- **WHEN** launcher opens with an empty search field
- **THEN** the first section lists up to 10 recent tools and the second section is not visible

#### Scenario: No recent history

- **WHEN** launcher opens with an empty search field and the user has no recent tools
- **THEN** the first section shows an empty-state hint to search for a tool

### Requirement: Search shows two-tier results

When the user enters a non-empty search query, the launcher SHALL show matching enabled tools in two sections: the first section SHALL contain the highest-scoring fuzzy matches; the second section SHALL contain other matching tools not already listed in the first section. If the second section has no items, it SHALL NOT be shown.

#### Scenario: Fuzzy primary matches

- **WHEN** user types a keyword that matches tool names or descriptions
- **THEN** the first section lists the best-ranked matches

#### Scenario: Secondary matches

- **WHEN** additional enabled tools match the keyword but are not in the first section
- **THEN** those tools appear in the second section

#### Scenario: No secondary matches

- **WHEN** all matches are shown in the first section only
- **THEN** the second section is hidden

### Requirement: Selecting a tool opens it directly

When the user selects a tool from the launcher, the system SHALL record the tool in recent history, hide the launcher overlay, and open the main window on that tool's view without showing Home first.

#### Scenario: Open tool from launcher

- **WHEN** user confirms selection of a tool in the launcher
- **THEN** the launcher hides, recent tools are updated, and the main window shows that tool

### Requirement: Launcher keyboard navigation

The launcher SHALL support keyboard navigation across visible items and confirmation of the highlighted item.

#### Scenario: Arrow key navigation

- **WHEN** launcher is visible
- **THEN** user can move highlight with Up and Down arrow keys across items in section order

#### Scenario: Enter confirms selection

- **WHEN** user presses Enter on a highlighted tool
- **THEN** that tool is opened per the direct-open requirement

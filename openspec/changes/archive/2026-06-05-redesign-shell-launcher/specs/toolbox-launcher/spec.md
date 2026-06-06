## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

#### Scenario: Open launcher via global shortcut

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Close launcher with Escape

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: Close launcher on outside click

- **WHEN** the launcher is visible and user clicks outside the launcher panel
- **THEN** the launcher overlay is hidden

#### Scenario: Close launcher on blur

- **WHEN** the launcher overlay loses focus to another application or desktop
- **THEN** the launcher overlay is hidden

## MODIFIED Requirements

### Requirement: Empty search shows recent tools in first section only

When the launcher search query is empty, the launcher SHALL display only the user's recent items (maximum 10) in the first section. Recent items SHALL include both toolbox plugins and Shankai application shortcuts, merged and sorted by most recent use (`lastUsedAt` descending). Recent items SHALL be laid out in a **horizontal row** (or wrapped row) showing icon and name only—without per-item description lines. The second section SHALL NOT be shown.

#### Scenario: No search query with mixed recents

- **WHEN** launcher opens with an empty search field and the user has recent plugin or Shankai app launches
- **THEN** the first section shows up to 10 mixed recent items in a horizontal layout with icons and names only

#### Scenario: No recent history

- **WHEN** launcher opens with an empty search field and the user has no recent items
- **THEN** the first section shows an empty-state hint to search

## ADDED Requirements

### Requirement: Launcher home affordance

The launcher search bar SHALL include a branded **jellyfish breathing-lamp** icon control on the right side of the input. Activating it SHALL hide the launcher and open the main window on the Home overview.

#### Scenario: Open home from launcher jellyfish button

- **WHEN** user clicks the jellyfish icon beside the launcher search field
- **THEN** the launcher hides and the main window shows the Home overview

### Requirement: Pinned search keywords

The Launcher search area SHALL display keywords that the user has pinned from the Home preview（固定到搜索框）as quick-access chips adjacent to or below the search input. Activating a pinned chip SHALL populate the search field with that keyword label and filter visible launcher results accordingly. Pinned keywords SHALL persist across sessions.

#### Scenario: Show pinned keywords in launcher

- **WHEN** the user has pinned one or more keywords and opens the launcher
- **THEN** those keywords appear as chips in the launcher search area

#### Scenario: Use pinned keyword chip

- **WHEN** user clicks a pinned keyword chip in the launcher
- **THEN** the search field is filled with that keyword and matching items are shown

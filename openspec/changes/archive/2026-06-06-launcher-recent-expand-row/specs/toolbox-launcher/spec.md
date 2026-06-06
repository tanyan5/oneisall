## MODIFIED Requirements

### Requirement: Empty search shows recent tools in first section only

When the launcher search query is empty, the launcher SHALL display the user's recent items in the first section when recent history exists. Recent items SHALL include both toolbox plugins and Shankai application shortcuts, merged and sorted by most recent use. The merged recent list MAY contain up to **20** entries (each source contributing at most 10).

Recent items SHALL default to a **single horizontal row of 10 columns** showing icon and name only (dock-style). In the collapsed view, at most **10** items SHALL be visible; additional items SHALL be hidden. The recent section and the launcher body (when search is empty) SHALL NOT use horizontal or vertical scrollbars.

When more than **10** recent items exist, the section header SHALL include an **展开全部** control on the upper-left. Activating it SHALL reveal all recent items in a multi-row grid layout (10 columns per row) without scrollbars. The control SHALL toggle to **收起** to restore the single-row collapsed view showing only the first 10 items.

When 10 or fewer recent items exist, the **展开全部** control SHALL NOT be shown.

When no recent history exists, the launcher SHALL show empty-state recommendations and pin guidance. The second section SHALL NOT be shown.

#### Scenario: Collapsed recent single row of ten

- **WHEN** launcher opens with empty search and the user has recent items
- **THEN** up to 10 items are shown in one 10-column row with no scrollbar on the recent area or launcher body

#### Scenario: Expand shows all recents when more than ten

- **WHEN** user has more than 10 recent items and clicks 展开全部
- **THEN** all recent items are shown in wrapped grid rows without scrollbars and the control reads 收起

#### Scenario: Collapse restores single row of ten

- **WHEN** user clicks 收起 while expanded
- **THEN** the recent section returns to the collapsed view showing only the first 10 items

#### Scenario: No expand when ten or fewer

- **WHEN** the user has 10 or fewer recent items
- **THEN** the 展开全部 control is not shown and all items appear in the single row

### Requirement: Launcher keyboard navigation

The launcher SHALL support keyboard navigation across visible items and confirmation of the highlighted item (Up/Down, Enter, Escape). The launcher SHALL NOT display a bottom footer bar with keyboard hint chips or the configured `openLauncher` shortcut invoke text.

#### Scenario: Arrow key navigation without footer

- **WHEN** launcher is visible
- **THEN** user can move highlight with Up and Down arrow keys and no bottom shortcut hint bar is shown

#### Scenario: Enter confirms selection

- **WHEN** user presses Enter on a highlighted item
- **THEN** that item is opened per the direct-open requirement

#### Scenario: Escape closes launcher

- **WHEN** user presses Escape
- **THEN** the launcher overlay is hidden

### Requirement: Launcher recent dock presentation

When showing recent items (empty search), each recent item SHALL use dock-like neon highlight on hover/selection and a compact kind indicator. The recent container SHALL not use scrollbars. The layout SHALL use a **10-column CSS grid**; expanded layout SHALL wrap additional items to subsequent rows within the same grid.

#### Scenario: Recent area has no scrollbar

- **WHEN** recent items are shown collapsed or expanded
- **THEN** the recent dock area does not show scrollbars

#### Scenario: Empty search body has no vertical scrollbar

- **WHEN** launcher shows recent items with empty search query
- **THEN** the launcher body does not show a vertical scrollbar on the right

### Requirement: Launcher adaptive height

The launcher overlay window height SHALL adapt to its current content. The launcher panel SHALL size to content (`height: auto`) so resize reflects true content height. When the user expands the recent section, the window SHALL grow to fit the additional grid rows within configured maximum height. The recent section itself SHALL NOT scroll; only search result lists MAY scroll when the search query is non-empty and content exceeds maximum body height.

#### Scenario: Height grows on recent expand

- **WHEN** user expands the recent section to show wrapped grid rows
- **THEN** the launcher window height increases to fit the recent content within max bounds

#### Scenario: Height shrinks on recent collapse

- **WHEN** user collapses the recent section
- **THEN** the launcher window height decreases to the compact single-row layout

#### Scenario: Search results may scroll

- **WHEN** user enters a search query and results exceed available body height
- **THEN** the launcher body scrolls vertically while the recent section is not shown

### Requirement: Launcher window drag

The launcher overlay SHALL be movable by mouse drag despite using a frameless window. Designated non-interactive regions of the launcher panel (top chrome and outer chrome around the search row) SHALL act as drag handles. The search field, jellyfish home control, result list rows, recent expand control, and buttons SHALL NOT initiate window drag.

#### Scenario: Expand button does not drag window

- **WHEN** user clicks the recent 展开全部 or 收起 control
- **THEN** the launcher window does not move and the recent section toggles state

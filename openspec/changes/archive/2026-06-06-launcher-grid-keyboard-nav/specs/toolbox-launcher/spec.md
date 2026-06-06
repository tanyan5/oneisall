## MODIFIED Requirements

### Requirement: Launcher keyboard navigation

The launcher SHALL support keyboard navigation across visible items and confirmation of the highlighted item (Arrow keys, Enter, Escape). When visible items are shown, the launcher SHALL default to highlighting the **first** item (index 0). The launcher SHALL NOT display a bottom footer bar with keyboard hint chips or the configured `openLauncher` shortcut invoke text.

For **recent items** displayed in the 10-column grid, Arrow Left and Arrow Right SHALL move the highlight one column within the same row, and Arrow Up and Arrow Down SHALL move the highlight one row within the same column, without wrapping at grid boundaries.

For **search result lists** and **recommendation chips**, Arrow Up and Arrow Down SHALL move the highlight linearly through the visible list. Arrow Left and Arrow Right SHALL move the highlight to the previous or next item in the list order.

Pressing Enter SHALL open the currently highlighted item per the direct-open requirement.

#### Scenario: First item highlighted on open

- **WHEN** launcher opens with visible recent items or search results
- **THEN** the first visible item is highlighted without requiring an initial key press

#### Scenario: Grid arrow navigation on recent items

- **WHEN** recent items are shown in the grid and user presses Arrow Right
- **THEN** highlight moves to the next item in the same row or stays if at the row end

#### Scenario: Grid vertical navigation on recent items

- **WHEN** recent items span multiple rows (expanded) and user presses Arrow Down
- **THEN** highlight moves to the item directly below in the same column or stays if none exists

#### Scenario: Linear navigation on search results

- **WHEN** user has typed a search query and presses Arrow Down
- **THEN** highlight moves to the next item in the combined primary and secondary result list

#### Scenario: Enter confirms selection

- **WHEN** user presses Enter on a highlighted item
- **THEN** that item is opened per the direct-open requirement

#### Scenario: Escape closes launcher

- **WHEN** user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: Arrow key navigation without footer

- **WHEN** launcher is visible
- **THEN** user can move highlight with Arrow keys and no bottom shortcut hint bar is shown

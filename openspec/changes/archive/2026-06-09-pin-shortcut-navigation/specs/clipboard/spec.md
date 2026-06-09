## MODIFIED Requirements

### Requirement: Clipboard keyboard navigation

When the clipboard list has one or more visible items and no blocking overlay is open (detail, edit, or confirm dialogs), the view SHALL default the **active row** to the **first** item in the current filtered list. Changing tabs, search filters, or list reloads SHALL re-default to the first visible item when the prior active id is absent from the new list.

While focus is not in the search field or another text input, **Arrow Up** and **Arrow Down** SHALL move the active row highlight to the previous or next item in the list order without copying to the system clipboard. The list SHALL scroll as needed to keep the active row visible.

Pressing **Enter** SHALL copy the active row to the system clipboard (same behavior as the toolbar copy action) and SHALL hide the main window so the user can paste immediately in the target application.

#### Scenario: First item active on open

- **WHEN** user opens the clipboard tool and history items are visible
- **THEN** the first list row is highlighted as the active row without requiring a click or key press

#### Scenario: Arrow keys move highlight only

- **WHEN** user presses Arrow Down with the active row on the first item
- **THEN** the second row becomes active and no copy occurs until Enter or an explicit copy action

#### Scenario: Enter copies active row and dismisses view

- **WHEN** user highlights a row with arrow keys and presses Enter
- **THEN** that item is copied to the system clipboard and the main window is hidden so the user can paste with Ctrl+V

#### Scenario: Search input retains typing keys

- **WHEN** the search field is focused and user presses Arrow Up or alphanumeric keys
- **THEN** the search field receives the input and list navigation shortcuts do not run

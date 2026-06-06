## ADDED Requirements

### Requirement: Clipboard keyboard navigation

When the clipboard list has one or more visible items and no blocking overlay is open (detail, edit, or confirm dialogs), the view SHALL default the **active row** to the **first** item in the current filtered list. Changing tabs, search filters, or list reloads SHALL re-default to the first visible item when the prior active id is absent from the new list.

While focus is not in the search field or another text input, **Arrow Up** and **Arrow Down** SHALL move the active row highlight to the previous or next item in the list order without copying to the system clipboard. The list SHALL scroll as needed to keep the active row visible.

Pressing **Enter** SHALL copy the active row to the system clipboard (same behavior as the toolbar copy action).

#### Scenario: First item active on open

- **WHEN** user opens the clipboard tool and history items are visible
- **THEN** the first list row is highlighted as the active row without requiring a click or key press

#### Scenario: Arrow keys move highlight only

- **WHEN** user presses Arrow Down with the active row on the first item
- **THEN** the second row becomes active and no copy occurs until Enter or an explicit copy action

#### Scenario: Enter copies active row

- **WHEN** user highlights a row with arrow keys and presses Enter
- **THEN** that item is copied to the system clipboard and confirmation feedback is shown

#### Scenario: Search input retains typing keys

- **WHEN** the search field is focused and user presses Arrow Up or alphanumeric keys
- **THEN** the search field receives the input and list navigation shortcuts do not run

### Requirement: Clipboard toolbar keyboard shortcuts

When the clipboard list keyboard handler is active (no modal open, focus not in a text input), the view SHALL support **single-letter** keyboard shortcuts (no Ctrl/Alt/Shift/Meta modifiers) for toolbar actions:

| Shortcut | Action |
|----------|--------|
| `P` | Pin / unpin active item |
| `V` | View details |
| `C` | Copy to system clipboard |
| `M` | Toggle multi-select mode |
| `F` | Toggle favorite |
| `X` | Delete (opens confirm when needed) |
| `E` | Edit (text/HTML only) |
| `S` | Save as file |
| `L` | Clear all history (opens confirm) |

Toolbar buttons SHALL expose the same shortcut in their tooltip or `title` text where applicable.

#### Scenario: C copies active item

- **WHEN** user has an active row and presses C outside a text input
- **THEN** the active item is copied to the system clipboard

#### Scenario: M toggles multi-select

- **WHEN** user presses M outside a text input
- **THEN** multi-select mode toggles and row checkboxes appear or hide

#### Scenario: Shortcuts disabled in modal

- **WHEN** a detail, edit, or confirm dialog is open
- **THEN** letter shortcuts do not trigger toolbar actions on the list behind the dialog

## MODIFIED Requirements

### Requirement: Clipboard list UI

The clipboard tool view SHALL use an immersive layout with a **single top bar** combining the tool title and a keyword search field. The title area SHALL display the **clipboard plugin icon** resolved from `plugins/clipboard/icon.png` via the shared tool icon loader—not an emoji placeholder. The view SHALL NOT expose a pause/resume recording control in the plugin header (capture may continue to be controllable via host APIs elsewhere).

When the host shell hides the plugin top bar (pinned immersive chrome), the same plugin icon SHALL appear in the shell `WindowChrome` row per the toolbox pin-mode requirement.

The view SHALL provide horizontal category tabs: **全部** (all), **文本** (text and HTML), **图片** (images), **文件** (files), and **收藏** (favorited items only). Selecting a tab SHALL filter the visible history list to that category.

Each list row SHALL display only **relative time** and **content preview** for the item (type-appropriate preview such as text excerpt, image thumbnail, or file name). The view SHALL NOT use a multi-column table with separate type and detail columns or per-row inline delete buttons.

The history list SHALL scroll within a dedicated list pane using a **thin cyber-themed scrollbar** (transparent track, semi-transparent accent thumb) consistent with other OneIsAll scrollable panels—not the default thick system scrollbar.

The view SHALL include a **vertical floating toolbar** overlaid on the right side of the list content area, positioned to the **left of the scrollbar track** (not in a separate full-height column beyond the scrollbar). The toolbar SHALL appear as a floating panel (rounded corners, border and/or shadow) and SHALL NOT use a full-height `border-left` column divider. The list pane SHALL reserve right padding so row content is not obscured by the toolbar. Toolbar icon actions SHALL remain in order: pin to top, view details, copy to system clipboard, multi-select mode, favorite, delete, edit, save as file, and clear all history. The toolbar SHALL reserve additional slots for future actions. All nine toolbar actions SHALL be implemented. Toolbar actions SHALL apply to the **active row** (the item last single-clicked), or to all checked items when multi-select mode is active.

Activating a list row with a **single click** (when not in multi-select mode) SHALL copy that item to the system clipboard and set it as the active row. Image items SHALL show an **inline thumbnail** in the list content area (not a separate thumbnail preview panel).

List ordering SHALL show pinned items before non-pinned items within the active tab, then by most recent `createdAt` descending.

#### Scenario: List scrollbar matches cyber theme

- **WHEN** user scrolls the clipboard history list
- **THEN** a thin styled scrollbar with transparent track and accent thumb is shown, consistent with launcher/home scroll areas

#### Scenario: Floating toolbar left of scrollbar

- **WHEN** user views the clipboard list with enough items to scroll
- **THEN** the vertical toolbar floats over the list area to the left of the scrollbar, not in a separate column past the scrollbar edge

#### Scenario: List content clears toolbar overlap

- **WHEN** user views long preview text in list rows
- **THEN** row content respects right padding and remains readable beside the floating toolbar

#### Scenario: Title bar shows plugin icon

- **WHEN** user opens the clipboard tool without shell chrome replacing the top bar
- **THEN** the title area shows the clipboard `icon.png` at approximately 20px beside the「剪贴板」label

#### Scenario: Pinned chrome matches plugin top bar icon

- **WHEN** user pins the clipboard view with Ctrl+D
- **THEN** the shell window chrome icon matches the same clipboard `icon.png` shown in the unpinned title bar

#### Scenario: Combined title and search bar

- **WHEN** user opens the clipboard tool
- **THEN** the title and search input appear on one horizontal bar without a separate pause button on the right

#### Scenario: Tab filters list by category

- **WHEN** user selects the「图片」tab
- **THEN** only image-type history items are shown with relative time and inline image thumbnail per row

#### Scenario: Single click row copies

- **WHEN** user single-clicks a list row while not in multi-select mode
- **THEN** that item is copied to the system clipboard, becomes the active row, and confirmation feedback is shown

#### Scenario: Favorites tab

- **WHEN** user selects the「收藏」tab
- **THEN** only items marked as favorite are shown

#### Scenario: Pin from toolbar

- **WHEN** user has an active row and activates the pin toolbar action
- **THEN** the item is marked pinned and appears at the top of the list within the current tab

#### Scenario: Multi-select does not copy on click

- **WHEN** multi-select mode is enabled and user clicks a row
- **THEN** the row checkbox toggles and the item is not copied to the system clipboard

#### Scenario: View details from toolbar

- **WHEN** user selects an item and activates the details toolbar action
- **THEN** a detail view shows the full stored content or metadata for that item

#### Scenario: Copy from toolbar

- **WHEN** user selects an item and activates the copy toolbar action
- **THEN** the item is written to the system clipboard and confirmation feedback is shown

#### Scenario: Multi-select delete

- **WHEN** user enables multi-select, checks multiple items, and activates delete
- **THEN** all checked items are removed from persistence and the list

#### Scenario: Clear all history

- **WHEN** user activates clear-all from the toolbar and confirms
- **THEN** all clipboard history items are removed from persistence

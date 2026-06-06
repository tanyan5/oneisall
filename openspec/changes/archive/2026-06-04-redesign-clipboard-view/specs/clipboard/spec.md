## MODIFIED Requirements

### Requirement: Clipboard list UI

The clipboard tool view SHALL use an immersive layout with a **single top bar** combining the tool title and a keyword search field. The view SHALL NOT expose a pause/resume recording control in the plugin header (capture may continue to be controllable via host APIs elsewhere).

The view SHALL provide horizontal category tabs: **全部** (all), **文本** (text and HTML), **图片** (images), **文件** (files), and **收藏** (favorited items only). Selecting a tab SHALL filter the visible history list to that category.

Each list row SHALL display only **relative time** and **content preview** for the item (type-appropriate preview such as text excerpt, image thumbnail, or file name). The view SHALL NOT use a multi-column table with separate type and detail columns or per-row inline delete buttons.

The view SHALL include a **vertical toolbar** fixed on the right side of the content area with icon actions in order: pin to top, view details, copy to system clipboard, multi-select mode, favorite, delete, edit, save as file, and clear all history. The toolbar SHALL reserve additional slots for future actions. All nine toolbar actions SHALL be implemented in this change. Toolbar actions SHALL apply to the **active row** (the item last single-clicked), or to all checked items when multi-select mode is active.

Activating a list row with a **single click** (when not in multi-select mode) SHALL copy that item to the system clipboard and set it as the active row. Image items SHALL show an **inline thumbnail** in the list content area (not a separate thumbnail preview panel).

List ordering SHALL show pinned items before non-pinned items within the active tab, then by most recent `createdAt` descending.

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

## ADDED Requirements

### Requirement: Clipboard item pin and favorite

The system SHALL persist optional **pinned** and **favorite** flags per clipboard history item. Pinned items SHALL sort before non-pinned items in list queries. Favorite items SHALL be retrievable via the favorites tab filter.

#### Scenario: Mark favorite

- **WHEN** user toggles favorite on a selected item
- **THEN** the item appears in the「收藏」tab when favorited

#### Scenario: Unpin item

- **WHEN** user toggles pin off on a pinned item
- **THEN** the item returns to chronological ordering among non-pinned items

### Requirement: Clipboard edit and export

The system SHALL allow editing stored content for text and HTML items via the toolbar edit action. The system SHALL allow saving an item to a user-chosen file path via the save-as toolbar action for supported types (text, HTML, image, files).

#### Scenario: Edit text item

- **WHEN** user edits a text history item and saves
- **THEN** the stored preview and detail are updated and the list reflects the change

#### Scenario: Save image as file

- **WHEN** user chooses save-as on an image item and picks a path
- **THEN** the image bytes are written to that file

### Requirement: Clipboard bulk operations

The system SHALL support deleting multiple items in one operation when the UI is in multi-select mode.

#### Scenario: Bulk delete

- **WHEN** the client invokes bulk delete with multiple item ids
- **THEN** all specified items are removed from the database and storage

## MODIFIED Requirements

### Requirement: Clipboard search

The clipboard tool view SHALL provide keyword search with debounced filtering against item preview and detail fields. Search SHALL combine with the active category tab filter.

#### Scenario: Filter by keyword within tab

- **WHEN** user types a search keyword while the「文本」tab is active
- **THEN** only text/HTML items matching the keyword are shown

## MODIFIED Requirements

### Requirement: Clipboard list UI

The clipboard tool view SHALL use an immersive layout with a **single top bar** combining the tool title and a keyword search field. The title area SHALL display the **clipboard plugin icon** resolved from `plugins/clipboard/icon.png` via the shared tool icon loader—not an emoji placeholder. The view SHALL NOT expose a pause/resume recording control in the plugin header (capture may continue to be controllable via host APIs elsewhere).

When the host shell hides the plugin top bar (pinned immersive chrome), the same plugin icon SHALL appear in the shell `WindowChrome` row per the toolbox pin-mode requirement.

The view SHALL provide horizontal category tabs: **全部** (all), **文本** (text and HTML), **图片** (images), **文件** (files), and **收藏** (favorited items only). Selecting a tab SHALL filter the visible history list to that category.

Each list row SHALL display only **relative time** and **content preview** for the item (type-appropriate preview such as text excerpt, image thumbnail, or file name). The view SHALL NOT use a multi-column table with separate type and detail columns or per-row inline delete buttons.

The view SHALL include a **vertical toolbar** fixed on the right side of the content area with icon actions in order: pin to top, view details, copy to system clipboard, multi-select mode, favorite, delete, edit, save as file, and clear all history. The toolbar SHALL reserve additional slots for future actions. All nine toolbar actions SHALL be implemented. Toolbar actions SHALL apply to the **active row** (the item last single-clicked), or to all checked items when multi-select mode is active.

Activating a list row with a **single click** (when not in multi-select mode) SHALL copy that item to the system clipboard and set it as the active row. Image items SHALL show an **inline thumbnail** in the list content area (not a separate thumbnail preview panel).

List ordering SHALL show pinned items before non-pinned items within the active tab, then by most recent `createdAt` descending.

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

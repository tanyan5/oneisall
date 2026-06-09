# toolbox-launcher Specification

## Purpose

Global quick-launch overlay for searching and opening toolbox tools and Shankai applications via keyboard.
## Requirements
### Requirement: Launcher window drag

The launcher overlay SHALL be movable by mouse drag despite using a frameless window. Designated non-interactive regions of the launcher panel (top chrome and outer chrome around the search row) SHALL act as drag handles. The search field, O-ring home control, result list rows, recent expand control, and buttons SHALL NOT initiate window drag.

#### Scenario: Expand button does not drag window

- **WHEN** user clicks the recent 展开全部 or 收起 control

- **THEN** the launcher window does not move and the recent section toggles state

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut, tray double-click, or tray **显示** menu item. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds (see adaptive height requirement). The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

When the hub window is visible showing an **unpinned** plugin tool view, the `openLauncher` global shortcut SHALL take precedence over overlay toggle and SHALL dismiss the hub session per the toolbox navigation requirement without opening the launcher overlay.

When a dismissed unpinned plugin session is pending restore, the `openLauncher` global shortcut SHALL restore that plugin on the hub window instead of toggling the launcher overlay.

Tray double-click and tray **显示** SHALL continue to open the launcher overlay directly and SHALL NOT trigger hub-session dismiss or restore.

When the launcher is shown—including when returning from the main window via navigation—the overlay SHALL NOT display a visible white flash before themed content appears. The host SHALL use a themed window background color matching the launcher panel and SHALL show the window only after content is ready to paint.

#### Scenario: Open launcher via global shortcut when idle

- **WHEN** user presses the configured openLauncher global shortcut and no unpinned plugin dismiss or restore applies
- **THEN** the launcher overlay is shown and the search field is focused without a white flash

#### Scenario: openLauncher dismisses hub plugin instead of overlay

- **WHEN** the hub window shows an unpinned plugin and user presses openLauncher
- **THEN** the hub window is hidden, the tool id is remembered for restore, and the launcher overlay is not shown

#### Scenario: openLauncher restores hub plugin instead of overlay

- **WHEN** a dismissed unpinned plugin session is pending and user presses openLauncher
- **THEN** the hub window reopens on that plugin unpinned and the launcher overlay is not shown

#### Scenario: Return to launcher from main window

- **WHEN** user navigates back to the launcher from the hub window (e.g. Escape from unpinned plugin)
- **THEN** the launcher appears with themed background immediately without a white frame flash

#### Scenario: Open launcher via tray double-click

- **WHEN** user double-clicks the tray icon
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

### Requirement: Search shows two-tier results

When the user enters a non-empty search query, the launcher SHALL show matching items in two sections: enabled toolbox tools and Shankai application shortcuts SHALL both participate in fuzzy matching. The first section SHALL contain the highest-scoring matches; the second section SHALL contain other matches not already listed in the first section. If the second section has no items, it SHALL NOT be shown. Result rows SHALL indicate item kind (tool vs application) and SHALL display an icon for each item where resolvable.

#### Scenario: Fuzzy primary matches across tools and apps

- **WHEN** user types a keyword matching tool names, descriptions, or Shankai app names
- **THEN** the first section lists the best-ranked mixed matches with kind labels and icons

#### Scenario: Secondary matches

- **WHEN** additional tools or apps match the keyword but are not in the first section
- **THEN** those items appear in the second section with icons when available

#### Scenario: No secondary matches

- **WHEN** all matches are shown in the first section only
- **THEN** the second section is hidden

### Requirement: Selecting a tool opens it directly

When the user selects a **toolbox plugin** item from the launcher, the system SHALL record the tool in recent history and hide the launcher overlay. If that tool already has a pinned window, the system SHALL focus that pinned window. Otherwise the system SHALL open the tool on the hub window in unpinned immersive layout without showing Home first. Escape from an unpinned hub tool view SHALL return to the launcher overlay per the toolbox navigation stack requirement.

When the user selects a **Shankai application** item from the launcher, the system SHALL launch the application directly, record the launch in merged recent history, and hide the launcher overlay without opening the main window.

#### Scenario: Open tool from launcher focuses existing pinned window

- **WHEN** user confirms selection of a toolbox plugin that already has a pinned window
- **THEN** the launcher hides and the existing pinned window is focused

#### Scenario: Open different tool from launcher while pinned

- **WHEN** user has plugin A pinned on the taskbar and selects plugin B in the launcher
- **THEN** the launcher hides, plugin A remains pinned, and plugin B opens unpinned on the hub window

#### Scenario: Open tool from launcher unpinned

- **WHEN** user confirms selection of a toolbox plugin with no pinned window
- **THEN** the launcher hides, recent history is updated, and the hub window shows that tool without shell WindowChrome

#### Scenario: Escape from launcher-opened tool

- **WHEN** user opened a toolbox plugin from the launcher in unpinned mode and presses Escape in the tool view
- **THEN** the launcher overlay is shown again with search focused and the hub window is hidden

#### Scenario: Open Shankai app from launcher

- **WHEN** user confirms selection of a Shankai application in the launcher
- **THEN** the launcher hides, the application process is started, and merged recent history is updated

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

### Requirement: Launcher home affordance

The launcher search bar SHALL include a branded **O-ring** home control on the right side of the input, implemented via the shared `BrandMark` component with normal breathing animation. Activating it SHALL hide the launcher and open the main window on the Home overview. The control SHALL NOT use a tentacled jellyfish or lion glyph.

#### Scenario: Open home from launcher brand button

- **WHEN** user clicks the O-ring home control beside the launcher search field
- **THEN** the launcher hides and the main window shows the Home overview

### Requirement: Pinned search keywords

The Launcher search area SHALL display keywords that the user has pinned from the Home preview（固定到搜索框）as quick-access chips adjacent to or below the search input. Activating a pinned chip SHALL populate the search field with that keyword label and filter visible launcher results accordingly. Pinned keywords SHALL persist across sessions.

#### Scenario: Show pinned keywords in launcher

- **WHEN** the user has pinned one or more keywords and opens the launcher
- **THEN** those keywords appear as chips in the launcher search area

#### Scenario: Use pinned keyword chip

- **WHEN** user clicks a pinned keyword chip in the launcher
- **THEN** the search field is filled with that keyword and matching items are shown

### Requirement: Launcher cyber visual theme

The launcher overlay SHALL use a cyberpunk-aligned visual theme consistent with OneIsAll branding (dark base, cyan/purple neon accents, subtle grid or scan-line background). Interactive elements (search field, pinned chips, recent items, result rows, recommendation chips) SHALL use neon highlight states on hover or focus. The theme SHALL NOT alter launcher search, navigation, or open behavior.

#### Scenario: Cyber styling on open

- **WHEN** user opens the launcher overlay
- **THEN** the panel displays cyber-themed colors and background decoration distinct from a flat generic dark panel

#### Scenario: Reduced motion preference

- **WHEN** the user OS has `prefers-reduced-motion: reduce` enabled
- **THEN** decorative animations (including border breathing and entry animation) are disabled or reduced to static neon styling

### Requirement: Launcher breathing border

The launcher panel outer border SHALL display a continuous soft breathing glow animation (pulsing border color and/or outer glow) while the overlay is visible, unless reduced-motion is requested.

#### Scenario: Border pulse visible

- **WHEN** launcher is visible and reduced-motion is not active
- **THEN** the panel border shows a perceptible breathing glow effect

### Requirement: Launcher minimal brand header

The launcher SHALL NOT display a separate lion brand header above the search area. Brand presence is conveyed only through the shared O-ring home control beside the search field.

#### Scenario: No duplicate brand header

- **WHEN** user opens the launcher overlay
- **THEN** there is no additional lion or wordmark header row above the search field

### Requirement: Launcher entry micro-animation

The launcher panel SHALL play a brief entry animation (e.g. scale and glow, approximately 150ms) the first time it is shown per application session, unless reduced-motion is requested.

#### Scenario: First open animation per session

- **WHEN** user opens the launcher for the first time in a session and reduced-motion is not active
- **THEN** the panel plays a short entry animation

#### Scenario: Subsequent opens in same session

- **WHEN** user toggles the launcher again in the same session
- **THEN** the entry animation does not repeat on every open

### Requirement: Launcher empty-state recommendations and pin guidance

When the launcher search query is empty and the user has no recent items, the launcher SHALL display a recommendation section with quick-launch chips for enabled built-in toolbox tools (e.g. clipboard, shankai, demo). The launcher SHALL also display guidance encouraging the user to pin keywords from the Home preview via「固定到搜索框」, including a visible hint and/or ghost chip. When recent items exist, the recommendation section SHALL NOT replace the recent row.

#### Scenario: No recents shows recommendations

- **WHEN** launcher opens with empty search and no recent items
- **THEN** recommendation chips for built-in tools are shown and are selectable to open those tools

#### Scenario: Pin keyword guidance shown

- **WHEN** launcher opens with empty search and no recent items
- **THEN** guidance text for pinning keywords from Home is visible

#### Scenario: Ghost chip guides to Home pinning

- **WHEN** user activates the pin-keyword guidance affordance (e.g. ghost chip)
- **THEN** the launcher hides and the main window opens on Home overview so the user can pin keywords

#### Scenario: Recents present hides recommendations

- **WHEN** launcher opens with empty search and one or more recent items
- **THEN** the recent row is shown and the built-in recommendation section is not shown

### Requirement: Launcher command-style search field

The launcher search area SHALL present a command-palette style input with a visible command prefix (e.g. `>`) before the text field, a Chinese placeholder guiding tool or application search, and cyber-themed placeholder styling. On focus, the search field SHALL show a neon highlight state.

#### Scenario: Command prefix visible

- **WHEN** launcher is visible
- **THEN** a command prefix appears beside the search input

#### Scenario: Placeholder guides search intent

- **WHEN** the search field is empty
- **THEN** placeholder text indicates searching for toolbox tools or Shankai applications

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


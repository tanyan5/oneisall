## ADDED Requirements

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

The launcher SHALL display a minimal brand header above the search area showing only a small cyber lion mark consistent with the tray icon family. The header SHALL NOT include a full product title or tagline text.

#### Scenario: Lion mark on open

- **WHEN** user opens the launcher overlay
- **THEN** a small lion brand mark is visible at the top of the panel

#### Scenario: Fallback when icon unavailable

- **WHEN** the lion mark image cannot be resolved
- **THEN** a host-defined minimal brand fallback glyph is shown instead

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

When showing recent items in horizontal layout (empty search), each recent item SHALL use dock-like neon highlight on hover/selection and a compact kind indicator (e.g. cyan dot for tools, purple dot for applications) instead of per-item description lines.

#### Scenario: Recent item dock highlight

- **WHEN** user hovers or keyboard-highlights a recent item
- **THEN** the item shows a neon dock-style highlight state

#### Scenario: Kind indicator on recent items

- **WHEN** recent items are shown in horizontal layout
- **THEN** each item displays a compact visual kind indicator without description text

### Requirement: Launcher adaptive height

The launcher overlay window height SHALL adapt to its current content. When few or no recent items and no search results are shown, the window SHALL use a reduced height sized to fit the recommendation/guidance area and avoid large empty space. When more content is present (pinned chips, recent row, recommendation section, or search result lists), the window MAY grow up to a defined maximum height; content beyond the maximum SHALL scroll inside the body area. Window width SHALL remain fixed.

#### Scenario: Compact height with empty recents and recommendations

- **WHEN** launcher opens with empty search, no recent items, and recommendation/guidance content
- **THEN** the overlay height fits that content near the configured minimum without a large blank middle region

#### Scenario: Taller height with many results

- **WHEN** user searches and many matching items are listed
- **THEN** the overlay grows toward the maximum height and the body area scrolls if needed

#### Scenario: Height updates on content change

- **WHEN** recent items load, pinned chips appear, recommendation visibility changes, or search query changes result count
- **THEN** the overlay height updates to fit content within min/max bounds

## MODIFIED Requirements

### Requirement: Launcher overlay window

The system SHALL provide a lightweight launcher overlay window that can be toggled via the configured `openLauncher` global shortcut. The overlay SHALL be separate from the main toolbox window, SHALL be always on top when visible, and SHALL receive keyboard focus when opened. The overlay window height SHALL be content-adaptive within configured minimum and maximum bounds (see adaptive height requirement). The overlay SHALL close when the user clicks outside the launcher panel or when the overlay window loses focus, in addition to Escape and the toggle shortcut.

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

### Requirement: Empty search shows recent tools in first section only

When the launcher search query is empty, the launcher SHALL display only the user's recent items (maximum 10) in the first section when recent history exists. Recent items SHALL include both toolbox plugins and Shankai application shortcuts, merged and sorted by most recent use (`lastUsedAt` descending). Recent items SHALL be laid out in a **horizontal row** showing icon and name only—without per-item description lines—and SHALL use dock-style presentation per the recent dock requirement. When no recent history exists, the launcher SHALL show the empty-state recommendations and pin guidance instead of only a plain empty hint. The second section SHALL NOT be shown.

#### Scenario: No search query with mixed recents

- **WHEN** launcher opens with an empty search field and the user has recent plugin or Shankai app launches
- **THEN** the first section shows up to 10 mixed recent items in a horizontal dock layout with icons and names only

#### Scenario: No recent history shows recommendations

- **WHEN** launcher opens with an empty search field and the user has no recent items
- **THEN** built-in tool recommendation chips and pin-keyword guidance are shown instead of a plain empty-search-only message

### Requirement: Launcher keyboard navigation

The launcher SHALL support keyboard navigation across visible items and confirmation of the highlighted item. A footer shortcut hint bar SHALL span the full panel width at the bottom, listing navigation keys (e.g. arrow keys, Enter, Escape) as legible kbd-style chips. The footer SHALL also display the currently configured `openLauncher` global shortcut label so users learn the invoke key.

#### Scenario: Arrow key navigation

- **WHEN** launcher is visible
- **THEN** user can move highlight with Up and Down arrow keys across items in section order

#### Scenario: Enter confirms selection

- **WHEN** user presses Enter on a highlighted item
- **THEN** that item is opened per the direct-open requirement (tool or Shankai app)

#### Scenario: Full-width shortcut hints

- **WHEN** launcher is visible
- **THEN** the bottom shortcut hint bar spans the panel width with legible kbd-style key labels

#### Scenario: Configured invoke shortcut shown

- **WHEN** launcher is visible
- **THEN** the footer displays the user's configured openLauncher shortcut text

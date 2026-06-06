## MODIFIED Requirements

### Requirement: Management center shell

The application SHALL provide a **Management Center** shell (entered from the launcher jellyfish control), replacing the prior lightweight Home-only preview. The shell SHALL use a **two-column** layout: a **left** column listing installed toolbox tools (and searchable Shankai applications when filtering), and a **right** main content area.

The shell SHALL include a top bar (`mgmt-top-bar`) with the application brand logo and a search field on the **same row**. The search placeholder SHALL read `搜索 {count} 款插件应用...` where `{count}` is the live total of searchable toolbox plugins and Shankai application shortcuts. When the window is pinned, window chrome controls SHALL append on the right of this row without replacing the logo or search field.

The left column header SHALL read `已安装插件应用 ({count})` using the same catalog count.

#### Scenario: Management center shows two columns on entry

- **WHEN** user opens the Management Center from the launcher jellyfish control
- **THEN** the left installed-tools list and right main content area are visible

#### Scenario: Default content is hub not plugin preview

- **WHEN** user enters the Management Center without selecting a tool
- **THEN** the right main content shows hub modules (announcements, promo, recent, recommended, etc.) and does not show any plugin detail preview

#### Scenario: Logo and search on one row

- **WHEN** the Management Center shell is displayed
- **THEN** the brand logo and search input appear on a single top bar row

#### Scenario: Search placeholder shows live count

- **WHEN** the search catalog contains 12 entries
- **THEN** the search placeholder reads `搜索 12 款插件应用...`

### Requirement: Home view displays enabled tools

When the user selects a tool from the left column (and no active search results view is shown), the right main content SHALL show that tool's preview with icon, description, keyword chips, and an Open action. No tool SHALL be auto-selected on entry.

When the user activates search, the right main content SHALL show a search result list until the query is cleared or a result is chosen.

#### Scenario: User selects a tool from left column

- **WHEN** user clicks a tool in the left column
- **THEN** the right main content shows that tool's preview with icon, description, keyword chips, and Open action

#### Scenario: No default tool selection

- **WHEN** user opens the Management Center
- **THEN** no tool is pre-selected in the left column and no plugin preview is shown

#### Scenario: Search filters tools

- **WHEN** user types a keyword in the top search field
- **THEN** matching plugins and applications filter the left column and/or the right column shows search results

#### Scenario: Return to hub default

- **WHEN** user clicks the brand logo or returns to the Management Center via navigation without a tool context
- **THEN** tool selection is cleared and the hub default content is shown

### Requirement: Home is lightweight overview only

The Management Center SHALL NOT duplicate full tool functionality. It SHALL provide plugin browsing (list + on-demand preview + search), hub discovery content, and shortcut hints only. It SHALL NOT embed full plugin UIs until the user explicitly opens a tool.

#### Scenario: Hub content scope

- **WHEN** Management Center is displayed without a selected tool
- **THEN** user sees hub cards (announcements, promo, recent, recommended, hints)—not an embedded plugin UI

## ADDED Requirements

### Requirement: Management center hub panel

The right main content default view SHALL display modular hub cards for: **announcements**, **promo/welfare**, **recent items**, **recommended tools**, **pinned-keyword guidance**, and **shortcut hints**. Each module SHALL be omitted when it has no content. Selecting a recommended or recent **tool** from the hub SHALL show that tool's preview in the main content area (not open immersive mode directly). Selecting a recent **application** SHALL launch it.

#### Scenario: Announcement and promo on hub

- **WHEN** active announcement and promo items exist
- **THEN** they appear as cards in the hub grid on Management Center entry

#### Scenario: Empty module hidden

- **WHEN** there are no active announcements
- **THEN** the announcement card is not shown

#### Scenario: Hub recommended selects preview

- **WHEN** user clicks a recommended tool in the hub
- **THEN** the right main content switches to that tool's preview

### Requirement: Home announcements

The system SHALL supply announcement items for the Management Center hub. Version 1 SHALL read from local JSON. Users SHALL be able to dismiss an announcement (`dismissedAnnouncementIds` in settings).

#### Scenario: Show local announcement

- **WHEN** a non-expired announcement exists and is not dismissed
- **THEN** the hub shows title, summary, and optional detail link

#### Scenario: Dismiss announcement

- **WHEN** user dismisses an announcement
- **THEN** that announcement id is persisted and the card is hidden on subsequent visits

### Requirement: Home promo and remote welfare content

The system SHALL provide a **PromoProvider** for the welfare/partnership hub card. Version 1 SHALL load from local `promo.json`. Version 2 SHALL support remote HTTPS fetch with user-data cache fallback. The renderer SHALL obtain promo data via main-process IPC only.

#### Scenario: Local promo in v1

- **WHEN** `promo.json` contains a non-expired item and promo display is enabled
- **THEN** the hub shows one welfare/partnership card

#### Scenario: No promo available

- **WHEN** no active promo is available
- **THEN** the promo section is omitted from the hub

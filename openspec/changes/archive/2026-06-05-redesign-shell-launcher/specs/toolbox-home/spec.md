## MODIFIED Requirements

### Requirement: Home view displays enabled tools

The system SHALL show a built-in Home view in the main content area with a **master-detail** layout. The left pane SHALL list all enabled tools (icon and name). The right preview pane SHALL display, for the **currently selected** tool: (1) on the **first row**, the tool description (or a host-defined fallback); (2) on the **second row**, that tool's **quick-launch keywords** as interactive chips when defined in the plugin manifest; (3) an explicit **Open** (打开) action. Selecting a tool in the left pane SHALL update the right preview without immediately opening the tool. Activating **Open** SHALL navigate into that tool's **immersive** full-window view without showing the sidebar or other plugins' lists. The Home view SHALL NOT use a grid of cards that open tools on single click.

#### Scenario: User opens main window from tray

- **WHEN** user chooses「打开主窗口」from the tray menu
- **THEN** the main window shows the Home master-detail view with the tool list and a preview pane

#### Scenario: User previews a tool on Home

- **WHEN** user selects a tool in the Home left list
- **THEN** the right pane shows that tool's description on the first row, quick-launch keywords on the second row when available, and an Open button

#### Scenario: Keyword dropdown shows actions

- **WHEN** user clicks a quick-launch keyword chip in the Home preview
- **THEN** a dropdown lists that keyword's defined actions plus a「固定到搜索框」option

#### Scenario: Pin keyword to launcher search

- **WHEN** user chooses「固定到搜索框」from a keyword dropdown on Home
- **THEN** that keyword is persisted and becomes available as a pinned item in the Launcher search area

#### Scenario: User opens a tool from Home preview

- **WHEN** user clicks Open on the Home preview pane
- **THEN** the shell hides the sidebar and Home lists and shows only that tool's full-window view

#### Scenario: Escape closes keyword dropdown before leaving home

- **WHEN** a keyword dropdown is open on Home and user presses Escape
- **THEN** the dropdown closes and Home overview remains visible

#### Scenario: Tool icon on home list

- **WHEN** Home lists an enabled tool that has a resolvable icon
- **THEN** the left list entry displays the tool icon beside the name

## MODIFIED Requirements

### Requirement: Home is lightweight overview only

The Home view SHALL NOT duplicate full tool functionality. It SHALL provide plugin browsing (list + preview) and shortcut hints only. It SHALL NOT embed full plugin UIs until the user explicitly opens a tool.

#### Scenario: Home content scope

- **WHEN** Home view is displayed
- **THEN** user sees a tool list, description, keyword chips, and Open action—not an embedded plugin UI

## REMOVED Requirements

### Requirement: Optional last-used tool emphasis

**Reason**: Home moves from card grid to list + preview; recent emphasis on cards is replaced by Launcher recent row and sidebar selection state.

**Migration**: No data migration; optional badge behavior dropped from Home.

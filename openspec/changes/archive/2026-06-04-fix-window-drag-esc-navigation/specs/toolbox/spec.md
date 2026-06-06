## ADDED Requirements

### Requirement: Frameless window drag

The main toolbox window SHALL be movable by mouse drag despite using a frameless window chrome. Designated non-interactive regions (sidebar brand area, immersive view top bars, and equivalent shell chrome) SHALL act as drag handles via `-webkit-app-region: drag`. Interactive controls (inputs, buttons, list rows, scrollable content) SHALL use `-webkit-app-region: no-drag`.

#### Scenario: Drag main window from sidebar shell

- **WHEN** user presses and drags a designated drag region on the Home shell
- **THEN** the main window moves with the pointer

#### Scenario: Drag immersive plugin window

- **WHEN** user presses and drags the plugin top bar drag region
- **THEN** the main window moves and controls in the top bar remain usable

#### Scenario: Interactive controls do not drag

- **WHEN** user clicks or drags inside a search input, button, or list row
- **THEN** the window does not move and the control receives the interaction

### Requirement: Navigation stack and Escape back

The host SHALL maintain a navigation stack for main-window sessions. Pressing Escape SHALL first dismiss in-view overlays (keyword panel, modals) if any; otherwise SHALL pop one stack frame and show the previous surface. When the previous surface is the launcher overlay, the main window SHALL be hidden and the launcher SHALL be shown with search focused. When the current surface is the launcher overlay, Escape SHALL hide the launcher.

Opening a tool via a global shortcut (e.g. openClipboard) SHALL record back target as the launcher overlay so Escape from that tool returns to the launcher even if the user did not open the launcher earlier in the session.

#### Scenario: Escape from plugin opened via launcher

- **WHEN** user opened a plugin from the launcher and presses Escape in the immersive view
- **THEN** the main window is hidden and the launcher overlay is shown with search focused

#### Scenario: Escape from plugin opened via Home

- **WHEN** user opened Home from the launcher jellyfish control, then opened a plugin from Home, and presses Escape in the plugin
- **THEN** the main window shows the Home shell (sidebar + Home content)

#### Scenario: Escape from Home shell

- **WHEN** user opened Home from the launcher and presses Escape on the Home shell
- **THEN** the main window is hidden and the launcher overlay is shown

#### Scenario: Escape from global shortcut tool

- **WHEN** user opened a plugin via a global shortcut such as openClipboard and presses Escape
- **THEN** the main window is hidden and the launcher overlay is shown

#### Scenario: Escape on launcher

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

## MODIFIED Requirements

### Requirement: System integration

The system SHALL provide a system tray context menu with **显示** (show launcher), **隐藏** (hide launcher), **Settings** (设置), and **Quit** (退出). Double-clicking the tray icon SHALL show the launcher overlay (not the main window Home). Selecting **显示** SHALL show the launcher overlay. Selecting **隐藏** SHALL hide the launcher overlay if visible. Configured global shortcuts SHALL continue to perform host actions: `openLauncher` toggles the launcher overlay; `openClipboard` opens the clipboard tool in the main window with Escape returning to the launcher per the navigation stack requirement.

#### Scenario: Tray double-click opens launcher

- **WHEN** user double-clicks the tray icon
- **THEN** the launcher overlay is shown and the search field is focused

#### Scenario: Tray show launcher

- **WHEN** user selects「显示」from the tray context menu
- **THEN** the launcher overlay is shown

#### Scenario: Tray hide launcher

- **WHEN** user selects「隐藏」from the tray context menu and the launcher is visible
- **THEN** the launcher overlay is hidden

#### Scenario: Tray open settings

- **WHEN** user selects「设置」from the tray menu
- **THEN** the main window is shown with the Settings view active and Escape returns to the launcher

#### Scenario: Tray quit

- **WHEN** user selects「退出」from the tray menu
- **THEN** the application exits

#### Scenario: Global shortcut to launcher

- **WHEN** user presses the configured openLauncher global shortcut
- **THEN** the launcher overlay is shown or focused

#### Scenario: Global shortcut to clipboard

- **WHEN** user presses the configured openClipboard global shortcut
- **THEN** the main window is shown with the clipboard tool active and Escape returns to the launcher

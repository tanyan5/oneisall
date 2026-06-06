## MODIFIED Requirements

### Requirement: Navigation stack and Escape back

The host SHALL maintain a navigation stack for main-window sessions. Pressing Escape SHALL first dismiss in-view overlays (keyword panel, modals) if any; otherwise SHALL pop one stack frame and show the previous surface. When the previous surface is the launcher overlay, the main window SHALL be hidden and the launcher SHALL be shown with search focused. When the current surface is the launcher overlay, Escape SHALL hide the launcher.

Opening a tool via a global shortcut (e.g. openClipboard) SHALL record back target as the launcher overlay so Escape from that tool returns to the launcher even if the user did not open the launcher earlier in the session.

Opening a tool via a global shortcut SHALL also **clear window pin mode** before the tool view is shown. The main window SHALL open in the standard unpinned immersive layout (plugin top bar visible, no shell `WindowChrome`, not on taskbar, O-ring taskbar icon restored). Pin mode entered earlier in the session SHALL NOT carry over to shortcut-opened tool sessions.

#### Scenario: Shortcut opens tool unpinned

- **WHEN** user invokes a global shortcut such as openClipboard while pin mode was previously active
- **THEN** the tool opens without pin chrome, without taskbar presence, and with the plugin's own top bar

#### Scenario: Launcher open preserves pin state

- **WHEN** user had pin mode active and opens a tool from the launcher overlay
- **THEN** pin mode remains unchanged (still pinned if it was pinned before)

#### Scenario: Escape from plugin opened via launcher

- **WHEN** user opened a plugin from the launcher and presses Escape in the immersive view
- **THEN** the main window is hidden and the launcher overlay is shown with search focused

#### Scenario: Escape from plugin opened via Home

- **WHEN** user opened Home from the launcher O-ring control, then opened a plugin from Home, and presses Escape in the plugin
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

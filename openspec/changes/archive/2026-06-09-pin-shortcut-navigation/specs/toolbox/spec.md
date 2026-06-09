## MODIFIED Requirements

### Requirement: Navigation stack and Escape back

The host SHALL maintain a navigation stack for main-window sessions. Pressing Escape SHALL first dismiss in-view overlays (keyword panel, modals) if any; otherwise SHALL pop one stack frame and show the previous surface. When the previous surface is the launcher overlay, the main window SHALL be hidden and the launcher SHALL be shown with search focused. When the current surface is the launcher overlay, Escape SHALL hide the launcher.

When the main window is in **pin mode**, Escape SHALL NOT pop the navigation stack or hide the main window after overlays are dismissed. The user SHALL hide a pinned main window only via the shell window-chrome close control or an equivalent explicit close action.

Opening a tool via a global shortcut (e.g. openClipboard) SHALL record back target as the launcher overlay so Escape from that tool returns to the launcher even if the user did not open the launcher earlier in the session.

Opening a tool via a global shortcut SHALL clear window pin mode and open in the standard unpinned immersive layout **unless** the main window is already visible showing that **same** tool in pin mode—in that case the host SHALL focus the main window and leave pin mode unchanged.

When the main window is visible showing an **unpinned** plugin tool view and the user presses the `openLauncher` global shortcut, the host SHALL hide the main window, remember the dismissed tool id for restore, and SHALL NOT show the launcher overlay.

When the main window is hidden, the launcher overlay is not visible, and a dismissed unpinned tool id is remembered, pressing `openLauncher` again SHALL restore the main window on that tool view (still unpinned) without showing the launcher overlay, then clear the dismissed-session memory.

When neither dismiss nor restore applies, `openLauncher` SHALL toggle the launcher overlay as before.

#### Scenario: Escape ignored in pinned plugin

- **WHEN** user has an immersive plugin open in pin mode with no modal overlay and presses Escape
- **THEN** the main window remains visible and pinned and navigation does not pop

#### Scenario: Escape still dismisses overlays in pin mode

- **WHEN** user has pin mode active and an in-view overlay such as the keyword panel is open
- **THEN** the first Escape dismisses the overlay without hiding the pinned window

#### Scenario: Same-tool shortcut preserves pin

- **WHEN** user invokes a global shortcut for a tool that is already open in pin mode on the main window
- **THEN** the main window is focused, pin mode stays active, and layout is unchanged

#### Scenario: Shortcut opens different tool unpinned

- **WHEN** user invokes a global shortcut for a tool while another tool or unpinned layout is active, or pin mode was active for a different tool
- **THEN** the requested tool opens without pin chrome, without taskbar presence, and with the plugin's own top bar

#### Scenario: Launcher open preserves pin state

- **WHEN** user had pin mode active and opens a tool from the launcher overlay
- **THEN** pin mode remains unchanged (still pinned if it was pinned before)

#### Scenario: Escape from plugin opened via launcher

- **WHEN** user opened a plugin from the launcher in **unpinned** mode and presses Escape in the immersive view
- **THEN** the main window is hidden and the launcher overlay is shown with search focused

#### Scenario: Escape from plugin opened via Home

- **WHEN** user opened Home from the launcher O-ring control, then opened a plugin from Home, and presses Escape in the plugin
- **THEN** the main window shows the Home shell (sidebar + Home content)

#### Scenario: Escape from Home shell

- **WHEN** user opened Home from the launcher and presses Escape on the Home shell
- **THEN** the main window is hidden and the launcher overlay is shown

#### Scenario: Escape from global shortcut tool

- **WHEN** user opened a plugin via a global shortcut such as openClipboard in **unpinned** mode and presses Escape
- **THEN** the main window is hidden and the launcher overlay is shown

#### Scenario: Escape on launcher

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: openLauncher dismisses unpinned plugin

- **WHEN** the main window shows an unpinned plugin tool and the launcher overlay is not visible
- **THEN** pressing openLauncher hides the main window without showing the launcher overlay

#### Scenario: openLauncher restores dismissed plugin

- **WHEN** the main window was dismissed via openLauncher while showing an unpinned plugin and the launcher overlay is not visible
- **THEN** pressing openLauncher again shows the main window on the same plugin still unpinned

#### Scenario: openLauncher toggles overlay when idle

- **WHEN** neither an unpinned plugin dismiss nor a dismissed-session restore applies
- **THEN** pressing openLauncher toggles the launcher overlay visibility as before

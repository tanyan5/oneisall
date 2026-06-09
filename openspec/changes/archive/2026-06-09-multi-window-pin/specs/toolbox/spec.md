## MODIFIED Requirements

### Requirement: Navigation stack and Escape back

The host SHALL maintain a per-window navigation stack for toolbox window sessions. Pressing Escape SHALL first dismiss in-view overlays (keyword panel, modals) if any; otherwise SHALL pop one stack frame and show the previous surface. When the previous surface is the launcher overlay, the window SHALL be hidden and the launcher SHALL be shown with search focused. When the current surface is the launcher overlay, Escape SHALL hide the launcher.

When a toolbox window is in **pin mode**, Escape SHALL NOT pop the navigation stack or hide that window after overlays are dismissed. The user SHALL hide a pinned window only via that window's shell window-chrome close control or an equivalent explicit close action.

Opening a tool via a global shortcut (e.g. openClipboard) SHALL record back target as the launcher overlay so Escape from that tool returns to the launcher even if the user did not open the launcher earlier in the session.

Opening a tool via a global shortcut or the launcher SHALL focus an existing **pinned** window for that same tool if one is registered, without creating a new unpinned session.

Opening a tool via a global shortcut for a **different** tool SHALL open in the standard unpinned immersive layout on the hub window (plugin top bar visible, no shell `WindowChrome`, not on taskbar).

Opening a tool from the launcher when no pinned window exists for that tool SHALL open on the hub window in unpinned immersive layout. Opening a **different** tool from the launcher while other tools remain pinned SHALL NOT affect those pinned windows.

When the hub window is visible showing an **unpinned** plugin tool view and the user presses the `openLauncher` global shortcut, the host SHALL hide the hub window, remember the dismissed tool id for restore, and SHALL NOT show the launcher overlay.

When the hub window is hidden, the launcher overlay is not visible, and a dismissed unpinned tool id is remembered, pressing `openLauncher` again SHALL restore the hub window on that tool view (still unpinned) without showing the launcher overlay, then clear the dismissed-session memory.

When neither dismiss nor restore applies, `openLauncher` SHALL toggle the launcher overlay as before.

Closing a pinned window via chrome close SHALL clear that window's pin registration and remove it from the taskbar so subsequent launcher or shortcut opens for that tool use an unpinned hub session.

#### Scenario: Escape ignored in pinned plugin

- **WHEN** user has an immersive plugin open in pin mode with no modal overlay and presses Escape
- **THEN** that window remains visible and pinned and navigation does not pop

#### Scenario: Escape still dismisses overlays in pin mode

- **WHEN** user has pin mode active and an in-view overlay such as the keyword panel is open
- **THEN** the first Escape dismisses the overlay without hiding the pinned window

#### Scenario: Same-tool shortcut or launcher focuses pinned window

- **WHEN** user invokes a global shortcut or selects a toolbox plugin in the launcher while that tool already has a pinned window on the taskbar
- **THEN** the existing pinned window is shown and focused and no new unpinned session is created

#### Scenario: Shortcut opens different tool unpinned

- **WHEN** user invokes a global shortcut for a different tool while another tool has a pinned window
- **THEN** the requested tool opens unpinned on the hub window without affecting pinned windows

#### Scenario: Launcher opens different tool while pinned

- **WHEN** user has plugin A pinned on the taskbar and selects plugin B in the launcher
- **THEN** plugin A remains pinned on the taskbar and plugin B opens unpinned on the hub window

#### Scenario: Close pinned window clears pin registration

- **WHEN** user closes a pinned plugin window via chrome close
- **THEN** that window is hidden, removed from the taskbar, and subsequent launcher opens for that tool use an unpinned hub session

#### Scenario: Escape from plugin opened via launcher

- **WHEN** user opened a plugin from the launcher in unpinned mode and presses Escape in the immersive view
- **THEN** the hub window is hidden and the launcher overlay is shown with search focused

#### Scenario: Escape from plugin opened via Home

- **WHEN** user opened Home from the launcher O-ring control, then opened a plugin from Home, and presses Escape in the plugin
- **THEN** the window shows the Home shell (sidebar + Home content)

#### Scenario: Escape from Home shell

- **WHEN** user opened Home from the launcher and presses Escape on the Home shell
- **THEN** the window is hidden and the launcher overlay is shown

#### Scenario: Escape from global shortcut tool

- **WHEN** user opened a plugin via a global shortcut in unpinned mode and presses Escape
- **THEN** the hub window is hidden and the launcher overlay is shown

#### Scenario: Escape on launcher

- **WHEN** the launcher overlay is visible and user presses Escape
- **THEN** the launcher overlay is hidden

#### Scenario: openLauncher dismisses unpinned plugin

- **WHEN** the hub window shows an unpinned plugin tool and the launcher overlay is not visible
- **THEN** pressing openLauncher hides the hub window without showing the launcher overlay

#### Scenario: openLauncher restores dismissed plugin

- **WHEN** the hub window was dismissed via openLauncher while showing an unpinned plugin and the launcher overlay is not visible
- **THEN** pressing openLauncher again shows the hub window on the same plugin still unpinned

#### Scenario: openLauncher toggles overlay when idle

- **WHEN** neither an unpinned plugin dismiss nor a dismissed-session restore applies
- **THEN** pressing openLauncher toggles the launcher overlay visibility as before

### Requirement: Window pin mode

Each toolbox window (Management Center shell, immersive plugin views, and Settings) SHALL support **pin mode** toggled by **Ctrl+D** while that window is focused. The launcher overlay SHALL NOT support pin mode. When pin mode is active on a window, that window SHALL appear in the Windows taskbar (`skipTaskbar: false`) with the active plugin icon when applicable.

Multiple plugin windows MAY be pinned simultaneously; each pinned plugin SHALL have its own taskbar entry. Pinning a window SHALL spawn a separate hidden hub window for subsequent unpinned launcher sessions.

When pin mode is active, the window SHALL display window chrome controls (**pin to top**, **minimize**, **maximize/restore**, **close**) using **SVG outline icons** styled with the application muted/text colors—not emoji or system-default colored glyphs. The pin-to-top control SHALL show an active state using brighter text color when always-on-top is enabled.

On immersive plugin views in pin mode, the window chrome row SHALL display the **active plugin's icon** (same asset as taskbar and `plugins/<id>/icon.png`) at the leading position, loaded via the shared tool icon resolver—not emoji or a separate hardcoded glyph.

On the **Management Center** surface, pin mode SHALL append chrome controls to the right of the existing `mgmt-top-bar` row (brand logo + search). Pin mode SHALL NOT replace or remove the logo or search field.

The Management Center search placeholder SHALL read `搜索 {count} 款插件应用...` with live catalog count and launcher-equivalent fuzzy filtering.

Toggling pin mode off SHALL remove chrome controls from the top bar and restore the frameless layout below.

Closing a pinned window via chrome close SHALL clear pin mode for that window and remove it from the taskbar without destroying other pinned windows.

#### Scenario: Immersive chrome shows plugin icon

- **WHEN** user pins an immersive plugin view such as clipboard
- **THEN** the window chrome leading icon matches that plugin's `icon.png`

#### Scenario: Multiple pinned plugins on taskbar

- **WHEN** user pins plugin A and later pins plugin B on a separate window
- **THEN** both plugins appear as separate taskbar entries with their respective icons

#### Scenario: Pin hub spawns new hub

- **WHEN** user pins a plugin on the hub window
- **THEN** that window becomes a pinned plugin window and a new hidden hub is created for unpinned sessions

#### Scenario: Close one pinned window leaves others

- **WHEN** user has plugins A and B pinned and closes plugin A via chrome close
- **THEN** plugin B remains pinned on the taskbar and plugin A's pin registration is cleared

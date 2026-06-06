## MODIFIED Requirements

### Requirement: Unified application branding

The application SHALL use the display name **OneIsAll** consistently in window titles, tray tooltip, and packaged product name. The Windows taskbar, window, and installer icon SHALL default to the **O-ring** branded asset (not the default Electron icon).

When the main window is in **pin mode** on an **immersive plugin view**, the Windows taskbar and window icon SHALL switch to that plugin's resolved `icon.png` (via `ToolIconService`). When pin mode ends or the user is on the Management Center / Home surface, the icon SHALL restore to the O-ring brand asset.

#### Scenario: Taskbar icon matches tray brand by default

- **WHEN** the application is running on Windows and no immersive plugin is pinned
- **THEN** the taskbar/window icon visually matches the O-ring tray icon family

#### Scenario: Pinned plugin shows plugin icon on taskbar

- **WHEN** user pins an immersive plugin view (e.g. clipboard) with Ctrl+D
- **THEN** the Windows taskbar and window icon show that plugin's `icon.png`, not the O-ring

#### Scenario: Unpin restores brand icon

- **WHEN** user toggles pin mode off or navigates to Management Center while pinned
- **THEN** the taskbar/window icon restores to the O-ring brand asset

#### Scenario: Consistent product name

- **WHEN** user views the main window title or tray tooltip
- **THEN** the name shown is OneIsAll (host-defined localized suffix allowed, e.g.「OneIsAll 工具集」)

### Requirement: Window pin mode

The main toolbox window (Management Center shell, immersive plugin views, and Settings) SHALL support **pin mode** toggled by **Ctrl+D** while that window is focused. The launcher overlay SHALL NOT support pin mode. When pin mode is active, the window SHALL appear in the Windows taskbar (`skipTaskbar: false`).

When pin mode is active, the window SHALL display window chrome controls (**pin to top**, **minimize**, **maximize/restore**, **close**) using **SVG outline icons** styled with the application muted/text colors—not emoji or system-default colored glyphs. The pin-to-top control SHALL show an active state using brighter text color when always-on-top is enabled.

On immersive plugin views in pin mode, the window chrome row SHALL display the **active plugin's icon** (same asset as taskbar and `plugins/<id>/icon.png`) at the leading position, loaded via the shared tool icon resolver—not emoji or a separate hardcoded glyph.

On the **Management Center** surface, pin mode SHALL append chrome controls to the right of the existing `mgmt-top-bar` row (brand logo + search). Pin mode SHALL NOT replace or remove the logo or search field.

The Management Center search placeholder SHALL read `搜索 {count} 款插件应用...` with live catalog count and launcher-equivalent fuzzy filtering.

Toggling pin mode off SHALL remove chrome controls from the top bar and restore the frameless layout below.

#### Scenario: Immersive chrome shows plugin icon

- **WHEN** user pins an immersive plugin view such as clipboard
- **THEN** the window chrome leading icon matches that plugin's `icon.png`

#### Scenario: Toggle pin with Ctrl+D

- **WHEN** user presses Ctrl+D while the main window is focused
- **THEN** pin mode toggles and chrome controls appear or disappear on the top bar

#### Scenario: Pin controls use SVG icons

- **WHEN** pin mode is active
- **THEN** window controls render as SVG outline icons consistent with the dark theme, not colored emoji

#### Scenario: Pin top toggle visual state

- **WHEN** user enables always-on-top via the pin control
- **THEN** the control shows active state with brighter text color, not a red emoji pin

#### Scenario: Management center logo and search unchanged when pinned

- **WHEN** user pins the Management Center
- **THEN** brand logo and search field remain on the same top row with controls appended on the right

#### Scenario: Close pinned window

- **WHEN** user clicks close in the chrome controls
- **THEN** the main window is hidden and the application continues in the tray

### Requirement: Built-in cyber-style icon artwork

The host SHALL ship built-in PNG icons for plugins `clipboard`, `shankai`, and `demo`, and for shell navigation targets `home` and `settings`. These icons SHALL use a cohesive **cyber** visual language (dark base, neon accent lines, grid or scan-line motifs, recognizable pictogram per tool) and SHALL NOT be flat single-color placeholders. Icons SHALL remain legible when displayed at 20px (sidebar, window chrome, plugin top bars) and 48px (Home cards).

The clipboard plugin icon SHALL depict a clipboard board with clip and stacked card/lines motif consistent with the cyber icon family.

#### Scenario: Clipboard icon is recognizable cyber glyph

- **WHEN** the user views the clipboard tool in Home, sidebar, launcher, plugin top bar, or pinned taskbar
- **THEN** the icon shows a distinct clipboard pictogram on the cyber dark base, not a generic block or emoji

#### Scenario: Built-in plugin icons are patterned

- **WHEN** the user views Home, sidebar, or Launcher entries for clipboard, shankai, or demo
- **THEN** each tool shows a distinct cyber-style patterned icon rather than a solid color block

#### Scenario: Navigation icons match cyber style

- **WHEN** the user views sidebar entries for Home or Settings
- **THEN** each entry shows a cyber-style patterned icon consistent with built-in plugin icons

#### Scenario: Icon files remain on existing paths

- **WHEN** the host resolves icons via `ToolIconService`
- **THEN** built-in icons are loaded from existing paths (`plugins/<id>/icon.png` and `resources/nav/<id>.png`) without API changes

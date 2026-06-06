## ADDED Requirements

### Requirement: Window pin mode

The main toolbox window (Management Center shell, immersive plugin views, and Settings) SHALL support **pin mode** toggled by **Ctrl+D** while that window is focused. The launcher overlay SHALL NOT support pin mode. When pin mode is active, the window SHALL appear in the Windows taskbar (`skipTaskbar: false`).

When pin mode is active, the window SHALL display window chrome controls (**pin to top**, **minimize**, **maximize/restore**, **close**) using **SVG outline icons** styled with the application muted/text colors—not emoji or system-default colored glyphs. The pin-to-top control SHALL show an active state using brighter text color when always-on-top is enabled.

On the **Management Center** surface, pin mode SHALL append chrome controls to the right of the existing `mgmt-top-bar` row (brand logo + search). Pin mode SHALL NOT replace or remove the logo or search field.

The Management Center search placeholder SHALL read `搜索 {count} 款插件应用...` with live catalog count and launcher-equivalent fuzzy filtering.

Toggling pin mode off SHALL remove chrome controls from the top bar and restore the frameless layout below.

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

## MODIFIED Requirements

### Requirement: System integration

The system SHALL provide a system tray context menu with **显示**, **设置**, and **退出**. The menu SHALL NOT include **隐藏**. Double-clicking the tray icon SHALL show the launcher overlay.

#### Scenario: Tray menu without hide

- **WHEN** user opens the tray context menu
- **THEN** 显示, 设置, and 退出 are shown and 隐藏 is not shown

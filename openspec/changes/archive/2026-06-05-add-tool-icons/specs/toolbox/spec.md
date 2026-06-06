## MODIFIED Requirements

### Requirement: Plugin model

Tools SHALL be discovered via `plugin.json` manifests under `plugins/` and `%APPDATA%/OneIsAll/plugins/`. Each plugin SHALL expose `id`, `name`, `version`, and optional `capabilities`. Plugin manifests MAY include an optional `icon` field pointing to an image file relative to the plugin directory (for example `icon.png`). The host SHALL activate enabled plugins at startup and expose tool metadata to the renderer via IPC. The host SHALL provide a way to obtain a display icon for each tool id.

#### Scenario: Tool discovery

- **WHEN** the application starts
- **THEN** enabled tools from plugin manifests are registered and exposed to the renderer

#### Scenario: Plugin icon from manifest

- **WHEN** a plugin manifest includes a valid `icon` path
- **THEN** the host can resolve and return that icon for the tool id

#### Scenario: Default plugin icon file

- **WHEN** a plugin has no `icon` field but `icon.png` exists in its plugin directory
- **THEN** the host uses that file as the tool icon

## MODIFIED Requirements

### Requirement: Shell UI

The main window SHALL show a sidebar of enabled tools and a content area for the active view. The sidebar SHALL include a **Home** entry at the top that shows the built-in Home overview. Sidebar navigation entries for Home, each enabled tool, and Settings SHALL display a recognizable icon alongside the label text. When the user opens the main window without a specific tool target, the content area SHALL default to Home. When the user selects a tool from the sidebar or Home, the content area SHALL show that tool's view. Closing the main window hides it; the app remains running in the tray.

#### Scenario: Default main window entry

- **WHEN** user opens the main window without a tool-specific entry point
- **THEN** Home is shown in the content area and the Home sidebar entry is active

#### Scenario: Sidebar tool navigation

- **WHEN** user clicks a tool in the sidebar
- **THEN** that tool's view replaces the content area

#### Scenario: Sidebar shows tool icons

- **WHEN** the sidebar lists Home, enabled tools, or Settings
- **THEN** each entry shows an icon next to its label

#### Scenario: Window hide on close

- **WHEN** user closes the main window
- **THEN** the window is hidden and the application continues running in the tray

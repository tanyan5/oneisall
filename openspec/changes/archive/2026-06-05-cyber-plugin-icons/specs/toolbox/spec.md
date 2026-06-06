## ADDED Requirements

### Requirement: Built-in cyber-style icon artwork

The host SHALL ship built-in PNG icons for plugins `clipboard`, `shankai`, and `demo`, and for shell navigation targets `home` and `settings`. These icons SHALL use a cohesive **cyber** visual language (dark base, neon accent lines, grid or scan-line motifs, recognizable pictogram per tool) and SHALL NOT be flat single-color placeholders. Icons SHALL remain legible when displayed at 20px (sidebar) and 48px (Home cards).

#### Scenario: Built-in plugin icons are patterned

- **WHEN** the user views Home, sidebar, or Launcher entries for clipboard, shankai, or demo
- **THEN** each tool shows a distinct cyber-style patterned icon rather than a solid color block

#### Scenario: Navigation icons match cyber style

- **WHEN** the user views sidebar entries for Home or Settings
- **THEN** each entry shows a cyber-style patterned icon consistent with built-in plugin icons

#### Scenario: Icon files remain on existing paths

- **WHEN** the host resolves icons via `ToolIconService`
- **THEN** built-in icons are loaded from existing paths (`plugins/<id>/icon.png` and `resources/nav/<id>.png`) without API changes

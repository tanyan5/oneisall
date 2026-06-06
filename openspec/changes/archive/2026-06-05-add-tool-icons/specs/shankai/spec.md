## MODIFIED Requirements

### Requirement: Application display within module

Within each module block, shortcuts SHALL be displayed with both icon and display name. Icons SHALL reflect the target application's icon where possible, including shortcuts that point to `.lnk` files by resolving the link target on Windows. Shortcuts within a module SHALL be ordered by `createdAt` descending (newest first). If an icon cannot be resolved, the UI SHALL show a consistent fallback glyph without breaking the layout.

#### Scenario: Show icon and name

- **WHEN** a module contains shortcuts
- **THEN** each shortcut shows its extracted icon and display name

#### Scenario: Icon for exe shortcut

- **WHEN** a shortcut targets a `.exe` file that exists
- **THEN** the UI displays the executable's application icon

#### Scenario: Icon for lnk shortcut

- **WHEN** a shortcut targets a `.lnk` file that resolves to an existing application target
- **THEN** the UI displays the resolved application's icon rather than a blank placeholder

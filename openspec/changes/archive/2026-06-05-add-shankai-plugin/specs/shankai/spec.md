## ADDED Requirements

### Requirement: Shankai plugin registration

The host SHALL register a built-in plugin with id `shankai`, display name「闪开」, and a renderer view accessible from the toolbox sidebar and Home tool grid like other enabled tools.

#### Scenario: Tool appears in toolbox

- **WHEN** the application starts with the shankai plugin enabled
- **THEN**「闪开」appears in the tools list with id `shankai`

#### Scenario: Open shankai from sidebar

- **WHEN** user selects「闪开」in the main window sidebar
- **THEN** the Shankai modular home view is shown in the content area

### Requirement: Modular block home layout

The Shankai view SHALL present a minimalist home layout composed of user-defined module blocks and a「新建模块」placeholder block. The page SHALL use a futuristic AI-inspired visual background. The Shankai view SHALL NOT include a page-level global search field (search is provided by the global Launcher).

#### Scenario: Empty first visit

- **WHEN** user opens Shankai and no modules exist
- **THEN** the view shows the AI-styled background and a prompt to create the first module

#### Scenario: Multiple modules displayed

- **WHEN** user has created one or more modules
- **THEN** each module appears as a glass-style block with its name and contained applications

### Requirement: Switchable visual themes

The Shankai view SHALL offer two switchable background themes:「赛博网格」(cyber-grid) and「Aurora 流光」(aurora). The user SHALL be able to switch themes at any time from the Shankai page without restarting the application. The selected theme SHALL be persisted across sessions.

#### Scenario: Switch theme on Shankai page

- **WHEN** user selects the other theme from the Shankai theme control
- **THEN** the background and ambient styling update immediately to the chosen theme

#### Scenario: Theme persists after restart

- **WHEN** user restarts the application after selecting a theme
- **THEN** Shankai opens with the same theme applied

#### Scenario: Reduced motion fallback

- **WHEN** the system prefers reduced motion
- **THEN** both themes SHALL render without continuous animation while remaining visually distinct

### Requirement: Module management

The user SHALL be able to create modules with custom names, rename modules, and delete empty modules only.

#### Scenario: Create module

- **WHEN** user chooses「新建模块」and provides or accepts a module name
- **THEN** a new empty module block appears on the Shankai home view

#### Scenario: Rename module

- **WHEN** user renames a module
- **THEN** the new name is persisted and shown on the module block

#### Scenario: Delete empty module

- **WHEN** user deletes a module that contains no applications
- **THEN** the module is removed from persistence and the home view

#### Scenario: Reject delete non-empty module

- **WHEN** user attempts to delete a module that still contains applications
- **THEN** the UI SHALL show an error and SHALL NOT delete the module

### Requirement: Add application to module

The user SHALL add application shortcuts via manual file picker or by dragging files from the desktop or file explorer onto a module block. Supported targets SHALL be `.exe` and `.lnk` files. Each shortcut SHALL belong to exactly one module. The same `targetPath` SHALL NOT exist in more than one module at a time.

#### Scenario: Add via module plus control

- **WHEN** user activates add within a module and selects a valid `.exe` or `.lnk`
- **THEN** a new shortcut with icon and name appears in that module and is persisted

#### Scenario: Add via drag and drop

- **WHEN** user drags a valid `.exe` or `.lnk` file onto a module block and drops it
- **THEN** the module shows drop-target feedback during drag-over and a new shortcut is created in that module using the same validation and conflict rules as file-picker add

#### Scenario: Reject invalid drag target

- **WHEN** user drops a file that is not `.exe` or `.lnk` onto a module
- **THEN** the UI SHALL show an error and SHALL NOT create a shortcut

#### Scenario: Default display name

- **WHEN** user adds a shortcut without custom naming
- **THEN** the display name SHALL default from the file name without extension

#### Scenario: Reject unsupported file type

- **WHEN** user selects a file that is not `.exe` or `.lnk`
- **THEN** the UI SHALL show an error and SHALL NOT create a shortcut

### Requirement: Move application between modules

When adding or managing shortcuts, the system SHALL allow moving an existing shortcut to a different module if its `targetPath` is already registered under another module.

#### Scenario: Move on duplicate add

- **WHEN** user adds a `targetPath` that already exists in another module and confirms move to the current module
- **THEN** the shortcut is reassigned to the current module and removed from the previous module

### Requirement: Application display within module

Within each module block, shortcuts SHALL be displayed with both icon and display name. Shortcuts within a module SHALL be ordered by `createdAt` descending (newest first).

#### Scenario: Show icon and name

- **WHEN** a module contains shortcuts
- **THEN** each shortcut shows its extracted icon and display name

### Requirement: Launch application

When the user activates a shortcut, the system SHALL launch the configured target on Windows, record the launch in Shankai recent history for the global Launcher, and surface errors without crashing the host.

#### Scenario: Successful launch from Shankai

- **WHEN** user clicks a shortcut whose target path exists
- **THEN** the application starts and the launch is recorded for Launcher recent merging

#### Scenario: Missing target path

- **WHEN** user clicks a shortcut whose target path no longer exists
- **THEN** the UI SHALL show an error indicating the path is invalid

### Requirement: Remove application shortcut

The user SHALL remove shortcuts from a module with confirmation. Changing a shortcut target path SHALL require removing the shortcut and adding again (no in-place path edit). Launch arguments SHALL NOT be configurable in v1.

#### Scenario: Remove shortcut

- **WHEN** user confirms removal of a shortcut
- **THEN** the shortcut is removed from persistence and disappears from the module

### Requirement: Module overlay controls remain accessible

When multiple module blocks are displayed, module action menus and per-application remove controls SHALL remain clickable and SHALL NOT be obscured by adjacent module blocks in the layout.

#### Scenario: Module menu above neighbors

- **WHEN** user opens the module overflow menu on a module that has other modules below or beside it
- **THEN** the menu and its actions (including delete module) are fully visible and clickable

#### Scenario: Application remove control above neighbors

- **WHEN** user hovers an application tile to reveal the remove control
- **THEN** the remove control is not covered by an adjacent module block

### Requirement: Shankai data persistence

The host SHALL persist modules and shortcuts in user data across restarts. Each module SHALL store `id`, `name`, `order`, and `createdAt`. Each shortcut SHALL store `id`, `moduleId`, `name`, `targetPath`, and `createdAt`.

#### Scenario: Restart retains modules and shortcuts

- **WHEN** user restarts after configuring Shankai
- **THEN** the same modules and shortcut assignments are loaded

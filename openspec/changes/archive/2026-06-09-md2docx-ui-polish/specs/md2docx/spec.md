## ADDED Requirements

### Requirement: Full-width scroll layout

The Md2docx view SHALL scroll at the full content-area width so the vertical scrollbar appears at the right edge of the main window, not aligned to a narrow inner column.

#### Scenario: Scrollbar at window edge

- **WHEN** the Md2docx view content exceeds the viewport height
- **THEN** the vertical scrollbar is rendered at the right edge of the immersive content area

#### Scenario: Centered content column

- **WHEN** the main window is wider than the designed content max width
- **THEN** form controls and cards are centered in a readable column while scrolling uses the full area width

### Requirement: Shell-consistent visual styling

The Md2docx view SHALL use the toolbox design tokens and visual patterns shared by other immersive tool views (surface backgrounds, borders, accent buttons, muted secondary text).

#### Scenario: Uses global CSS variables

- **WHEN** the Md2docx view is rendered
- **THEN** primary surfaces and controls reference shared tokens such as `--surface`, `--border`, `--accent`, and `--muted` rather than unrelated hard-coded palettes

#### Scenario: Interactive states match toolbox

- **WHEN** user hovers or focuses buttons, the drop zone, or recent list rows
- **THEN** hover/focus feedback is visually consistent with other built-in tool views

### Requirement: Immersive chrome integration

The Md2docx view SHALL integrate with the toolbox immersive shell chrome: no duplicate in-view title bar when `WindowChrome` is shown; use the standard top drag strip when unpinned.

#### Scenario: Unpinned immersive mode

- **WHEN** user opens Md2docx without window pin
- **THEN** the view shows the standard immersive drag strip and does not render a second competing title header

#### Scenario: Pinned immersive mode

- **WHEN** user pins the main window while Md2docx is active
- **THEN** the tool title appears in `WindowChrome` and the in-view duplicate header is hidden

### Requirement: Cyber-style tool icon

The Md2docx plugin SHALL ship a built-in PNG icon at `plugins/md2docx/icon.png` using the same cyber visual language as other built-in plugins (dark gradient base, neon grid/scan lines, corner brackets, distinct center glyph). The center glyph SHALL depict **document conversion**: a narrow Markdown page on the left, a wider Word-style page on the right, and a neon arrow between them. The icon accent color SHALL be amber (`#fbbf24`) for a document/paper feel distinct from other plugin accents.

#### Scenario: Icon replaces letter fallback

- **WHEN** the user views Md2docx in Home, sidebar, Launcher, plugin chrome, or pinned taskbar
- **THEN** the tool shows the cyber conversion glyph icon, not a single-letter **M** placeholder

#### Scenario: Icon legibility at small sizes

- **WHEN** the icon is displayed at 20px or 48px
- **THEN** the dual-page and arrow motif remains recognizable

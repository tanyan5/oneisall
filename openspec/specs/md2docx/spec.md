# md2docx

Markdown 转 Word 内置插件：选择 Markdown 文件、按样式预设转换为 `.docx`，并提供最近记录与输出操作。

## Requirements

### Requirement: Md2docx plugin registration

The host SHALL register a built-in plugin with id `md2docx`, display name「Markdown 转 Word」, and a renderer view accessible from the toolbox sidebar and Home tool grid like other enabled tools.

#### Scenario: Tool appears in toolbox

- **WHEN** the application starts with the md2docx plugin enabled
- **THEN**「Markdown 转 Word」appears in the tools list with id `md2docx`

#### Scenario: Open md2docx from sidebar

- **WHEN** user selects「Markdown 转 Word」in the main window sidebar
- **THEN** the Markdown to Word conversion view is shown in the content area

### Requirement: Markdown file input

The user SHALL be able to select a Markdown source file via a file picker or by dragging a file onto the conversion view. Supported extensions SHALL be `.md` and `.markdown`.

#### Scenario: Select file via picker

- **WHEN** user activates the file picker and chooses a valid `.md` file
- **THEN** the selected file path is shown in the view and ready for conversion

#### Scenario: Drop markdown file

- **WHEN** user drops a `.markdown` file onto the drop zone
- **THEN** the file path is accepted and shown as the current source

#### Scenario: Reject invalid drop

- **WHEN** user drops a file that is not `.md` or `.markdown`
- **THEN** the UI SHALL show an error and SHALL NOT set it as the source file

### Requirement: Markdown to DOCX conversion

The plugin SHALL convert the selected Markdown file to a `.docx` document in the main process without requiring network access or external binaries.

#### Scenario: Successful conversion with default output

- **WHEN** user converts a valid Markdown file without specifying a custom output path
- **THEN** a `.docx` file is written next to the source file with the same base name and the UI shows success with the output path

#### Scenario: Successful conversion with custom output

- **WHEN** user specifies a custom output path and converts a valid Markdown file
- **THEN** the `.docx` is written to the chosen path and the UI shows success

#### Scenario: Conversion failure

- **WHEN** conversion fails due to unreadable source, invalid content, or write error
- **THEN** the UI SHALL show a readable error message and SHALL NOT claim success

### Requirement: Supported Markdown syntax

The conversion SHALL preserve common Markdown constructs in the output document, including headings, paragraphs, ordered and unordered lists, bold and italic emphasis, inline and fenced code, blockquotes, links, and tables.

#### Scenario: Headings and lists convert

- **WHEN** the source contains `#` headings and bullet or numbered lists
- **THEN** the output DOCX contains corresponding heading levels and list structures

#### Scenario: Code and quotes convert

- **WHEN** the source contains fenced code blocks and blockquotes
- **THEN** the output DOCX represents them as distinct formatted blocks

### Requirement: Leadership reading style preset

The plugin SHALL apply a default「商务汇报」style preset optimized for long documents (10+ pages) read by leadership, including Chinese-friendly typography, hierarchical heading sizes, 1.5 line spacing, and justified body text. The plugin SHALL also offer a「极简风」(`minimal-clean`) preset for continuous, clean documents without leadership-oriented page chrome.

#### Scenario: Default preset on convert

- **WHEN** user converts a Markdown file without changing the preset
- **THEN** the output DOCX uses the business-report preset styling

#### Scenario: Preset persists across sessions

- **WHEN** user restarts the application after converting with the business-report preset
- **THEN** business-report remains the selected preset unless the user previously chose minimal-clean

### Requirement: Minimal-clean style preset

The plugin SHALL provide a second style preset「极简风」with id `minimal-clean`, selectable in the conversion view alongside「商务汇报」. The minimal-clean preset SHALL produce a single continuous Word document without an auto-generated table of contents page, without section breaks between cover/TOC and body, without headers or footers, and without page numbers. Word SHALL paginate the document automatically based on content flow and typography.

#### Scenario: User selects minimal-clean preset

- **WHEN** user chooses「极简风」in the preset dropdown and converts a Markdown file
- **THEN** the output DOCX is a single-section document with no `[TOC]` page and no explicit section break inserted by the converter

#### Scenario: Minimal-clean preserves markdown structure

- **WHEN** user converts with minimal-clean and the source contains headings, lists, and paragraphs
- **THEN** the output DOCX reflects the same document structure with minimal-clean typography applied

#### Scenario: Minimal-clean has no page chrome

- **WHEN** user converts with minimal-clean
- **THEN** the output DOCX has no page header, no page footer, and no displayed page numbers added by the converter

#### Scenario: Automatic pagination

- **WHEN** user converts a long Markdown file with minimal-clean
- **THEN** Word breaks content across multiple pages based on layout without the converter inserting manual page or section breaks

### Requirement: Preset-specific UI description

The conversion view SHALL show preset-specific helper text so users understand output differences between presets.

#### Scenario: Business report preset hint

- **WHEN** user selects「商务汇报」
- **THEN** the UI indicates the output includes table of contents and page numbers

#### Scenario: Minimal-clean preset hint

- **WHEN** user selects「极简风」
- **THEN** the UI indicates the output is a continuous clean document without TOC or page numbers

### Requirement: Minimal-clean preset persistence

The plugin SHALL persist the user's last selected preset id including `minimal-clean` across application restarts.

#### Scenario: Minimal-clean persists

- **WHEN** user selects minimal-clean, converts a file, and restarts the application
- **THEN** minimal-clean remains the selected preset

### Requirement: Automatic table of contents

When the **business-report** preset is selected, the conversion SHALL generate a clickable table of contents from Markdown headings (H1–H3). If the source file does not contain a `[TOC]` marker, the converter SHALL insert one automatically before the body content.

#### Scenario: TOC generated for structured document

- **WHEN** user converts a Markdown file with `#` and `##` headings using business-report
- **THEN** the output DOCX begins with a directory page listing those headings

#### Scenario: TOC omitted from source is still produced

- **WHEN** user converts a Markdown file that has headings but no `[TOC]` line using business-report
- **THEN** the converter still produces a table of contents in the output

#### Scenario: TOC page has no page number

- **WHEN** the output document includes a table of contents section
- **THEN** page numbers SHALL NOT appear on the TOC pages

### Requirement: Page numbers and header

When the **business-report** preset is selected, the output document SHALL display the document title in the page header and Arabic page numbers in the footer on body pages. Body page numbering SHALL start at 1 after the table of contents.

#### Scenario: Header shows document title

- **WHEN** the source contains a top-level `#` heading and business-report is selected
- **THEN** body pages show that title centered in the header

#### Scenario: Footer shows page number

- **WHEN** user views a body page after the table of contents
- **THEN** the footer shows the current page number centered (e.g.「— 3 —」)

#### Scenario: Body numbering starts at one

- **WHEN** the document has a table of contents followed by body content
- **THEN** the first body page is numbered 1

### Requirement: Post-conversion actions

After a successful conversion, the user SHALL be able to open the generated DOCX file or reveal its containing folder from the plugin view.

#### Scenario: Open output file

- **WHEN** user chooses to open the output file after success
- **THEN** the system opens the generated `.docx` with the default associated application

#### Scenario: Open output folder

- **WHEN** user chooses to open the output folder after success
- **THEN** the system opens the file explorer focused on the output directory

### Requirement: Recent conversions

The plugin SHALL remember up to 10 recently converted source file paths and display them for quick re-selection.

#### Scenario: Record recent on success

- **WHEN** a conversion completes successfully
- **THEN** the source path is added to recent list ordered by most recent first

#### Scenario: Re-select from recent

- **WHEN** user clicks a recent entry
- **THEN** that path becomes the current source file for the next conversion

#### Scenario: Recent list cap

- **WHEN** more than 10 successful conversions have been recorded
- **THEN** only the 10 most recent source paths are retained

### Requirement: Launcher keywords

The md2docx plugin manifest SHALL include launch keywords so the global Launcher can surface the tool when the user searches related terms such as「Markdown」or「转 Word」.

#### Scenario: Launcher finds md2docx by keyword

- **WHEN** user searches the Launcher with a registered md2docx keyword
- **THEN**「Markdown 转 Word」appears in search results and selecting it opens the md2docx view

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

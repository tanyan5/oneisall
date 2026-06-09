## ADDED Requirements

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

The plugin SHALL apply a default「商务汇报」style preset optimized for long documents (10+ pages) read by leadership, including Chinese-friendly typography, hierarchical heading sizes, 1.5 line spacing, and justified body text.

#### Scenario: Default preset on convert

- **WHEN** user converts a Markdown file without changing the preset
- **THEN** the output DOCX uses the business-report preset styling

#### Scenario: Preset persists across sessions

- **WHEN** user restarts the application after converting with the business-report preset
- **THEN** the same preset remains selected in the plugin view

### Requirement: Automatic table of contents

The conversion SHALL generate a clickable table of contents from Markdown headings (H1–H3). If the source file does not contain a `[TOC]` marker, the converter SHALL insert one automatically before the body content.

#### Scenario: TOC generated for structured document

- **WHEN** user converts a Markdown file with `#` and `##` headings
- **THEN** the output DOCX begins with a directory page listing those headings

#### Scenario: TOC omitted from source is still produced

- **WHEN** user converts a Markdown file that has headings but no `[TOC]` line
- **THEN** the converter still produces a table of contents in the output

#### Scenario: TOC page has no page number

- **WHEN** the output document includes a table of contents section
- **THEN** page numbers SHALL NOT appear on the TOC pages

### Requirement: Page numbers and header

The output document SHALL display the document title in the page header and Arabic page numbers in the footer on body pages. Body page numbering SHALL start at 1 after the table of contents.

#### Scenario: Header shows document title

- **WHEN** the source contains a top-level `#` heading
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

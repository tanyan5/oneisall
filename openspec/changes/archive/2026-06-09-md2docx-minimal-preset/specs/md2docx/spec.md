## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Leadership reading style preset

The plugin SHALL apply a default「商务汇报」style preset optimized for long documents (10+ pages) read by leadership, including Chinese-friendly typography, hierarchical heading sizes, 1.5 line spacing, and justified body text. The plugin SHALL also offer a「极简风」(`minimal-clean`) preset for continuous, clean documents without leadership-oriented page chrome.

#### Scenario: Default preset on convert

- **WHEN** user converts a Markdown file without changing the preset
- **THEN** the output DOCX uses the business-report preset styling

#### Scenario: Preset persists across sessions

- **WHEN** user restarts the application after converting with the business-report preset
- **THEN** business-report remains the selected preset unless the user previously chose minimal-clean

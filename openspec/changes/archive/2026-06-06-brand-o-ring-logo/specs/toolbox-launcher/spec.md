## MODIFIED Requirements

### Requirement: Launcher home affordance

The launcher search bar SHALL include a branded **O-ring** home control on the right side of the input, implemented via the shared `BrandMark` component with normal breathing animation. Activating it SHALL hide the launcher and open the main window on the Home overview. The control SHALL NOT use a tentacled jellyfish or lion glyph.

#### Scenario: Open home from launcher brand button

- **WHEN** user clicks the O-ring home control beside the launcher search field
- **THEN** the launcher hides and the main window shows the Home overview

### Requirement: Launcher minimal brand header

The launcher SHALL NOT display a separate lion brand header above the search area. Brand presence is conveyed only through the shared O-ring home control beside the search field.

#### Scenario: No duplicate brand header

- **WHEN** user opens the launcher overlay
- **THEN** there is no additional lion or wordmark header row above the search field

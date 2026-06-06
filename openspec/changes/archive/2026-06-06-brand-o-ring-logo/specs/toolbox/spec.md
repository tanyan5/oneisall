## MODIFIED Requirements

### Requirement: Application brand identity

The application SHALL use a unified **O-ring** brand mark (abstract breathing jellyfish bell as the letter O) across the management center top bar, launcher home control, system tray, and Windows application icon. The mark SHALL consist of a cyan ring stroke with an optional center highlight dot at sizes 20px and above. The mark SHALL NOT include tentacles, lion imagery, or the diamond fallback glyph.

Tray and taskbar icons SHALL be static (no animation). The management center top bar and launcher home control MAY display a subtle breathing animation on the ring per reduced-motion preferences.

The primary brand accent color SHALL be `#22D3EE` for the O-ring across UI and generated tray assets.

#### Scenario: Top bar shows O-ring brand

- **WHEN** user views the management center top bar
- **THEN** an O-ring brand icon is shown with subtle breathing animation and no text wordmark

#### Scenario: Launcher home control uses same mark

- **WHEN** user opens the launcher overlay
- **THEN** the home control beside the search field shows the same O-ring family with normal breathing animation

#### Scenario: No diamond fallback

- **WHEN** brand assets are rendered in the shell
- **THEN** the diamond ◆ placeholder is not used

#### Scenario: Tray icon matches brand

- **WHEN** the application is running in the system tray
- **THEN** the tray icon depicts the O-ring on the dark cyber base consistent with generated brand assets

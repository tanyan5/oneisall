## MODIFIED Requirements

### Requirement: Search shows two-tier results

When the user enters a non-empty search query, the launcher SHALL show matching items in two sections: enabled toolbox tools and Shankai application shortcuts SHALL both participate in fuzzy matching. The first section SHALL contain the highest-scoring matches; the second section SHALL contain other matches not already listed in the first section. If the second section has no items, it SHALL NOT be shown. Result rows SHALL indicate item kind (tool vs application) and SHALL display an icon for each item where resolvable.

#### Scenario: Fuzzy primary matches across tools and apps

- **WHEN** user types a keyword matching tool names, descriptions, or Shankai app names
- **THEN** the first section lists the best-ranked mixed matches with kind labels and icons

#### Scenario: Secondary matches

- **WHEN** additional tools or apps match the keyword but are not in the first section
- **THEN** those items appear in the second section with icons when available

#### Scenario: No secondary matches

- **WHEN** all matches are shown in the first section only
- **THEN** the second section is hidden

### Requirement: Empty search shows recent tools in first section only

When the launcher search query is empty, the launcher SHALL display only the user's recent items (maximum 10) in the first section. Recent items SHALL include both toolbox plugins and Shankai application shortcuts, merged and sorted by most recent use (`lastUsedAt` descending). Each recent row SHALL display an icon when resolvable. The second section SHALL NOT be shown.

#### Scenario: No search query with mixed recents

- **WHEN** launcher opens with an empty search field and the user has recent plugin or Shankai app launches
- **THEN** the first section lists up to 10 mixed recent items with icons, sorted by recency

#### Scenario: No recent history

- **WHEN** launcher opens with an empty search field and the user has no recent items
- **THEN** the first section shows an empty-state hint to search

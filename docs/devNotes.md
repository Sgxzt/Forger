# Forger Developer Notes

## v1.6.0

Forger now includes the foundation of its internal entity architecture. Extracted contextual terms can be represented as structured entities instead of existing only as plain strings.

The new EntityFactory and EntityStore modules create, normalize, store and merge entities during each analysis while preserving full compatibility with the existing dashboard and TXT export workflow.

### Implemented

- Added EntityFactory for consistent structured entity creation.
- Added EntityStore for temporary in-memory entity management.
- Added automatic entity normalization and deduplication.
- Added occurrence tracking for repeated contextual terms.
- Added source, context, confidence and metadata support.
- Integrated contextual entities into the existing scraping pipeline.
- Included entities in the internal analysis result without changing legacy output.

### Fixed

- Prevented duplicate entity objects when the same term appears multiple times.
- Ensured entity data is cleared between separate page analyses.
- Preserved existing categorized strings and wordlist exports during the migration.
- Maintained the original text while providing a normalized identifier for comparisons.

### Architecture

EntityFactory is responsible only for creating valid entity objects.

EntityStore is responsible for storing, merging and retrieving entities during the current analysis.

The scraper remains responsible for extraction and only sends valid observations to the entity system.

### Next phase

The next phase will progressively register existing categories such as technologies, users, companies and products as structured entities.

Later development will add source-aware confidence calculation, contextual classification and scoring without relying exclusively on static dictionaries.

## v1.5.0

Forger now includes a modular filtering pipeline using dedicated stopword, blacklist and whitelist managers.

The new FilterEngine coordinates filtering priorities while preserving compatibility with the existing extraction and dashboard workflow.

### Implemented

- Added configurable stopword loading and normalization.
- Added blacklist and whitelist data managers.
- Added FilterEngine with whitelist priority.
- Added contextual word preservation for valid unclassified terms.
- Expanded accessible extension resources for external JSON data.

### Fixed

- Prevented common noise words and unwanted web-resource terms from reaching exported dictionaries.
- Preserved important security and infrastructure terms during filtering.
- Corrected JSON resource paths and loading configuration.
- Verified TXT wordlist exports and contextual category output.

### Next phase

The next development phase will introduce structured Entity objects, occurrence tracking and source-aware scoring while maintaining the current legacy output for dashboard compatibility.

# Forger Developer Notes

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

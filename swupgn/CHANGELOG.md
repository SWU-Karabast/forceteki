# Changelog

## 0.1.0

First release of the redesigned SWU-PGN format (`SWU-PGN/0.1`): an entity model with board
diffs, three profiles (`full`, per-seat perspective, `public`) produced by one redaction
algorithm, narrative blocks with per-kind contracts, registries, a JSON schema, and a conformance
suite.

The SDK has three entry points: `@swupgn/format` (parse, serialize, apply, boardAt, render,
registries), `@swupgn/format/writer` (serialize, diff, redact) and `@swupgn/format/validate`.

Files of the earlier 1.0 pilot format are legacy. They are not readable as 0.1 and there is no
migration path. The format freezes at 2.0, not 1.0.

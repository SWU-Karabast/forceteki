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

### Changes since the 2026-11-03 draft

From the SWU Forge review (2026-11-04):

- A face-down departure from a hand the viewer cannot see makes the viewer lose track of every
  card it knew in that hand (§10.3, R-17, W-63).
- Each block kind has a field contract (§22.4). A writer that writes blocks writes one for every
  occurrence (W-64, W-65), and the validator checks the contracts (V-16).
- Ids are never shared across files. A host MAY give players the `full` file after the match
  when every seat agrees (H-05).

From the maintainer review (2026-11-18):

- Only the board at each step is normative. A writer MAY leave out an entity, a reveal or an
  effect that begins and ends within one step group, unless a block it writes names it (§8.2, W-37).
- Effect entities are a SHOULD (W-31), with a granularity rule: one entity per effect that one
  ability resolution creates. Effect audiences that widen later are an open issue (§23).
- Setup has steps: step 0 is the first decision of the game, and `g.phase` is `setup` until the
  action phase (W-39). A prompt that asks both seats at once is one step, the seat with the
  initiative's records first (§8.2).
- A block records only an event both seats observe, and its `amount` holds only what its
  contract defines (W-54).
- Vectors pin the board at every step (`N.<profile>.boards.jsonl`, §19). §19 describes the drift
  and privacy checks every writer should run in its own CI.
- Registry: `keywords` and `traits` give their exact format; `exhausted` no longer applies to
  upgrades (CR 1.5.4.b); ability ids are opaque and unstable.
- Wording: a deck pass inside one step (W-22 note), the reveal exception to "cannot link" (§10.3),
  and decision steps that collapse long resolutions (§8.2).

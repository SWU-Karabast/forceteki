# swupgn

Engine-independent reference reader for the SWU-PGN/1.0 game format.

- `parse(text)` -> structured document (header, story, decks, cards, setup, events, annotations)
- `fold(events)` / `stateAt(events, seq)` -> reconstructed board state (no rules engine)
- `render(doc)` -> the normative human-readable game story
- `validate(text)` -> conformance report

This module MUST NOT import from `server/game/` (the SWU rules engine). It is the
executable reference for `docs/SWU-PGN-1.0-SPEC.md`.

## Test vectors

`test-vectors/` holds the normative examples (spec §20). `minimal` is hand-written; `organic`,
`upgrades`, `pilot` and `capture` are real games the writer produced under
`test/server/chat/SwuPgnVectors.spec.ts` / `SwuPgnOrganicGame.spec.ts`, whose fold and story
those specs pin byte for byte. To regenerate them after a deliberate writer change:

```
SWUPGN_WRITE_VECTORS=1 npm test
```

then review the diff and update the spec's §20/§22 tables.

## Provenance in production

The `Engine` header tag resolves `FORCETEKI_VERSION`, then the git SHA of the working tree, then
the package version (spec §5.3). A deployed image has no `.git` and package.json has always said
`0.1.0`, so CI must set `FORCETEKI_VERSION` from the commit it builds or every production file
will read `forceteki@0.1.0` and identify nothing.

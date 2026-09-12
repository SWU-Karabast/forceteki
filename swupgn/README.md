# swupgn

Engine-independent reference reader for the SWU-PGN/1.0 game format.

- `parse(text)` -> structured document (header, story, decks, cards, setup, events, annotations)
- `fold(events)` / `stateAt(events, seq)` -> reconstructed board state (no rules engine)
- `render(doc, names?)` -> the normative human-readable game story
- `validate(text)` -> conformance report
- `checkKeyframes(events)` -> keyframe integrity report (spec §13). A conformant file reports no
  mismatch, so one that does means your fold has a rule wrong, not that the file is bad.
- `linkActionSteps(events)` -> stamps `for` on the records the engine numbered before the action
  they belong to (spec §9.1), so a reader never implements that heuristic. Writers run this.
- `indexResolver(cards)` / `baseId(ref)` -> the card-name lookup `render` takes as `names`

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

Two environment variables decide whether a production file is worth anything.

`FORCETEKI_VERSION` — the `Engine` header tag resolves it first, then the git SHA of the working
tree, then the package version (spec §5.3). A deployed image has no `.git` and package.json has
always said `0.1.0`, so CI must set `FORCETEKI_VERSION` from the commit it builds or every
production file will read `forceteki@0.1.0` and identify nothing.

`SWUPGN_ID_SECRET` — set it and player ids become an HMAC keyed by that secret: non-reversible,
and the same player hashes the same across that server's games. Leave it unset and ids fall back
to a `GameId` salt, which anyone holding the file and a candidate username list can confirm by
re-hashing. Both schemes emit `sha256:<hex>`, so nothing downstream can tell them apart — a
deployment that publishes files MUST set it (spec §17). An empty value reads as unset, so
`SWUPGN_ID_SECRET=` in a deploy config publishes confirmable ids, not HMACs.

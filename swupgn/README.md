# swupgn

Engine-independent reference reader for the SWU-PGN/1.0 game format. Informative: the spec,
`docs/SWU-PGN-1.0-SPEC.md`, is normative, and where the two disagree that is an erratum
(spec §2).

- `parse(text, limits?)` -> structured document (header, story, decks, cards, setup, events,
  annotations). Throws a `SwuPgnError` whose `code` is from the spec's error table (§24) for a
  malformed file, and rejects a file over `limits` (`DEFAULT_LIMITS`: 16 MiB counted in UTF-8
  bytes, not string length; 1,048,576 characters (UTF-16 code units) per line;
  1,000,000 records; depth 64) rather than reading part of it. `RESERVED_KEYS` is every
  `Object.prototype` name plus `prototype` (spec §23): a record key, a header tag name, or a
  `STATUS_TOKEN` `token` (in `SETUP`, `EVENTS` or an annotation's what-if `line`) that is one
  of them (`reserved-key`), or a major version other than `READER_MAJOR`
  (`unsupported-major`), makes the file malformed, so no consumer ever sees one.
  `header.result` keeps an outcome a newer minor version added as written; treat one you do
  not know as `Incomplete` (spec §18).
- `validate(text)` -> conformance report: `level` (`malformed` … `complete`, spec §2.1) and
  `issues`, each with a `code` and a `severity`. Branch on `code`, never on `message`. The list
  stops at `MAX_ISSUES` (1000) with one `too-many-issues` warning; `level` counts every issue.
- `fold(events)` / `stateAt(events, seq)` -> reconstructed board state (no rules engine);
  `reduce(state, event)` is the per-event rule both apply between keyframes (spec §12). Events
  built without `parse()` get the same guard: a `STATUS_TOKEN` naming a reserved key does nothing.
- `render(doc, names?)` -> the story, as a strict renderer writes it (spec §16)
- `checkKeyframes(events)` -> keyframe integrity report (spec §14). A conformant file reports no
  mismatch, so one that does means your fold has a rule wrong, not that the file is bad.
- `linkActionSteps(events)` -> stamps `for` on the records the engine numbered before the action
  they belong to (spec §9.1 `[W-18]`, by the rule in Appendix C). Writers run this; a reader
  of an old file without `for` can run it too.
- `indexResolver(cards)` / `baseId(ref)` -> the card-name lookup `render` takes as `names`.
  It cuts any name or `backSideName` longer than 120 characters (UTF-16 code units) to its first
  119 and `…`, as spec §16's `nm(id)` requires (the longest real card's is 49), because the story
  repeats a name on every line that names the card. It also skips an index entry whose `id` or
  `name` is not a string. A resolver you pass to `render` yourself is used as is.

This module MUST NOT import from `server/game/` (the SWU rules engine).

## Schemas

`schema/` holds the JSON Schemas (draft 2020-12): `header`, `deck`, `event` and `annotation`
for the records, and `reduced-state` for the board a fold produces (a `.fold.json`). Their
`$id`s are URNs (`urn:swu-pgn:1.0:event`), not URLs: nothing needs to be fetched.

## Conformance suite

`test-vectors/` is the conformance suite (spec §20). `test-vectors/manifest.json` lists every
vector with the level, error and warning codes a validator reports for it, and for a positive
vector the `.fold.json` a folder produces and the `.render.txt` a strict renderer produces.
`test/server/swupgn/manifest.spec.ts` runs the whole manifest against this reader.

Positive vectors: `minimal` is hand-written and is also the spec's Appendix A, so edit both
together. `other-writer` is `minimal` as another platform's writer would make it
(`examplewriter@1.0.0`, no `WriterRevision`); its fold and render files are copies of
`minimal`'s, so change all three with `minimal`. `organic`, `upgrades`, `pilot`, `capture`, `arrest`, `stolen-hauler`, `homeworlds`,
`death-star`, `effects`, `visibility` and `control` are real games the writer produced under
`test/server/chat/SwuPgnVectors.spec.ts` / `SwuPgnOrganicGame.spec.ts`, whose fold and story
those specs pin byte for byte. `homeworlds` is the one to test Homeworlds support against:
Fortify upgrades on both bases (`baseUpgrades`), a base using an ability an upgrade granted it
(`grantedBy`), Beast tokens, and Weakness tokens stacking until one kills (spec §10.3).
`death-star` is Grand Moff Tarkin deploying as The Death Star (`backSideName`) and defeating a
base that still has HP (`DEFEAT` on `base@2`, `baseDefeated`; spec §10.4).
`effects` is lasting effects (`EFFECT_START` / `EFFECT_END`, the board's `effects`): an effect on
both bases, one on two units that one of them leaves (a partial end), an `until` effect, and a
blanked unit. `visibility` is `LOOK`, `SEARCH.seen`, `NAME`, `blind` choices with a `simul`
discard, and a When Defeated used again by the leader (`usedBy`). `control` is an upgrade and a
unit taken, a limited ability (`limit`), a gained trait, a copy (`copyOf`), and an enemy unit put
into play as a resource (`foreignResources`). Each scenario's seed is fixed; the `control` seed
(`swu-pgn-vector-control-b`) is the first of a short list that played every card it is about, so
if a card-data change makes its assertions fail, try others the same way rather than loosening
them.

The setup's initiative choice (`R0.S.1`, a `MODAL_CHOICE`) is made before the scenario seeds the
game, so which seat makes it can differ from run to run. Neither the fold nor the story shows it,
and it carries no `for`, so the gate never compares it; a regenerated vector may differ from the
committed one there and nowhere else.

Negative vectors, in `test-vectors/negative/`, are each `minimal` with one thing broken.

To regenerate the real-game vectors after a deliberate writer change:

```
SWUPGN_WRITE_VECTORS=1 npm run test-fast build/test/server/chat/SwuPgnVectors.spec.js build/test/server/chat/SwuPgnOrganicGame.spec.js
```

from a clean commit (the `Engine` tag records `-dirty` otherwise; check with
`grep -h '^\[Engine' swupgn/test-vectors/*.swupgn | sort -u`), then review the diff, bump
`SWU_PGN_WRITER_REVISION` if a reader could see the change, update the spec's §20 table and
Appendix C's writer-revision table, update `manifest.json` if a vector's level or codes moved,
and update the spec's quoted records (`specQuotes.spec.ts` names each stale one, `ms` included).
A regeneration that inserts records renumbers later sub-steps, so also carry
`test/server/swupgn/fixtures/for-links-rev3.json` over to the new seqs, record for record.

## Provenance and identity in production

Operational detail for the reference writer (`server/game/core/chat/`). The spec's Appendix D
says what each one is for.

`FORCETEKI_VERSION` — the `Engine` header tag resolves it first, then the git SHA of the working
tree (with `-dirty` for an uncommitted tree), then the package version (spec §5.3). A deployed
image has no `.git`, and `package.json` has said `0.1.0` for the project's whole life, so CI must
set `FORCETEKI_VERSION` from the commit it builds or every production file will read
`forceteki@0.1.0` and identify nothing. The value is cached for the life of the process, so a
long-running development server keeps stamping the SHA it started with until it restarts.

`SWUPGN_ID_SECRET` — set it and player ids become an HMAC keyed by that secret: non-reversible,
and the same player hashes the same across that server's games. Leave it unset and ids fall back
to a salt of the engine's internal game id. The file does not print it (`GameId` is a hash of
it), but it is not a secret: the server names the game by that id to its players and spectators,
and logs it, so the fallback only keeps ids from being joined across files. Both schemes emit
`sha256:<hex>`, so nothing downstream can tell them apart — a deployment that publishes files
MUST set it (spec §17). An empty value reads as unset, so `SWUPGN_ID_SECRET=` in a deploy config
publishes salted ids, not HMACs. A production server logs an error at startup when it is unset.

The PII gate is `test/server/chat/SwuPgnPiiScan.spec.ts`: it stamps sentinel identities onto a
live game and fails if any of them survive into the file.

The host serves a game's file through `Lobby.getGameLog`, and only once the match is over
(spec §23). Only the game attached to the lobby is served: in a best-of-three that is the last
game, because each earlier game's file is dropped when the next game replaces it, and a rematch
drops the finished game's file the same way (a `TODO` in `Lobby.getGameLog`).

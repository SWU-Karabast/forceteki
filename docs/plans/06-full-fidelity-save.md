# Plan 6 — Full-Fidelity Save/Load

**Status:** Proposed (revised after adversarial review; product decisions folded in — builds on Plan 2's bug-report fork, empty residue target)
**Depends on:** Plan 2 (schema + `engineOnlyFacts` manifest + loader + artifact plumbing), Plan 3 (generated serializers + registry; including its schema-surface hash — see D), Plan 5 (recreation from records + closure recipes; the lasting-effect capture prerequisite in A answers Plan 5's open question)
**Shape:** Large — two items are real design work, not convergence: the lasting-effect parameter capture (A) and the load-time identity/translation layer (C, the largest item in the plan). The rest is convergence and hardening. Re-sized under the accepted decisions: E shrank (bug-report artifacts need no consent/UX flow), and a small new item G (the `until`-closure refactor) was added; net size still Large.

## Goal

Grow the Plan-2 semantic save into a **complete** state capture: a saved match
restores *everything* the snapshot system knows — active duration-bound
ongoing effects, gained abilities, delayed effects, custom-duration events,
ability/effect internals — by embedding the (now JSON-safe) serialized
GameObject records and recreation recipes directly in the save file.

The honest convergence target, stated up front: v1's degradation list is
absorbed check-by-check into the engine tier, and the capture residue —
lasting effects whose captured parameters contain functions (per-resolution
`until` closures; exactly 3 card files today, refactored to declarative form
by work item G) — converges to **empty**, with the writer's hard-fail on
non-serializable `until` parameters kept as the guard against regression.
Every fact that lives only in the engine tier is declared in the
**machine-readable `engineOnlyFacts` manifest** in the semantic tier —
inherited from Plan 2, which defines it. The convergence artifact of this
plan is that manifest: "full fidelity" means the manifest covers everything
the engine tier carries, the residue is enumerated (and, after G, empty),
and nothing is ever dropped silently (invariant 4).

Semantic save v1 and full-fidelity save are **one schema, two tiers** — not
two systems:

```jsonc
{
  "formatVersion": 2,
  // ...everything from v1 (the human-readable semantic tier)...
  "engineOnlyFacts": [               // semantic-tier manifest of engine-tier-only state — schema inherited from Plan 2 (see B)
    { "category": "lastingEffect", "source": { /* ISavedCardRef */ }, "target": { /* ... */ },
      "duration": "untilEndOfPhase", "description": "..." }
  ],
  "engineState": {                   // the full-fidelity tier
    "engineSchemaHash": "...",       // schema-surface hash (see D), not a build hash
    "records": {
      "<fileUuid>": {                // fileUuid = file-internal record id, never matched against live uuids (see C)
        "classTag": "OngoingCardEffect",   // in-record, per Plan 5 A1
        "recipe": { /* per-class recipe section incl. matching coordinate, per Plan 5 A4/5b */ },
        "state": { /* JSON-safe serialized state record */ }
      }
    },
    "gameStateRecord": { /* Game.state record (Plan 3 Phase B step 2) */ }
  }
}
```

The record layout is **Plan 5's layout**: `classTag` and the recipe section
live inside each record (Plan 5 A1, A4), not in separate top-level maps — the
file embeds the same record shape the in-memory system produces, byte-for-
byte, so the two plans describe one format. There is no `lastGameObjectId`
in the file: under the translation design in C, file uuids never become live
uuids and the live counter is never restored from a save.

The semantic tier remains authoritative for cross-version loads and human
inspection; the `engineState` tier enables exact restoration on a compatible
engine. A loader confronted with an incompatible `engineState` (schema hash
mismatch) degrades to semantic-tier loading only by presenting the
`engineOnlyFacts` manifest and obtaining explicit confirmation — the user
sees *specifically which* effects/abilities the degraded position loses, not
a generic notice (see B and D).

## Work items

### A. Prerequisite: lasting-effect parameter capture (the wall Plan 5 handed over)

Plan 5 classified resolution-created lasting effects as **non-recreatable —
pinned** (`05-gameobject-recreation.md`, 5b): their props are built from the
*resolved target and context* at resolution time
(`CardLastingEffectSystem.getEffectFactoriesAndProperties` constructs
`{ matchTarget: card, ability: context.ability, ...otherProperties }`,
`server/game/gameSystems/CardLastingEffectSystem.ts:110-120`), and
`OngoingEffect` pins these as plain readonly fields plus closures
(`OngoingEffect.ts:48-57`). "Pinned" is a rollback concept — keep the live
instance — and is meaningless across a save/load process boundary. Plan 5's
open question put the choice to this plan in writing. The answer:

**Decision: schedule the parameter-capture recipe as this plan's
prerequisite, with a hard-fail on function-valued parameters — and empty
the residue by refactoring its only occupants (work item G).** Justification from the code: mid-phase positions are the whole
point of full fidelity — 239 card implementations (~13%) create these effects,
`forThisPhaseCardEffect` alone ×217 (Plan 5's survey), so they are present at
essentially every interesting save point; and the alternative of restricting
saves to end-of-action-phase is *not* actually lasting-effect-free —
`UntilEndOfRound`, `WhileSourceInPlay`, and `Duration.Custom` effects survive
the phase boundary (forThisRound ×5, whileSourceInPlay ×4, custom ×3, raw
lasting effects in 11 files), and that timepoint needs its own loader
machinery anyway (see D). Capture is the only exit that serves the feature.

- **Capture point:** the lasting-effect systems' registration boundary
  (`CardLastingEffectSystem` / `PlayerLastingEffectSystem` /
  `DelayedEffectSystem` apply paths). At effect registration, record a
  JSON-safe capture: resolved `matchTarget` ref, duration, the source
  ability's coordinate (`abilityIdentifier` + the lasting-effect system's
  position within it), and the resolved additional-properties bag. The
  captured recipe goes into the effect's record recipe section (Plan 5 A4).
- **Recreation:** re-derive the effect factory from the recreated source
  card's ability definition via the captured coordinate (the card's setup
  fan-out already reconstructs the ability and its systems — Plan 5b's
  composite protocol), then re-apply it against the captured target/params
  — replaying the *application*, never the resolution.
- **Residue (hard-fail at capture time, invariant 4):** any captured member
  that is function-valued. Today that is per-resolution `until` closures —
  exactly 3 card files (`server/game/cards/03_TWI/units/Clone.ts`,
  `server/game/cards/07_TS26/units/FivesIHaveProof.ts`,
  `server/game/cards/02_SHD/events/GiveInToYourAnger.ts`), refactored to a
  declarative form by work item G so the residue set is **empty** — plus any
  dynamic parameter bag members that resist JSON capture, found by the
  capture dev-assert, not assumed. A save containing a residue effect is
  **hard-failed**, naming the card. The hard-fail is not vestigial once G
  lands: it is the enforcement mechanism that makes a future non-serializable
  `until` closure surface at test time (the round-trip corpus) instead of in
  production saves.
- **Classification update (cross-plan note for Plan 5):** captured lasting
  effects become a third class in Plan 5's snapshot-time classification
  dev-assert — "recreatable by capture" alongside "recreatable" and
  "pinned"; the assert must recognize the flag. In-memory rollback behavior
  is unchanged (they stay pinned there — capture is only exercised by
  save/load).
- **De-risk fallback, stated for honesty:** if capture slips, full saves at
  the **end-of-action-phase** timepoint are the fallback — it already
  returns a valid entry point (`RollbackRoundEntryPoint.EndOfActionPhase`,
  `SnapshotManager.ts:402-406`) and `forThisPhase` effects (the dominant
  ×217) have expired there, shrinking the residue to the ~12 round/custom/
  while-in-play implementations. It still requires the per-timepoint loader
  analysis in D and a verification that the end-of-phase snapshot is taken
  *after* phase-duration effect expiry — it is a fallback, not free.

Same treatment, briefly, for the other v1 degradation families — covered
by existing Plan 5 recipes and need only round-trip wiring, not new design:
gained abilities (Plan 5b recipe `(sourceCardRef, sourceAbilityCoordinate,
targetCardRef, gainKind)`; requires Plan 5b's gained-ability identifier fix),
constant-ability ongoing effects (re-derived from source-card definitions),
custom-duration events whose effect is recreatable-or-captured (handler
re-derived via `OngoingEffectEngine.createCustomDurationHandler`). A
custom-duration event whose effect is in the residue is in the residue.

### B. Writer: emit the engine tier

- **Scope the record set to live-reachable state — never "every registered
  GameObject".** The registry's `hasRef` latch is monotonic and
  `removeUnusedGameObjects` culls only never-referenced objects
  (`GameStateManager.ts:98-118`), so `allGameObjects` at save time contains
  every expired effect and superseded wrapper the whole game ever pinned —
  including non-recreatable ones — retained only by snapshot history, which
  a load discards anyway. The record set is instead the closure over live
  roots (the `Game.state` record, Players, Zones, engine singletons, state
  watchers, cards in zones, registered effects/abilities) through decorated
  refs plus the uuid-bearing `stateValue` fields inventoried by Plan 5c's
  ref extractors — equivalently, what a snapshot taken with cleared history
  and per-uuid liveness (Plan 5c) would retain. Dev-assert at write time
  that no emitted record references a uuid outside the emitted set.
- Emit each live-reachable object's record in Plan 5's in-record layout
  (`classTag` + recipe + state), including the capture recipes from A.
- **File-level JSON hardening (the flag Plan 3 handed to this plan,
  `03-codegen-serializers.md` Phase A step 2):** in-memory records tolerate
  `NaN`/`Infinity` and `undefined`-valued keys; `JSON.stringify` silently
  corrupts both (`NaN` → `null`, `undefined` keys dropped). The file writer
  tag-encodes non-finite numbers (`{"$num": "NaN" | "Infinity" |
  "-Infinity"}`, decoded symmetrically by the loader) and **hard-fails** on
  `undefined`-valued keys inside `stateValue` payloads (invariant 4; ref
  fields already encode `?? null` per Plan 3). Round-trip test for both.
- **Shrink v1's degradation list check-by-check, each with a round-trip
  test** — duration-bound ongoing effects (via A), gained abilities, delayed
  effects, custom-duration events — until the manifest is the exact
  engine-minus-semantic difference and A's capture hard-fail (empty after G)
  is the only writer failure mode.
- **Emit the `engineOnlyFacts` manifest in the semantic tier — extending
  Plan 2's schema, not introducing one.** Plan 2 defines the manifest
  (category, source card ref, target ref, duration, human-readable
  description) and its writer already emits it for *dropped* facts; here the
  same checks and the same entry shape declare facts that are *carried* in
  `engineState` but absent from the semantic tier. An empty manifest means
  the semantic tier alone is lossless.
- Keep writing the semantic tier from the same live game (not derived from
  records) so the two tiers cross-validate: a dev-mode check compares
  semantic-tier facts (damage, zones, counts, limits, watcher entries)
  against the records **and** checks the manifest is exactly the
  engine-tier-minus-semantic-tier difference, failing on mismatch.

### C. Loader: identity mapping and restoration (the largest item)

**Decision: load-time uuid translation, complying with invariant 2 — file
uuids are never adopted by live objects.** The alternative ("uuids from
file") would require rekeying every fresh-start object *and its constructor
fan-out* to file uuids through machinery Plan 5 built only for rehydration
scopes during rollback, plus an unstated construction-order determinism
contract between the original game's setup and the loader's headless replay
— and any divergence trips the single-assignment assert
(`GameObjectBase.ts:73-76`) or the silent mapping overwrite
(`GameStateManager.ts:93`). Translation avoids all of it: file uuids are
**file-internal record identifiers only**, matching between file and live
objects uses stable coordinates exclusively (invariant 2's actual demand —
"uuids… may be remapped on load" is the clause this design exercises), and
every record therefore carries its stable matching coordinate in its recipe
section (cards additionally carry Plan 2's `(seat, zone, ordinal)`; fan-out
objects carry Plan 5b's composite coordinates — `abilityIdentifier`,
`(classTag, ordinal-within-scope)`, etc.).

The load sequence:

1. Fresh `Game` from decklists/settings via Plan 2's path (headless setup
   driver), **skip semantic injection**. This organically creates Players,
   Zones, engine singletons, watchers, and every card plus its constructor
   fan-out, all with live uuids minted by the normal counter.
2. **Match** every live object to its record by stable coordinates: Players
   by seat; Zones by `(seat, zoneName)`; singletons and watchers by
   classTag/`StateWatcherName` (one per game); cards by `(seat, zone,
   ordinal)`; card fan-out by Plan 5b's matching table. Every pairing is
   entered into the **translation table** `fileUuid → liveUuid`. Unmatched
   live object or unmatched record with a live-family coordinate: hard fail.
3. **Construct** the records with no live counterpart (effects, gained
   abilities, wrappers, delayed/custom-duration events) via Plan 5 factories
   and recipes (including A's capture recipes), in ascending file-uuid order
   (file uuids preserve original creation order, so dependency order is
   reproduced exactly as Plan 5 A3 argues). Construction runs inside Plan
   5's rehydration-scope machinery in a **pairing mode**: scope close
   matches collected objects to records as in 5b, but instead of rekeying
   scratch→file-uuid, each object keeps (or is assigned) a live uuid and the
   pairing is recorded in the translation table. (Cross-plan note: Plan 5's
   scope-close should factor the match step from the rekey step so the key
   policy is pluggable; the occupancy assert and no-scratch-leak sweep apply
   unchanged.)
4. **Rewrite** every uuid reference in every record through the table before
   applying it: generated deserializers know the ref-typed fields; uuid refs
   inside opaque `stateValue` payloads (watcher entries,
   `GainAbility._abilityUuidByTargetCard`, …) go through Plan 5c's per-field
   ref extractors, extended from extract to **extract-and-rewrite**
   (cross-plan note to Plan 5c). A file uuid absent from the table is a hard
   load failure — never a dangling ref (invariant 4). `gameStateRecord`
   refs are rewritten the same way.
5. Apply records via the generated deserializers, then recipes'
   post-construction linking, then `onRehydrate`, then
   `afterSetState`/`afterSetAllState` — Plan 5 A3's order.
6. Restore RNG state, then `resolveGameState(true)`,
   `clearAllSnapshots()`, and pipeline re-entry at the saved timepoint via
   `postRollbackOperations`, exactly as Plan 2's load sequence — the
   re-entered ActionWindow takes the first snapshot.

- The uuid counter is **not** restored from the file; it simply continues
  from wherever fresh construction left it. Nothing in the loaded game
  depends on uuid *values* — the rewrite pass is what guarantees this, and
  the uuid-renumbering fuzz test in Verification proves it.
- Snapshot-history persistence (undo surviving a load) was considered and
  dropped: Plan 2 already makes undo-history restart a non-goal, and
  persisting history multiplies file size by the retention window for a
  capability nobody has requested.

### D. Versioning & migration

- `formatVersion` bumps with a migration chain (v1 semantic-only files load
  forever).
- **The engine-tier compatibility gate is a schema-surface hash — specified
  as a Plan 3 generator deliverable (Plan 3, Phase A step 1)**; it is
  distinct from Plan 3's generation *cache* hash over build inputs, which
  would make the engine tier same-commit-only. Hash
  inputs, precisely: the sorted list of `(classTag → sorted field names +
  field kinds (primitive/ref/refArray/refMap/value) + sorted recipe-section
  field names)`, plus the encoding-tag vocabulary (`$map`, `$set`, `$num`,
  …) and the engine-tier format version. Emitted as a constant in the
  generated module (the generator has the full field model in hand),
  embedded in the file at save, checked at load. Comment edits and
  refactors that don't change the semantic surface do not invalidate saves.
- **Answer to Plan 5's classTag handoff (`05:` A1), in writing: no aliasing
  layer.** `classTag` is the TS class name; a class rename changes the
  schema hash and invalidates the engine tier of every existing save. That
  is accepted — the semantic tier is the durable format, and the
  degradation is honest because the manifest (B) tells the user exactly
  what the degraded load loses. Consequence to socialize in developer docs:
  renaming a `@registerState` class is a save-breaking change and should be
  release-noted. A manual alias map remains available as a future add-on if
  a specific hot rename ever warrants it; it is a non-goal here.
- Card-data-version mismatch policy: semantic tier may load across card-data
  versions with a warning (positions reference stable names); engine tier
  requires exact match (records encode implementation-specific state).
- **Degradation protocol (invariant 4):** on hash mismatch or a corrupt
  engine tier, the loader offers semantic-tier loading only after
  presenting the `engineOnlyFacts` manifest and receiving explicit
  confirmation; with a non-empty manifest and no confirmation channel
  (e.g. automated tooling), it refuses. The fallback uses Plan 2's loader,
  which is **action-timepoint-specific** (`passedActionPhase` derivation,
  ActionWindow-owned snapshot seeding) — so semantic fallback exists only
  for saves taken at action-window timepoints.
- **v1's action-window-only restriction stays, with one narrow exception —
  decided.** The pipeline is still never serialized, so saves remain
  restricted to snapshot timepoints, and the only additional timepoint in
  scope is **end-of-action-phase**, built only if work item A takes it up
  as its de-risk fallback (it already returns a valid entry point —
  `RollbackRoundEntryPoint.EndOfActionPhase`, `SnapshotManager.ts:402-406`).
  Setup and regroup save points are **explicitly out of scope**: each needs
  its own loader scalar-derivation and injection analysis (Plan 2's
  derivations are justified only for open action windows; both timepoints
  still `throw` in `getEntryPointAfterRollback`, `SnapshotManager.ts:401,408`)
  and there is no demand behind them.

### E. Hidden-information hardening (shrunk under the bug-report decision)

The full record dump contains deck order and both hands. Because saves are
bug-report artifacts destined for the dev team, no consent or sharing UX
flow is needed — the hidden information is exactly what makes a report
reproducible (Plan 2, work item D, records the same decision). What remains:
- document that full saves contain hidden information (deck order, hands)
  wherever the artifact is produced;
- a **scrubbed export** (semantic tier only, hidden zones shuffled/omitted)
  is deferred until player-to-player sharing or spectating ships.

### F. Measurement

Every other plan in this set earned its sizing with numbers; this one too:
- Full-save document size (records + semantic tier) across the round-trip
  corpus positions; if it is problematically large, gzip at rest before
  inventing anything cleverer.
- Writer latency at a save point (the record dump is a full serialize pass;
  it should be comparable to one snapshot).
- CI cost of the round-trip corpus (below), to pick the representative
  subset honestly.

### G. Empty the residue: refactor the three `until`-closure card files

Small, contained — three card files plus a helper form and their specs; can
land any time after A defines the capture shape, independently of B–D.

Rationale for doing it rather than accepting a permanent residue: with a
permanent residue, a card author writing an `until` closure silently breaks
full-fidelity saves for every game containing that card — and has no signal
that they did. Emptying the residue and keeping A's hard-fail as the guard
turns that failure mode into a test-time error.

- Convert the three files —
  `server/game/cards/03_TWI/units/Clone.ts`,
  `server/game/cards/07_TS26/units/FivesIHaveProof.ts`,
  `server/game/cards/02_SHD/events/GiveInToYourAnger.ts` — from
  per-resolution `until` closures (e.g. Clone's
  `until: { onCardLeavesPlay: (event, context) => event.card === context.source }`)
  to a declarative/serializable until-condition form (event name + a
  coordinate-expressible predicate, e.g. "the effect's own source/target
  leaves play"), capturable by A's recipe.
- A's hard-fail on function-valued `until` parameters is the enforcement
  mechanism: future violations surface when the round-trip corpus runs, not
  in production saves. This constrains how card implementers write `until`
  conditions — accepted; note the style rule in developer docs.
- Behavior specs for the three cards must pass unchanged; each file gains a
  round-trip test replacing its former residue-refusal test.

## Verification

- Round-trip: save → load → save produces deeply-equal documents (file
  uuids normalized through the translation table — record *contents* must
  be equal under the fileUuid→fileUuid′ mapping), across a corpus of
  positions generated by running the integration suite with a save/load
  hook at every snapshot point (the undo-all-tests pattern, but through
  serialize→fresh-process→deserialize instead of in-memory rollback). With
  A landed, positions with active lasting effects — most of the corpus —
  round-trip; with G landed, the residue is empty and **every** corpus
  position round-trips. This is the strongest available correctness oracle;
  F's numbers pick the CI subset.
- **uuid-renumbering fuzz:** arbitrarily renumber all file uuids in a saved
  document (consistently, refs included), load both versions, assert
  identical resulting games and identical re-saves — proving nothing
  depends on file-uuid values and the rewrite pass is complete.
- Continuation equivalence: after load, scripted action sequences produce
  identical outcomes and identical subsequent save documents vs the
  original unloaded game — including a scenario where a loaded
  `forThisPhaseCardEffect` expires at the phase end and a loaded gained
  ability is used.
- Cross-tier validation tests (semantic tier vs records vs manifest — the
  manifest must equal the engine-minus-semantic difference).
- Degradation test: corrupted/incompatible engine tier → manifest presented,
  load proceeds only on confirmation, loaded game matches the semantic tier
  exactly; refusal path tested for the no-confirmation-channel case.
- JSON-hardening round-trip test: records containing non-finite numbers
  tag-encode and decode identically; an `undefined`-valued `stateValue` key
  fails the writer loudly.
- Capture hard-fail regression guard: a test-only card with a
  function-valued `until` closure produces a writer hard-fail naming the
  card (the three formerly-residue cards round-trip instead — see G).

## Explicit non-goals

- Live migration of in-flight games across server deploys (this enables it
  in principle; productionizing it is its own project).
- Replay/event-sourcing formats.
- Cross-card-data-version engine-tier loads.
- A classTag alias map (renames invalidate engine tiers by design — see D).
- Snapshot-history persistence across a load (considered and dropped — see C).
- Setup and regroup save points (out of scope — see D; end-of-action-phase
  only, and only as A's fallback).
- Consent/sharing UX for save artifacts (bug-report artifacts go to the dev
  team; see E).

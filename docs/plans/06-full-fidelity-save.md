# Plan 6 — Full-Fidelity Save/Load

**Status:** Proposed (revised after adversarial review; product decisions folded in — builds on Plan 2's bug-report fork, empty residue target)
**Depends on:** Plan 2 (schema + `engineOnlyFacts` manifest + loader + artifact plumbing), Plan 3 (generated serializers + registry; including its schema-surface hash — see D), Plan 5 (recreation from records + closure recipes; work item A takes up the lasting-effect capture Plan 5 scheduled as this plan's prerequisite)
**Shape:** Large — two items are real design work, not convergence: the lasting-effect parameter capture (A) and the load-time identity/translation layer (C, the largest item in the plan). The rest is convergence and hardening, plus one genuinely new capability carried over from Plan 2: the snapshot-buffer read path in B, which unlocks saves from the automated error paths. Re-sized under the accepted decisions: E shrank (bug-report artifacts need no consent/UX flow), and a small new item G (the `until`-closure refactor) was added; net size still Large.

## Goal

Grow the Plan-2 semantic save into a **complete** state capture: a saved match
restores *everything* the snapshot system knows — active duration-bound
ongoing effects, gained abilities, delayed effects, custom-duration events,
ability/effect internals — by embedding the (now JSON-safe) serialized
GameObject records and recreation recipes directly in the save file.

The honest convergence target, stated up front: v1's degradation list is
absorbed check-by-check into the engine tier, and the capture residue —
lasting effects whose captured parameters resist JSON capture (per-resolution
`until` closures *and* non-JSON-safe parameter-bag members like Clone's
`KeywordInstance` values; the same 3 card files today, refactored by work
item G) — is whatever A's capture dev-assert audit enumerates, expected to
converge to **empty** once G lands, with the writer's hard-fail on
non-capturable parameters kept as the guard against regression.
Every fact that lives only in the engine tier is declared in the
**machine-readable `engineOnlyFacts` manifest** in the semantic tier —
inherited from Plan 2, which defines it. The convergence artifact of this
plan is that manifest: "full fidelity" means the manifest covers everything
the engine tier carries, the residue is enumerated (and, after G, expected
empty — conditional on the capture audit, see A and G), and nothing is ever
dropped silently (invariant 4).

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
instance — and is meaningless across a save/load process boundary. Plan 5
put the handoff in writing (05, 5b: capture is "out of scope here and
scheduled as a Plan 6 prerequisite (Plan 6 work item A)"). Taking it up:

**Decision: schedule the parameter-capture recipe as this plan's
prerequisite, with a writer hard-fail on non-capturable parameters — and
drive the residue to empty by refactoring its only known occupants (work
item G).** Justification from the code: mid-phase positions are the whole
point of full fidelity — 239 card implementations (~13%) create these effects,
`forThisPhaseCardEffect` alone ×217 (Plan 5's survey), so they are present at
essentially every interesting save point; and the alternative of restricting
saves to end-of-action-phase is *not* actually lasting-effect-free —
`UntilEndOfRound`, `WhileSourceInPlay`, and `Duration.Custom` effects survive
the phase boundary (forThisRound ×5, whileSourceInPlay ×4, custom ×3, raw
lasting effects in 11 files), and that timepoint needs its own loader
machinery anyway (see D). Capture is the only exit that serves the feature.

- **Capture point — lazy, at write time (decided).** The capture *source*
  is what the lasting-effect systems (`CardLastingEffectSystem` /
  `PlayerLastingEffectSystem` / `DelayedEffectSystem` apply paths) pin at
  registration — but the capture itself runs in the **writer**, reading the
  fields `OngoingEffect` already holds as plain readonly members
  (`matchTarget`, `duration`, the props bag, `effect.context.ability` —
  `OngoingEffect.ts:48-57`): resolved `matchTarget` ref, duration, the
  source ability's coordinate (see Recreation below), and the resolved
  additional-properties bag. Nothing walks the parameter bag on the
  resolution hot path — consistent with the performance section; the
  registration-time capturability check is a dev-assert in test mode only,
  and the hard-fail fires in the writer. The error-path save (B) works
  under the same lazy model: a halted game's objects are still live and
  readable. The captured recipe goes into the effect's record recipe
  section (Plan 5 A4).
- **Recreation:** re-derive the effect factory from the recreated source
  card's ability definition via the captured coordinate — defined over the
  *statically declared registration site*: `abilityIdentifier` plus which
  lasting-effect **invocation** within that ability (dev-asserted
  deterministic). The coordinate cannot point into a live system tree:
  `GameSystem` instances are outside the GameObject graph and outside the
  setup fan-out (Plan 5b's composite protocol reconstructs abilities and
  their limits, not system trees), and dynamically minted trees produce
  fresh instances per `generatePropertiesFromContext` call
  (`GiveInToYourAnger.ts:20` builds its systems inside
  `sequential((context) => [...])`). Re-application therefore feeds a
  **synthetic minimal context** — source, player, and the captured
  target/params — into the per-resolution property factories (Clone's
  props factory needs a resolved `context.target` to run); a factory that
  reads a context field the capture did not preserve is a hard load
  failure (invariant 4). This replays the *application*, never the
  resolution.
- **Residue (hard-fail in the writer, invariant 4):** any captured member
  that is neither JSON-safe nor ref-encodable. Today that is two shapes in
  the same 3 card files (`server/game/cards/03_TWI/units/Clone.ts`,
  `server/game/cards/07_TS26/units/FivesIHaveProof.ts`,
  `server/game/cards/02_SHD/events/GiveInToYourAnger.ts`): per-resolution
  `until` closures, refactored to a declarative form by work item G; and
  parameter-bag members that are live non-GameObject values — Clone's
  `overridePrintedAttributes` bag carries `KeywordInstance` objects
  (`Clone.ts:38-51`; a plain class, `KeywordInstance.ts:7`, and some
  subclasses carry ability-definition closures, e.g.
  `KeywordWithAbilityDefinition` for Bounty), which land in the
  `otherProperties` spread (`CardLastingEffectSystem.ts:111-113`).
  **Decided — capture recipe for these bags: capture the target's card
  *identity* (`internalName`/set id) and re-derive the printed attributes
  from static card data at load.** Not a live-object ref (fails when the
  cloned unit was a token later defeated — tokens cease to exist, Plan 2's
  unresolvable-referent rule) and not value-capture of the
  `KeywordInstance`s (the ability-definition closures). Printed attributes
  are static by definition, so re-derivation is defeated-token-safe: card
  definitions outlive instances, and token card classes exist statically.
  Work item G owns applying this recipe to the three files alongside the
  `until` refactor. The residue set is whatever the capture dev-assert
  audit enumerates — expected to converge to **empty** once the
  identity+re-derive recipe covers the known bags, found by the audit, not
  assumed. A save containing a residue effect is **hard-failed**, naming
  the card. The hard-fail is not vestigial once G lands: it is the
  enforcement mechanism that makes a future non-capturable parameter
  surface at test time (the round-trip corpus) instead of in production
  saves.
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

Same treatment, briefly, for two of the other v1 degradation families —
covered by existing Plan 5 recipes and need only round-trip wiring, not new
design: gained abilities (Plan 5b recipe `(sourceCardRef,
sourceAbilityCoordinate, targetCardRef, gainKind)`; requires Plan 5b's
gained-ability identifier fix) and constant-ability ongoing effects
(re-derived from source-card definitions). **Custom-duration events are
deferred design owned by this work item, not an existing recipe:** Plan 5
explicitly deferred the `CustomDurationEvent` recreation recipe here (05,
5b — the handler and the `until` closures are the same capture problem).
The recipe needs the event's registration/cancellation state, not just the
handler, and `createCustomDurationHandler` is private
(`OngoingEffectEngine.ts:313`) — re-derivation goes through a deliberate
seam, not a reach-in. A custom-duration event whose effect is in the
residue is in the residue.

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
  engine-minus-semantic difference and A's capture hard-fail (expected
  empty after G) is the only writer failure mode.
- **Emit the `engineOnlyFacts` manifest in the semantic tier — extending
  Plan 2's schema, not introducing one.** Plan 2 defines the manifest
  (category, source card ref, target ref, duration, human-readable
  description) and its writer already emits it for *dropped* facts; here the
  same checks and the same entry shape declare facts that are *carried* in
  `engineState` but absent from the semantic tier. An empty manifest means
  the semantic tier alone is lossless.
- **Add a snapshot-buffer read path (the gap Plan 2 deferred here).** Plan 2
  can only save at a live action-window boundary, so its automated error
  paths (`Lobby.handleError`, `handleSerializationFailure`) get no save at
  all — a halted game has no next boundary to arm. The fix is to write from
  the *last action snapshot* rather than the live game: after Plan 3 Phase B
  step 2, `snapshot.states` is a uuid-keyed record map of exactly the
  serialized state this plan's writer already emits (today it is a v8
  buffer — `SnapshotFactory.ts:155-156`,
  `GameStateManager.buildGameStateForSnapshot`; this plan reads the
  post-Plan-3 shape), and card identity does not
  need the buffer at all — `internalName` is a readonly constructor field
  (`Card.ts:113,348`), so the still-live objects supply identity for every
  uuid in the record. Cheap here and expensive in Plan 2 for the same reason:
  this writer is already record-shaped, whereas Plan 2's walks live objects
  and would need a whole second backend. Explicitly **not** rollback-and-
  restore: `rollbackToSnapshot` deletes post-snapshot GameObjects from
  `allGameObjects` and `gameObjectMapping` (`GameStateManager.ts:204-212`)
  and nothing recreates them, so there is no way back.
  **Error-path saves are engine-tier-only — decided.** The live game halted
  mid-action and the snapshot is the last action boundary: different
  positions by construction, so the semantic tier cannot be written from
  the live game, and deriving it from the snapshot records is exactly the
  second backend rejected above. The semantic tier is marked absent (or
  emitted diagnostic-only, non-loadable), cross-tier validation is skipped
  for error-path saves, and the degradation fallback (D) is explicitly
  unavailable for them — refusal only.
  **Plan 4 interaction:** under Plan 4 the "last action snapshot" is a
  reverse delta or a hollow current snapshot, not a materialized record
  map — Plan 4 names this snapshot-read save path (i.e. this work item)
  as the at-risk reader of current-snapshot metadata (04). This read path
  therefore goes through
  Plan 4's window-start materialization rule (serialize live state, overlay
  the pending window's recorded old values, drop pending-created objects),
  costing O(live) + O(pending delta) in the error path — acceptable for a
  path that runs once per crash.
- Keep writing the semantic tier from the same live game (not derived from
  records) so the two tiers cross-validate: a dev-mode check compares
  semantic-tier facts (damage, zones, counts, limits, watcher entries)
  against the records **and** checks the manifest is exactly the
  engine-tier-minus-semantic-tier difference, failing on mismatch. Skipped
  for error-path saves, which have no semantic tier (above).

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
section (cards carry owner seat + `internalName` for matching — see step 2 —
plus Plan 2's `(seat, zone, ordinal)` for the semantic tier; fan-out
objects carry Plan 5b's composite coordinates — `abilityIdentifier`,
`(classTag, ordinal-within-scope)`, etc.).

The load sequence:

1. Fresh `Game` from decklists/settings via Plan 2's path (its headless
   prompt driver), **skip semantic injection**. This organically creates Players,
   Zones, engine singletons, watchers, and every card plus its constructor
   fan-out, all with live uuids minted by the normal counter.
2. **Match** every live object to its record by stable coordinates: Players
   by seat; Zones by `(seat, zoneName)`; singletons and watchers by
   classTag/`StateWatcherName` (one per game); cards by **(owner seat,
   `internalName`, arbitrary-among-interchangeable-copies)** — *not* the
   file's `(seat, zone, ordinal)`: step 1 skipped injection, so live cards
   sit in post-setup positions, and the record's controller seat can differ
   from the constructing seat under control-changing effects (owner is the
   stable key). Arbitrary assignment among same-name copies is sound
   because fresh copies are state-identical before the record overlay is
   applied. Card fan-out matches by Plan 5b's table. Every pairing is
   entered into the **translation table** `fileUuid → liveUuid`. The match
   set is scoped to the same live-reachable closure as B's writer, and
   every family gets an explicit disposition before any failure is
   declared:

   | Disposition | Families |
   | --- | --- |
   | **Matched** (stable coordinate) | Players, Zones, engine singletons, watchers, decklist cards + their constructor fan-out |
   | **Constructed** (file-only records, step 3) | effects, gained abilities, delayed/custom-duration events, **tokens** (mid-game-created — shields, experience, clone troopers — present in the file but absent from fresh setup; Plan 5b composites keyed by token enum), effect-owned wrappers (rebuilt via the owning effect's re-application) |
   | **Discarded** (fresh-only, no record) | setup-derived objects — the `OngoingEffectValueWrapper`s minted by setup's `resolveGameState`, which reflect the *setup* board; replaced by re-applied effects plus `resolveGameState(true)` at step 6 |

   An object or record still unmatched **after these dispositions are
   applied**: hard fail.
3. **Construct** the records with no live counterpart (effects, gained
   abilities, wrappers, tokens, delayed/custom-duration events) via Plan 5
   factories and recipes (including A's capture recipes), in ascending
   file-uuid order (file uuids preserve original creation order, so
   dependency order is reproduced exactly as Plan 5 A3 argues). Construction
   runs inside Plan 5's rehydration-scope machinery in a **pairing mode**:
   scope close matches collected objects to records as in 5b, but instead of
   rekeying scratch→file-uuid, each object keeps (or is assigned) a live
   uuid and the pairing is recorded in the translation table. (Cross-plan
   note: Plan 5's scope-close factors the match step from the rekey step
   precisely so this key policy is pluggable — 05 A2; the occupancy assert
   and no-scratch-leak sweep apply unchanged. And Plan 5 A2 makes scopes legal
   only while `_isRollingBack` — this load runs outside any rollback, so
   the scope mechanism gains a **load-mode gate** alongside
   `_isRollingBack`: a required Plan 5 amendment when C lands.)
4. **Rewrite** every uuid reference in every record through the table before
   applying it: generated deserializers know the ref-typed fields; uuid refs
   inside opaque `stateValue` payloads (watcher entries,
   `GainAbility._abilityUuidByTargetCard`, …) go through Plan 5c's per-field
   ref extractors — shaped **extract-and-rewrite** for exactly this reuse
   (05, 5c). A file uuid absent from the table is a hard
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
  depends on file-uuid *values* — but their **order** is semantically
  meaningful (step 3's construction order is ascending file-uuid order,
  and that order is load-bearing for dependencies), so the rewrite pass
  guarantees value-independence and the uuid-renumbering fuzz test in
  Verification proves it order-preservingly.
- **Restore `Game._lastAttackId` — an undecorated live id generator that
  breaks the tier's exactness promise.** Watcher records apply verbatim
  (only uuid refs are rewritten in step 4), so saved attack ids are
  non-negative; `_lastAttackId` is a plain field restarting at -1 in a
  fresh process (`Game.ts:303,364,669-672`), so post-load attacks re-mint
  ids that collide with saved watcher entries — the same bug Plan 2 fixed
  for the semantic tier with negative-range minting (02, watcher
  translation). Remapping here instead would put the engine tier in
  tension with the round-trip oracle (re-saved documents would differ), so
  restore the generator: decorate `_lastAttackId` into state or carry it
  as an engine-tier scalar. (`lastGameEventId` is safe — it lives in
  `Game.state` and rides `gameStateRecord`.) Work-item bullet: audit for
  other plain-field id generators outside decorated state.
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
  for saves taken at action-window timepoints; end-of-action-phase saves
  (A's fallback timepoint) have **no** degradation path at all, only
  refusal, as do error-path saves (B).
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

Small, contained — three card files plus a helper form and their specs. The
refactor itself can land any time after A defines the capture shape,
independently of B–D; the round-trip acceptance tests below need B's writer
and C's loader, so they land with or after B+C.

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
- Apply A's identity+re-derive recipe (decided in A's residue bullet) to
  the same files' parameter bags: capture the copied/cloned target's card
  identity and re-derive the printed attributes (Clone) / copied abilities
  (Fives) from static card data at load — the capture dev-assert audit
  confirms the bags are fully capturable.
- Engine-side contract, named here because G's output must survive A's
  hard-fail: the engine consumes `until` as functions
  (`Object.keys(effect.until)`, `OngoingEffectEngine.ts:290`;
  `listener(event, context)`, `:316-317`), so the declarative form is
  **compiled to functions carrying their declarative source as recorded
  provenance** — capture reads the source, and A's function-valued
  hard-fail exempts provenance-tagged functions only.
- A's hard-fail on function-valued `until` parameters is the enforcement
  mechanism: future violations surface when the round-trip corpus runs, not
  in production saves. This constrains how card implementers write `until`
  conditions — accepted; note the style rule in developer docs.
- Behavior specs for the three cards must pass unchanged; each file gains a
  round-trip test once B+C exist (if G lands before them, there is no
  residue-refusal interval to replace — the round-trip test is simply the
  first save/load coverage these cards get).

## Verification

- Round-trip: save → load → save produces deeply-equal documents (file
  uuids normalized through the translation table — record *contents* must
  be equal under the fileUuid→fileUuid′ mapping), across a corpus of
  positions generated by running the integration suite with a save/load
  hook at every snapshot point (the undo-all-tests pattern, but through
  serialize→fresh-process→deserialize instead of in-memory rollback). With
  A landed, positions with active lasting effects — most of the corpus —
  round-trip; with G landed, every corpus position round-trips **conditional
  on the capture dev-assert audit confirming the parameter bags are fully
  capturable** — the residue set is whatever the audit enumerates, expected
  to converge to empty once the identity+re-derive recipe covers the known
  bags. This is the strongest available correctness oracle; F's numbers
  pick the CI subset.
- **uuid-renumbering fuzz (order-preserving):** renumber all file uuids in
  a saved document through an arbitrary *monotonic* mapping (consistently,
  refs included — order-preserving because C step 3's ascending-file-uuid
  construction order is load-bearing), load both versions, assert
  identical resulting games and identical re-saves — proving nothing
  depends on file-uuid *values* (their order is the semantic content) and
  the rewrite pass is complete.
- Continuation equivalence: after load, scripted action sequences produce
  identical outcomes and identical subsequent save documents vs the
  original unloaded game (compared under the same fileUuid-mapping
  normalization the round-trip bullet defines — translated files cannot be
  byte-identical) — including a scenario where a loaded
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

---

## Performance capture (required on completion)

```bash
npm run benchmark -- --name final-performance --compare initial-performance
```

Commit both generated files under `docs/plans/performance/`, and update the
capture index. See [Plan 0](00-performance-benchmarks.md) for the method and
[the capture index](performance/README.md) for the rules.

**The roadmap's performance verdict is written at Plan 4, not here.** Plan 4
(delta snapshots) is the last plan whose thesis is performance; this plan and
Plan 5 are save/load-oriented. This capture is the closing bookend: a
no-regression check confirming the save/load work did not give back the wins
recorded in the `initial-performance` → `after-plan-04` comparison. Also
compare against the latest prior capture (`after-plan-05c` or wherever the
roadmap left off) so a regression introduced here is attributable to this plan
rather than smeared across the whole roadmap diff.

**What this plan itself should move: nothing on the hot path.** Full-fidelity
save is out-of-band, like Plan 2 — with one thing to watch: if Plan 5's
recreation recipes or this plan's lasting-effect capture added per-object state
in the *serialized record* (capture recipes live in record recipe sections,
Plan 5 A4), it shows up in `payload/fullSnapshotTotal` and in
bytes-per-GameObject.

If anything got worse, write it into this doc. If a headline benchmark was
redefined somewhere along the roadmap, state explicitly which parts of the
comparison are honest and which are not — a redefined row silently carried
through six plans is worse than a missing one.

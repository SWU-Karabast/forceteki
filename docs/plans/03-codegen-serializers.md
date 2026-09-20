# Plan 3 — Codegen State Serializers

**Status:** Proposed
**Depends on:** Plan 1 recommended (smaller payload to validate against)
**Unblocks:** Plan 4 (delta hooks live in the retained decorator setters and collection wrappers — see "Decorator model after cutover"; the generator additionally emits per-field serializers deltas reuse), Plan 5 (class registry + per-class serializers), Plan 6 (JSON-safe encoders)
**Shape:** Two phases, each its own PR arc. Phase A has one behavioral prerequisite PR, then is riskless to land; Phase B is the cutover.
**Design references:** `experimental/ts-morph-v2` (architecture), `feature/quick-undo-deltas-morph` (generator with static mixin resolution — the 687-line `scripts/generate-state-serializers.ts` on that branch supersedes v2's; **and** the decorator runtime model — see below), and their plan docs (`docs/plans/generated-state-serializers.md`, `docs/plans/generated-state-serializers-mixin-resolution.md` on those branches). **Reimplement on current main; do not rebase the branches** (~296+ commits of drift in exactly the rewritten files).

## Goal

Replace the runtime cost of the decorator system in `GameObjectUtils.ts` with
build-time generated serializer code:

- Delete the per-object `state` bag and the dual-write in every decorated
  setter (`this.state[name] = ...` alongside the native backing field).
- Delete `copyState`'s `Symbol.metadata` prototype-chain walk on restore
  (`GameObjectUtils.ts:728-792`); restore goes through generated
  `deserialize<Class>` functions instead.
- Remove the `v8.serialize` round-trip for per-GameObject state (snapshots
  hold plain serialized records instead of a Buffer).
- Field decorators become **thin runtime overrides** — they keep a setter, but
  the setter no longer writes the state bag. The collection wrappers survive
  in slimmed form. See "Decorator model after cutover" for the decision and
  rationale; this is a deliberate departure from v2's marker-only model.

Additionally — and deliberately, for Plans 5/6:

- Generated output includes a **class-name-keyed registry**
  (`registerStateSerializers`) — the class-identity infrastructure recreation
  needs. See the registry key policy in Phase B step 6.
- Generated serializers emit **JSON-safe encodings** (Maps/Sets → tagged
  arrays) so a serialized state record is a plain JSON document, satisfying
  the standing invariant.

## What the prior branches established (and their gaps to fix)

From `experimental/ts-morph-v2` (working, adopt):
- ts-node generator prepended to `build-dev`/`build-server`/`build-test`,
  emitting `server/game/core/generated/GeneratedStateSerializers.ts` with
  straight-line `serialize<Class>` / `deserialize<Class>` functions and a
  `registerStateSerializers([...])` call.
- Roundtrip spec (`test/server/core/GeneratedStateSerializers.spec.ts`) and a
  perf benchmark harness (`Performance.spec.ts` + `benchmark-snapshots`
  script, gated on `RUN_PERF_BENCHMARKS=1`).

From `feature/quick-undo-deltas-morph` (adopt over v2's version):
- **Static mixin resolution** in the generator
  (`resolveStateNodeFromCallExpression` etc.), resolving
  `WithUnitProperties(WithStandardAbilitySetup(InPlayCard))` chains at build
  time. This matters: v2's runtime prototype-walk composition caused concrete
  exported classes (e.g. `NonLeaderUnitCard`) to generate **empty
  serializers**, a discovered blocker with its own plan doc on that branch.
- **The decorator runtime model.** `-morph` deliberately kept thin setter
  overrides and the collection wrappers as its mutation-observation points
  (its `GameObjectUtils.ts` setters all call
  `this.game.deltaTracker?.recordFieldChange(...)` + eager ref marking); v2
  went marker-only and could afford to only because it had no delta system.
  This plan adopts `-morph`'s model — see the next section.
- Card zone-membership reconciliation on restore
  (`reconcileUpdatedCardZoneMemberships`).
- Clone-on-deserialize (`deserializeStateValue` = `structuredClone` in its
  `StateSerializers.ts`) — load-bearing, see Phase B step 4.

Gaps in both branches that this plan must close:
1. **No parity gate ever ran.** v2 deleted the old system in the same commit
   that introduced the new one; the plan's Phase-2 parity test was never
   written. This plan's Phase A exists precisely to run that gate.
2. **Silent degradation:** `StateSerializers.ts` swallowed `MODULE_NOT_FOUND`
   for the generated module — a missing codegen step degraded to "no
   serializers registered." Must hard-fail instead (standing invariant 4):
   the generated module is imported **non-optionally**, so a missing artifact
   is a `tsc` compile error, and the coverage cross-check (Phase A step 5)
   catches stale artifacts at runtime.
3. `stateRefArray`'s `readonly` argument: `-morph` honors it at *runtime*
   (its retained setter wraps mutable arrays in `UndoArray`, passes readonly
   arrays through); only the *generator's* field model flattens both to
   `refArray` — which is fine for serialization, since both encode as string
   arrays. Under this plan's retained-setter model the runtime distinction
   survives unchanged; nothing to restore. The mutable users are hot paths:
   `DeckZone.ts:22,25` and `GameObject.ts:30` (`@stateRefArray(false)`).
4. `-morph`'s `UndoSafeRecord` still asserted against the deleted `go.state`
   (would throw if `@stateRefRecord` were exercised). Audit every residual
   reference to the state bag during cutover. `stateRefRecord`/`stateRefSet`
   remain unused on current main (verified by grep), which is why it never
   surfaced — the wrappers survive here, so fix the assert during cutover
   regardless.
5. Per-class `ISerialized*` interfaces were planned but never emitted
   (everything was `Record<string, unknown>`). **Now required, not optional:**
   after cutover they are what types the lifecycle hooks' `oldState`
   argument (Phase B step 5), replacing today's `I*State` bag-view
   interfaces (`IAbilityLimitState`, `ITriggeredAbilityState`,
   `ICustomDurationEventState`, `IStateWatcherState`).
6. `@registerState`'s runtime work (wrapper subclass for auto-`initialize()`,
   parent validation) remains in both branches. Out of scope to remove here —
   it is construction-time, not per-snapshot — but note it for Plan 5, which
   must handle the wrapper-class identity in the registry.

## Decorator model after cutover (decision)

Adopt `-morph`'s runtime model, not v2's marker-only model. This is the
load-bearing interface between this plan and Plan 4, so it is pinned here:

- **Decorators keep thin setter overrides.** The state-bag dual-write is
  deleted; what remains in each ref-typed setter is eager ref marking
  (`markStateRef` → `getObjectId()` on stored values) and, when Plan 4 lands,
  a single `this.game.deltaTracker?.recordFieldChange(this, name)` line.
  `-morph`'s `GameObjectUtils.ts` is the template (its `statePrimitive`,
  `stateRef`, `stateRefArray`, `stateRefMap`, etc. setters).
- **The `UndoArray`/`UndoMap`/`UndoSet`/`UndoSafeRecord` wrappers survive**
  for mutable ref collections, stripped of their state-bag synchronization
  writes. They are the *only* place an in-place mutation
  (`deckZone.deck.push(...)`) is ever observed — for eager ref marking now
  and for Plan 4's delta recording later. A marker-only design has no hook
  point for either; you cannot bolt observation onto native fields from an
  external generated module without runtime prototype patching, which is the
  decorator system with worse ergonomics.
- Keep the call-site guard (branches' `assertStateAccessorContext`:
  static/private/symbol validation — does not exist on main, port it). Note
  it validates decorator *usage*, not generator *coverage*; coverage is
  enforced by the cross-check in Phase A step 5.
- What is deleted at cutover: `GameObjectBase.state`, `setState`,
  `getStateUnsafe`, `getState`, `copyState` and its hydration-closure
  metadata, every `this.state[name] = ...` write, and the wrappers'
  bag-mirroring. Native auto-accessor backing fields become the sole storage;
  generated `serialize<Class>`/`deserialize<Class>` read/write them directly.

### hasRef latch contract (must preserve)

On main, every ref-decorated setter eagerly calls `getObjectId()` on stored
values (`GameObjectUtils.ts:417, 438, 479, 523, 565, 606` via
`createIdArray`/`createIdMap`/`createIdSet`/`createIdRecord`/...), which
latches `_hasRef` (`GameObjectBase.ts:154-167`).
`buildGameStateForSnapshot` (`GameStateManager.ts:136-141`) calls
`removeUnusedGameObjects()` **before** serializing, trusting that latch — an
object stored in a ref field but never otherwise `getObjectId()`'d survives
culling only because the setter latched it at write time. The contract:

- **Eager marking stays** in every retained setter and wrapper mutation (as
  `-morph` does via `markStateRef*`). Deleting it dangles serialized refs →
  `getFromUuidUnsafe` → `SevereHaltGame` on rollback.
- **Generated serializers must be side-effect-free:** read `go.uuid`
  directly, never call `getObjectId()` (it mutates `_hasRef` and asserts).
  This keeps main's remove-then-serialize snapshot order valid unchanged.
  (`-morph` flipped to serialize-then-remove because its `serializeStateRef`
  latched via `getObjectId()` during serialization; with side-effect-free
  serializers that order flip — itself a parity-visible change in which uuids
  appear in `states` — is unnecessary. Do not port it.)

## Phase A — StateWatcher prerequisite, then generator + parity gate

Steps 1-6 change no serializer authority; step 0 is a real (small) behavior
change and lands first as its own PR.

0. **Migrate `StateWatcher` off direct state-bag writes.** `StateWatcher.ts`
   is `@registerStateBase(CopyMode.UseBulkCopy)` (line 33) and writes its
   entire payload straight into the bag with no decorated accessor
   (`protected declare state` at line 40; `this.state.entries = []` at 55;
   `this.state.entries = updatedStateValue` at 131). A generator that scans
   decorated fields emits an **empty watcher serializer**, so the parity gate
   would fail on every game. Both prior branches were forced into the same
   refactor (v2's cutover commit `7e6545fd7` is the template): `entries`
   becomes `@stateValue() private accessor entries: TState[] = []`, reads go
   through the accessor, and the constructor bag-write is deleted. Retire
   `CopyMode.UseBulkCopy` and `copyState`'s `bulkCopyMetadata` branch
   (`GameObjectUtils.ts:222-227, 731-733`) — `StateWatcher` is their only
   user. Watcher entries are near-flat `TState[]` structs of `GameObjectId`
   strings and primitives — plus `Set<Trait>` in three watchers
   (`AttacksThisPhaseWatcher.ts:17` `attackerAttributes`, and the shared
   `IStateWatcherLKIEntry` (`StateWatcher.ts:21-27`) stored as
   `lastKnownInformation` by `CardsDefeatedThisPhaseWatcher` and
   `CardsLeftPlayThisPhaseWatcher`; same survey as Plan 2's watcher
   section) — so the **recursive** `stateValue`
   encoder handles them, Sets via the `$set` tag. Note that
   `StateWatcher.addUpdater`'s dev check (lines 90-114) inspects the
   listener *config* object (`when`/`update` — `IStateListenerProperties`,
   `Interfaces.ts:302-305`), not entry payloads; no entry-shape enforcement
   exists today, and this step adds none — the step 2 encoder's hard-fail is
   deliberately the first real enforcement. Audit for other direct bag
   writers; the only other `declare state` is `TokenCards.ts:20,36,45`
   (`declare state: never`, inert), and a grep for `this.state.` also
   matches ~30 writes in `Game.ts` — that is `Game.state: IGameState`
   (`Game` is not a `GameObjectBase`), not the bag. This changes watcher
   restore from bulk-copy to field-copy — same data, but gate it on the
   existing suite + `npm run test-undo` before the rest of Phase A.
1. Port the `-morph` generator to current main: scan `@registerState` /
   `@registerStateBase` classes and decorated `accessor` fields; resolve
   mixin chains statically; emit per-class serialize/deserialize plus the
   registry. **Generated-file policy (decided): gitignored + build-step,
   with hard-fail + CI verification.** Committed generated files drift from
   their sources, bloat every review diff, and produce meaningless merge
   conflicts; both prior-art branches chose gitignored; staleness is covered
   by the coverage cross-check (step 5) and the generation cache (below).
   Concretely: add the path to `.gitignore`; carry over `-morph`'s
   eslint-disable header from `buildGeneratedFile`; generation runs as a
   build step, and the runtime import is **non-optional** so a missing
   artifact is a compile error. The lint-job fix (Phase B step 10) must land
   in the **same PR** as this non-optional import — the lint workflow runs
   no build step and would otherwise break on every PR from that point on.
   **Generation cost is a first-class concern:** the `-morph` generator loads
   the whole tsconfig project (`getSourceFiles('server/**/*.ts')` — thousands
   of card files) via ts-node on every build. Add a generation cache: find
   candidate files with a cheap text scan for the decorator names *before*
   instantiating ts-morph, hash the candidate set + contents, embed the hash
   in the artifact header, and skip regeneration on match. The candidate
   set is the decorator-name files **plus the transitive files the mixin
   resolver visited on the last generation** (embed that file list in the
   artifact header too) — a pure mixin-composition file like
   `AllAbilityTypeRegistrations.ts` mentions no decorator name yet sits in
   the ancestry of every `InPlayCard` (`InPlayCard.ts:31`); the text scan
   alone would serve a stale artifact after a mixin reorder there. The
   step 5 cross-check is the runtime backstop for anything the scan
   misses. Under
   `npm run test-fast` (`scripts/build-test.js:11-31`, `--fast-build`) the
   cached check still runs — never skip it outright, or a stale gitignored
   artifact silently compiles (the test tsconfig includes `../server/**/*`).
   Record cold and warm generator wall-clock as Phase A acceptance numbers.
   The generator also emits a **schema-surface hash** constant in the
   generated module — distinct from the generation *cache* hash (which
   covers build inputs and changes on any edit). Its inputs are exactly the
   semantic surface: the sorted `classTag → sorted field names + field kinds
   (primitive/ref/refArray/refMap/value)` model, recipe-section field names
   (once Plan 5 A4 adds recipe sections), the encoding-tag vocabulary
   (`$map`, `$set`, `$num`, …), and the engine-tier format version. Comment
   edits and refactors that don't change that surface must not change the
   hash. Plan 6 gates engine-tier save compatibility on it (Plan 6, work
   item D).
2. Serialized record format: plain JSON-safe objects. Encode:
   - `GameObjectId` refs: as the branded string (already JSON-safe), read
     via `.uuid` (see latch contract);
   - ref arrays: string arrays (copied, never aliased);
   - `Map`/`Set` state: tagged arrays, e.g. `{ "$map": [[k, v], ...] }` /
     `{ "$set": [v, ...] }`;
   - primitives: as-is;
   - `stateValue` payloads: **recursively** — real payloads include
     `Map<string, string[]>` (`GainNonKeywordAbilitiesFromUnitEffect.ts:18-20`)
     and nested plain objects (`Player.ts:155` `_decklist`). `stateValue`'s
     documented contract is "structuredClone-compatible"
     (`GameObjectUtils.ts:618-640`) — a strictly larger set than JSON (Date,
     RegExp, typed arrays are legal today). The encoder **throws** on any
     value it cannot tag-encode (invariants 1 and 4); do a one-time audit of
     current `stateValue` payloads in this step and add encoders or fix call
     sites as needed. The audit must inspect **stored** values, not declared
     entry types — e.g. `DefeatedCardEntry.wasDefeatedWhileAttacking` is
     typed `IDefeatSource` (which carries a live `Player`) but the updater
     actually stores a boolean (`CardsDefeatedThisPhaseWatcher.ts:29,140`). `NaN`/`Infinity` survive in-memory records but not
     `JSON.stringify` — flag them in the encoder audit for Plan 6. The
     encoding-tag vocabulary reserves `$num` for non-finite numbers
     (`{ "$num": "NaN" | "Infinity" | "-Infinity" }`): a **file-level**
     encoding applied by Plan 6's writer — in-memory records keep raw
     non-finite numbers unchanged, but the tag is part of the vocabulary
     (and the schema-surface hash) from the start.
   Copy semantics must match today's v8-clone (no aliasing of live
   collections into stored records).
3. **Parity harness, serialize leg:** a test-mode hook that, at every
   snapshot point, runs both the existing `getStateUnsafe()`+v8 path and the
   generated serializer, normalizes, and deep-compares per uuid. The harness
   must be **side-effect-free**: read refs via `.uuid`, never
   `getObjectId()`. The normalizer must define `undefined ≡ null` for
   ref-typed fields up front (main's bag stores `newValue?.getObjectId()` —
   `GameObjectUtils.ts:606` — so `undefined` occurs; generated encoders emit
   `?? null`; the existing hydrators already collapse `== null`). Compare
   Maps/Sets in iteration order — it is deterministic and survives the v8
   round-trip; do not sort (sorting needs comparators for object values).
   Run the full suite and `npm run test-undo` under the harness. Any
   mismatch is a Phase-A bug. This is the gate v2 skipped.
4. **Parity harness, restore leg:** the deserializers mutate live state
   through a completely different mechanism than `copyState`'s hydrator walk
   and must not get their first real exercise at cutover. Run the undo suite
   twice behind a flag — once restoring via the old path, once via the
   generated deserializers — and compare resulting field values after each
   rollback (or restore a shadow copy and diff). This is also what
   determines whether `-morph`'s `reconcileUpdatedCardZoneMemberships` is
   needed on main (it exists because of restore-side effects; a
   serialize-only compare cannot answer that).
5. **Coverage/staleness cross-check:** the thin decorators keep recording
   field names into `context.metadata` (they already do on main —
   `GameObjectUtils.ts:221-233` and the per-decorator `metaState` writes).
   At startup in dev, and in a spec that force-loads every module
   containing a registered class (reuse the card-loading path
   `validate-cards` exercises — decorator metadata materializes at module
   load; instantiation adds nothing and needs a live `Game`; card-file
   classes like `FirstLightHeadquartersOfTheCrimsonDawn.ts`'s load only via dynamic card import, so a
   dev-startup check alone never sees them), compare the runtime metadata
   field set **and per-field kind** (the metadata already buckets by
   decorator symbol — `stateSimpleMetadata`/array/map/set/record/object)
   against the generated serializer's model per class; **hard-fail on any
   delta.** Kinds matter, not just names: once the Phase A parity gate
   retires, a kind misclassification on a new field would pass a name-set
   check and mis-encode silently. This is the
   real "generator missed a field" detector — a decorated accessor added
   somewhere the static resolver can't follow (a card class under
   `server/game/cards/**`, a class expression, a new mixin pattern) must
   fail loudly, not be silently dropped from snapshots. Unlike a
   source-content hash, this works in a compiled production build where the
   TS sources are absent; the metadata is runtime data.
6. Land Phase A with the old system still authoritative.

## Phase B — Cutover

1. Slim the decorators per "Decorator model after cutover": delete the
   state-bag dual-write and bag-mirroring, keep thin setters (eager
   `markStateRef*`, future delta hook line) and the slimmed collection
   wrappers. Delete the bag (`GameObjectBase.state`, `setState`,
   `getStateUnsafe`, `getState`), `copyState`, and the hydration-closure
   metadata. Keep the decorator metadata field-name recording (the
   cross-check depends on it). Snapshot order stays remove-then-serialize
   (`GameStateManager.ts:136-141`) — valid because eager marking stays and
   serializers are side-effect-free.

   **Corrected by `P3-PB2` against live code (implementation-time correction):** `getState` named above does not exist on this branch — `getStateUnsafe` was the only reader, and it is what was deleted. Three further deltas, each forced by the bag's removal rather than chosen: `@stateRefArray(false)`'s `init` now *copies* its initializer into the wrapper (previously it built an empty `UndoArray` and wrote the ids to the bag separately, which is only correct while a second storage exists); `@stateRefRecord`'s `set` gained the `null` guard it never had, closing the `P3-PA1` `new Proxy(null, …)` landmine; and `UndoArray.sort`/`fill` keep throwing, but for a new reason — `fill(v)` would store `v` without routing it through `markStateRef`, so a referent reachable only through that array would never latch. `CopyMode`/`RegisterStateOptions.copyMode` were deliberately left in place: removing them changes `registerState`'s public option shape for no behavioral gain.
2. `IGameSnapshot.states` becomes the serialized-record map (JSON-safe
   objects) instead of a `Buffer`. **`Game.state` moves to the same record
   format** — `IGameState` (`SnapshotInterfaces.ts:136-149`) is already
   JSON-safe (`GameObjectId` strings throughout), so this is nearly free and
   keeps the snapshot uniform; do not leave it v8-serialized. (`-morph` went
   further and made `Game.state` a GameObject — that belongs to Plan 4,
   don't pull it into this cutover.) `Game.state` restore deep-clones/
   decodes the stored record exactly like per-object deserialization —
   never assign the retained record by reference. It sits outside the
   per-object deserializers that step 4's no-aliasing rule names, but the
   same hazard applies: the live game mutates it in place
   (`this.state.winnerNames.push`, `Game.ts:850-853`; `allCards.push`,
   `:1609`; `movedCards.push`, `:1634`), and today's freshness guarantee is
   `v8.deserialize` (`GameStateManager.ts:152`).

   **Implemented by `P3-PB2`, with one deviation and one bounded gap.** The deviation: `IGameSnapshot.gameState` is typed `unknown`, not `IGameState`, with a single `decodeStateValue(...) as IGameState` at the restore site. The stored value is an encoded record, and `IGameState` describes the *live* shape; typing the field `IGameState` would have been a convenient lie in a snapshot-format field Plan 6 consumes. There is one production consumer and no caller breaks. The gap: `GENERATED_SCHEMA_SURFACE_HASH` does **not** cover this second serialized surface. `computeSchemaSurfaceHash` hashes the per-class registry model plus the tag vocabulary and `STATE_RECORD_FORMAT_VERSION`; `Game.state` is outside the registry, so a field added to or renamed in `IGameState` changes every snapshot payload with the hash silently green. The window closes when Plan 4 brings `Game.state` under the registry — which must therefore land before Plan 6 relies on that hash as a save-compatibility gate.
3. Restore path: per-object `deserialize<Class>(game, instance, record)`
   assigning fields **through the retained accessor setters** (as `-morph`'s
   generated `instance.field = ...` statements do —
   `buildDeserializeStatement`, its `generate-state-serializers.ts:604-616`),
   never raw backing storage. The setters are what re-wrap mutable
   collections (`UndoArray`/`UndoMap`/`UndoSet`/`UndoSafeRecord`) and
   re-latch `_hasRef` on restore — today's hydrators reconstruct wrappers
   for the same reason (`hydrateUndoMapFromIds`,
   `CreateUndoArrayInternalFromIds`, `GameObjectUtils.ts:120-158, 710-722`).
   Assign raw storage instead and after the first rollback every mutable
   ref collection is a plain array/Map/Set: later pushes never latch, the
   object is culled by `removeUnusedGameObjects()` at the next snapshot,
   and the rollback after that dies in `getFromUuidUnsafe` →
   `SevereHaltGame`. Spec: after a rollback, assert `deckZone.deck` is
   still the wrapper type (or that a post-rollback push latches
   `_hasRef`). Ref resolution goes through the existing registry lookups.
   **Plan 4 handoff:** Plan 4 should assume delta recording is suppressed
   during rollback-driven setter writes. Preserve the lifecycle contract
   exactly:
   `afterSetState` per object → removals + `cleanupOnRemove` →
   `afterSetAllState` (order documented in `GameStateManager.ts:143-223`).
   Include `-morph`'s zone-membership reconciliation if the Phase A restore
   leg shows it is needed on main.

   **Resolved by `P3-PA3`/`P3-PA4`, then implemented by `P3-PB2`:** zone-membership reconciliation is **not** needed and was not ported — measured zero forward/reverse zone violations across 8,186 serial rollbacks, with the masked pre-rollback population exhaustively `{"DeckZone":78}`. Two implementation-time corrections to the lifecycle wording above: `afterSetState` is now **`public`**, not `protected`, because the call moved out of the deleted `GameObjectBase.setState` and into `GameStateManager.rollbackToSnapshot`, which drives the whole per-object sequence in one visible place alongside the already-public `afterSetAllState`/`cleanupOnRemove`. An override must mutate only `this`; see step 5's pre-pass note for why.
4. **Deserializers must never alias values out of the stored record.**
   Snapshots are rolled back to repeatedly (including the nested
   `beforeRollbackSnapshot` recovery, `GameStateManager.ts:190-199`), and the
   current code relies on restore handing every object fresh state (the
   "Rollback swaps the entire state object reference" comment at lines
   163-164 — that guarantee comes from `v8.deserialize` today). Every
   non-primitive value is decoded/cloned to a fresh object on restore, as
   `-morph`'s `deserializeStateValue` (`structuredClone`) does. Spec: roll
   back to the same snapshot twice with mutation in between; assert
   identical results. The mutations must include at least one game-level
   array (`winnerNames`/`movedCards`) so the `Game.state` clone rule in
   step 2 is exercised, not just per-object fields.
5. **`oldState` for the lifecycle hooks is manufactured at rollback time.**
   `afterSetState`/`afterSetAllState`/`cleanupOnRemove` today receive the
   retained live bag (`GameStateManager.ts:165-178, 216`). After the bag is
   deleted, run the generated serializer on each live object immediately
   before overwriting or removing it during rollback (v2's approach). Two
   consequences to make explicit: (a) the argument's shape changes from
   live-bag (Maps, `GameObjectId` Maps) to the JSON-safe serialized record —
   every current consumer reads only primitives off it (`AbilityLimit.ts:38-52`,
   `TriggeredAbility.ts:316-330`, `OngoingEffectEngine.ts:44-58`,
   `Damage.ts:149-152`, `StateWatcher.ts:148-150`), so this is survivable,
   but retype the hook signatures with the generated per-class
   `ISerialized*` interfaces and delete the orphaned `I*State` bag views
   (gap 5); (b) this is a per-rollback serialize pass main currently avoids
   by design — it must appear in the benchmark as "rollback time (including
   the oldState pass)" or the "replace runtime cost" headline is overstated
   for the rollback path.

   **Corrected and extended by `P3-PB2` (implementation-time correction):** "immediately before overwriting or removing it" was implemented as a **complete pre-pass over every live object, inside `rollbackToSnapshot`, with its own `try` outside the main restore `try`**, rather than interleaved with the update loop. The reason is that this read stopped being infallible: `serialize` runs `encodeStateValue`, which can throw on a non-finite number, an `undefined` array element or `Map`/`Set` value, a `GameObjectBase` instance, a circular reference, a foreign prototype, or a reserved `$map`/`$set`/`$num` key — over a population that includes objects created *after* the snapshot, which that snapshot's own capture never serialized. Such a throw is **deterministic**: its cause is the object's own payload and `serialize` precedes any mutation of it, so the interleaved form would leave objects `i+1..n` already deserialized (a torn graph) and the existing recovery leg would re-run the identical encode and fail identically. The pre-pass also runs before `this.#game.state` is replaced, so an abort leaves `Game.state` untouched as well. On failure the rollback aborts with **no recovery attempt and no halt**: log, `reportError(error, GameErrorSeverity.SevereGameMessageOnly)` (non-fatal, reaches Discord, keeps the existing player alert truthful — deliberately *not* `reportSevereRollbackFailure`, which escalates to `SevereHaltGame` and throws), the existing undo-failed alert, then `return false`. Both calls go through `withRegistrationGuardSuspended`, because the severe branch of `Lobby.handleError` calls `captureGameState`, which constructs and registers pristine `GameObject`s while `_rollbackDepth` is still nonzero. Do not add a per-object `try`/`catch`: swallowing an encoder defect behind a successful-looking undo is what this structure exists to forbid.

   **Residual `P3-PB2` accepted rather than closed: snapshot *capture* became fallible the same way, and deliberately has none of this handling.** The analysis above, and `PB2-C13`, cover only the rollback pre-pass. The identical change landed on the capture path: `buildGameStateForSnapshot` now runs `serialize(go)` over every live object and `SnapshotFactory` runs `encodeStateValue('Game.state', …)`, both unguarded, from `ActionWindow`, `Phase`, `RegroupPhase` and `SetupPhase`. The population is exactly the pre-pass's. A payload the encoder refuses therefore throws into the game pipeline on the next action tick, so **the game breaks rather than the undo** — no abort, no alert, no `return false`. That is the intended shape, not an oversight: capture has nowhere to degrade *to*, and "nothing degrades silently" (`docs/plans/README.md`) makes a loud throw the correct failure. Giving capture the rollback's abort shape needs a design decision about what a game does when it cannot snapshot, which is a follow-up unit, not this one. The mitigation that *was* taken is upstream: `isSnapshotSafeOngoingEffectValue`, the gate on the one `@stateValue` field that can hold a computed payload, now delegates to `encodeStateValue` itself, so it can no longer bless a value the encoder will refuse.

   **Follow-up owned by `P3-PB3` (recorded here so it is not rediscovered):** the pre-pass serializes roughly 141 objects and 2,352 encoded fields per rollback to deliver, in practice, one boolean. Exactly six classes override a lifecycle hook; three ignore the argument entirely and the three that read it read only `isRegistered`. The complete pass does buy a real property — atomic abort before any mutation, plus proof that the whole live population is encodable — so this is a genuine trade, not an oversight, and `P3-PB2` deliberately did not touch it. The question `P3-PB3`'s capture must answer is: **how much of the `full/rollbackToSnapshot` and `manager/rollbackTo(Manual)` delta is the pre-pass?** (`full/buildGameStateForSnapshot` is the useful lower bound — the same work minus the cull.) If the answer says narrow it, the decidable narrowing is an O(1) identity test per object: serialize only instances whose hook differs from the base (`go.afterSetState !== GameObjectBase.prototype.afterSetState`, likewise `cleanupOnRemove`/`afterSetAllState`). That trades away the whole-population encodability proof, which is the thing to weigh.

   **Answered by `P3-PB3`'s capture (`after-plan-03` vs. `pre-roadmap-baseline`, five scenarios, single run each — see the caveat below).** There is no rollback regression to narrow away: `full/rollbackToSnapshot` fell 44.0%–58.7% and `manager/rollbackTo(Manual)` fell 48.5%–59.7% across all five scenarios, comfortably clearing the ~18–20% single-run noise floor `docs/plans/performance/README.md` sets (rule 4) and consistent in direction and magnitude across every scenario (rule 4's replication bar). `full/buildGameStateForSnapshot` after the cutover is 0.11–0.22 ms per scenario, against a post-cutover `full/rollbackToSnapshot` of 0.68–0.96 ms — so the pre-pass's cost floor is roughly 15%–30% of the *current, already-much-smaller* rollback time, not 15%–30% of the old one. In absolute terms the pre-pass is real (it duplicates a full `buildGameStateForSnapshot` pass every rollback), but the dual-write and `v8.serialize` removal it rides alongside outweighs it by a wide margin: net rollback got faster, not slower. Recommendation: **do not spend the O(1) identity-test narrowing now.** It would trade away the whole-population encodability proof for a saving of at most ~30% of an already-small number, with no regression to justify the risk. Revisit only if a future capture (ideally a replicate arm, per the README's own caution about single-run timing deltas) shows rollback regressing again.

   **`PB2I1-OPR-01`, fixed in `P3-PB2`.** The pre-pass gave `rollbackToSnapshot` a third outcome. At HEAD the nested recovery call could only return `true` or throw, so the recovery leg discarding its result was safe; a discarded `false` would hand the player the benign undo-failed alert over a graph whose `Game.state` had already been replaced. The recovery leg now checks that result and throws, so the existing catch escalates exactly as it did at HEAD.

   Two smaller corrections to the retyping instruction. The generated `ISerialized<Class>` declarations are emitted as **`type` aliases, not `interface`s** — the hooks' base signature is `SerializedStateRecord` = `Record<string, unknown>`, and an override narrowed to a per-class shape only type-checks if that shape has an implicit index signature, which TypeScript grants to object type literals and not to interfaces (an `interface` emission fails with `TS2416`). Declaration form is not a schema-surface-hash input, so `GENERATED_SCHEMA_SURFACE_HASH` is unchanged. And three hooks are typed with the base `SerializedStateRecord` rather than a generated type, because they ignore their argument entirely: `WithDamage.afterSetState` and `OngoingEffect.afterSetAllState` (mixin-fragment and unused-argument sites the plan already anticipated), plus `StateWatcher.cleanupOnRemove`, whose callers include the save tier's teardown in `PristineAbilityIdentifiers.ts` and would otherwise need an object-literal cast this repo's lint config forbids.
6. **Registry key policy** (the contract handed to Plan 5) — **corrected by
   `P3-PA1` against live code (implementation-time correction, not the
   original plan wording):** the literal rule as first written here
   ("registry keys are the names of concrete `@registerState`-decorated
   classes") is false on current `main`. No card class carries
   `@registerState` at all — `Card`, `PlayableOrDeployableCard`,
   `InPlayCard`, `NonLeaderUnitCard`, `LeaderUnitCard`, and every other card
   base class is `@registerStateBase`, and a card's full prototype chain
   contains zero `@registerState` classes. Under the literal rule, the
   registry would have **no entry for any card**, and lookup **throws for
   every card instance** at the first serialization attempt — a loud,
   total failure, not a silent mis-resolution to a wrong ancestor. The rule
   actually implemented (and verified against all 126 top-level registered
   classes, 28 abstract / 98 non-abstract): a class is a registry key if it
   carries **either** `@registerState` or `@registerStateBase` and is
   declared at module top level (not inside a mixin factory function body).
   Each registry entry additionally records its decorator kind and
   `abstract` modifier, so Plan 5 can recover concreteness (e.g. filter to
   the 98 non-abstract or 85 `@registerState`-only subsets) without
   re-running the resolver or importing the target class. Mixin factories
   mint a new class per call with the
   same name (`AsUnit` at `UnitProperties.ts:116`, `WithDamage` at
   `Damage.ts:30`) and
   different flattened ancestor chains — mixin fragments are an internal
   generator concept, flattened into each concrete class's serializer, and
   are never registered as lookup targets. The generator **hard-fails on
   any duplicate registered key name** — even when the flattened field sets
   are identical (they would silently share a serializer, harmless here but
   ambiguous for Plan 5's name→constructor lookup).
   Lookup walks `constructor.name` up the prototype chain (as `-morph`'s
   `StateSerializers.ts:96-110`) — safe because the auto-init wrapper copies
   the target class's `name`. **The registry must cover the
   card-file-local `@registerState` classes under `server/game/cards/**`** —
   two at the time of writing (`FirstLightHeadquartersOfTheCrimsonDawn.ts`,
   `Advantage.ts`; `Bamboozle.ts` lost its `PlayBamboozleAction` in #2694,
   so re-grep rather than trusting this list) — the same territory Phase A step 5 flags as a
   static-resolver blind spot. The generator's scan must include them (or
   they must be covered by explicit entries); the coverage cross-check
   treats them as required registrations, never acceptable misses. Plan 5's
   A1 factory registry extends these same entries. **Plan 5 handoff
   (resolved — decision recorded in Plan 5 A1):** a module-local class
   cannot be imported for name→constructor recreation. Decided: the two
   non-exported `@registerState` classes
   (`FirstLightSmuggleAction`, `CustomDurationEvent` — note the last is in
   core, `OngoingEffectEngine.ts`, not under `cards/**`) are exported so the
   generated registry can import them, and the generator hard-forbids any
   new module-local registered class of **either** decorator that would
   become a non-abstract registry key, going forward (generation-time
   failure) — extended from `@registerState` alone to both decorators
   because the structural rule above makes a top-level `@registerStateBase`
   class a registry key too. See `05-gameobject-recreation.md` A1.
7. **Value-collection mutation:** with live Maps/Sets/arrays in native
   fields, in-place mutation of a `stateValue`-typed collection is invisible
   to the retained setters (only whole-value reassignment is observed).
   Not load-bearing for full snapshots (serialization reads current
   contents) but load-bearing for Plan 4. Do the `stateMap`/`stateSet`/
   `stateArray` decorator split (a known `-morph` TODO) now, in this phase,
   while touching every call site anyway — those decorators get wrappers on
   the ref-collection pattern, giving Plan 4 its value-collection hook.

   **Landed early — corrected by `P3-PB1` against live code (implementation-time
   correction, not the original plan wording):** this step was resequenced
   before the Phase B cutover and landed against the still-bag-based system
   (Phase A had already landed; the bag itself is untouched). (a) The
   literal `stateMap`/`stateSet`/`stateArray` decorator names land via a
   three-entry additive `scripts/stateSerializerModel.js` table change
   (`DECORATOR_SCAN_NAMES` and `FIELD_DECORATOR_TO_KIND`, both mapping to
   kind `'value'`) — verified byte-identical to the generated artifact
   (both the `--print-model` completeness table and the artifact body
   outside its cache header) by regenerating and diffing before vs. after
   the change, since the generator's `ownFields()` resolves `kind` from the
   decorator identifier only, and every downstream consumer of `kind`
   switches on `kind` alone. (b) Beyond the original plan wording, this
   revision also adds a compile-time constraint at the user's request: a
   field can no longer be declared with a concrete `Map`/`Set`/`Array` type
   under bare, no-argument `@stateValue()` (compile error) — a field whose
   *declared* type is an unresolved class generic (today, exactly
   `MutableOngoingEffectValueWrapper<TValue>._value`) uses the explicit,
   disclosed escape hatch `@stateValue({ allowGenericValue: true })`
   instead, which is a full bypass of the check (TypeScript cannot narrow
   it to "only when `TValue` turns out non-collection" for an unresolved
   generic) and is guarded against a *silent* new use by the
   `forceteki/require-allow-generic-value-justification` lint rule
   (`eslint-rules/`), which requires an adjacent justification comment at
   every use site, and is registered on every `.ts` file under `server/**`
   and `test/**` (not just `server/game/**`), since nothing stops a file
   outside the engine tree from importing these decorators (confirmed
   reachable: `server/gameStatistics/GameStatisticsTracker.ts` already
   imports from `GameObjectUtils` and declares `@registerState()` classes).
   The rule resolves the call site's identifier through scope analysis
   before checking it. As of the third fix round (PB1-N1/PB1-N2), the
   shapes it closes are precisely: a bare local identifier bound by a
   named import; that import aliased; a namespace import accessed via
   `Namespace.stateValue(...)` member access; `const { stateValue } =
   Namespace` destructured off a namespace import (aliased or not); a
   `const`-bound decorator reference (`const dec = stateValue(...); @dec`)
   chaining to any of the above; the argument-shape indirection
   (`const opts = {...}; @stateValue(opts)`) fixed in an earlier round
   (PB1-R1); and all of the above through a relative import path carrying
   a trailing `.js`/`.mjs`/`.cjs`/`.ts` extension (an ordinary style
   already used elsewhere in this codebase, not a contrived shape). Three
   gaps remain, deliberately not closed, each disclosed the same way: (1)
   the rule does not, and without typed linting cannot, verify that a
   given justification comment is *honest* — a field concretely typed as
   `Map`/`Set`/`Array` can still carry this escape hatch and a
   plausible-sounding comment and pass every automated check; a human
   reviewer checking the comment against the field's declared type remains
   the defense for that residual case. (2) An arbitrary wrapper function
   that itself calls and returns `stateValue({ allowGenericValue: true })`
   is not traced into and so is not flagged either — closing it needs
   call-graph analysis approaching the cost of full type-checking; human
   review of new decorator-factory functions that call `stateValue` is the
   defense there. (3) A re-export barrel (`export { stateValue } from
   './GameObjectUtils'` consumed via `import { stateValue } from
   './proxy'`) is not traced through either, since the rule only inspects
   the importing file's own import declaration, not a second module's
   `export ... from` chain; closing it needs cross-file resolution of
   comparable cost to the wrapper-function gap. Do not describe this
   rule's coverage as "general" or as making indirection "unable to bypass
   it silently" — name the shapes actually closed, per the list above.
   (c) Cost disclosure for this step, not measured here
   (the performance capture is `P3-PB3`'s job): each of the 9 retargeted
   fields' `ValueMap`/`ValueSet`/`ValueArray` wrapper allocates fresh on
   every whole-value reassignment, including once per field per rollback
   (`copyState`'s `stateSimpleMetadata` reassignment loop) and once per
   matching event for `StateWatcher.entries` (~15 watchers) — a named
   candidate contributor if a `payload/*`/`sustained/*` capture shows a
   regression touching these fields.
8. Keep the parity harness available behind a flag for one release cycle,
   comparing against committed snapshot fixtures (golden serialized
   records) — B1 deletes the bag and every dual-write, so there is no old
   path left for a live test shim to preserve. Then delete the harness.

   **Status after `P3-PB2` (which fenced this step out and owns none of it):** the golden-fixture comparison is still `P3-PB4`'s work and was not started. But the harness could not simply be left alone either — it imported `copyState`, patched `GameObjectBase.prototype.setState` and read `instance.state` directly, so it would not have compiled, and jasmine's `helpers` glob loads it on every run whether the flag is set or not. It was therefore **repointed, not retired**, onto three invariants that are genuine with only one path in existence: a **round-trip self-check** (each registry entry's `deserialize` is wrapped so the instance is re-serialized and deep-compared to the record it was handed, immediately after the original returns and before `afterSetState` runs — the hooks legitimately mutate state, so a post-rollback comparison would need a divergence allowlist); a **wrapper-identity check** (`refMap`/`refSet` fields must hold an `UndoMap`/`UndoSet` after restore, and a `refArray` field that held an `UndoArray` before the call must hold one after — the before/after form is required because `FieldKind` cannot distinguish `@stateRefArray(true)` from `(false)`); and the existing zone-membership passes. Net, this is a deletion: the retained-record `WeakMap`, the `buildGameStateForSnapshot` patch, the `setState` patch, `compareSnapshotRecords` and the compare/generated restore modes are all gone, and the four `test-parity*` npm scripts collapse to two because `*-generated` no longer names a distinct mode. **Known blind spot, disclosed rather than closed:** a round-trip compare reads values, so `encodeRefArray(plainArray)` emits the identical uuid list — a green parity run is not evidence that restore assigned through the setters or that `_hasRef` latched. That is carried only by the dedicated specs under `test/server/core/snapshot/`.
9. Update `docs/` developer docs: "adding a state field" workflow now
   includes the codegen step; document the hard-fail behavior.
10. **Lint job — lands with Phase A step 1, not at cutover — corrected by
    `P3-PA1` against live config (implementation-time correction):** the
    claim as first written here, that the non-optional import "trips
    `eslint-plugin-import-x`'s resolver" and "would otherwise break on
    every PR", is false against the live `eslint.config.mjs`. Measured:
    `eslint.config.mjs` spreads `eslintPluginImportX.flatConfigs.recommended`
    into an object literal that then declares its own `rules:` key, which
    replaces the spread `rules` wholesale — so `import-x/no-unresolved` is
    not active, and a direct probe (a file importing a nonexistent module
    under `./generated/`) lints clean. `.github/workflows/pullrequest.yml`'s
    `lint` job runs no build, so the generated artifact is normally absent
    there regardless. The real, verified lint hazard is the opposite one:
    once a developer has built locally, the generated artifact **exists**
    and eslint **does** lint it against `@stylistic/all-flat`. Chosen shape:
    add `server/game/core/generated/**` to `eslint.config.mjs`'s top-level
    `ignores` array (the same array used for `build/**`), with a comment
    recording that if `import-x/no-unresolved` is ever enabled repo-wide,
    the importing module (`StateSerializers.ts`) will need its own
    carve-out too. No generation step is added to the lint job. (Listed
    here with the other CI work for reference; the timing constraint is
    Phase A's.)

## Verification

- Phase A step 0 lands green on the full suite + `npm run test-undo` before
  the rest of Phase A.
- Phase A parity gate: full suite + `ENABLE_UNDO_ALL_TESTS=true` with zero
  mismatches on **both** the serialize leg and the restore leg.
- Coverage cross-check spec (metadata vs. generated field sets) green, and
  demonstrated to fail when a field is deliberately hidden from the
  generator.
- Generator wall-clock (cold and warm/cached) recorded as Phase A numbers.
- Phase B: same suites green; roundtrip spec (serialize → deserialize →
  serialize deep-equal); double-rollback aliasing spec (B step 4); benchmark
  harness before/after numbers recorded in the PR (snapshot time, restore/
  rollback time including the oldState pass, heap).
- A "missing codegen" CI check: build without the generation step must fail
  (the non-optional import makes this a `tsc` error).

## Explicit non-goals

- Delta snapshots (Plan 4) — but the hook points Plan 4 needs are exactly
  the retained decorator setters and collection wrappers (see "Decorator
  model after cutover"). Keep the override bodies centralized in
  `GameObjectUtils.ts` so adding `recordFieldChange` is a one-place change,
  and keep the generator's per-field encoders individually addressable so
  Plan 4's delta values reuse them.
- Removing `@registerState`'s constructor wrapper.
- Making `Game.state` a GameObject (Plan 4).
- Recreation/factory work beyond emitting the class-name registry and its
  key policy (Plan 5).

## Risks / open questions for reviewer

- **ts-morph ↔ TypeScript version coupling:** the repo pins
  `typescript ^5.5.4`; ts-morph releases lag new TS syntax. Pin ts-morph
  exactly, and treat any TypeScript upgrade PR as requiring a generator run
  plus a green coverage cross-check before merge.
- **`Symbol.metadata` polyfill / decorator semantics:** the generator must
  see the same field set the runtime decorators record; the Phase A step 5
  cross-check is the enforcement, the call-site guard is only usage
  validation.
- JSON-record snapshots are larger in memory than v8 buffers. If heap regresses
  materially, an acceptable fallback is JSON-safe *structure* with v8 encoding
  *at rest* (serialize the record map to a Buffer after building it) — keeps
  the invariant (records are JSON-able) while restoring compactness. Measure
  first.

---

## Performance capture (required on completion)

Capture **after each phase**, not just at the end — Phase B is the cutover and
is the one that can regress memory:

```bash
npm run benchmark -- --name after-plan-03-phase-a --compare pre-roadmap-baseline
npm run benchmark -- --name after-plan-03 --compare pre-roadmap-baseline
```

Commit both generated files under `docs/plans/performance/`. See
[Plan 0](00-performance-benchmarks.md) for the method and
[the capture index](performance/README.md) for the rules.

**What this plan should move.** Replacing runtime decorator cost with generated
serializers should lower `manager/moveToNextTimepoint(Action)`,
`full/createSnapshotForCurrentTimepoint`, and allocation per operation.

**This is the plan where the capture is a decision input, not a report.** The
risk note above — "JSON-record snapshots are larger in memory than v8 buffers" —
is exactly what `payload/fullSnapshotTotal` and `payload/retainedChain` measure.
If those regress materially at Phase B, that triggers the documented fallback:
JSON-safe structure with v8 encoding at rest. Take the capture *before*
deciding, per "Measure first".

**Benchmark maintenance.** Phase B changes what
`GameStateManager.buildGameStateForSnapshot` returns, so the `full/*` diagnostic
rows change meaning here. That is expected and allowed — they are diagnostic
tier. The `manager/*`, `payload/*` and `sustained/*` rows **must stay
comparable**; if the cutover makes that impossible, resolve it in this plan's doc
before landing, not quietly in the spec.

**Resolved here by `P3-PB2`, as that rule requires.** Two `payload/*` rows read `Buffer.byteLength` off a payload that is no longer a `Buffer`. The row names are kept (comparability is the stated priority) and the same quantity is computed via a measurement-only `v8.serialize(...).byteLength` of the retained record, so `payload/fullSnapshotTotal` and its two components now measure a **serialized-equivalent** size rather than the stored payload's own length. Read them as a like-for-like comparison of *content volume* across the cutover, not as a claim about in-memory footprint. `payload/retainedChain` is untouched — it is a real heap delta — and is therefore the load-bearing row for the JSON-vs-`v8`-at-rest fallback decision described above. `P3-PB3` owns the capture; `P3-PB2` deliberately ran no benchmark.

The provenance travels with the data, not just in this paragraph: both rows and `payload/fullSnapshotTotal` carry an `IPayloadMeasurement.notes.measurement` tag naming the change, which the report renderer already prints. Two systematic artefacts make the new numbers *not* a strict like-for-like content comparison, and a reader of the capture needs both: `v8.serialize` encodes a native `Map`/`Set` compactly where the encoder emits `{$map:[…]}`/`{$set:[…]}` (an object header, a four-character key and a nested array per container), and `v8.serialize` preserves shared substructure where `encodeStateValue` explicitly does not, so every DAG inside a `@stateValue` payload inflates the new figure. `REPORT_SCHEMA_VERSION` is deliberately *not* bumped: a bump makes the renderer refuse the cross-version comparison outright, which costs more than it buys here.

**What `P3-PB3`'s capture must answer.** Beyond the pre-pass question recorded at Phase B step 5, the at-rest footprint changed shape: `IGameSnapshot.gameState`/`.states` are live object graphs (≈141 plain objects × ≈17 properties per snapshot, each with V8 object and property-backing-store overhead, plus a separate array per `refArray` field) where they were one contiguous `Buffer`. Retention is bounded but multiplies by concurrent lobbies: 3 action + 2 phase snapshots per container, plus manual and quick containers. Nothing in the suite can bound the multiplier from code, which is why it needs a capture. Three questions: (1) `payload/retainedChain` bytes **per retained snapshot**, before vs after; (2) whether that ratio crosses the threshold that triggers the documented JSON-vs-`v8`-at-rest fallback; (3) whether `sustained/snapshotAndUndoCycle`'s GC count and pause moved, since every rollback now allocates a full snapshot's worth of short-lived garbage in the pre-pass.

**Answered by `P3-PB3`'s capture (`after-plan-03` vs. `pre-roadmap-baseline`, same machine/Node version, five scenarios, single run each).** All three questions resolve in the favorable direction — **no fallback trigger, no regression to quantify**:

1. **`payload/retainedChain` bytes per retained snapshot (13-snapshot chain), before → after:** compact-board 48,921 → 41,465 (-15.2%); forty-cards-four-mutated 86,437 → 71,392 (-17.4%); forty-cards-per-player 92,692 → 79,924 (-13.8%); forty-cards-sparse-mutations 85,853 → 72,564 (-15.5%); large-board 80,276 → 69,846 (-13.0%). This row is a real heap delta (untouched by the `P3-PB2` measurement-tag change to the other `payload/*` rows), and per rule 5 of `docs/plans/performance/README.md` memory numbers of this size are trustworthy well above the ~5% noise floor. The composition shifted as expected — before, the chain's bytes were almost entirely `externalBytes` (v8-serialized `Buffer`s); after, they are almost entirely `heapUsedBytes` (live JS object graphs), with the `externalBytes` component going slightly negative (GC/measurement noise around a component that is now near zero) — but the **total per-snapshot footprint went down, not up**. The risk note's premise ("JSON-record snapshots are larger in memory than v8 buffers") did not materialize for these scenarios: V8's per-object/per-property overhead on these object graphs is, in aggregate, cheaper than the `v8.serialize` buffer encoding it replaced.
2. **Fallback threshold:** the plan does not state a numeric threshold anywhere it's referenced (`docs/plans/00-performance-benchmarks.md`, `docs/plans/performance/README.md`) — only "if heap regresses **materially**." Retained-chain memory did not regress at all; it improved by 13%–17% in every scenario measured. There is nothing here that would trigger the JSON-vs-`v8`-at-rest fallback, materially or otherwise, so the fallback is not adopted.
3. **`sustained/snapshotAndUndoCycle` GC, before → after, per scenario (count / total pause ms / pause fraction):** compact-board 1→2 / 23.9ms→4.0ms / 4.2%→1.9%; forty-cards-four-mutated 2→3 / 29.3ms→6.9ms / 3.9%→2.0%; forty-cards-per-player 2→4 / 30.7ms→7.0ms / 3.6%→1.9%; forty-cards-sparse-mutations 3→4 / 38.4ms→7.9ms / 4.7%→2.3%; large-board 3→3 / 42.9ms→5.6ms / 5.0%→1.6%. GC count did move, up by 0–2 collections across a 400-iteration run, consistent with the pre-pass allocating a full snapshot's worth of short-lived garbage every rollback as anticipated. But total GC pause time fell by roughly 6×–8× and pause fraction roughly halved-to-thirded in every scenario: the extra collections are of much cheaper, smaller (JS heap object) garbage than the `Buffer`/external-memory garbage they replaced, so more-frequent-but-cheaper collection is a net win, not a cost.

   **Timing caveat (applies to all rollback/timing numbers quoted here and at step 5):** every number above is a **single run** per capture. `docs/plans/performance/README.md` rule 4 sets a ~18–20% single-run noise floor for timing rows and asks for a replicate arm before trusting a timing delta; rule 5 says memory/payload rows are trustworthy at much finer resolution from one run. The retained-chain and GC-pause findings above (rules 1–3) are memory/GC-duration measurements and stand on one run. The rollback *timing* improvements at step 5 (44%–60%) are far outside that noise floor and consistent in direction across all five scenarios, which is the bar rule 4 sets for taking a single-run timing pattern seriously — but, per the roadmap's own standing caution (Plans 1/2's experience, `docs/plans/README.md`), a formal reconfirmation would need a replicate arm, which this unit did not run.

**Net verdict on the "build-time complexity for runtime cost" trade this plan named as its expectation:** the opposite happened, on every headline row this capture measured. Plan 3 traded build-time complexity (the ts-morph generator, its cache, the schema-surface hash) for a *reduction* in runtime cost, not an increase — rollback and snapshot timing improved 5%–65% depending on the row and scenario (the two `manager`/`full` timepoint-advance rows on `forty-cards-per-player` are the only near-flat/slightly-up exception, +6.2% and +10.6%, both inside or barely outside the single-run noise floor and not replicated elsewhere), retained-chain memory improved 13%–17%, and GC pause time fell 6×–8× despite more frequent collections. There is no headline-benchmark regression to quantify or wave through; the numbers above are the full, unfiltered set of headline (`manager/*`, `payload/*`, `sustained/*`) deltas this capture produced, including the two rows that did not improve.

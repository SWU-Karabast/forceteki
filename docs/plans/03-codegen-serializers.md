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
values (`GameObjectUtils.ts:417, 438, 479, 606` via `createIdArray`/
`createIdMap`/...), which latches `_hasRef` (`GameObjectBase.ts:154-166`).
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
   user. Watcher entries are arbitrary `TState[]` plain objects containing
   `GameObjectId` strings (dev-enforced in `StateWatcher.addUpdater`, lines
   90-114), so the generic `stateValue` encoder serializes them. Audit for
   other direct bag writers; the only other `declare state` is
   `TokenCards.ts:20,36,45` (`declare state: never`, inert). This changes
   watcher restore from bulk-copy to field-copy — same data, but gate it on
   the existing suite + `npm run test-undo` before the rest of Phase A.
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
   in the artifact header, and skip regeneration on match. Under
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
     sites as needed. `NaN`/`Infinity` survive in-memory records but not
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
   At startup in dev, and in a spec that instantiates every registered
   class, compare the runtime metadata field set against the generated
   serializer's field set per class; **hard-fail on any delta.** This is the
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
2. `IGameSnapshot.states` becomes the serialized-record map (JSON-safe
   objects) instead of a `Buffer`. **`Game.state` moves to the same record
   format** — `IGameState` (`SnapshotInterfaces.ts:136-149`) is already
   JSON-safe (`GameObjectId` strings throughout), so this is nearly free and
   keeps the snapshot uniform; do not leave it v8-serialized. (`-morph` went
   further and made `Game.state` a GameObject — that belongs to Plan 4,
   don't pull it into this cutover.)
3. Restore path: per-object `deserialize<Class>(game, instance, record)`
   assigning fields directly, with ref resolution through the existing
   registry lookups. Preserve the lifecycle contract exactly:
   `afterSetState` per object → removals + `cleanupOnRemove` →
   `afterSetAllState` (order documented in `GameStateManager.ts:143-223`).
   Include `-morph`'s zone-membership reconciliation if the Phase A restore
   leg shows it is needed on main.
4. **Deserializers must never alias values out of the stored record.**
   Snapshots are rolled back to repeatedly (including the nested
   `beforeRollbackSnapshot` recovery, `GameStateManager.ts:190-199`), and the
   current code relies on restore handing every object fresh state (the
   "Rollback swaps the entire state object reference" comment at lines
   163-164 — that guarantee comes from `v8.deserialize` today). Every
   non-primitive value is decoded/cloned to a fresh object on restore, as
   `-morph`'s `deserializeStateValue` (`structuredClone`) does. Spec: roll
   back to the same snapshot twice with mutation in between; assert
   identical results.
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
6. **Registry key policy** (the contract handed to Plan 5): registry keys
   are the names of concrete `@registerState`-decorated exported classes
   only. Mixin factories mint a new class per call with the same name
   (`AsUnit` at `UnitProperties.ts:116`, `WithDamage` at `Damage.ts:30`) and
   different flattened ancestor chains — mixin fragments are an internal
   generator concept, flattened into each concrete class's serializer, and
   are never registered as lookup targets. The generator **hard-fails on
   duplicate registered key names** whose flattened field sets differ.
   Lookup walks `constructor.name` up the prototype chain (as `-morph`'s
   `StateSerializers.ts:96-110`) — safe because the auto-init wrapper copies
   the target class's `name`. **The registry must cover the three
   card-file-local `@registerState` classes under `server/game/cards/**`**
   (`Bamboozle.ts`, `FirstLightHeadquartersOfTheCrimsonDawn.ts`,
   `Advantage.ts`) — the same territory Phase A step 5 flags as a
   static-resolver blind spot. The generator's scan must include them (or
   they must be covered by explicit entries); the coverage cross-check
   treats them as required registrations, never acceptable misses. Plan 5's
   A1 factory registry extends these same entries.
7. **Value-collection mutation:** with live Maps/Sets/arrays in native
   fields, in-place mutation of a `stateValue`-typed collection is invisible
   to the retained setters (only whole-value reassignment is observed).
   Not load-bearing for full snapshots (serialization reads current
   contents) but load-bearing for Plan 4. Do the `stateMap`/`stateSet`/
   `stateArray` decorator split (a known `-morph` TODO) now, in this phase,
   while touching every call site anyway — those decorators get wrappers on
   the ref-collection pattern, giving Plan 4 its value-collection hook.
8. Keep the parity harness available behind a flag for one release cycle
   (old path preserved in a test shim or snapshot-fixture comparison), then
   delete the old system.
9. Update `docs/` developer docs: "adding a state field" workflow now
   includes the codegen step; document the hard-fail behavior.
10. **Lint job — lands with Phase A step 1, not at cutover:**
    `.github/workflows/pullrequest.yml:24` runs `npx eslint --quiet` with no
    build/generation step, so the non-optional import of a gitignored module
    trips `eslint-plugin-import-x`'s resolver. This fix is **required in the
    same PR as the non-optional import** (Phase A step 1): that workflow
    needs either a generation step in the lint job or a resolver carve-out
    for the generated path. Chosen shape: carve the generated module path
    out of the import resolver / `no-unresolved` rule (one settings entry)
    rather than paying full generation in the lint job; the test job, which
    builds, is the generation gate. (Listed here with the other CI work for
    reference; the timing constraint is Phase A's.)

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

# Plan 4 — Delta Snapshots

**Status:** Proposed (revised after adversarial review)
**Depends on:** Plan 3 (dirty-tracking hooks live in the retained decorator setter overrides and the `Undo*` collection wrappers — see Plan 3's "Decorator model after cutover", the pinned interface between these plans; the generator additionally emits the per-field serializers that delta values reuse)
**Unblocks:** Cheaper per-action snapshots; smaller retained-snapshot memory
**Shape:** One PR arc with an explicit mid-plan decision checkpoint (full deltas vs memoization fallback)
**Design reference:** `feature/quick-undo-deltas-morph` (primary; adopt its design **except where this plan explicitly deviates** — chain contiguity/eviction, bridge id accounting, manual-snapshot materialization, and the harness gate below are deliberate corrections to `-morph`), `feature/quick-undo-deltas` (cautionary — see "prior-art defects"). The 1555-line `docs/plans/delta-snapshots.md` on the `quick-undo-deltas` branch documents a previous failed implementation round ("Restart Requirements" section) — read it before starting.

## Goal

Quick (per-action) snapshots become **reverse deltas** relative to the most
recent full snapshot instead of full serializations. Full snapshots remain at
phase/round boundaries. Per-action cost drops from
O(all live GameObjects) to O(fields actually mutated this action) — with one
caveat: the first touch of a collection field records a serialized copy of the
whole collection (a draw-containing window copies the ~60-entry deck array).
Cheap, but the benchmark must record delta *size* distribution, not just time.

## Mechanism (adopted from `-morph`)

- **Dirty-field tracking, not diffing.** Every retained decorator setter
  override and every `Undo*` wrapper mutation method (`UndoArray`/`UndoMap`/
  `UndoSet` — the hook points pinned in Plan 3's "Decorator model after
  cutover") calls `deltaTracker.recordFieldChange(gameObject, fieldName)`
  **strictly before** the write, capturing the pre-write value through the
  generated per-field serializer. **The record-before-mutate ordering is a
  stated invariant at every hook site** — first-write-wins is only correct
  under it. Object creation is hooked in `GameStateManager.register` (inside
  the `!_disableRegistration` guard, as `-morph` does).
- **First-write-wins is mandatory:** within one tracking window, only the
  *first* mutation of a field records its value (that is the window-start
  value). `if (fieldName in goEntry) return;` — and put that early-return
  *before* the serializer lookup: `-morph` does the lookup plus a
  `Contract.assertNotNullLike` first, paying per-write cost on the hot path
  for already-recorded fields. Don't port that ordering.
- **Delta payload is bufferless:** `{ changedFields: Map<uuid,
  Record<field, serializedOldValue>>, createdObjectUuids: string[], rngState,
  lastGameObjectId }`. No `gameState` buffer, no `states` buffer. This is the
  point of the plan — the plain `quick-undo-deltas` branch still ran a full
  serialization per action to seed its tracker, making deltas additive cost.
  Forward-compat (Plan 5, "Interaction with Plan 4 deltas"): once objects can
  be removed within a chain window, the payload must capture the object's
  **full serialized record at first-removal time** so it remains recreatable
  by a later delta rollback — design the payload shape with that slot in
  mind now, even though nothing populates it before Plan 5.
- **`Game.state` flows through the same path** by promoting it to a real
  `@registerState` GameObject with `alwaysTrackState = true` (`-morph`'s
  `server/game/core/GameState.ts`, 161 lines — port it). This removes the
  per-delta `v8.serialize(Game.state)` and unifies the tracking story.
  (Port note: `-morph`'s file predates Plan 3 B7's `stateArray` split and
  hand-rolls `recordFieldChange` calls in `addWinnerName` /
  `incrementLastGameEventId` / `clearMovedCards` because `_winnerNames` is
  `@stateValue`; after the split those become decorator-hooked fields — do
  not fossilize the manual hooks.)

**As landed in P4-A.**
The tracker is `server/game/core/snapshot/DeltaTracker.ts`, one per `Game` (`game.deltaTracker`), a plain class that is not a `GameObjectBase` and is not snapshotted.
Its API is `isTracking`, `mode`, `pendingWindow`, `setMode`, `startTracking(anchor)`, `checkpoint(nextAnchor)` (returns the closed window), `stopTracking`, `resumeTracking`, `discardWindow`, `recordFieldChange(go, fieldName)` and `recordObjectCreation(uuid)`.
A window is `{ anchor: { snapshotId, rngState, lastGameObjectId }, mode, changedFields, createdObjectUuids }`; snapshots stay full, and since P4-C the snapshot build and the rollback pre-pass consume it (see 'As landed in P4-C').
The only window boundary is `SnapshotFactory.createSnapshotForCurrentTimepoint`: the first call starts tracking and every later call checkpoints, so a window runs from one full snapshot to the next.
`recordFieldChange` returns on `fieldName in entry` before any serializer lookup, and the per-object record is `Object.create(null)`.
The creation hook is in `GameStateManager.register` inside the `!_disableRegistration` guard, and `GameStateManager.isRegistered(go)` lets the tracker ignore objects that are not game state.
Capture mode is fixed per window (user decision D1): `DeltaTrackerMode.CaptureOldValues` is the default and stores the field's window-start value through the `StateEncoding` encoder for its registry kind (never `getObjectId()`), `DeltaTrackerMode.DirtyOnly` stores a marker with no registry or encoder call, and `setMode` applies from the next window.
P4-C needs only the dirty set, so it selects `DirtyOnly`; P4-E selects capture if P4-D picks deltas.
Rollback (`SnapshotManager.rollbackToInternal`) stops the tracker on entry, so the restore's field writes are never recorded.
When a container restored a snapshot, a `finally` starts a fresh window at the restored snapshot.
When nothing was restored (a missing target, a throw, the pre-pass abort) or the restore failed and recovered to the current snapshot, the same `finally` resumes the existing window rather than replacing it with an empty one (user decision D2a), because an empty window would claim that objects changed earlier in the same action are untouched.
`clearAllSnapshots` discards the window and stops the tracker; the next snapshot starts a new one.
Writes to objects registered during the window and to objects built under `createWithoutRefsUnsafe` are not recorded (user decision D2b): the former have no window-start state and the latter are not game state.
The hook surface is every retained decorator setter, both `UndoSafeRecord` proxy traps, and every mutator of `UndoMap`, `UndoSet`, `UndoArray` (including a new `copyWithin`), `ValueMap`, `ValueSet` and `ValueArray`; each calls the tracker before its write (as its first statement, except `UndoArray.splice`, which first rejects unsupported arguments).
`ValueMap` and `ValueSet` now construct empty and populate through `Map.prototype.set`/`Set.prototype.add`, so no overridden mutator runs before `#go` exists.
Writes no hook can see are never recorded: index assignment and `length =` on a `ValueArray` (on an `UndoArray` both are compile errors through `IStateArray`), a write cast past `readonly` into a readonly `@stateRefArray()` array, in-place mutation inside a `@stateValue` payload or inside a value held by a `ValueMap`/`ValueArray`, `Object.defineProperty` on a `@stateRefRecord` proxy (a `defineProperty` trap would also fire inside the `set` trap's `Reflect.set` and record twice), and `Game.state` until P4-B.
The benchmark harness (`test/scenarios/undo/Performance.spec.ts`) runs its two timed raw restores (`full/rollbackToSnapshot` and `sustained/snapshotAndUndoCycle`) with the tracker stopped, through a spec-local helper that restarts it at the restored snapshot, because production rollbacks never pay capture for the restore's writes; its untimed `restoreAnchor` restore is left tracked.
No benchmark scenario, row name or iteration count changed, so the rows stay comparable, but what they include moved.
Every field write now runs the tracker hook, which on a stopped tracker is two property loads, two calls and a boolean test, so the three restore legs (`full/rollbackToSnapshot`, `manager/rollbackTo(Manual)` and the restore inside `sustained/snapshotAndUndoCycle`) gain that cost per restored field.
Populated `@stateMap` and `@stateSet` values now rebuild through a JavaScript loop rather than the native `Map` and `Set` constructors, which also shifts those restore legs.
The write-path rows (`manager/moveToNextTimepoint(Action)`, `full/createSnapshotForCurrentTimepoint`, and the snapshot step inside `sustained/snapshotAndUndoCycle`) gain the O(1) `startTracking` or `checkpoint` call, which allocates one window with its `Map` and `Set` plus one anchor object.
Each rollback-timed row (`manager/rollbackTo(Manual)`, and `full/rollbackToSnapshot` and `sustained/snapshotAndUndoCycle` through the spec-local helper inside their timed restore) gains the stop and restart pair, which allocates the same window, `Map`, `Set` and anchor.
The mutations timed inside `sustained/snapshotAndUndoCycle` gain their hook cost (and, only if a run selects `CaptureOldValues`, capture cost).
These are what production now pays for the same operations, so a change in any of these rows against `pre-roadmap-baseline` has these causes available before a later unit is blamed.
P4-C note: the tracker stays stopped through the post-restore hooks (`afterSetState`, `afterSetAllState`), so a field they wrote would be missing from the fresh window.
Reading their sources, every such write either sets a non-state field (`Damage._activeAttack`, `OngoingEffect.context`) or rewrites the value the restore just wrote (the `isRegistered` re-registration in `AbilityLimit`, `TriggeredAbility` and the effect listener, and the re-resolution of ongoing effects against the restored targets), and `DeltaTracker.spec.ts` asserts on a board whose ongoing effects the rolled-back actions changed that every object serializes equal to the restored snapshot after a manual rollback.
P4-C's parity spec should keep that assertion in view, and treat any object where it fails as dirty.
A registration that happened while the tracker was stopped with a window held would likewise be unrecorded (AC5 says a registration while stopped is not recorded); no rollback path does that today, because the registration guard forbids allocation during the restore and the guard-suspended error-reporting paths only read state or build transient objects under `createWithoutRefsUnsafe`, which never enter the registry.

**As landed in P4-B.**
`Game.state` is the registered class `GameState` (`server/game/core/GameState.ts`), constructed once by the `Game` constructor as `public readonly state` and never replaced, with `alwaysTrackState = true` because nothing holds a ref to it and the snapshot cull would otherwise drop it.
It is storage only: sixteen public decorated accessors named as the old `IGameState` keys, with no guard, no rule and no manual `recordFieldChange` (the `-morph` hooks in `addWinnerName`, `incrementLastGameEventId` and `clearMovedCards` are not ported, because the decorated setters and the `ValueArray` mutators already record).
`initialFirstPlayer`, `initiativePlayer`, `actionPhaseActivePlayer` and the Faux Suns `planCounterClaimedByPlayer` and `blastCounterClaimedByPlayer` are `@stateRef`; `allCards` and `movedCards` (card ids) and `winnerNames` are `@stateArray`; the rest are `@statePrimitive`.
`Game`'s accessors keep their names and their checks, including `assertFauxSuns` on the four claim-counter pairs and `assertNonNegative`; the guard lives on `Game` and never on `GameState`, because the generated deserializer writes every field of every game on each restore and a guarded setter would throw in every non-Faux-Suns rollback.
`Game`'s five ref setters store `value ?? null`, so a cleared ref is `null` in the record rather than `undefined`.
`IGameSnapshot.gameState` and `IGameState` are deleted rather than replaced by a uuid: the record is `snapshot.states[game.state.uuid]`, produced and restored by the generated `serializeGameState` and `deserializeGameState` like every other object, and the `encodeStateValue`/`decodeStateValue` calls on `Game.state` are gone.
The uuid is `GameState_1` (the engine keeps `OngoingEffectEngine_0`), stable across rollbacks because `GameState` registers before the first snapshot, and every object registered after it has a uuid one higher than before this unit; no persisted format carries a uuid.
Restore now happens inside the ordinary update loop: `GameState` sits at index 1, so it deserializes after every later-registered object, and the pre-pass still serializes every live object, `GameState` included, before anything is written, so an encode failure on `game.state` aborts the rollback with `game.state` untouched (since P4-C the outermost pre-pass serializes only the objects the held window shows written or created, and reuses the current snapshot's record for the rest).
Because `Game.state` restores late in that loop, no `afterSetState` override may read a `Game.state` field (the four overrides today, in `AbilityLimit`, `TriggeredAbility`, `Damage` and the effect listener in `OngoingEffectEngine`, do not); `afterSetAllState` and `cleanupOnRemove` run after the loop and may.
`rollbackToSnapshot` refuses a snapshot whose `states` lacks the `GameState` record, with a `Contract` failure before `_rollbackDepth` is raised, because without the check that snapshot would look like one taken before `GameState` existed and the loop would remove it from the game.
Restore still copies and never aliases: the generated deserializer assigns a fresh array through each `@stateArray` setter, and the double-rollback spec (`CutoverRestore.spec.ts` PB2-C6) mutates the arrays between two rollbacks and compares the retained record.
The tracker records `Game.state` writes under `game.state.uuid`, so the "until P4-B" exclusion in the P4-A list above no longer holds.
`GameState` is now a schema-surface hash input, which closes the gap recorded in `03-codegen-serializers.md` (Phase B step 2): renaming `GameState.planCounterClaimedByPlayer` moved the regenerated `GENERATED_SCHEMA_SURFACE_HASH`, and renaming the old `IGameState` field before this unit had not.
The hash is `95ebd3141d807f70e15164d3397eb92f589454c7958927cdc8625dd77a7fe037` and the generator now emits 130 targets.
The payload benchmark rows in `Performance.spec.ts` keep their names with a redefined quantity (the `P3-PB2` precedent): `payload/gameStateBuffer` is the measurement-only `v8.serialize` size of the `GameState` record, `payload/gameObjectStatesBuffer` is that of every other record, `payload/fullSnapshotTotal` is their sum, and `bytesPerGameObject` divides by a live count that now includes `GameState`.
No benchmark was run in this unit.

**As landed in P4-C.**
Per-object serialization memoization is the landed intermediate state; the fork between memoization and deltas is not decided here (P4-D decides it).
Snapshots stay full: every `states` map holds a record for every live object, and no chain, bridge, cadence, hollow snapshot or delta-parity code exists.
`GameStateManager.buildGameStateForSnapshot(previous: IGameSnapshot | null = null)` is the factory's build; the factory passes its current snapshot, which is both the memo and the tracker window's anchor (D1).
Reuse needs `previous`, a tracking tracker, and a held window anchored at `previous.id`; any other pairing (no snapshot, tracker stopped, a window restarted at another snapshot as `restoreUntracked` does) serializes every object, and a zero-argument call is a full serialize.
One public prototype method, `memoizedRecordFor(go, anchorStates, window)`, makes the reuse decision for both the build and the rollback pre-pass (D2): it returns the anchor's record unless the uuid is in `window.changedFields` or `window.createdObjectUuids`.
The `createdObjectUuids` test is load-bearing, not redundant: a raw `rollbackToSnapshot` to an older snapshot while the tracker runs (tests only) rewinds the uuid counter, so a new object can take the uuid of a removed instance the current snapshot still records, and only that test stops the removed instance's record being placed for it.
Each snapshot gets a new `states` map, filled in `allGameObjects` order after the cull, whose values are either the anchor's record object or a fresh `serialize` result (D3).
The cull (`removeUnusedGameObjects`) is still the first statement of the build, so a culled object's record is never reused, and no record is written after it is placed: the production code neither copies nor freezes, and the test-mode verifier freezes every placed record.
`DeltaTracker`'s default mode is now `DirtyOnly` (D4); `setMode(CaptureOldValues)` still applies from the next window and memoization works in both modes because it reads only the window's keys, so the P4-A text above that calls capture the default describes the state before this unit.
The post-rollback reset needs no new code (D5): a successful rollback makes the restored snapshot current and opens a fresh window at it, so the next build's memo is the restored snapshot's records, and a rollback that restores nothing resumes the held window, whose dirty set is a superset of the real changes.
The test-mode verifier (`test/helpers/SnapshotMemoVerifier.ts`, D6) is installed at module load in every jasmine run except under `RUN_PERF_BENCHMARKS`.
It wraps the build and compares every record of every built map with a fresh serialize through `compareRoundTrip` (the successor of the deleted `compareSnapshotRecords`), checks the key count against the live object count, and deep-freezes each placed record.
It wraps `memoizedRecordFor` to compare every record the pre-pass reuses, records failures instead of throwing, fails the spec from a top-level `afterEach`, and writes a boot marker and a counts file per worker under `os.tmpdir()/forceteki-snapshot-memo-verifier-runs/<ppid>`, because the stdout line alone is lost under `--parallel`.
The counts file is rewritten after every spec (`state=running`, with `specs=` the number of specs the worker finished) and written a final time as `state=exit` on the worker's `disconnect` event and on `exit`, because a worker's `exit` handler was observed lost under `--parallel` while the `disconnect` event, which the jasmine primary triggers by disconnecting the cluster before it exits, still ran.
A suite run therefore leaves four boot files and four `state=exit` files whose `specs=` sum to the suite's executed specs: jasmine's total minus its excluded specs (`xit`, `xdescribe`), because a spec that calls `pending()` while running still runs its `afterEach`.
The counts line counts `failures` outside `withExpectedMemoMismatch` and `expectedMismatches` inside it; stale sibling directories older than six hours are pruned at load.
A write that no hook sees (the P4-A list above) is now a correctness hazard, not a missed optimization: it would leave a stale record in every later snapshot that shares it, and only the verifier guards it in tests.
The one live instance was `Game.generateToken` pushing the token id into `player.decklist.tokens` and `.allCards` in place (D7); `Player.addGeneratedTokenToDecklist` now replaces the payload through the `_decklist` setter, no field was added, and `GENERATED_SCHEMA_SURFACE_HASH` is unchanged.
The planning pilot measured the premise on the unmodified tree: about 90% of records at a snapshot build and 99% at a rollback pre-pass were clean (undo suite: 12.3M of 13.7M build records and 1.37M of 1.38M pre-pass records), and the only mismatches were that `Player._decklist` write.
Those ratios are planning observations, not measured results of this unit.
Decision P1 (plan gate, user decision "Approve, undo reuses copies"): the rollback pre-pass reuses the current snapshot's record as `oldState` for objects clean since that snapshot, in the outermost frame only (`_rollbackDepth === 1`, `beforeRollbackSnapshot` given, and the held window anchored at it).
The nested recovery frame serializes every live object, because the outer frame has already deserialized part of the graph untracked, so an object clean since the anchor may no longer equal the anchor's record, and reuse there would hand a restore hook the anchor's `isRegistered` in place of the torn value and leave a triggered ability unregistered.
The pre-pass still checks `initialized` for every object and still proves every live object encodable before any write, because a reused record was produced by the encoder and the object is unchanged since.
`afterSetState`, `afterSetAllState` and `cleanupOnRemove` now receive a retained, shared record as `oldState` and must not write into it; the hook doc comments say so.
An encode failure injected on a clean object is no longer reached, and one on a written object still aborts with nothing written.
Notes for P4-D on the benchmark rows (no row was edited and none was run here):
`manager/moveToNextTimepoint(Action)` clears every snapshot after each iteration, so it never has a memo and keeps measuring a full serialize; it cannot show memoization's per-action saving.
`full/createSnapshotForCurrentTimepoint` reuses every record except the few objects the snapshot step itself writes, because nothing writes between iterations.
`full/buildGameStateForSnapshot` (a zero-argument call) and the two raw-restore rows keep their meaning, and `sustained/snapshotAndUndoCycle` never reuses because its window is restarted at another snapshot after the raw restore.
`payload/retainedChain(13 snapshots)` shares nearly every record across a chain with no game writes, so it drops sharply for a reason a realistic game would not reproduce.
`manager/rollbackTo(Manual)` drops under P1 because the pre-pass no longer serializes clean objects.
P4-D's fixed verdict rule reads the first and fourth of those rows, so as written it cannot observe memoization's write-side benefit and over-reads its retention benefit; the roadmap owner should decide before P4-D runs whether the rule needs a new diagnostic row.
That open question is resolved by two rows added in the test-only unit P4-Cb and by P4-D's rule in `docs/plans/IMPLEMENTATION-ORDER.md`: `full/moveToNextTimepoint(Action, memoized)` and `payload/retainedChainWithWrites(13 snapshots)` build each snapshot after a real write sized by the scenario's mutated set, and both report how many records each build reused by reference and how many it serialized fresh, as notes that are never asserted, so the pre-memo reference capture, where reuse correctly reads zero, does not fail.
The memoized row's reuse counts are numbers on its result in the JSON report and the console line only, because the markdown renderer prints notes for payload rows alone, so P4-D reads that row's counts from the JSON.

### Chain selection, contiguity, and eviction

Delta windows are **global time slices** — there is one tracker per game — but
each action delta lands only in the *acting player's* container, and bridge
deltas (see Cadence) land only in the global index. Rolling player A back two
actions must unwind the opponent's intervening windows. Therefore:

- **Chains are selected from a single global, id-ordered delta index**
  (`-morph`'s `deltaSnapshotsById`; its filter
  `id > target && id <= current`, applied newest-first). Containers hold
  per-player *entry points* only: port `-morph`'s `DeltaSnapshotContainer`
  (mixed ordered list of `{type:'full'} | {type:'delta'}` entries;
  `enforceMaxDeltaCount` caps only the *action delta* entries at
  `MaxDeltaEntries` — `-morph` used 3 — while full entries persist until
  `clearNewerSnapshots` or backing-map eviction; keep that scope, don't
  accidentally cap full entries in the port), replacing `MetaSnapshotArray`'s
  closure-index scheme. A per-container chain would skip the opponent's
  windows and every bridge delta and silently restore corrupt state; the
  global filter is not an accident of either prior branch, it is required.
- **Contiguity is asserted at chain-build time (invariant 4):** before
  applying, every snapshot id in `(target, current]` must be accounted for in
  the index; any hole is a `SevereHaltGame`-class hard failure, never a
  silent partial restore. `-morph` has no such check — a missing intermediate
  delta yields a holed chain that quietly writes wrong state, and a missing
  *target* returns `null` (a silent no-op undo). Port neither behavior.
- **Bridge entries share their boundary's snapshot id and timepoint number**
  (one timepoint, two artifacts: the bridge delta in the index, the full
  snapshot in its container). `-morph` consumed two ids and two timepoint
  numbers per boundary, which (a) leaves index holes at full-snapshot ids,
  breaking the contiguity rule above, and (b) inflates the
  `timepointsSinceSnapshot` counts that `opponentActedSinceLastSnapshot`
  classifies on exactly 0/1/2 (`SnapshotManager.ts:457-474` on main) —
  shifting quick-undo confirmation behavior near phase edges. The shared-id
  rule keeps the confirmation policy byte-identical (an explicit non-goal to
  change); a boundary-adjacent confirmation-policy spec locks it in.
- **Rollback dispatch keys on entry type, never on index membership.** Under
  the shared-id rule a boundary id is *both* a container `{type:'full'}`
  entry and a bridge delta in the global index, so `-morph`'s dispatch
  predicates — `deltaSnapshotsById.has(id)` in `quickRollback`, the
  Action-rollback case, and `takeManualSnapshot` — become wrong here: on a
  quick rollback to a boundary, `DeltaSnapshotContainer.rollbackToSnapshot`
  executes the full restore inside the `{type:'full'}` entry, then the
  `has()` check sees the bridge and re-enters `rollbackToDeltaSnapshotId` on
  top of the freshly restored state (and applies a stale pending delta — see
  protocol step 3). Rule: dispatch is decided solely by the container/manual
  entry type (`{type:'full'}` → full restore, `{type:'delta'}` → delta
  chain); index membership is never a dispatch predicate. Audit every ported
  `deltaSnapshotsById.has(...)` site against this rule.
- **The index is age-evicted — this is where the memory claim lives.**
  `-morph` never evicts by age (`pruneDeltaSnapshotIndex` only removes
  *newer* ids on rollback); that is simultaneously what makes its filter safe
  and an unbounded per-game leak that contradicts this plan's
  "smaller retained-snapshot memory" headline. Eviction rule: the horizon is
  the oldest delta-backed entry id still reachable from any player's
  container (containers evict from the old end via `MaxDeltaEntries`;
  phase-boundary full entries reset chains); index deltas with
  `id <= horizon` are dropped. Because containers and the index both evict
  only from the old end, eviction can never create a hole — the contiguity
  assert is the backstop, not the mechanism. Manual snapshots must never pin
  the index (see "Manual snapshots and the whole-suite gate"); test mode may
  disable eviction (same section).

### Rollback protocol

The restore path has more moving parts than "apply the chain"; all of them are
load-bearing and all are ported from `-morph`'s `rollbackToInternal` /
`rollbackToDeltaSnapshotId` / `rollbackToDeltaChain`:

1. **Stop the tracker at the shared rollback entry point** — the
   `rollbackToInternal`-equivalent that *every* rollback type (quick, action,
   manual, phase) funnels through, exactly where `-morph` puts it — never
   scoped to the delta path alone. Delta restore writes old values back
   *through the hooked decorator setters*; without suspension the restore
   pollutes the live window, and first-write-wins makes the pollution sticky
   (the pre-restore value gets locked in as "window start"). And after
   Plan 3, *full*-snapshot restore writes through the same hooked setters, so
   a tracker left live during a manual/phase full rollback mid-action-phase
   poisons the next delta checkpoint the same way. This single shared
   stop/restart is what discharges Plan 3's handoff ("assume delta recording
   is suppressed during rollback-driven setter writes") for the full-restore
   path as well as the delta path.
2. **Build the chain** from the global index, contiguity-checked as above.
3. **Prepend the pending-window delta.** The current action's mutations live
   in the un-checkpointed live tracker, not in any stored delta
   (`createPendingRollbackDelta`). For the single most common undo — revert
   the current action, `QuickRollbackPoint.Current`, target id == current
   id — the stored chain is *empty* and the entire rollback is the pending
   delta. The prepend must be guarded by an *actually live* tracked window,
   and the window data must be **invalidated** — not merely
   `_tracking = false`, which is all `-morph`'s `stopTracking` does while
   `hasTrackedWindow()` stays true — once any rollback path other than the
   delta chain has consumed or bypassed it; otherwise a stale pending delta
   of pre-rollback window-start values gets applied over a completed full
   restore.
4. **Materialize a recovery snapshot from live state** (`-morph`'s
   `createRecoverySnapshot` — a full O(all objects) serialize) and pass it as
   `beforeRollbackSnapshot`, preserving main's nested-recovery contract
   (`SnapshotContainerBase.ts:72`, `GameStateManager.ts:190-199`). Under
   deltas the current snapshot is hollow, so the recovery state *must* come
   from a live serialize; this is a real per-rollback cost (see
   Verification). Recovery snapshots are transient, never stored or addressed
   by id — they are the one place "live state under the current id" is
   deliberate.
5. **Apply the chain newest-first:** per delta, restore RNG +
   `lastGameObjectId`, write each recorded old value back through the
   generated field deserializer, and collect `createdObjectUuids` removals
   (tolerating already-culled uuids via mapping-lookup-then-skip — an object
   created and culled within one window is in no mapping and that is fine).
   That tolerance — and delta/full culling parity generally — rests on a
   retained invariant: `removeUnusedGameObjects` runs at **every** checkpoint
   (first thing in `-morph`'s `checkpointDelta`), before the tracker
   checkpoint, so no-ref objects never survive to a snapshot boundary;
   optimizing the cull out of delta checkpoints would silently diverge delta
   and full restores.
6. **Lifecycle ordering — pinned, and deliberately different from the
   full-snapshot path:** field writes for all deltas → `cleanupOnRemove` for
   created objects → registry removal → `-morph`'s
   `reconcileUpdatedCardZoneMemberships` → `notifyAfterSetState` per updated
   object → `afterSetAllState` on **every live object**, manufacturing
   `oldState` for untouched objects by serializing their current state. The
   all-objects pass is required, not gold-plating: on main's full path every
   surviving object appears in `snapshot.states`, so the "updates" list — and
   hence `afterSetAllState` (`GameStateManager.ts:143-223`) — effectively
   covers all live objects (`OngoingEffect.refreshContext` and friends depend
   on it); the delta path's sparse update set must preserve that contract
   explicitly. It is also an O(all objects) serialize pass per rollback —
   benchmark it (see Verification).
7. **On success:** replace the current snapshot with a hollow entry
   (`states: {}`) that lazily rematerializes on demand — the materialization
   correctness rule is in the manual-snapshots section. Its
   `rngState`/`lastGameObjectId` must clone the **post-restore live** values
   (by construction equal to the target state's) or be explicitly nulled —
   do not port `updateCurrentSnapshotFromDelta`'s stamping of the target
   delta's values, which are the window-*start* (the state one window
   earlier) and would hand off-by-one metadata to any reader of
   current-snapshot metadata (the snapshot-read save path Plan 6 B adds is
   the obvious one; Plan 2's writer walks the live game and never reads
   snapshot metadata). Prune
   newer snapshots and newer index entries.
8. **Restart the tracker at the shared exit**, anchored to the new current
   snapshot, on *both* success and failure paths (failure additionally
   restores from the recovery snapshot and alerts the player). Like step 1's
   stop, the restart lives in the `rollbackToInternal`-equivalent and covers
   every rollback type — full or delta, success or failure — one code path,
   not two kept in sync by hand. Re-anchoring is not optional after a full
   rollback either: the old window anchor describes a discarded timeline.

**Rollback performs zero *organic* registrations — enforced, not assumed.**
`recordObjectCreation` is guarded by `isTracking`, and tracking is stopped
during rollback, so a GameObject registered mid-rollback (lifecycle hooks run
arbitrary code) is invisible to every delta and — because delta culling is
presence-based (`createdObjectUuids`) where full-snapshot culling is
absence-based — can never be removed by any later delta rollback: it leaks,
and any refs it latches (`hasRef` is monotonic, `GameObjectBase.ts:154-166`)
pin it into every subsequent full snapshot. Resolution: the delta rollback
path sets `_isRollingBack` (as `-morph`'s `rollbackToDeltaChain` does) and
registration **outside an active rehydration scope** hard-fails while it is
set — this is exactly the dormant guard main's `GameStateManager.ts:35-36`
comment anticipates and **Plan 1 item B activates** (after item A removes the
last rollback-time allocation), with the scope carve-out defined by Plan 5's
A2 rehydration scopes (the delta-rollback path opens no scopes until Plan 5's
delta integration lands, so until then the guard is total in practice). If
Plan 1 item B has not landed first, activating that guard becomes a
prerequisite of this plan; either way, a spec asserts that organic
registration during a delta rollback fails loudly, with a companion case
(once Plan 5 lands): registration inside an active rehydration scope
succeeds and rekeys.

## Cadence

- `shouldUseDelta(timepoint)`: deltas only for `SnapshotTimepoint.Action`
  during the action phase. Everything else (start/end of phase, setup,
  regroup, manual snapshots) stays a full snapshot.
- Every full snapshot starts a fresh tracking window; a "bridge" delta lets a
  chain terminate at the preceding full snapshot across the boundary. Bridges
  live only in the global index and share the boundary full snapshot's id and
  timepoint number (see "Chain selection"). **Universal pairing rule:** every
  full snapshot taken after tracking begins records a bridge sharing its id,
  *including zero-mutation bridges* for consecutive boundary timepoints
  (EndOfPhase → StartOfPhase → RegroupResource each consume an id with
  possibly no mutations between them) — the contiguity assert depends on it.
  The only bridge-less full snapshots are the first of a game or of a loaded
  session (`-morph` skips the bridge whenever the tracker is not live, which
  is correct in exactly those two cases); the contiguity assert correctly
  rejects any chain that would cross them.
- Manual snapshots: always full — see the next section for the policy, the
  anchor rule, and what it does to the test gate.
- Load (Plan 2 integration): a loaded game re-enters at an action-window safe
  point with empty snapshot history; the delta tracker must not start until
  the first full snapshot at re-entry establishes the window anchor (the
  tracker's `startTracking` asserts a snapshot anchor exists — keep that).

## Manual snapshots and the whole-suite gate

**Policy: manual snapshots are always full.** A delta-backed bookmark either
pins its entire chain in the global index for as long as it lives — defeating
the eviction policy the memory claim depends on — or silently dies when a
chain link evicts. Bookmarks are product-facing and must outlive any delta
window. (Bounding their *count* is not scheduled: Plan 1 item D records it as
a prerequisite for whatever feature first exposes bookmarks to clients, since
manual snapshots have no client route today.) `-morph` chose
delta-backed manuals (`manualDeltaSnapshots`) and got away with it only
because it never evicted the index.

**Anchor rule (the part `-morph` got wrong):** "always full" must not mean
"serialize live state under the window-start id". Under lazy materialization
the current snapshot is hollow, and `-morph`'s `getCurrentActionSnapshot`
materializes *live* state labeled with the *window-start* id — so a manual
snapshot taken mid-window (it is a player-triggered API, `Game.ts:1794`, not
tied to the take-immediately-after-timepoint discipline) stores mid-action
state under an action-start id, and rollback lands somewhere that is neither.
The rule: **materializing the hollow current snapshot must produce the true
window-start state** — serialize live state, then overlay the pending
window's recorded old values per (uuid, field), drop objects in the pending
`createdObjectUuids`, and use the window-start `rngState`/`lastGameObjectId`
from the tracker. Cost is O(live) + O(pending delta), no new id or timepoint
is consumed, and manual-snapshot semantics stay exactly main's (bookmark =
state at action start). The ported `-morph` regression spec does not catch
the drift because it bookmarks immediately after a rollback, when live ≡
window-start; add a mid-window manual-snapshot spec (bookmark while a prompt
is open mid-action, roll back, assert action-start state).

**The harness moves, not the policy.** The whole-suite undo harness replays
every spec via a *manual* snapshot rollback (`undoIt`:
`game.takeManualSnapshot(activePlayer)` at `test/helpers/IntegrationHelper.js:50`,
rollback with `SnapshotType.Manual` in `assertManualRollbackSucceeded`, which `undoIt` calls). With always-full manuals
and no harness change, every replayed spec would exercise only the
full-snapshot path and the delta restore machinery — the entire novel surface
of this plan — would be gated by half a dozen dedicated specs. Unacceptable.
Under `ENABLE_UNDO_ALL_TESTS`:

- index age-eviction is disabled (test mode only), so the chain back to the
  start-of-test snapshot always exists;
- `takeManualSnapshot` additionally records the id as a delta anchor;
- `undoIt` rolls back through the **delta chain** (hard-failing if the chain
  is not intact — never falling back silently), then deep-compares the
  resulting live serialization against the stored full manual snapshot: a
  per-spec **delta-vs-full parity check** (invariant 4). Under delta-parity
  mode the only legal skip is the existing null-`snapshotId`
  (non-action-phase) case; any other rollback failure fails the spec —
  unit P4-1 already removed the silent skip `undoIt` used to apply to every
  failed rollback, so any other rollback failure already fails the spec.

Resulting gate coverage: every spec whose start-of-test snapshot is taken
during the action phase — the large majority of the integration suite (the
harness already skips the rest) — traverses `rollbackToDeltaChain` *and*
proves its result byte-equivalent to the full snapshot. The full-restore path
remains covered by the phase/setup specs and the dedicated specs.

## Prior-art defects this plan must not repeat

1. **Lost first-write-wins** — `quick-undo-deltas`' `recordFieldChange`
   unconditionally overwrote the recorded value, so a field mutated N times
   in one window restored to the value before the *last* write. Covered by
   dedicated unit tests in this plan: mutate a scalar field 3× in one window,
   roll back, assert window-start value — **and the same 3×-mutation test for
   in-place collection mutation through each wrapper type**
   (`UndoArray.push/splice`, `UndoMap.set/delete/clear`, `UndoSet`), which is
   the equally dangerous path (each records a serialized snapshot of the
   whole collection on first touch).
2. **Full serialization retained per delta** — tracker must not be seeded
   with `buildGameStateForSnapshot()`; the generated-serializer capture at
   mutation time replaces it.
3. **`Buffer.alloc(0)` sentinels** and rematerialization branches — the
   bufferless payload removes the need.
4. **Zero test coverage** — `quick-undo-deltas` shipped 2,325 changed lines
   with no test changes and a plan-doc-only validation claim. Every
   correctness property here gets an in-repo spec.

## Open issues inherited from `-morph` (must be resolved, not carried)

- **Phase-boundary prompts, resolved on main.** Main's
  `SnapshotManager.ts` `getQuickRollbackPoint` `TODO THIS PR` has been
  resolved for Sneak Attack's and Thrawn's own boundary triggers by roadmap
  unit `P4-0` (the TODO comment is gone; `SnapshotManager.ts:328` no longer
  names it). The narrower defect — landing on the wrong quick-rollback
  target when two or more boundary triggers are pending and the requesting
  player has already decided part of the window — was resolved by roadmap
  unit `P4-0b`; see "Known limitations (deferred)" below for the rule and the
  mechanism. Independently of
  either: **the quick-rollback policy (`getQuickRollbackPoint`) must still
  handle a delta chain whose window ends at a boundary prompt** — this is
  Plan 4's own obligation, not discharged by `P4-0`/`P4-0b`, and belongs to
  whichever of `P4-E`/`P4-F` builds the delta chain. (The other boundary
  defect — double-consumed ids/timepoint numbers perturbing the confirmation
  policy — is resolved by the shared-id rule in "Chain selection".)
- **In-place mutation of `stateValue` Maps/Sets** is invisible to setter
  hooks. Plan 3 Phase B step 7 commits to the `stateMap`/`stateSet`/
  `stateArray` decorator split in-phase — verify it is present; it is a hard
  prerequisite for value-collection delta tracking here, not an option.
- **Silent-failure returns in `rollbackToDeltaSnapshotId`** (missing target →
  `null` → no-op undo) — replaced by the contiguity hard-fail.
- Any residual `go.state` references (the `-morph` `UndoSafeRecord` assert
  bug) — should already be gone after Plan 3 Phase B.

## Known limitations (deferred)

No limitation is open.
The one this section carried was resolved by roadmap unit `P4-0b`: quick-undo no longer overshoots at a Regroup/Setup phase boundary once the requesting player has already decided part of that boundary's own trigger window.
The record below keeps the rule, the root cause, the lesson about array positions, the mechanism that shipped and the mechanisms that were rejected on the way.

**Rule.**
At a Regroup/Setup `StartOfPhase` window, a requesting player who has completed a decision in that window (chosen a resolution order, answered one of several simultaneous triggers, declined an optional trigger) lands on the boundary checkpoint, the start of the current phase transition.
A player who has decided nothing in the window keeps `Previous`, because landing on the boundary checkpoint would be a state-identical no-op; this is pinned by `test/scenarios/undo/PhaseStartAndEnd.spec.ts`'s `should revert back to the last action of the action phase on undo` test.
The opponent of a deciding player keeps `Previous` as well, and a second undo after the replayed window also keeps `Previous`, because the replay clears the record.

**Exact moment.**
Two or more players' (or one player's own multiple) `StartOfPhase`-triggered abilities are pending in the same Regroup/Setup window (e.g. two copies of Sneak Attack, one per player).
The requesting player has already completed part of that window's own resolution before requesting a quick-undo.
Before the fix, `getQuickRollbackPoint` returned `Previous` there, overshooting into the previous action phase.

**Root cause.**
Every quick-undo checkpoint except Regroup/Setup's own `StartOfPhase` is recorded lazily, only after its trigger window closes, gated on `Game.hasBeenPrompted` (`Phase.ts`'s `takeActionSnapshotsForPromptedPlayers`, `ActionPhase.setupActionPhase`'s `addQuickStartOfActionSnapshot`).
Regroup/Setup's own `StartOfPhase` is the one exception: `addQuickStartOfPhaseSnapshots` records it eagerly and unconditionally, for every player, before that phase's `OnPhaseStarted` trigger window even opens.
That eager checkpoint is the only thing quick-undo can land on while the window is still open, and during the open window it is already the requester's latest entry, so `Previous` (`entries[length-2]`) steps over it.
Making it lazy like every other checkpoint does not fix this: during the still-open window there would then be no checkpoint at all for either `Current` or `Previous` to target, and several already-passing tests' `Previous` answer resolves through the eager entry (`PhaseStartAndEnd.spec.ts`).

**How `getQuickRollbackPoint`'s existing cases resolve the two already-correct cases**, confirmed by instrumenting the function to log the branch taken and the value returned and running the two named existing specs, not by static reading:
- *Thrawn* (`PhaseStartAndEnd.spec.ts`'s "during the prompt, should roll back to the regroup phase snapshot on undo", mid-prompt): the `[RegroupReadyCards, StartOfPhase, EndOfPhase]` staleness case (the `.includes(this.currentSnapshottedTimepointType)` check in `getQuickRollbackPoint`) fires and returns `Current`. `Current` resolves to `entries[length-1]` in the player's `MetaSnapshotArray`, which, because Action's own `StartOfPhase` never receives the eager per-phase push Regroup/Setup's does, still points to the preceding Regroup phase's own eager `StartOfPhase` entry. That is what produces the observed `regroup`-phase destination, not the mid-action case (the `if` block gated on `SnapshotTimepoint.Action`, which cannot fire at a `StartOfPhase` boundary).
- *Single-trigger Sneak Attack* (`PhaseStartAndEnd.spec.ts`, after Ruthless Raider's own on-defeat prompt has already been answered, at the Regroup phase's resourcing prompt): `RegroupResource` is not one of the three timepoints the staleness case checks, so control falls through to the final `return QuickRollbackPoint.Previous`. `Previous` resolves to `entries[length-2]`, which, because answering Ruthless Raider's prompt caused `takeActionSnapshotsForPromptedPlayers` to push a new entry for the resourcing timepoint, sits one position back from that new entry, at the same eager `StartOfPhase` entry Thrawn's case also resolves through. Same target, reached by the opposite branch and the opposite enum value, for an unrelated reason (a different-length array, not a different destination rule).

The load-bearing point for anyone extending this function: `Current`/`Previous` are **positions in a per-player array**, not labels for "the boundary" or "the previous action".
Which physical snapshot each position resolves to depends on how many entries have been pushed by the time the function runs, not on which branch or enum name was used to get there.

**Mechanism: declared-decision prompts, recorded at the player-input boundary, enumerated by a CI spec.**
1. `UiPrompt.isPlayerDecisionPrompt(): boolean`, default `false`; every concrete prompt class states its own answer.
2. `Game` records the player in `playerHasDecided` when an input was handled, the prompt that was awaiting it was incomplete before the input and is complete after it, and it declares itself a decision; `resetPromptedPlayersTracking()` clears it, so a rollback-and-replay of the window (which re-runs `Phase.startPhase`) starts clean.
3. `getQuickRollbackPoint` returns `Current` at a Regroup/Setup `StartOfPhase` timepoint when the player's latest quick entry is the current snapshot and `Game.hasMadeDecision(player)`.
4. `test/server/core/gameSteps/PromptDecisionDeclaration.spec.ts` fails when any concrete `UiPrompt` subclass inherits instead of stating its answer, discovering classes from runtime exports and from the source `extends` graph.
5. A requester who was shown hidden information in the open window still needs the opponent's approval to land on the boundary target in Request mode: `SnapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot`, the single funnel every reveal source already calls (`ViewCardSystem`, `DrawSystem`, search, discard, random selection), also calls `Game.recordHiddenInformationShown(playerId)` into a window-scoped map cleared by `resetPromptedPlayersTracking()`; `getQuickRollbackInformation` returns `requiresConfirmation: true` when the rollback point is `Current`, the open-boundary condition of item 3 holds, and `Game.hasBeenShownHiddenInformation(player)`. It is added in `getQuickRollbackInformation`, outside `opponentActedSinceLastSnapshot`, which keeps its 0/1/2 classification.

The hook sits at the input boundary rather than in `UiPrompt.complete()` because `SelectCardPrompt.continue()` calls `complete()` with no player input when `hideIfNoLegalTargets` applies, so a `complete()` hook records a decision nobody made.
`AllPlayerPrompt.isComplete()` is true only when every player is done, so an input-boundary hook means a first finisher is not recorded; no all-player prompt can open in a Regroup/Setup `StartOfPhase` window (resource and mulligan prompts have their own timepoints).

**Failure direction.**
A prompt class that is new, undeclared or declared wrongly as non-decision leaves the requester on `Previous`, exactly the behavior before the fix: an overshoot the player can replay by passing again.
The opposite error (a non-decision prompt counted) lands on a state-identical checkpoint: the undo does nothing visible, spends the game's one free undo or asks the opponent for a pointless approval, and breaks a rewind that worked before.
The design therefore defaults to `false`, and the CI spec turns an undeclared class from a silent default into a failing test.
For the approval rule the failure direction is also the cautious one: any source that calls the funnel makes the boundary undo ask for approval, and a source that does not call it keeps the earlier behavior of that source.

**Rejected mechanisms — read before changing this:**
1. *Fire on "a boundary prompt is open"* (no player-decision gating). Rejected: this makes the first undo a state-identical no-op at the moment nothing has been decided yet.
2. *A per-player, per-checkpoint "consumed" marker* that survives rollback (added to `MetaSnapshotArray`, pruned via its existing `clearNewerSnapshots` hook). Rejected: it adds new tracked state to the exact container this doc's "Chain selection" section replaces with `DeltaSnapshotContainer`, a carry-over cost and a larger diff than the defect requires.
3. *A per-player "completed a decision-bearing prompt in this window" flag hooked into the shared `UiPrompt.complete()` choke point with a per-class opt-out list.* Rejected twice on the same failure shape: the choke point is shared by prompt types that complete without the player deciding anything about game state, and each round's enumeration of those types missed one. `UndoConfirmationPrompt` (Allow/Deny) was missed first, since clicking **Deny** set the flag for the denying player with no compensating rollback/replay to clear it, so that player's next quick-undo in the same window became a no-op. After an opt-out for it (and for `PassDelayPrompt`, a structurally identical masking prompt), `DisplayCardsBasicPrompt` was found still missing: a view-only "Done"-only popup reachable inside a Regroup boundary window via the shipped upgrade `Foresight` (`server/game/cards/03_TWI/upgrades/Foresight.ts`), which reveals a card to the opponent who decided nothing. A source read of this attempt's replacement design found a further hole: `SelectCardPrompt.continue()` completes by itself when no target exists.
4. *Deriving "is a decision" from the prompt's button and selection state.* Rejected: `UndoConfirmationPrompt` shows two enabled buttons (`['Allow', 'Deny']`), so Deny would count as a decision (the same trap as item 3), and a click on the only legal target would count as no choice.
5. *A game-event counter since the checkpoint.* Rejected: choosing the order and declining a trigger emit no event.

**Confirmation mode at the boundary target.**
`Game.confirmationRequiredForRollback` has three independent ways to require Request-mode confirmation: `rollbackInformation.requiresConfirmation`, `freeUndoLimit.hasReachedLimit` and `!!opponent.hasResolvedAbilityThisTimepoint`; `SnapshotManager.getQuickRollbackInformation` alone only computes the first.
Observed from an actual run (not predicted) at the corrected target:
- `rollbackInformation.requiresConfirmation` is false in every state, because the boundary entry is 0 timepoints behind the current one; `isSameTimepoint` is true.
- `freeUndoLimit.hasReachedLimit` is false on the first undo of a game; it is a per-game counter (`PerGameUndoLimit`) unrelated to the boundary and fires after the game's first free undo.
- `opponent.hasResolvedAbilityThisTimepoint` is false while the opponent's trigger has not started resolving (the requester only chose the order), so the undo is free; it is true once the opponent's trigger has started resolving, so Request mode shows the opponent "Your opponent would like to undo their current action" and Allow lands on the boundary.
- After that replay, a second request targets `Previous` (3 timepoints back), where the first check is true through `opponentActedSinceLastSnapshot`'s `> 2` branch and the wording is "previous action".
A requester who was shown hidden information in the window still needs the opponent's approval at the boundary target in Request mode.
The Thrawn case above lands on the same checkpoint type several timepoints after it was taken (`timepointsSinceSnapshot = 4`, observed), where the first check is true and short-circuits `Game.confirmationRequiredForRollback`'s `||`.
A prompt's wording ("undo their **current** action" vs. "undo their **previous** action") reliably reflects which target (`isSameTimepoint`) was chosen, which makes it a direct way to observe the target in a run.

**For `P4-F` and `P4-G`.**
The `Current` target in this case is the eager full `StartOfPhase` checkpoint, and the delta-chain obligation in "Open issues inherited from `-morph`" is unchanged.

## Decision checkpoint: full deltas vs per-object memoization

After the tracker + hooks land (they are shared by both options), evaluate:
if chain-composition correctness looks risky in review — this design already
consumed one failed implementation round (`-codex`/`-opus` prototypes, then a
restart) — fall back to **per-object serialization memoization**:

- Keep full-snapshot *semantics*: every snapshot logically contains every
  object.
- Use the same dirty flags to **reuse each object's serialized record from
  the previous snapshot when unchanged** (copy-on-write of the record map).
- No chains, no first-write-wins subtlety, no bridge entries, no
  phase-boundary special cases; restore path unchanged.
- Captures most of the serialize-time win (typically ~95% of objects are
  untouched between actions); does not shrink retained-memory as much
  (mitigated by structural sharing of unchanged records across snapshots).

The plan should implement hooks → memoization → (optionally) deltas, in that
order, so the fallback is the intermediate landed state rather than a rewrite.
The memoization stage has its own gate: today's `ENABLE_UNDO_ALL_TESTS` form
of the whole-suite harness plus the serialize-time benchmark — the
delta-parity harness mode does not exist in the intermediate state and only
arrives with the delta stage.

### Decision checkpoint verdict (P4-D)

**DELTAS: per-object memoization delivered the retention target and the write-side drop in every scenario, but missed the write-side sparsity clause W2 on the replicated medians (19.3 points against the bound 20), so by the rule fixed for P4-D `P4-E` and `P4-F` run.**
The miss is 0.7 points wide and sits well inside the roughly 18-point single-run timing noise ceiling of [the capture index](performance/README.md); it is a miss on the bound estimator (head median against reference median over six runs) and not a miss clearly outside the noise floor: a ratio of six-run means gives a margin of 17.9 points and the median of the six per-run-pair drops gives 21.9, so the 0.7-point miss is not measurable at this sample size.
The owner accepted the mechanical outcome: the verdict follows the bound rule and DELTAS is kept by the owner's decision, not because the sparsity effect was shown absent, and the sparsity direction held on the medians (a 66.6% drop in forty-cards-four-mutated against 47.3% in forty-cards-per-player); `P4-G` re-measures sparsity with deltas in place.
The three flags `ENABLE_PARITY_HARNESS`, `ENABLE_UNDO_ALL_TESTS` and `MEASURE_SAVE_DEGRADATION` were unset in the capture environment.
Everything else the rule asks passed, so the margin is the whole of the decision.

Method.
The two captures are `p4-d-reference-pre-memo` (scratch worktree at `d30824a12` with P4-Cb's spec patch from `2e7beb110`, Node v26.13.0, 2516 cards) and `after-plan-04-memo` (this branch at `a2fd76e3a`, same machine, Node and card count), taken back to back with `ENABLE_PARITY_HARNESS` unset.
Because the single-run W2 margin (15.6 points) and three control rows moved outside the noise band, each arm was extended to six runs: the capture plus five replicates alternating reference and head with `--skip-build --skip-card-memory` and no rebuild or spec edit.
The replicate files are not committed; every figure in the clause tables is a six-run median over the capture and its five uncommitted replicates (the per-run values of the two rows that decide W2 are inlined below; the other medians cannot be re-derived from the committed single runs alone), and `d` is the relative drop of the head median against the reference median.
The thresholds were chosen by the user and fixed before the captures: T1 = 20 percent (W1), T2 = 20 points (W2), T3 = 30 percent (R1), T4 = 10 points (R2).

Gate 1 (the P4-Cb rows measure what they claim) passed in all ten cells of every run of both arms: the reference reads 0 reused records, head reads 144, 203, 236, 238 and 230 reused records per build in compact-board, large-board, forty-cards-per-player, forty-cards-sparse-mutations and forty-cards-four-mutated, and head's fresh records per build equal each scenario's mutated-card count (11, 28, 40, 12, 4) on both the memoized row and the chain-with-writes row.

Write side, `full/moveToNextTimepoint(Action, memoized)` avg (ms, six-run medians; single-run capture values in brackets for the first run):

| Scenario | Reference | Head | d | W1 (>= 20%) |
|---|---|---|---|---|
| compact-board | 0.110 [0.124] | 0.045 [0.038] | 59.5% | pass |
| large-board | 0.176 [0.229] | 0.072 [0.072] | 59.2% | pass |
| forty-cards-per-player | 0.249 [0.239] | 0.131 [0.138] | 47.3% | pass |
| forty-cards-sparse-mutations | 0.240 [0.263] | 0.064 [0.063] | 73.4% | pass |
| forty-cards-four-mutated | 0.163 [0.151] | 0.054 [0.064] | 66.6% | pass |

W1 passes in every scenario; the smallest drop (47.3% in forty-cards-per-player) clears T1 by 27.3 points, beyond the 18-point noise ceiling.
W2 (`d[forty-cards-four-mutated] - d[forty-cards-per-player]` >= 20 points): 66.6 - 47.3 = 19.3 points on the medians (15.6 points on the single run), a miss of 0.7 points.
Per-run values (ms, capture then replicates 1 to 5) for the two rows that decide W2:

| Row | Reference | Head |
|---|---|---|
| forty-cards-per-player | 0.239, 0.272, 0.248, 0.229, 0.268, 0.249 | 0.138, 0.106, 0.134, 0.145, 0.101, 0.128 |
| forty-cards-four-mutated | 0.151, 0.165, 0.171, 0.161, 0.159, 0.190 | 0.064, 0.054, 0.043, 0.041, 0.063, 0.055 |

Retention, `payload/retainedChainWithWrites(13 snapshots)` `notes.bytesPerSnapshot` (six-run medians; the bands are within 0.5% of the median except forty-cards-sparse-mutations, whose reference band is 83,379 to 84,526 (1.3% below the median) and whose head band is 26,874 to 29,945 (10.3% below the median)):

| Scenario | Mutated cards | Live objects | Reference B/snapshot | Head B/snapshot | d | R1 (>= 30%) |
|---|---|---|---|---|---|---|
| compact-board | 11 | 155 | 49,012 | 17,992 | 63.3% | pass |
| large-board | 28 | 231 | 76,941 | 35,255 | 54.2% | pass |
| forty-cards-per-player | 40 | 276 | 87,911 | 42,638 | 51.5% | pass |
| forty-cards-sparse-mutations | 12 | 250 | 84,472 | 29,945 | 64.6% | pass |
| forty-cards-four-mutated | 4 | 234 | 79,201 | 22,015 | 72.2% | pass |

R1 passes in every scenario (the smallest drop, 51.5%, clears T3 by 21.5 points, against the 0.3% typical and 7.3% worst memory spread of [the capture index](performance/README.md) rule 5).
R2 (`d[forty-cards-four-mutated] - d[forty-cards-per-player]` >= 10 points): 72.2 - 51.5 = 20.7 points, pass.
Scaling reading, not a clause: head bytes per snapshot fall from 42,638 (40 mutated, 276 live) to 22,015 (4 mutated, 234 live), so retained bytes track the mutated set, but a per-snapshot floor that follows the live object count remains (forty-cards-four-mutated still retains 22 KB per snapshot with 4 mutated cards).
That floor is the per-snapshot record-map overhead this section already warned about when it said memoization "does not shrink retained-memory as much" as deltas would.

Rows that are not verdict inputs, each read for its reason.
`manager/moveToNextTimepoint(Action)` never has a memo and is the control, expected flat; its six-run median moved +5.4%, +1.0%, +13.4%, +27.1% and -17.9% across the five scenarios (single run: +10.1%, +42.6%, +36.1%, +22.6%, +9.8%).
Three of the single-run moves and one replicated median (+27.1%) sit outside the 20 percent band, so the control is explained rather than ignored: the runtime, card data and benchmark spec are identical between the arms by construction, and the per-run values overlap heavily (forty-cards-sparse-mutations head ran 0.190 to 0.397 ms against 0.196 to 0.280 for the reference), so run-to-run noise is the leading candidate, with the tracker default switch from `CaptureOldValues` to `DirtyOnly` that P4-C made as the other candidate; the six-run medians do not separate the two, and neither feeds a clause.
`full/createSnapshotForCurrentTimepoint` (-71.0% to -83.1%) and `payload/retainedChain(13 snapshots)` (-81.6% to -84.3%) have no writes between snapshots, so they are upper bounds on what memoization can save and not evidence of the realistic saving.
`payload/gameStateBuffer`, `payload/gameObjectStatesBuffer` and `payload/fullSnapshotTotal` were redefined at P3-PB2 and carry `notes.measurement` in every scenario of both arms, so they are not comparable with captures before that redefinition and none is used here.

Rollback reading for `P4-G`.
The plan's red flag is a rise in `manager/rollbackTo(Manual)` p95.
Against the reference it did not rise: avg moved -15.7% to -23.7% and p95 -13.9% to -24.1% across the five scenarios on the six-run medians (head p95 medians: compact-board 0.699, large-board 1.122, forty-cards-per-player 0.986, forty-cards-sparse-mutations 0.884, forty-cards-four-mutated 0.749 ms), while the raw-restore control `full/rollbackToSnapshot` stayed flat to slightly better (avg +4.4% to -12.2%, p95 -12.7% to +15.7%, whose largest rises, in compact-board and large-board, are inside noise and the control's meaning is unchanged).
Memoization therefore did not cost rollback time, and the improvement on the manual-rollback path sits beside an unchanged raw restore, which is consistent with P4-C reusing records in its pre-pass; `P4-G` should read the delta path's rollback p95 against these memoized numbers, not against `after-plan-03`.

Cross-runtime context only, never an input to this verdict: against `after-plan-03` (Node v24.13.0, 2386 cards) the head capture reads `manager/rollbackTo(Manual)` avg -11.8% to -41.4% and `payload/retainedChain(13 snapshots)` -81.5% to -84.3%, but its control row moved +43.5%, +7.7%, +38.1%, +4.3% and -18.9%, which is what a runtime and card-count change looks like and is why the same-runtime reference replaced it.

Consequence.
Per the P4-D rule `P4-E` and `P4-F` run, with this memoized state as the measured baseline for them: the delta stage must beat the head figures above (not the pre-memo reference), and the near-miss on W2 means the sparsity test is the first thing `P4-G` should re-measure with deltas in place.

## Verification

- Full suite + `ENABLE_UNDO_ALL_TESTS=true` in its delta-parity form (see
  "Manual snapshots and the whole-suite gate") — every action-phase spec
  replayed through `rollbackToDeltaChain` with a delta-vs-full parity
  compare. This is the real gate.
- Dedicated specs: first-write-wins, scalar and per-wrapper in-place
  collection variants; multi-delta chain across 3 actions **with both
  players acting** (the chain must cross the opponent's windows and at least
  one bridge); rollback across a delta→full boundary; rollback to the same
  delta target twice with mutation in between; object created+destroyed
  within one window; **corrupted chain: deliberately delete an intermediate
  index delta and assert the loud contiguity failure** (invariant 4);
  **organic registration during delta rollback asserts** (`_isRollingBack`
  guard; companion case once Plan 5's delta integration lands —
  registration inside an active rehydration scope succeeds and rekeys, per
  Plan 5 A2);
  delta-backed rollback followed by a manual snapshot (the `-morph`
  regression case in its `SnapshotTypes.spec.ts` addition, +43 lines — port
  it); **full manual rollback mid-window, then a delta checkpoint, then a
  delta rollback, asserting clean values** (tracker stop/restart at the
  shared entry point covers full restores too — protocol steps 1/8);
  **mid-window manual snapshot** (anchor rule); boundary-adjacent
  quick-undo confirmation policy unchanged (shared-id rule); phase-boundary
  prompt cases (Sneak Attack, Thrawn); index eviction behavior (horizon
  advances, no holes, chains older than the horizon rejected loudly).
- Benchmark harness numbers in the PR, before/after, on a scripted long
  game: per-action snapshot time; heap; **delta size distribution** (the
  collection-copy caveat); and **delta rollback wall-clock** — the rollback
  path pays a recovery-snapshot serialize plus the all-objects
  `afterSetAllState` pass, and the "O(fields mutated)" headline applies to
  snapshot *taking*, not rollback.

## Explicit non-goals

- Changing which timepoints exist or the undo UX/confirmation policy (the
  bridge shared-id rule exists precisely to keep
  `opponentActedSinceLastSnapshot` behavior unchanged).
- GameObject recreation (deltas still assume live objects; Plan 5 changes
  that and its restore path must compose with delta chains — note this as a
  Plan 5 integration point). Two boundary facts pinned now for that
  integration: Plan 5c's release sweep runs only at **full-snapshot
  boundaries**, never per action delta (a mid-chain sweep would race the
  window's recorded values); and the delta payload carries a first-removal
  full-record slot (see "Mechanism") so objects removed within a chain
  window remain recreatable.

---

## Performance capture (required on completion)

```bash
npm run benchmark -- --name after-plan-04 --compare pre-roadmap-baseline
```

Also compare against `after-plan-03`, since Plan 3 is this plan's immediate
baseline. Commit both generated files under `docs/plans/performance/`. See
[Plan 0](00-performance-benchmarks.md) for the method and
[the capture index](performance/README.md) for the rules.

**This capture is the roadmap's performance deliverable.** Plan 4 is the last
plan whose thesis is performance — Plans 5 and 6 are save/load-oriented, and
their captures are no-regression checks. The `pre-roadmap-baseline` →
`after-plan-04` comparison is therefore the one that answers the roadmap's
central question. Read it against the two things the roadmap set out to fix:

1. **Speed** — `manager/moveToNextTimepoint(Action)` and
   `manager/rollbackTo(Manual)`, avg and p95.
2. **Memory / GC pressure** — `payload/retainedChain(13 snapshots)`, allocation
   per operation (heap + external), and the GC pause share in
   `sustained/snapshotAndUndoCycle`.

Write the verdict into this doc, including anything that got worse. If a
headline benchmark was redefined earlier in the roadmap, state explicitly which
parts of the comparison are honest and which are not. (Plan 5c's release policy
may later improve the memory numbers further — that is a bonus tracked in Plan
5's capture, not part of this verdict.)

**What this plan should move.**
Quick snapshots become reverse deltas, so `manager/moveToNextTimepoint(Action)`
and `payload/retainedChain(13 snapshots)` should both drop substantially.

The sparse scenarios exist for exactly this test:
`forty-cards-sparse-mutations` and `forty-cards-four-mutated` hold total card
count fixed while shrinking the mutated set, so delta savings should scale with
mutation density rather than board size. If `forty-cards-four-mutated` does not
improve markedly more than `forty-cards-per-player`, the delta path is not
exploiting sparsity — chase that before landing.

**What would be a red flag.** A rise in `manager/rollbackTo(Manual)` p95. Delta
chain replay is more work per undo than a single full restore, and the mid-plan
decision checkpoint (full deltas vs. memoization fallback) should weigh that
measured cost, not an estimate.

**Benchmark addition.** Delta-specific diagnostics — start-tracking cost,
checkpoint cost, delta payload bytes — belong in the diagnostic tier as **new
rows**. The `-morph` branch's spec has all three and can be ported directly. Do
not repurpose existing row names; that breaks the comparison against
every prior capture.

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

### Chain selection, contiguity, and eviction

Delta windows are **global time slices** — there is one tracker per game — but
each action delta lands only in the *acting player's* container, and bridge
deltas (see Cadence) land only in the global index. Rolling player A back two
actions must unwind the opponent's intervening windows. Therefore:

- **Chains are selected from a single global, id-ordered delta index**
  (`-morph`'s `deltaSnapshotsById`; its filter
  `id > target && id <= current`, applied newest-first). Containers hold
  per-player *entry points* only: port `-morph`'s `DeltaSnapshotContainer`
  (mixed ordered list of `{type:'full'} | {type:'delta'}` entries, capped at
  `MaxDeltaEntries` — `-morph` used 3), replacing `MetaSnapshotArray`'s
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
load-bearing and all are ported from `-morph`'s `rollbackToDeltaSnapshotId` /
`rollbackToDeltaChain`:

1. **Stop the tracker** at rollback entry. Delta restore writes old values
   back *through the hooked decorator setters*; without suspension the
   restore pollutes the live window, and first-write-wins makes the pollution
   sticky (the pre-restore value gets locked in as "window start").
2. **Build the chain** from the global index, contiguity-checked as above.
3. **Prepend the pending-window delta.** The current action's mutations live
   in the un-checkpointed live tracker, not in any stored delta
   (`createPendingRollbackDelta`). For the single most common undo — revert
   the current action, `QuickRollbackPoint.Current`, target id == current
   id — the stored chain is *empty* and the entire rollback is the pending
   delta.
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
   (`updateCurrentSnapshotFromDelta`, `states: {}`) that lazily
   rematerializes on demand — the materialization correctness rule is in the
   manual-snapshots section. Prune newer snapshots and newer index entries;
   **restart the tracker** from the new current snapshot.
8. **On failure:** restore from the recovery snapshot, alert the player, and
   restart the tracker — the tracker restarts on *both* success and failure
   paths, as `-morph` does in `rollbackToInternal`.

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
  timepoint number (see "Chain selection").
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
rollback with `SnapshotType.Manual` at `:249-253`). With always-full manuals
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
  per-spec **delta-vs-full parity check** (invariant 4).

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

- **Phase-boundary prompts** (`SnapshotManager.ts` `TODO THIS PR`: Sneak
  Attack / Thrawn-style triggers that prompt at phase boundaries). The
  quick-rollback policy (`getQuickRollbackPoint`) must handle a delta chain
  whose window ends at a boundary prompt. Resolve before merge; this TODO
  also exists on main's `SnapshotManager.ts:328` — fixing it may be a
  standalone precursor PR. (The other boundary defect — double-consumed
  ids/timepoint numbers perturbing the confirmation policy — is resolved by
  the shared-id rule in "Chain selection".)
- **In-place mutation of `stateValue` Maps/Sets** is invisible to setter
  hooks. Plan 3 Phase B step 7 commits to the `stateMap`/`stateSet`/
  `stateArray` decorator split in-phase — verify it is present; it is a hard
  prerequisite for value-collection delta tracking here, not an option.
- **Silent-failure returns in `rollbackToDeltaSnapshotId`** (missing target →
  `null` → no-op undo) — replaced by the contiguity hard-fail.
- Any residual `go.state` references (the `-morph` `UndoSafeRecord` assert
  bug) — should already be gone after Plan 3 Phase B.

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
  it); **mid-window manual snapshot** (anchor rule); boundary-adjacent
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

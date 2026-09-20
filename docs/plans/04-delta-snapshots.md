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
  per-spec **delta-vs-full parity check** (invariant 4). Under delta-parity
  mode the only legal skip is the existing null-`snapshotId`
  (non-action-phase) case; any other rollback failure fails the spec —
  today's `undoIt` treats every failed rollback as a silent skip
  (`IntegrationHelper.js:254-257`), and that leniency does not survive.

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

- **Phase-boundary prompts, partially resolved on main.** Main's
  `SnapshotManager.ts` `getQuickRollbackPoint` `TODO THIS PR` has been
  resolved for Sneak Attack's and Thrawn's own boundary triggers by roadmap
  unit `P4-0` (the TODO comment is gone; `SnapshotManager.ts:328` no longer
  names it). A separate, narrower defect — landing on the wrong quick-rollback
  target when two or more boundary triggers are pending and the requesting
  player has already decided part of the window — remains open; see "Known
  limitations (deferred)" below and roadmap unit `P4-0b`. Independently of
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

**Quick-undo overshoots at a Regroup/Setup phase boundary once the requesting
player has already decided part of that boundary's own trigger window.**
Deferred by explicit user decision after three fix attempts were rejected at
plan review (below); tracked as roadmap unit `P4-0b`, which `P4-F` and `P4-G`
depend on wherever they previously depended on "`P4-0`'s rule" for this case.

**Exact moment.** Two or more players' (or one player's own multiple)
`StartOfPhase`-triggered abilities are pending in the same Regroup/Setup
window (e.g. two copies of Sneak Attack, one per player). The requesting
player has already completed part of that window's own resolution — chosen a
resolution order, answered one of several simultaneous triggers — *before*
requesting a quick-undo. Today, `getQuickRollbackPoint` returns `Previous`,
overshooting into the *previous* action phase, instead of landing at the
start of the *current* phase transition. (The mirror case — nothing yet
decided in the window — is not a bug: overshooting there is correct, since
landing on the boundary checkpoint would be a state-identical no-op. Pinned
by `test/scenarios/undo/PhaseStartAndEnd.spec.ts`'s `should revert back to
the last action of the action phase on undo` test.)

**Root cause.** Every quick-undo checkpoint except Regroup/Setup's own
`StartOfPhase` is recorded lazily — only after its trigger window closes,
gated on `Game.hasBeenPrompted` (`Phase.ts`'s
`takeActionSnapshotsForPromptedPlayers`, `ActionPhase.setupActionPhase`'s
`addQuickStartOfActionSnapshot`). Regroup/Setup's own `StartOfPhase` is the
one exception: `addQuickStartOfPhaseSnapshots` records it eagerly and
unconditionally, for every player, before that phase's `OnPhaseStarted`
trigger window even opens. That eager checkpoint is the *only* thing
quick-undo can land on while the window is still open. Removing the
asymmetry (making it lazy like every other checkpoint) does not fix this:
during the still-open window there would then be no checkpoint at all for
either `Current` or `Previous` to target, and several already-passing tests'
`Previous` answer resolves through the eager entry today
(`PhaseStartAndEnd.spec.ts:126-252`). A fix has to distinguish "the
requesting player has decided something in this specific window" from "the
window is merely open," using a signal that resets on a rollback-and-replay
of that same window the same way `Game.playerHasBeenPrompted` already does.

**How `getQuickRollbackPoint`'s existing cases actually resolve the two
already-correct cases** — confirmed by instrumenting the function to log the
branch taken and the value returned, then running the two named existing
specs, not by static reading; a static read of this exact mechanism produced
a wrong branch attribution during this task's own planning and was caught
only by running it:
- *Thrawn* (`PhaseStartAndEnd.spec.ts`'s "during the prompt, should roll back
  to the regroup phase snapshot on undo", mid-prompt): the
  `[RegroupReadyCards, StartOfPhase, EndOfPhase]` staleness case (the
  `.includes(this.currentSnapshottedTimepointType)` check in
  `SnapshotManager.ts`'s `getQuickRollbackPoint`) fires and returns
  `Current`. `Current` resolves to `entries[length-1]` in the player's
  `MetaSnapshotArray` — which, because Action's own `StartOfPhase` never
  receives the eager per-phase push Regroup/Setup's does, still points to the
  *preceding* Regroup phase's own eager `StartOfPhase` entry. That is what
  produces the observed `regroup`-phase destination — not the mid-action case
  (the `if` block gated on `SnapshotTimepoint.Action`, which cannot fire at a
  `StartOfPhase` boundary at all).
- *Single-trigger Sneak Attack* (`PhaseStartAndEnd.spec.ts:126-150`, after
  Ruthless Raider's own on-defeat prompt has already been answered, at the
  Regroup phase's resourcing prompt): `RegroupResource` is not one of the
  three timepoints the staleness case checks, so control falls through to the
  function's final `return QuickRollbackPoint.Previous`. `Previous` resolves to
  `entries[length-2]` — which, because answering Ruthless Raider's prompt
  caused `takeActionSnapshotsForPromptedPlayers` to push a *new* entry for the
  resourcing timepoint, now sits one position back from that new entry, at
  the same eager `StartOfPhase` entry Thrawn's case also resolves through.
  Same target, reached by the opposite branch and the opposite enum value,
  for an unrelated reason (a different-length array, not a different
  destination rule).

The load-bearing point for anyone extending this function:
`Current`/`Previous` are **positions in a per-player array**, not labels for
"the boundary" or "the previous action" — which physical snapshot each
position resolves to depends on how many entries have been pushed by the
time the function runs, not on which branch or enum name was used to get
there. Reasoning about this function from branch names alone, without
checking what the array actually contains at that moment, is exactly how
this task's own planning briefly misattributed both cases above.

**Three fix attempts, each rejected at plan review — read before trying a
fourth:**
1. *Fire on "a boundary prompt is open"* (no player-decision gating).
   Rejected: this makes the corrected first undo a state-identical no-op at
   the exact moment nothing has been decided yet.
2. *A per-player, per-checkpoint "consumed" marker* that survives rollback
   (added to `MetaSnapshotArray`, pruned via its existing
   `clearNewerSnapshots` hook). Fixes the moment above, but adds new tracked
   state to the exact container this doc's "Chain selection" section
   replaces with `DeltaSnapshotContainer` — a real, if narrow, carry-over
   cost, and a larger diff than the defect strictly requires.
3. *A per-player "completed a decision-bearing prompt in this window" flag*,
   hooked into the shared `UiPrompt.complete()` choke point, reset by the
   existing `resetPromptedPlayersTracking()` (no new persisted state, no
   `MetaSnapshotArray` change — the mechanism that should eventually ship).
   Rejected twice on the same failure shape: the choke point is shared by
   prompt types that complete without the player deciding anything about
   game state, and each round's enumeration of those types missed one.
   `UndoConfirmationPrompt` (the Allow/Deny undo-confirmation prompt) was
   missed first — clicking **Deny** set the flag for the denying player with
   no compensating rollback/replay to clear it, so that player's own next
   quick-undo in the same window became the same no-op defect via ordinary
   Request-mode play. After adding an explicit opt-out for it (and for
   `PassDelayPrompt`, a structurally identical but currently-unreachable
   masking prompt), a **third** no-decision completion was found still
   missing an opt-out: `DisplayCardsBasicPrompt`, a view-only "Done"-only
   popup, reachable inside a Regroup boundary window via the shipped upgrade
   `Foresight` (`server/game/cards/03_TWI/upgrades/Foresight.ts`), which
   reveals a card to the *opponent* who did not choose to look and decided
   nothing. `DisplayCardsBasicPrompt` already overrides the sibling predicate
   `isOpponentRevealNewInfoPrompt()` two lines from where the needed override
   belonged, and the round whose entire purpose was enumerating this category
   still missed it — the second time an enumeration of "prompts that aren't
   decisions" on this exact choke point came up short. Do not retry a fourth
   enumeration; see the structural alternative below.

**A load-bearing fact discovered along the way, worth keeping regardless of
which fix ships next:** `Game.confirmationRequiredForRollback` has three
independent ways to require Request-mode confirmation —
`rollbackInformation.requiresConfirmation`, `freeUndoLimit.hasReachedLimit`,
and `!!opponent.hasResolvedAbilityThisTimepoint` — and
`SnapshotManager.getQuickRollbackInformation` alone only computes the first.
At a Regroup/Setup boundary where the eager `StartOfPhase` checkpoint is
still fresh (`timepointsSinceSnapshot` 0 or 1 — the Sneak Attack case above,
where nothing has been decided since the snapshot was taken), the first
check does not fire and no code path sets a phase-type snapshot's
`requiresConfirmationToRollback` true, so confirmation there comes entirely
from the third check. That scoping does not generalize to every eager
`StartOfPhase` checkpoint, though: the Thrawn case above lands on the same
checkpoint type several timepoints after it was taken
(`timepointsSinceSnapshot = 4`, observed), where
`opponentActedSinceLastSnapshot`'s `> 2` branch makes the first check
(`rollbackInformation.requiresConfirmation`) true and short-circuits
`Game.confirmationRequiredForRollback`'s `||` before the third check is ever
reached — the first check firing, not the first two being inert. Separately,
`freeUndoLimit.hasReachedLimit` (`UndoLimit.ts`'s `PerGameUndoLimit`) is a
per-game usage counter unrelated to boundary type or
`timepointsSinceSnapshot`; it happens not to have fired in either case
documented here, but that is not because the boundary makes it structurally
inert, and a future run could see it fire regardless of which checkpoint is
targeted. Any future work on this area should derive confirmation behavior
from an actual run, not from reading the snapshot-level inputs in isolation
— a prompt's wording ("undo their **current** action" vs. "undo their
**previous** action") reliably reflects which target (`isSameTimepoint`)
was actually chosen, and is a fast, direct way to observe it.

**Structural alternative for the next attempt** (not yet designed or
tried): stop enumerating exceptions on the shared choke point. Either (a)
derive "is a decision" from whether the prompt's own button/selection state
actually offers a real choice (more than one enabled option, or selectable —
not `ViewOnly` — targets) rather than from a per-class opt-out list, or (b)
add an enumeration test that fails CI whenever a `UiPrompt` subclass has not
made an explicit, non-inherited declaration either way, so a fourth missed
case is caught at review time instead of by a shipped card. Whoever picks
this up (`P4-0b`) should design and test one of these against the full
existing regression suite (`PhaseStartAndEnd.spec.ts`,
`UndoConfirmation.spec.ts`) before proposing a fix.

Further reading (optional, not required to act on this item): the full
round-by-round review trail is retained at `.anvil/p4-0/plan-v2.md` through
`plan-v5.md` and their matching `review-planreview-*.md` files.

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

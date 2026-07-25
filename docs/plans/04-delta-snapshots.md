# Plan 4 — Delta Snapshots

**Status:** Proposed
**Depends on:** Plan 3 (dirty-tracking hooks live in the generated setters; deltas store generated-serializer field values)
**Unblocks:** Cheaper per-action snapshots; smaller retained-snapshot memory
**Shape:** One PR arc with an explicit mid-plan decision checkpoint (full deltas vs memoization fallback)
**Design reference:** `feature/quick-undo-deltas-morph` (primary; adopt its design), `feature/quick-undo-deltas` (cautionary — see "prior-art defects"). The 1555-line `docs/plans/delta-snapshots.md` on the `quick-undo-deltas` branch documents a previous failed implementation round ("Restart Requirements" section) — read it before starting.

## Goal

Quick (per-action) snapshots become **reverse deltas** relative to the most
recent full snapshot instead of full serializations. Full snapshots remain at
phase/round boundaries. Per-action cost drops from
O(all live GameObjects) to O(fields actually mutated this action).

## Mechanism (adopted from `-morph`)

- **Dirty-field tracking, not diffing.** Every generated state setter and
  collection mutation calls
  `deltaTracker.recordFieldChange(gameObject, fieldName)` **before** the
  write, capturing the pre-write value through the generated per-field
  serializer. Object creation is hooked in `GameStateManager.register`.
- **First-write-wins is mandatory:** within one tracking window, only the
  *first* mutation of a field records its value (that is the window-start
  value). `if (fieldName in goEntry) return;`
- **Delta payload is bufferless:** `{ changedFields: Map<uuid,
  Record<field, serializedOldValue>>, createdObjectUuids: string[], rngState,
  lastGameObjectId }`. No `gameState` buffer, no `states` buffer. This is the
  point of the plan — the plain `quick-undo-deltas` branch still ran a full
  serialization per action to seed its tracker, making deltas additive cost.
- **`Game.state` flows through the same path** by promoting it to a real
  `@registerState` GameObject with `alwaysTrackState = true` (`-morph`'s
  `server/game/core/GameState.ts`, 162 lines — port it). This removes the
  per-delta `v8.serialize(Game.state)` and unifies the tracking story.
- **Restore:** roll back full-snapshot-or-newer state by applying the delta
  chain newest-first: for each delta, restore RNG + `lastGameObjectId`, write
  each recorded old value back through the generated field deserializer,
  remove objects in `createdObjectUuids` (with `cleanupOnRemove`), then run
  the standard lifecycle pass (`afterSetState` / `afterSetAllState`) and
  `-morph`'s card zone-membership reconciliation
  (`reconcileUpdatedCardZoneMemberships`).
- **Containers:** replace `MetaSnapshotArray`'s closure-index scheme with a
  `DeltaSnapshotContainer` holding a mixed ordered list of
  `{type:'full'} | {type:'delta'}` entries; cap delta chain length
  (`MaxDeltaEntries`, `-morph` used 3). Chain selection must be per-container
  ordered-list based, not the global
  `filter(id > target && id <= current)` scheme from `quick-undo-deltas`
  (fragile once ids interleave across containers).

## Cadence

- `shouldUseDelta(timepoint)`: deltas only for `SnapshotTimepoint.Action`
  during the action phase. Everything else (start/end of phase, setup,
  regroup, manual snapshots) stays a full snapshot.
- Every full snapshot starts a fresh tracking window; a "bridge" entry lets a
  chain terminate at the preceding full snapshot across the boundary.
- Manual snapshots: always full (they can outlive any delta window).

## Prior-art defects this plan must not repeat

1. **Lost first-write-wins** — `quick-undo-deltas`' `recordFieldChange`
   unconditionally overwrote the recorded value, so a field mutated N times
   in one window restored to the value before the *last* write. Covered by a
   dedicated unit test in this plan (mutate a field 3× in one window, roll
   back, assert window-start value).
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
  standalone precursor PR.
- **In-place mutation of `stateValue` Maps/Sets** is invisible to setter
  hooks. If Plan 3 did the `stateMap`/`stateSet` decorator split, mutation
  methods hook the tracker; if not, that split becomes a prerequisite here.
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

- Full suite + `ENABLE_UNDO_ALL_TESTS=true` (the real gate — every spec
  replayed through rollback).
- Dedicated specs: first-write-wins; multi-delta chain across 3 actions;
  rollback across a delta→full boundary; object created+destroyed within one
  window; delta-backed rollback followed by a manual snapshot (the `-morph`
  regression case in its `SnapshotTypes.spec.ts` addition, +43 lines — port
  it); phase-boundary prompt cases (Sneak Attack, Thrawn).
- Benchmark harness numbers in the PR: per-action snapshot time and heap,
  before/after, on a scripted long game.

## Explicit non-goals

- Changing which timepoints exist or the undo UX/confirmation policy.
- GameObject recreation (deltas still assume live objects; Plan 5 changes
  that and its restore path must compose with delta chains — note this as a
  Plan 5 integration point).

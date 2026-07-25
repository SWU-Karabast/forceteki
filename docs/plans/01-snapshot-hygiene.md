# Plan 1 — Snapshot Hygiene & Enablers

**Status:** Proposed
**Depends on:** Nothing
**Unblocks:** Shrinks the payload every later plan operates on; enables replay-for-repro
**Shape:** 4–5 small, independent PRs. Each work item below can land alone.

## Goal

Fix the known memory-growth pathologies in the current snapshot system, close
two small correctness gaps, and land the cheap enablers (RNG seeding) that keep
future options open — all without architectural change.

---

## Work item A: Eliminate `OngoingEffectValueWrapper` churn

**Problem.** `DynamicOngoingEffectImpl.recalculateValue()` constructs a fresh
`OngoingEffectValueWrapper` (a GameObject) every time it runs
(`server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts:64`)
and stores it into the `@stateRefMap values` map (`:53`). `UndoMap.set` calls
`getObjectId()` on the value (`GameObjectUtils.ts:820`), which sets the
monotonic `_hasRef` latch — so every wrapper is permanently retained and
re-serialized into every snapshot thereafter. `OngoingEffectEngine.resolveEffects`
re-enters up to 10× per game-state resolution (`OngoingEffectEngine.ts:208-224`),
so this is the dominant memory-growth term in the engine.

**Direction.** Options, in order of preference (implementer to validate):

1. **Reuse:** keep one wrapper per (effect, target) and update its value in
   place. The wrapper's value becomes decorated state; recalculation mutates
   instead of allocating.
2. **Demote:** store the computed value as plain state on the impl (keyed map
   of target-uuid → value) and stop making the wrapper a GameObject at all.
   Check what depends on wrapper object identity (`setContext`, effect
   description plumbing) before choosing this.

**Related fix in the same area:** `OngoingEffect.refreshContext()` runs on
every rollback via `afterSetAllState` (`OngoingEffect.ts:205-207`) and
allocates a new framework `OngoingEffectSource` GameObject each time
(`OngoingEffect.ts:99` → `Game.getFrameworkContext()` →
`AbilityContext.ts:63`). Cache the framework context/source per game (it is
stateless) so rollback stops allocating.

**Acceptance.**
- Heap benchmark before/after over a scripted long game (port or adapt the
  benchmark harness from `feature/quick-undo-deltas-morph`'s
  `test/scenarios/undo/Performance.spec.ts` / `scripts/card-memory-benchmark.js`
  if useful).
- GameObject count after N rounds is bounded for a game using dynamic ongoing
  effects (e.g. a unit with a `calculate`-based stat buff).
- Full suite + `npm run test-undo` pass.

## Work item B: Restore `lastGameObjectId` on rollback

**Problem.** `IGameSnapshot.lastGameObjectId` is written at snapshot time
(`SnapshotFactory.ts:149`) but never read: `GameStateManager.rollbackToSnapshot`
(`GameStateManager.ts:143-223`) does not restore `_lastGameObjectId`. The
counter drifts upward across undo timelines. Harmless today (prevents uuid
collisions by accident), but it makes uuid assignment non-reproducible, which
Plans 5/6 need, and it silently grows uuid strings.

**Direction.** Restore the counter as part of rollback. Verify no code relies
on post-rollback uuids being globally unique versus pre-rollback removed ones —
removed objects are deleted from `gameObjectMapping`, and re-created objects
would now reuse their ids. Audit any external logging that assumes uuid
uniqueness across the whole game session.

**Acceptance.** A test that: snapshots, creates objects, rolls back, recreates
the same game actions, and asserts the recreated objects receive the same
uuids. Full suite + `npm run test-undo`.

## Work item C: Seed the RNG in production and surface the seed

**Problem.** `Game` constructs `new Randomness()` unseeded (`Game.ts:339`);
`setRandomSeed` (`Game.ts:665-667`) is called only from tests. The engine is
otherwise fully deterministic (no `Math.random` in `server/`; all consumers go
through `game.randomGenerator`). An explicit logged seed is a prerequisite for
any future replay-based repro tooling and improves bug reports at zero cost.

**Direction.**
- Generate an explicit seed at `Game` construction (e.g. from the lobby or a
  crypto-random string), pass it to `Randomness`, store it on the game.
- Include the seed in `captureGameState` bug-report output and in the
  game-start log line.
- Optionally accept a seed in `GameConfiguration` for repro runs.

**Acceptance.** Two games created with the same seed and same decks produce
identical shuffles. Seed visible in bug-report payload.

## Work item D: Bound manual snapshots

**Problem.** Manual snapshots are stored in `SnapshotMap` keyed by
`snapshotId`, one map per player, unbounded in key count
(`SnapshotManager.ts:214-226`). Each retained snapshot holds full game-state
buffers. A hostile or enthusiastic client can grow memory without limit.

**Direction.** Cap manual snapshots per player (config constant, e.g. 5–10),
evicting oldest. Confirm with product expectations before choosing the number.

**Acceptance.** Unit test on eviction behavior; existing manual-snapshot specs
pass.

## Work item E: Housekeeping (single cleanup PR)

- Delete deprecated dead code: `SnapshotArray`
  (`container/SnapshotArray.ts`, marked `@deprecated` and unused) and
  `SnapshotFactory.createSnapshotArray`.
- Delete dead `GameObjectBase.getState()` (the `structuredClone` path;
  the snapshot path uses `getStateUnsafe()` exclusively).
- Fix `test/helpers/IntegrationHelper.js:78`: passes nonexistent
  `UndoMode.Full` (evaluates to `undefined`, silently defaulted to `Free` by
  `GameFlowWrapper.js:21`). Change to `UndoMode.Free` explicitly.
- Remove never-called `UndoLimit.reset()` / `isPerGameLimit()` or wire them up
  intentionally.
- Delete merged/superseded branches: `feature/undo-json`,
  `feature/gameobject-family-undo`, `feature/gameobject-family-undo-initialize`
  (landed as PR #2179). Optionally archive-tag the delta/ts-morph branches
  referenced by Plans 3–4 before any deletion.

## Explicit non-goals

- No changes to snapshot cadence, format, or the decorator system.
- No delta or codegen work (Plans 3–4).
- Work item A must not change observable game behavior — only allocation
  patterns.

## Risks / notes for reviewer

- Work item A touches the ongoing-effect engine, the most stateful subsystem;
  the undo-all-tests run (`ENABLE_UNDO_ALL_TESTS=true`) is the real gate, not
  just the default suite.
- Work item B changes uuid reuse semantics after rollback. The
  `GameObjectBase.uuid` setter asserts single assignment
  (`GameObjectBase.ts:73-76`) — recreated-after-rollback objects are *new*
  instances so this is fine, but confirm no map keyed by uuid outlives a
  rollback (e.g. `GainAbility._abilityUuidByTargetCard`).

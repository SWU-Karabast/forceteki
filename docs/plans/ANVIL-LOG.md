# Anvil project log

The durable record of [Anvil](https://github.com/SWU-Karabast/forceteki/wiki) orchestrate runs against the snapshot / save-load roadmap.
Units are defined in [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md); the standing invariants they work under are in [README.md](README.md).

Run state lives in `.anvil/{task_id}/`, which is git-local-excluded and not committed. This file is the part that survives.
Each run appends one entry. Entries are newest-last, so the file reads in execution order.

Every unit gates on the same three commands unless its invocation says otherwise:

```bash
npm run lint
npm run test-parallel
npm run test-parallel-undo
```

---

## `P1-E` — Housekeeping (Plan 1, work item E)

| | |
|---|---|
| Task ID | `p1-e` |
| Date | 2026-09-12 |
| Lane / tier | fast, tier 1 (Small 🟢) |
| Plan | [01-snapshot-hygiene.md](01-snapshot-hygiene.md) work item E |
| Parent | `3dcaecdb0` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

Dead-code deletion only; no behavior change to the running engine.

- Deleted `SnapshotArray` (`server/game/core/snapshot/container/SnapshotArray.ts`) and its sole entry point `SnapshotFactory.createSnapshotArray`. Both carried `@deprecated This is implemented but not currently used or tested`. `MetaSnapshotArray`, which is live and reached through `SnapshotFactory.createMetaSnapshotArray`, is untouched.
- Deleted `GameObjectBase.getState()`, the `structuredClone` copy path. The snapshot system reaches state through `getStateUnsafe()` exclusively. The surviving `.getState()` call sites in `Player.ts` resolve to `PlayerPromptState.getState()`, an unrelated class.
- `test/helpers/IntegrationHelper.js:78` passed `UndoMode.Full`, which does not exist on the enum and evaluated to `undefined`, silently defaulted to `Free` by `GameFlowWrapper.js:21`. Now passes `UndoMode.Free` explicitly. Same resolved mode, no longer by accident.
- Removed never-called `UndoLimit.reset()` and `UndoLimit.isPerGameLimit()`. `incrementUses` and `hasReachedLimit` are called from `Game.ts:1887` and `:1898` and were deliberately kept. The reset semantics survive anyway: `Game.setUndoConfirmationRequired` replaces the `freeUndoLimit` instance outright.
- Corrected `CLAUDE.md`'s snapshot section, which documented the deleted `getState()`/`structuredClone` as the state-cloning mechanism. The live path is `getStateUnsafe()` + `v8.serialize` in `GameStateManager.buildGameStateForSnapshot`. Raised by review as the one stale current-API reference this deletion created.

Net: 60 insertions, 141 deletions across 7 files (the insertions are this log plus the one-line doc correction).

### Out of scope, deliberately

- Work items A, B, C, D of Plan 1.
- The branch deletions in item E's last bullet (`feature/undo-json`, `feature/gameobject-family-undo`, `feature/gameobject-family-undo-initialize`). Deletion is destructive and irreversible for the two that exist only locally, so it stays a manual step for the repo owner.
- The Plan 1 performance capture, which unit `P1-B` owns.

### Verification

All four gating commands were re-run after `rm -r build/`, so the results below come from a tree with no stale compiled output — the relevant hazard for a deletion unit, since the build scripts have no clean step and `build/server/.../SnapshotArray.js` otherwise lingers.

| Check | Result |
|---|---|
| `npm run build` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run test-parallel` | 8207 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8024 specs, 0 failures, 14 pending |

Cold adversarial review returned 0 blocking findings, 1 warning (the `CLAUDE.md` staleness, fixed here), and 4 nits.

### Deferred, with reasons

- `test/scenarios/undo/Performance.spec.ts:163-165` still comments that the helper "currently passes a non-existent `UndoMode.Full`". Now false. Left alone because [01-snapshot-hygiene.md](01-snapshot-hygiene.md) pre-authorizes keeping the workaround and `CLAUDE.md` fences benchmark scenario files.
- [00-performance-benchmarks.md](00-performance-benchmarks.md) states the helper bug as unfixed and pending. Belongs with unit `P1-B`, which owns the Plan 1 capture and will read that section as methodology.

### Notes

First roadmap run, so it doubled as the pipeline shakedown described in [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md). The Forge commands and the commit gate behaved on this repo, and this log was created here.

One correction worth carrying forward: the `UndoMode.Full` bug was real but inert. `GameFlowWrapper.js:21` takes `undoMode = UndoMode.Free` as a default parameter, and a JS default fires on exactly `undefined`, so the old code already bound `Free`. The fix removes the accident, not a behavior difference — the suite's undo mode did not shift.

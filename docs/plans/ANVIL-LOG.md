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
| Commit | `512a62113` |
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

---

## `P1-C` — RNG seeding (Plan 1, work item C)

| | |
|---|---|
| Task ID | `p1-c` |
| Date | 2026-09-12 |
| Lane / tier | fast, tier 1 (Small 🟡) |
| Plan | [01-snapshot-hygiene.md](01-snapshot-hygiene.md) work item C |
| Parent | `09429a8af` |
| Commit | `d5afa3de8` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

`Game` previously constructed `new Randomness()` with no seed, so the seed existed only inside seedrandom and nothing could report or reproduce it. Production games now mint one explicitly.

- `Game`'s constructor sets `_randomSeed` to `details.seed || randomBytes(16).toString('hex')` and passes it to `Randomness`. `Randomness`'s constructor already accepted an optional seed — the gap was at the call site, not in the class.
- `GameConfiguration.seed?: string` is the repro-run override. `Lobby.buildGameSettings()` deliberately does not set it, so every `new Game(...)` from `startGameAsync()` mints its own seed. That is what satisfies the plan's one-seed-per-`Game` requirement for Bo3: games 2 and 3 reach the same `startGameAsync()` through `proceedToNextBo3Game`, so no seed is carried across a set.
- `ISerializedGameState.seed` carries the seed into `Game.captureGameState()`, and the `Lobby: starting game id:` log line carries it into server logs. Both sinks are server-side only: the capture's consumers are the two `formatAndSendServerErrorAsync` call sites and `submitReport` → `formatAndSendReportAsync`, all of which post to staff-configured Discord webhooks (`DiscordDispatcher.ts:84-95`), and the client socket in `submitReport` receives only `{id, success, message}`.
- `setRandomSeed` now updates `_randomSeed` alongside reseeding the generator, so a post-construction reseed cannot leave the reported seed disagreeing with the one producing the shuffles. `_randomSeed` lost `readonly` to allow this.
- `test/server/core/RandomSeed.spec.ts` (new, 4 specs) covers the four acceptance points: identical shuffles for a shared seed, distinct seeds across two `Game` instances built from one lobby configuration, seed present in the bug-report capture, and the seed absent from the client-bound payload.

Net: 170 insertions, 2 deletions across 5 files.

### The secrecy requirement and how it is held

The plan treats the seed as a server-side secret for the match's duration, because the engine is fully seed-deterministic and seed plus message history reveals deck order. What makes that hold today is that every client-bound payload is a hand-built allowlist rather than a reflective serializer — `Game.getState()`, `Lobby.getLobbyState()`, `sendGameState`, `getGamePreview()` all name their fields explicitly, so a new field on `Game` is not picked up by default. The guard against that changing is the fourth spec, which walks every key of a real `getState()` payload recursively and also substring-checks the serialized JSON for the seed value.

That spec is only meaningful against a *started* game. `Game.getState()` returns `{}` before `this.started`, so the obvious version of this test — construct a `Game`, call `getState()` — passes against an empty object and would keep passing if the real payload leaked the seed. The first implementation shipped exactly that, review caught it, and the committed version drives a real game through the `integration()` harness and asserts `started` plus a non-trivial payload before walking keys. Falsified both ways: adding `seed: this._randomSeed` to the `getState()` payload literal makes the spec fail, reverting makes it pass.

### Out of scope, deliberately

- Work items A, B, D of Plan 1, and E (landed separately as `512a62113`).
- The Plan 1 performance capture, which unit `P1-B` owns.
- `Lobby.getLobbyState()` has no executable absence assertion. The integration harness builds a `Game` without a `Lobby`, and standing up lobby fixtures for one assertion is disproportionate at `standard` proof for a tier-1 unit. It was inspected by hand instead and references neither `randomSeed` nor `_randomSeed`.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm test -- "**/RandomSeed.spec.js"` | 4 specs, 0 failures |
| `npm run test-parallel` | 8211 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8028 specs, 0 failures, 14 pending |

The two suite counts sit 4 above P1-E's baselines, which is this unit's new spec file and nothing else.

Cold adversarial review returned 1 blocking finding (the vacuous absence test), 2 warnings, 1 question, and 3 nits. The blocking finding and two of the in-scope smaller ones were fixed; a confirming delta review independently re-falsified the repaired test.

### Deferred, with reasons

- **`setRandomSeed` is reachable from any client.** `Lobby.onGameMessage` dispatches client-named commands straight onto `this.game[command](...)` with no allowlist for players, and `setRandomSeed` is public, so a player can reseed a live game to a value they know and predict subsequent shuffles. This is pre-existing and independent of this unit — but it means the secrecy property this unit establishes is not yet enforceable end to end, since an attacker does not need to read the seed if they can set it. Fixing it properly means either gating `setRandomSeed` to test/dev or auditing the whole command-dispatch surface for an allowlist, which is its own unit of work. Raised by review as finding C-2 and recorded here rather than widened into this change.
- **`_randomSeed` is an own-enumerable property**, so a future `{...game}` or `JSON.stringify(game)` debug path would expose it. Nothing in the tree spreads a `Game` today. An ES private field or `WeakMap` would be structurally immune; that restructuring was judged larger than a tier-1 fast-lane fix warranted.
- **The seed reaches the bug-report Discord channel from player-submitted reports**, which players can trigger mid-match. Accepted because those webhook URLs are staff-configured and the channel is not player-visible — which is the arrangement the plan sanctioned. If that channel ever becomes community-readable, the seed needs redacting from the `BugReport`/`PlayerReport` paths while staying in the server-error paths.

### Notes

`getState()`'s pre-start `{}` shortcut is worth remembering beyond this unit: any future test asserting that some field is *absent* from a serialized payload has to establish that it is looking at the real payload first, or it proves nothing. The same hazard applies to the serialization-failure branch, which also returns a near-empty object.

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

---

## `P1-A` — Ongoing-effect wrapper churn (Plan 1, work item A)

| | |
|---|---|
| Task ID | `p1-a` |
| Date | 2026-09-12 |
| Lane / tier | full, tier 3 (Medium 🔴) |
| Plan | [01-snapshot-hygiene.md](01-snapshot-hygiene.md) work item A, including its "Related fix in the same area" |
| Parent | `b8b9cc997` |
| Commit | `PENDING` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

Three allocation pathologies in the ongoing-effect engine, plus the context fix work item B depends on.

- **A1 — compare before wrapping.** `DynamicOngoingEffectImpl.recalculate` used to build a wrapper GameObject on every recalculation and only then ask `compareValues` whether anything had changed. Since `OngoingEffectEngine.resolveEffects` re-enters up to ten times per game-state resolution, an effect whose value was stable still churned ten wrappers per resolution. The comparison now runs first, and an unchanged value allocates nothing.
- **A2 — one reused wrapper per (effect, target), value in decorated state.** Previously every *changed* value stored a fresh wrapper into the `@stateRefMap values` map, and `UndoMap.set` latched `_hasRef` permanently, so each superseded wrapper stayed registered for the life of the game and was re-serialized into every later snapshot. A new `MutableOngoingEffectValueWrapper` holds its value in a `@stateValue` accessor and is updated in place instead.
- **A3 — deferred `GainKeyword` construction.** `gainKeyword(fn)` and `gainKeywords` built their `GainKeyword` GameObject *inside* the `calculate` closure, so the subclass early-return registered a transient on every recalculation even when the value was unchanged. The closures now return raw keyword props, and an optional `wrapValue` factory — threaded through `OngoingEffectBuilder.card.dynamic` / `player.dynamic` — constructs the wrapper only once a change is detected.
- **A4 — per-effect context caching.** `OngoingEffect.refreshContext` runs on every rollback via `afterSetAllState` and used to allocate a fresh `AbilityContext` plus a throwaway `OngoingEffectSource` each time. It now builds the context once with an explicit source and mutates `player`/`source`/`ongoingEffect` in place on later calls. `Game.getFrameworkContext` was deliberately left alone: its roughly fifteen other call sites never overwrite `source`, so a shared instance there would have changed `context.source` identity semantics game-wide.

Net: 839 insertions, 35 deletions across 10 files — six engine, four new specs.

### The two decisions the plan gate had to settle

**Option 1 over option 2.** Option 1 (reuse the wrapper, value as decorated state) was chosen, so there is no Plan 5 impact to flag — stage 5b's wrapper-recreation recipe builds on exactly the JSON-safe decorated-value subset this establishes. Option 1 is also the smaller change: option 2 would have had to hold two storage shapes in one `values` map, which must still carry `GainKeyword` GameObjects.

Worth recording, because the plan doc says otherwise and the next reader would re-derive it: **the plan's stated blocker for option 2 does not bind.** `OngoingEffectEngine.effectLimitReached` reads `targetStates` through `effect.impl?.valueWrapper`, and for a dynamic impl that resolves to the constructor-time dummy wrapper, never an entry of the `values` map. `targetStates` is defined only on `DetachedOngoingEffectValueWrapper`, which only the detached *static* builders create. So the client-state summary's dependency on wrapper object identity is on the detached static wrapper, which neither option touches.

**The aliasing audit cleared in-place context mutation, with no consumer needing an exemption.** `player` is the only field that can differ between two refreshes — `source` and `ongoingEffect` are `readonly` and reassigned identically. Every retainer either gets force-refreshed (`impl.context`, the value wrapper's context via `setContext`, and `DetachedOngoingEffectValueWrapper`'s push into its retained target states) or holds an independent `copy()` / `createCopy()`. Two negative findings closed it: nothing anywhere mutates any other field of an ongoing effect's context (`gameActionsResolutionChain` is dead, and the only `context.events` mutations are on ability contexts), and no retainer wants a pinned pre-rollback snapshot. `summarizeOngoingEffectsForState`'s reads of `effect.context` and `effect.ongoingEffect` are per-call and run after `afterSetAllState`, so they see refreshed values.

Review added one caller the plan's framing had omitted: `PlayableOrDeployableCard.ts:506` also calls `refreshContext()` on a live controller change, not only on rollback. The audit's conclusions are caller-independent and that path is strictly better served by in-place mutation, so no change was needed — but `refreshContext` is not rollback-only, and a future reader should not assume it is.

### What is deliberately unchanged

Retention semantics for wrapper subclasses returned directly by `calculate` (`GainAbility`, `AdditionalPhaseEffect`, `GainKeyword`) and for any value that is a function or contains GameObject references. These keep the immutable-pinned-wrapper model. A3 changed only *when* a `GainKeyword` is constructed, never what is retained.

In-place reuse is gated on three conditions, all of which must hold: the wrap site has no `wrapValue` factory, the value passes `isSnapshotSafeOngoingEffectValue`, and the entry already in `values` for that target is itself a `MutableOngoingEffectValueWrapper`. That third clause is not decoration — after one unsafe value evicts the mutable wrapper, the stored entry is a plain `OngoingEffectValueWrapper` whose `value` is `private readonly`, and mutating it would write outside decorated state, silently keeping the newer value through every undo. An evicted wrapper is never revived.

Snapshot-safe means primitives plus plain arrays and objects whose leaves are all accepted; it rejects functions, `GameObjectBase` instances anywhere in the graph, foreign prototypes (`Map`, `Set`, `Date`, class instances) and true cycles. Both live raw shapes — `{hp, power}` from `modifyStats` and `Aspect[]` from `providesAspectIconsForCosts` — are accepted, so the reuse path covers the whole live raw surface today.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run test-parallel` | 8234 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8049 specs, 0 failures, 15 pending |

Baselines at the parent commit were 8211/0/13 and 8028/0/14. The pending count rises by exactly one in undo mode: that is the new `undoIntegration` suite correctly self-skipping when `ENABLE_UNDO_ALL_TESTS=true`, since it manages its own manual snapshots. No pre-existing pending spec was activated.

Four new spec files, 24 new cases, no existing spec modified or removed:

- `test/server/core/ongoingEffects/DynamicOngoingEffectValueWrapper.spec.ts` — compare-before-allocate, one-wrapper-per-safe-run reuse, nullish coercion, the safe-to-unsafe-to-safe class transition, the unsafe-value fallback, the defensive subclass branch, and direct boundary cases for the snapshot-safety predicate including a shared-reference DAG and a true cycle.
- `test/server/core/ongoingEffects/OngoingEffectContextCaching.spec.ts` — context identity stable across refreshes, `player` tracking `abilityPlayer()` when the source's controller changes, `impl.context` agreeing, zero registrations per refresh, and no `OngoingEffectSource` at construction.
- `test/server/core/ongoingEffects/GainKeywordNormalization.spec.ts` — `normalizeKeywordProps` idempotence, and raw-versus-normalized equality of both `getValue()` and `effectDescription`.
- `test/server/core/ongoingEffects/OngoingEffectWrapperChurnUndo.spec.ts` — bounded wrapper growth, zero registrations across the rollback seam, rollback restoring the in-place value, post-rollback context correctness, and no allocation for an unchanged dynamic keyword.

**The acceptance assertions are non-vacuous by execution, not by argument.** Reverting the three production files to parent content in the working tree, with the index untouched, and rerunning the churn spec failed all three cases with ten assertion failures: the pre-existing wrapper family grew 4, 6, 8, 10 against an expected flat 2 — exactly one permanently pinned wrapper per value change, which is the A2 bug — the mutable family was 0 against an expected 1, the rollback seam registered 3 objects where zero are required, and the unchanged-keyword case allocated 2 where zero are required. Two of the new unit specs cannot even compile against the parent, since they use the new constructor arity. The tree was then restored and re-verified byte-identical to the index before the final gate ran.

Review: three concurrent cold lenses (correctness/security on Opus, ordering/performance and architecture/contracts on Sonnet) returned **zero blocking findings**, and the architecture lens returned zero findings of any severity. Five warnings across the other two lenses were all fixed and independently confirmed by a cold delta review. Two plan-review rounds preceded implementation; the first caught four test-design gaps that would have let hardened-level criteria pass vacuously.

### Notes worth carrying forward

- `GainKeyword` does not override `getGameObjectName()`, so its uuid carries the base `OngoingEffectValueWrapper_` prefix, not `GainKeyword_`. Any test or tooling identifying a `GainKeyword` allocation by uuid string will silently match nothing; `instanceof` is the reliable check. The same applies to `GainAbility`, `AdditionalPhaseEffect` and `DetachedOngoingEffectValueWrapper` — the whole family shares one prefix. That is what makes a uuid-prefix diff across a code seam a usable allocation-accounting technique for `P1-B`, provided you know the families are not separable that way.
- `OngoingEffectSource` likewise inherits the base `GameObject` name, so a uuid-prefix check for it matches nothing. Counting `lastGameObjectId` deltas around a seam is the reliable technique instead — and because `GameObjectBase.register()` runs unconditionally in the constructor, before `hasRef` can latch, that counter is an exact allocation count for every subclass regardless of eventual retention.
- `KeywordInstance.toProperties()` returns a bare **string** for non-numeric keywords, while `GainKeyword`'s constructor normalizes to `{keyword}`. Any future compare-before-construct work in this area must normalize first, or it will report a change on every recalculation — strictly worse than the churn it set out to remove.
- `OngoingEffect.context` is now a long-lived per-effect object. Per-resolution state must be `copy()`d off it, never stashed on it. A comment at `refreshContext` records this; the invariant is otherwise held only by that comment and the audit above.
- `refreshContext` is the only thing that refreshes `context.player`, and it runs at construction, on rollback, and on a controller change. A mid-game controller change through any other path leaves `context.player` stale — pre-existing behavior, which `PutIntoPlaySystem.ts` already works around with `.copy({player})`.
- `ProvidedAspects.forCard` returns `card.aspects` **by reference**, so a dynamic value can alias a live non-state card field. That alias now round-trips through `v8.serialize` on every snapshot, which is a stricter guarantee than before rather than a weaker one, but the stored value must be treated as read-only. The new wrapper class carries this caveat in its comment.

### Deferred, with reasons

- **The Plan 1 performance capture is not run here.** It belongs to `P1-B`, the final unit of this plan. The allocation and GC-share movement this unit is meant to produce is therefore predicted but unmeasured; only the object-count assertions in the new specs bound it.
- **`isSnapshotSafeOngoingEffectValue` lives in the new wrapper module, not `GameObjectUtils.ts`**, deliberately, so it does not collide with the decorator-layer assertion unit `P2-B` will add, and so Plan 5 has one import for the family.
- **The plan doc's mis-stated option-2 blocker was not corrected in place**, since editing work item A's prose falls outside this unit's scope fence. It is recorded above instead.

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
| Commit | `aa95babf7` |
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

---

## `P1-B` — Restore `lastGameObjectId` on rollback (Plan 1, work item B — final unit)

| | |
|---|---|
| Task ID | `p1-b` |
| Date | 2026-09-12 |
| Lane / tier | full, tier 3 (Large 🔴) |
| Plan | [01-snapshot-hygiene.md](01-snapshot-hygiene.md) work item B, plus its item-B risk notes and the closing performance-capture section |
| Commit | `5787a3314` |
| Parent | `deb54b46f` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

`GameStateManager.lastGameObjectId` was written on every registration but never restored on rollback, so ids drifted upward forever across undos — persistent identity corruption for the save/load roadmap this plan serves. This unit restores the counter and arms the guard that makes doing so safe.

- `_isRollingBack` (dead boolean) replaced by `_rollbackDepth`, a re-entrancy counter, because `rollbackToSnapshot` re-enters itself on its recovery path and a boolean would be cleared by the inner frame's `finally` while the outer frame is still mid-rollback.
- `register()` hard-fails (`Contract.fail`, branch form to avoid allocating a message/closure on the hot path) if called while `_rollbackDepth !== 0`. A second branch in the same method hard-fails if `gameObjectMapping` already holds a live occupant for the id about to be assigned, so a wrong reuse is loud instead of silently overwriting a live object.
- `restoreLastGameObjectId(snapshot)` writes `_lastGameObjectId = snapshot.lastGameObjectId` as the last statement before `rollbackToSnapshot` returns `true`, after the `afterSetAllState` pass (restoring earlier would let a transient created during that pass consume an id a replayed object is owed). Asserts the snapshot value is present, an integer, and `<=` the live counter (rollback never moves forward).
- `withRegistrationGuardSuspended(handler)` zeroes the depth counter for the duration of `handler` and restores the exact prior depth afterward (not always 0, so a suspension inside the nested recovery frame leaves the outer frame's guard armed). Wraps all five game-facing calls that re-enter Game/Lobby/GameChat while a rollback is in progress: the two `reportSevereRollbackFailure` calls and the `addAlert` call inside `rollbackToSnapshot`, and the `reportError` call inside each of `get`'s and `getUnsafe`'s catch blocks (the latter two are genuinely reachable mid-rollback, since every `@stateRef`-family hydration calls back into `get`/`getUnsafe`).
- Comment above the `afterSetAllState` loop pins the ordering dependency the restore depends on: `updates` is reverse-registration order, so every `OngoingEffect.refreshContext()` runs before `OngoingEffectEngine.resolveEffects(true)`.
- `Game.cardClicked` gets a comment-only audit conclusion (see below); no behavior change.
- `test/server/core/ongoingEffects/OngoingEffectWrapperChurnUndo.spec.ts` (p1-a's spec): its assertion `lastGameObjectId` is unchanged across a rollback is exactly the invariant this unit inverts. Re-expressed on a mechanism that survives the restore: a counting wrapper over `register()` proves zero registrations during the rollback (independent of this unit's own implementation), and three assertions replace the old one — the fixture allocated between snapshot and rollback, the counter now equals the snapshot's own recorded value, and it moved backward from the pre-rollback value.
- New `test/scenarios/undo/GameObjectIdRestore.spec.ts`, three cases (below).

Net: 2 production files changed (`GameStateManager.ts`, `Game.ts` comment-only), 1 spec modified, 1 spec added, 2 performance-capture files added, `docs/plans/performance/README.md` and this log updated.

### Two required audits

**uuid-reuse audit (non-state-tracked structures outside the decorator system).** Enumerated every `.uuid`-keyed `Map`/`Record` under `server/`. `GameStateManager.gameObjectMapping` is the one structure both outside decorated state and maintained by rollback itself; this unit's occupancy check is what makes a wrong reuse loud. Everything else keyed by uuid is either in decorated state (out of scope by the plan, already covered by `Contract.assertDoesNotHaveKey` in one existing case) or owned by a prompt instance that `Game.postRollbackOperations` always rebuilds. Transient ids (`createWithoutRefsUnsafe`) are safely recycled: a transient is never inserted into `gameObjectMapping` and can never be the target of a `@stateRef`, so nothing can look one up by id. One pre-existing, out-of-scope hazard recorded rather than fixed: `removeUnusedGameObjects` drops still-alive-but-ref-less objects from both `allGameObjects` and `gameObjectMapping` while keeping their uuid string. Before this change, that was harmless in practice because the counter only ever grew, so a dropped id was never reissued and any stray lookup would simply miss. After the restore, a replayed object can legitimately take that same freed id, so `get(uuid)` can silently return a *different, live* object instead of failing loudly — a loud-to-silent transition against the standing "nothing degrades silently" invariant. Recorded rather than fixed because reachability stays low: it requires a `@stateRef` assigned to an object `removeUnusedGameObjects` already swept, which is a pre-existing dangling-reference bug on its own regardless of this unit's change.

**Client-protocol audit (outbound uuid payloads and inbound uuid-carrying commands).** Seven outbound payload sites carry a GameObject uuid; six are rebuilt from scratch on every `sendGameState` (prompt payloads, since `postRollbackOperations` rebuilds the pipeline). The seventh, `GameChat.messages` (via `GameObject.getShortSummary()`), is **not** part of `game.state`, is not serialised into any snapshot, and is not touched by rollback — a negative result the previous plan revision got wrong (it claimed everything was rebuilt from scratch). Consequence: a chat entry written between a snapshot and a rollback keeps a `getShortSummary()` uuid that a replayed object can now legitimately re-acquire, so client behavior keyed on that uuid (card preview on hover/click) could resolve to a different live card; the rendered text itself (`id`/`name`) is unaffected. Of the four inbound uuid-carrying commands, three (`menuButton`, `perCardMenuButton`, `statefulPromptResults`) are gated by a prompt v1 uuid and/or the prompt's own legal-target list, so a stale click on those is unreachable for a recycled id. `cardClicked(playerId, cardId)` is the one ungated path: `findAnyCardInAnyList` resolves a bare uuid with no prompt/sequence check. After this change a stale in-flight click (processed after a rollback) can resolve to a different, live card instead of to nothing, and if that card is legal for the current step, the step acts on it — a real input-fidelity defect, not merely cosmetic. It is bounded: the authority for whether a click does anything is always the current pipeline step's own legality re-check, never the uuid, so this can only misapply an action the clicking player was already entitled to take; it cannot be triggered by an opponent to act on the undoing player's behalf, and cannot occur *during* a rollback (`onGameMessage` runs to completion per message, synchronously). Both residuals (chat log, `cardClicked`) are recorded as deferred, owned by client protocol (separate repository), since a real fix needs a client-side action-sequence token on `cardClicked`'s wire format, which cannot be added unilaterally from this repo.

### Step 1 diagnostic probe results

- **1a (does rollback register anything today?).** Temporary counting/logging variant of the guard, `npm run test-parallel-undo`: 8049 specs, 0 failures, 15 pending — **zero registrations during rollback across the whole suite**. Confirms work item A's zero-allocation contract is reachable, as section 2 of the plan argued from source. Probe fully reverted before step 2.
- **1b (is replayed-uuid equality exact?).** Temporary restore-only line plus a scratch scenario (moment-of-peace shield token, replayed identically after `postRollbackOperations`): pre-rollback shield uuid `Card_271`, replayed shield uuid `Card_274` — **not exact, offset +3**, against a `counterAtSnapshot`/`counterBeforeRollback` window of 267/276. The fallback bound `counterAtSnapshot < replayedId <= counterBeforeRollback` held (267 < 274 <= 276). Per the plan, AC4b is therefore written as that bounded inequality, not exact equality, in `GameObjectIdRestore.spec.ts`. The driver is prompt-refresh sweep count (every `ActionWindow.continue()` → `highlightSelectableCards()` → `getSelectableCards()` sweep allocates a fresh, uncached play action per playable card through `register()`), not the number of transients per sweep — the post-rollback pipeline rebuild does not perform exactly the same number of sweeps the original run did. Probe fully reverted before step 2.

**Conclusion, not just a measurement: work item B's acceptance criterion (a) — recreated objects receive the same uuids — is NOT met.** The counter no longer drifts and the replayed id is bounded within the freed window, but uuid assignment across rollback+replay is not reproducible, because the post-rollback pipeline rebuild performs a different number of prompt-refresh sweeps than the original run. Criterion (b), zero registrations during rollback, is met. `docs/plans/01-snapshot-hygiene.md`'s work item B acceptance paragraph is annotated in place to the same effect, since that document (unlike this log) is committed and read by later plan authors.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0, no output |
| `npm run test-parallel` | 8237 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8050 specs, 0 failures, 16 pending |

Baselines at parent `deb54b46f` were 8234/0/13 and 8049/0/15. `test-parallel` rises by exactly 3 (the three new `it`s in `GameObjectIdRestore.spec.ts`, run under `it` semantics there). `test-parallel-undo` rises by exactly 1 pending and 1 spec count: the new spec's `describe` self-skips as a single "skipped in whole-suite undo mode" entry under `ENABLE_UNDO_ALL_TESTS=true`, the same mechanism every other `undoIntegration`-marked spec in this suite already uses. No pre-existing pending spec was activated, no regression.

All three `GameObjectIdRestore.spec.ts` cases and all three `OngoingEffectWrapperChurnUndo.spec.ts` cases were also run individually (`test-fast`) before the full gate, isolating them from parallel-worker interaction.

### Performance capture (required deliverable)

`npm run benchmark -- --name after-plan-01 --compare initial-performance`, committed as `docs/plans/performance/after-plan-01.{json,md}` with a README row.

**This capture ran on a different machine and Node version than `initial-performance`** (Ryzen 7 9850X3D / Node v24.13.0 vs i9-13900HX / Node v22.11.0), so per the README's own comparability rules the timing deltas below are directional only, not a same-machine/same-runtime comparison.

- `manager/rollbackTo(Manual)`, the row the plan specifically requires quantified: moved -12.9% (`compact-board`), -12.9% (`large-board`), -14.9% (`forty-cards-per-player`), -22.5% (`forty-cards-sparse-mutations`), -10.0% (`forty-cards-four-mutated`). No increase was observed in any scenario; the plan's expectation of a small increase from the added guard/restore work is not confirmed by this capture, but the cross-machine caveat above means this is not strong evidence either way — the underlying hardware/Node change is large enough to dominate a same-order-of-magnitude effect.
- `payload/fullSnapshotTotal`: +0.1% to +0.2% across all five scenarios — flat, no red flag.
- `manager/moveToNextTimepoint(Action)`: within the sub-20% noise band in four of five scenarios; `forty-cards-per-player` shows +12.0%, also inside the band. No investigation triggered.
- Memory/op on `manager/rollbackTo(Manual)` moved in both directions across scenarios (+15.2% `compact-board`, -4.1% to -9.8% elsewhere) — read as noise for the same cross-machine reason.

### Disclosed residuals (accepted, per plan section 10)

- **A guard violation halts the game unconditionally in production.** The throw escapes `rollbackToSnapshot` outside the inner try/catch, with no recovery, no counter restore, and no `postRollbackOperations`. The only empirical bound is suite coverage (~16k spec-runs across both gate commands) plus the source audit in plan section 2 — not a proof it cannot happen in a live game. Accepted because a silently drifted id counter corrupts persistent identity for every later save, which is worse than a loud halt, and the branch is `experimental/rollback-saves-optimizations` under `LIFECYCLE=local`.
- **AC3 (the occupancy check) has no positive falsifier.** Its only reachable trigger is a bug the rest of this change is designed to prevent; manufacturing a collision would mean faking `gameObjectMapping`, testing the mock rather than the engine. Its real control is the two full suites with the check armed.
- **AC5 is only partly falsifiable.** `GameObjectIdRestore.spec.ts` test 3 covers the `:183` site (`reportSevereRollbackFailure` on the inner-try failure path) with a synthetic reporter and would fail if `withRegistrationGuardSuspended` were wired to a pass-through no-op. The other four suspension sites (`addAlert`, the recovery-failure `reportSevereRollbackFailure`, and `get`'s/`getUnsafe`'s `reportError`) stay inspection-only: the harness stubs `pushUpdate` to `() => true`, so no spec exercises the production reporting path, and per the corrected client-protocol audit that path allocates nothing today anyway, so a spec installing a real `pushUpdate` still could not distinguish a present suspension from an absent one at those sites.
- **`cardClicked` and the chat-log uuid exposure** — see the client-protocol audit above; both deferred to a separate-repository owner.

### Notes

- `_lastGameObjectId` starts at `-1`, so the first id is `0`; the restore is exact equality against the snapshot's recorded value, never an offset.
- `Contract.assertDoesNotHaveKey` has no lazy-message overload and `Contract.assertNotNullLikeOrNan` drops the caller's message on its null branch — both are why the two hot-path guards in `register()` are written as `if (...) { Contract.fail(...) }` rather than an assert call.
- The uuid-prefix-diff technique `P1-A`'s log entry flagged as usable for accounting allocations does not apply to counting registrations during a rollback (a class-name diff would not distinguish "class already seen" from "class registered this seam"); this unit instead counts calls to `register()` directly with a temporary wrapper, in both the modified and new specs.

### Deferred, with reasons

- Client-side action-sequence token for `cardClicked`, and any client behavior keyed on a chat-entry uuid — owner: client protocol (separate repository).
- Plan 5's rehydration-scope carve-out for the guard — owner: Plan 5, explicitly not this unit. The guard lands unconditional here.
- The `removeUnusedGameObjects` dropped-but-alive object hazard (uuid-reuse audit) — pre-existing, recorded, not fixed.

---

## `P2-B` — JSON-safety dev assertion (Plan 2, work item B)

| | |
|---|---|
| Task ID | `p2-b` |
| Date | 2026-09-13 |
| Lane / tier | fast, tier 1 (Small 🟡) |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item B |
| Parent | `2f0568431` |
| Commit | _(filled in after commit)_ |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

A dev-mode assertion that `@stateValue` payloads stay JSON-representable, plus the one-line change that makes dev-mode assertions actually run at all.

- `server/game/core/GameObjectUtils.ts`: new `assertJsonSafeStateValue`, called from `stateValue()`'s `set` and `init` behind `Helpers.isDevelopment()`. Accepts `null`/`undefined`, `string`, `boolean`, **finite** numbers, plain objects, arrays, and `Map`/`Set` (recursing into all of them). Rejects functions, symbols, bigints, non-finite numbers, foreign-prototype class instances, `GameObjectBase` instances (with a message pointing at `GameObjectId`/`getObjectId()`), and circular references. `Map` keys must be `string`. A `GameObjectId` is a branded `string` at runtime, so it passes the string check with no brand detection — per the plan, `GameObjectId`s are legal *in engine state*; only save *files* ban them, which is work item A2's problem.
- `server/game/core/utils/Helpers.ts`: `isDevelopment()` now memoizes **lazily, on first call** instead of eagerly at module load. This is the load-bearing change — see below.
- `test/helpers/IntegrationHelper.js`: `process.env.ENVIRONMENT ??= 'development'` at module scope, so gate activation is deterministic rather than dependent on which spec constructs the first `Game` in a worker.
- `test/server/core/GameObjectUtils.spec.ts` (new): 19 specs — the validator's accept/reject contract, and three that drive the real decorator `set`/`init` wiring through purpose-built fixtures.

Net: 350 insertions, 3 deletions across 4 files.

### The dev gate was dead code, in every environment

The assertion this unit was asked for is gated on `Helpers.isDevelopment()`, and review established that the gate could never be true. `isDevelopment()` read `process.env.ENVIRONMENT === 'development'` into a module-level `const` **at module load**, and in every reachable process that load happened before anything set the variable: the jasmine harness set it in a `beforeEach` (`IntegrationHelper.js:66`), and `npm run dev` loads `Helpers.js` before `server/env.ts` runs `dotenv.config()`. Production was correct only by accident of `Dockerfile:13` setting a real env var.

So the pre-existing `StateWatcher.addUpdater` check — the very check this unit was modelled on — had been inert since it was written, and a new check wired the same way would have shipped equally inert. **Shipping it that way was offered and explicitly rejected by the repo owner**, who chose to fix the flag as part of this unit. That is why `Helpers.ts` is in a unit whose plan text names only the decorator layer.

Lazy memoization (`_isDevelopment ??= ...`) rather than a per-call `process.env` read is deliberate: `copyState`'s `stateSimpleMetadata` loop re-enters every `@stateValue` `set` accessor on **every rollback**, so a per-call env lookup would land on the exact hot path this roadmap is optimizing.

Consequence to be aware of: `StateWatcher.addUpdater`'s check is now live for the first time. Both gating suites pass with it armed, so no watcher registration in the repo violates it today.

### Two defects caught by review, both real

- **A require-time crash.** The first implementation used `instanceof GameObjectBase`, which needed a value import — but `GameObjectBase.ts` imports back from `GameObjectUtils` and runs `@registerStateBase` as a decorator *at module evaluation*. That cycle made `require('build/server/game/core/GameObjectUtils.js')`, `cards/Index.js`, and `utils/deck/DeckValidator.js` all die with `ReferenceError: Cannot access 'stateMetadata' before initialization`. It was invisible to the suite purely because `GameServer.ts` happens to import `Lobby` before `DeckValidator`. Fixed by restoring the type-only import and detecting a `GameObjectBase` structurally (`typeof value.getObjectId === 'function'`); the `instanceof` only ever affected the error message, never the accept/reject decision, since a `GameObjectBase` hits the foreign-prototype branch regardless.
- **A flake introduced by the fix for the above.** Lazy memoization means the first caller in a process pins the value, and three specs construct a real `Game` outside `IntegrationHelper`'s `beforeEach` (`ongoingEffects/DynamicOngoingEffectValueWrapper`, `GainKeywordNormalization`, `OngoingEffectContextCaching`). If one led a jasmine worker it pinned the gate off for ~500 following specs. Reproduced directly: that ordering gave `28 specs, 2 failures`. Fixed at module scope in the helper, since jasmine loads `helpers/` once per worker before dispatching any spec file — a module-scope line in a *spec* file would not work, because spec files load only when dispatched.

### Known gaps, stated rather than closed

- **State-watcher entries.** `StateWatcher` writes entries straight into the state bag with no `@stateValue` accessor (`StateWatcher.ts:51,66,142`), so this assertion never sees watcher payloads, `Set<Trait>` members included. Plan 3 Phase A step 0 migrates them and Plan 3's step 2 encoder is deliberately the first enforcement. The plan explicitly says not to extend this check into the bag, and it was not extended.
- **In-place `Map`/`Set` mutation during normal play.** The check runs on `set`/`init`, so `AbilityLimit.useCount.set(...)` and the equivalents in `GainAbility` / `GainNonKeywordAbilitiesFromUnitEffect` are not validated at mutation time. Rollback *does* re-validate them, because `copyState` re-enters the `set` accessor with the full snapshot-time value, and `StateWatcher` is the only class using `CopyMode.UseBulkCopy` (which skips that loop) — so the gap is real only for non-rollback play. Documented in the validator's JSDoc; closing it would mean routing those fields through `UndoMap`/`UndoSet`, which is Plan 3 work.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run build` (server + test tsc + card json) | exit 0 |
| `npm run test-parallel` | 8256 specs, 0 failures, 13 pending (35.3s) |
| `npm run test-parallel-undo` | 8069 specs, 0 failures, 16 pending (51.4s) |
| Module-load probes | `GameObjectUtils.js`, `cards/Index.js`, `DeckValidator.js` all load clean |
| P2B-06 ordering repro | `28 specs, 0 failures` (was 28/2) |

Baselines at parent `2f0568431` were 8237/0/13 and 8050/0/16. `test-parallel` rises by 19 (the new spec file) and `test-parallel-undo` by 19 for the same reason. No pre-existing spec changed state, and the timings are flat against pre-change baselines, so arming both dev checks costs nothing measurable.

Three cold reviews: round 1 REJECTED (1 blocking, 4 warnings), round 2 APPROVED WITH CONCERNS (1 warning, introduced by the round-1 repair), round 3 APPROVED (0 blocking, 0 warnings, 1 informational nit). The round-1 blocking crash and the round-2 flake were each independently reproduced by the orchestrator before being accepted as real.

### Out of scope, deliberately

- Work items A, A2, C, D, E of Plan 2. No save-format code was written.
- The Plan 2 performance capture, which unit `P2-E` owns. `npm run benchmark` was not run.
- `isSnapshotSafeOngoingEffectValue` and its caller in `DynamicOngoingEffectImpl.ts` — unrelated machinery enforcing *structured-clone* safety for wrapper selection, not JSON safety. The new check is a separate function on purpose: it accepts `Map`/`Set` (which that one rejects) and rejects non-finite numbers (which that one allows, since `v8.serialize` round-trips them).

### Deferred, with reasons

- `test/helpers/IntegrationHelper.js:66`'s `beforeEach` assignment of `ENVIRONMENT` is now vestigial — the module-scope line resolves the memo before it can ever run. Harmless (both paths yield `development`), left in place rather than widening this unit's test-helper footprint further. Worth removing in a later pass.
- Non-string `Map` keys are now rejected, which is stricter than the plan's literal wording. No live field is affected (all four `@stateValue` maps are `Map<string, …>`), and it makes Plan 3's encoder contract well-defined.

### Notes

`npm run build` alone does **not** refresh `build/test/**`, including plain-`.js` helpers like `IntegrationHelper.js` — `scripts/build-server.js` never touches it. Rebuilding test-side changes needs `npx tsc -p ./test/tsconfig.json` (which has `allowJs: true`). A stale build here produces a *false* spec failure, which cost one verification round in this unit.

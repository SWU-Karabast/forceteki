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

**Corrected after the fact.** This entry originally read the `--compare initial-performance` section as evidence that Plan 1 cut undo latency by -10% to -22%, with a caveat that the comparison was cross-machine. The caveat was right and the reading was wrong. A control run at `26c1a8391`, which is the direct child of `initial-performance`'s commit and adds no engine code, reproduces most of that movement on the machine change alone — the hardware and Node version, not this work. The paragraphs below are rewritten against `pre-roadmap-baseline`, a same-machine, same-Node capture at `3dcaecdb0`, the direct parent of this plan's first commit. See the [capture index](performance/README.md) for the full account. The original cross-machine numbers are preserved in `after-plan-01.md`'s own comparison section, which is generated and was not touched.

- `manager/rollbackTo(Manual)`, the row the plan specifically requires quantified: against `pre-roadmap-baseline` it moved -9.3% (`compact-board`), -4.6% (`forty-cards-four-mutated`), -2.3% (`forty-cards-per-player`), -3.2% (`forty-cards-sparse-mutations`), -6.0% (`large-board`). All five sit inside the min-to-max range of the baseline's own six replicate runs of identical code, and an independent six-run arm at `5787a3314` puts the median across all 30 timing rows at +0.1%. **The honest statement is that Plan 1's effect on undo latency is not measurable at this sample size** — the movement is in the improving direction but is several times smaller than the -10% to -22% first claimed, and smaller than the noise. The plan's expectation of a small increase from the added guard/restore work is neither confirmed nor refuted: the measured noise floor on a single timing row is about ±18%, wider than any effect the added work could plausibly have.
- `payload/fullSnapshotTotal`: 0.0% across all five scenarios against `pre-roadmap-baseline`. Payload is deterministic to within 0.3% run-to-run, so this one can be read at face value — Plan 1 added no bytes.
- `manager/moveToNextTimepoint(Action)`: nothing outside the noise floor in any scenario. No investigation triggered.
- **Memory is where Plan 1 actually shows up, and it replicates.** Memory/op on `manager/rollbackTo(Manual)` fell 4.9% to 6.9% in four of the five scenarios, and `sustained/snapshotAndUndoCycle` memory/op fell 11% to 37% in all five. Memory rows have a run-to-run spread of about 1.5%, so a consistent 5-7% is well clear of noise, and the replicate arm reproduces it. The exception is `compact-board`'s rollback row, which is the noisiest of the memory rows (10-12% spread) and lands at -0.1% here and -2.4% in the replicate arm; it neither confirms nor contradicts the other four. The earlier reading of this row as bidirectional noise was itself an artifact of comparing across machines.
- The capture was taken at `deb54b46f`, one engine commit short of the end of Plan 1. `after-plan-01-replicate` closes that gap at `5787a3314` and agrees.

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
| Commit | `1e2e7d631` |
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

---

## `P2-A` — `ISavedMatch` schema + `MatchSerializer` writer + `engineOnlyFacts` manifest (Plan 2, work item A)

| | |
|---|---|
| Task ID | `p2-a` |
| Date | 2026-09-13 |
| Lane / tier | full, tier 3 (Large 🟡) |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item A |
| Parent | `1e2e7d631` |
| Commit | `b99e7fc65` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

A new `server/game/core/stateSerialization/` subsystem that walks a live `Game` and emits a JSON-safe `ISavedMatch` document for attaching to a bug report, plus ten additive engine accessors. No existing execution path changed; the writer has no production caller in this unit by design (`P2-D` is the declared future caller).

- `SavedMatchInterfaces.ts` — the `ISavedMatch` contract, `SAVED_MATCH_FORMAT_VERSION = 1`, and `SaveIntegrityError`.
- `MatchSerializer.ts` — `save(game, options?)`, synchronous, in three ordered phases (detect unsupported state, walk positions, resolve refs and classify). Deliberately **not** built on `Game.captureGameState`, which truncates the deck to five cards and drops limits and effects.
- `EngineOnlyFacts.ts` — the degrade-with-manifest classifier.
- `AbilityLimitSerializer.ts`, `SharedAbilitySurface.ts` — per-copy ability limits, and the single shared definition of which abilities this unit walks.
- `PristineAbilityIdentifiers.ts` — the `Card.nextAbilityIdx` coordinate guard and its isolation scope.
- `SavedCardRefResolver.ts`, `ChatScrubber.ts` — in-file `(seat, zone, ordinal)` coordinates, and uuid/user-id-free chat.

Net: 20 files, 2605 insertions, 7 deletions. `stateWatchers` ships `[]` with a `TODO(P2-A2)`; the `watcherEntry` manifest stubs are present so the drop is enumerated rather than silent.

### Re-derivability is decided structurally, and that took four plan reviews to get right

The writer must distinguish an ongoing effect that will be **re-created at load** (say nothing) from one that is **genuinely lost** (enumerate it in `engineOnlyFacts`). Three consecutive plan reviews each found the same shape of defect: the predicate enumerated the ability lists that register effects, and each review found one more list it had missed — the card scan itself, then `_pilotingConstantAbilities` and `_whileInPlayKeywordAbilities`, then `addGainedConstantAbility`'s second registration. Each fix was correct; the method was what kept failing.

The repo owner authorized a fourth round on the condition that the method change, not the predicate. The result **deletes** the enumeration rather than extending it:

> An effect that is `duration === Duration.Persistent && !ongoingEffect.isLastingEffect`, reached after the delayed rules, was registered by a `ConstantAbility` and is re-derivable.

This holds because every `ConstantAbility` sets `Duration.Persistent` in its constructor (`ConstantAbility.ts:79`), and `isEffectActive()` (`OngoingEffect.ts:152-173`) *already* requires `source.getConstantAbilities().some((a) => a.registeredEffects?.includes(this))` for exactly that class of effect — which rule 0 has already demanded. The rule is a corollary of the engine's own liveness check, not a new claim. The delayed class is closed separately, by rule 1's precedence: every effect reachable through `OngoingEffectSource.persistent()` carries `impl.type === EffectName.DelayedEffect`.

The enumeration obligation now lives in `UnitProperties.getConstantAbilities()`, where the engine must keep it correct for its own predicate. A registering list someone forgets to add there produces an effect the engine itself treats as dead — so the serializer stays right, and the failure mode becomes "the engine is broken for everyone" rather than "the save is silently wrong." Deleting the three-list union also removed the two accessors it needed.

### The coordinate guard must not mutate the match it is saving

`Card.nextAbilityIdx` is private, so the only way to check that an emitted `abilityIdentifier` is real is to construct a pristine instance of the card class and compare. Against a live `Game` that is dangerous: construction registers with `gameObjectManager`, registers state watchers, adds `game.on(...)` limit listeners, and — the hazard the plan originally missed — registers ongoing effects into the live engine for any constant ability with `sourceZoneFilter: WildcardZoneName.Any` (~44 card files, plus every `EventCard`).

That last one fails silently at write time and surfaces later: the phantom effect holds a uuid absent from `gameObjectMapping`, and `GameStateManager.get` does not return null for an unregistered uuid — it reports `SevereHaltGame` and rethrows. Taking a save would have halted the next undo.

The derivation therefore runs inside one non-nesting `createWithoutRefsUnsafe` handler with a plain recording stand-in swapped in for `game.stateWatcherRegistrar`, and tears down all four hazards — each step independently guarded so a throw in one cannot skip the others, with the registrar restore unconditional beneath them. Two falsifier specs prove the teardown: they were confirmed by reverting the fix, watching them fail, and restoring it.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run test-parallel` | 8386 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8199 specs, 0 failures, 16 pending |
| `npm run validate-cards` | 1983 files, 2 exempt |

Baselines at parent `1e2e7d631` were 8256/0/13 and 8069/0/16; both suites rise by exactly 130, the number of new `it`s. Four plan reviews (REJECTED three times, then APPROVED WITH CONCERNS), a three-lens implementation fan-out (0 blocking), two fix cycles and three confirming delta reviews.

### Known gaps, stated rather than closed

- **AC11's card-pool sweep is a seeded sample, not exhaustive.** Measured coverage this run: ground units 48/865, space units 24/306, events 40/428, leaders 16/171, bases 16/40, upgrades 24/161, pilot-attach 16/32. Per-partition attach floors are asserted (upgrades 0.6 against a measured 0.729; pilot-attach 0.8 against 1.000) and fail the spec when breached. The limiting factor was modelling upgrade `attachCondition`s for host selection, not runtime — the sample runs in about 1.2s.
- **The sweep cannot detect a dropped ability limit.** A dropped limit produces no manifest fact, so an empty manifest stays empty. A reachability assertion covers the ability *surface* instead: every ability carrying a non-`UnlimitedAbilityLimit` limit must be reachable by the writer's shared surface. That is what `PoeDameronICanFlyAnything`'s piloting `perRound(1)` violated before this unit widened the walk.
- **A teardown failure can mask a concurrent derivation failure.** Standard `try { throw A } finally { throw B }` semantics: the teardown rethrow supersedes the body's error. Pre-existing, requires two simultaneous currently-unreachable failures, and the registrar restore — the invariant that protects live-game correctness — is sound in every case.
- **`AbilityHelper.limit.perGame(...)` is reachable nowhere on the writer's ability surface today.** Both call sites (`JabbaTheHuttCrimeBoss.ts:50`, `ShienFlurry.ts:45`) feed `delayedCardEffect`, whose limit lands on the ongoing effect's factory props and is read only by `OngoingEffectEngine.checkDelayedEffects` — never becoming a `CardAbility`. The `ISavedPerGameAbilityLimit` schema branch is therefore exercised by a runtime `.limit` swap rather than by a real card. Worth knowing for Plan 6 or any future reviewer citing a "reachable `PerGameAbilityLimit`" card.
- **Gained-ability use counts are not durable** across save/load and are enumerated rather than preserved; `gained_from_<id>` is not a safe key (the engine carries its own TODO saying so). Plan 6 territory.
- **`cardDataVersion` has no runtime source** and defaults to `null`; owner `P2-D`.
- **The pristine derivation advances `_lastGameObjectId`** — by every `GameObjectBase` allocated during construction, not one per card. Benign against `P1-B`'s backwards-only restore rule (the ids never occupy a mapping slot), monotonic, and asserted as such rather than as a fixed count.

### Out of scope, deliberately

Work items A2 (watcher entry encoding), C (loader), D (server plumbing and the armed save trigger), and E (verification suite and degradation measurement). `npm run benchmark` was not run; `P2-E` owns the Plan 2 capture.

### Notes for the next agent

- `node scripts/build-test.js` invoked directly fails in a sandboxed shell (`concurrently` is not resolvable outside an `npm run` context). Use the npm scripts.
- Direct `npx jasmine build/test/<file>.spec.js` fails with `TypeError: Class extends value undefined is not a constructor` even against a freshly built tree — a module-registration-order problem distinct from the documented stale-build trap. Use `npm run jasmine -- --filter="<Name>"`, which loads through `jasmine.json`'s configured helpers.
- A substring-style leak assertion must exclude timestamp fields. A short numeric test player id (`"222"`) collided with digits inside an ISO timestamp's milliseconds and produced a real intermittent failure before the scan was scoped to message content.
- `test/helpers/DeckBuilder`'s `upgrades: [...]` setup path does not exclude token upgrades the way arena-unit setup does; naming `shield` or `experience` there fails deep in deck construction with an opaque "Card undefined not found in card map".

---

## `P2-A2` — State-watcher entry encoding (Plan 2, work item A2)

| | |
|---|---|
| Task ID | `p2-a2` |
| Date | 2026-09-13 |
| Lane / tier | full, tier 4 (Large 🔴), proof level hardened |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item A2 |
| Parent | `3500a4516` |
| Commit | `b37ce5e8c` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

The `stateWatchers` section `P2-A` left as `TODO(P2-A2)` is now populated. All 15 watcher entry structs under `server/game/stateWatchers/` have a saved shape, mapped row for row, with every `GameObjectId` replaced by an `ISavedCardRef` or a seat string and every runtime counter replaced by an encoded form.

- `SavedMatchInterfaces.ts` — 15 entry interfaces, `ISavedStintRef`, `ISavedCounterOrdinal`, `ISavedTaggedSet`, `ISavedLastKnownInformation`, `PRIOR_STINT_ID`, and a `ISavedStateWatcherSection` union discriminated on `watcher`. `ISavedCardRef.parent` gains `seat`; `SavedRefZone` gains `forceToken` and `creditTokens`.
- `WatcherEntryEncoding.ts` — the shared primitives, including the three loader-facing pure functions `resolveStintId`, `mintCounterId` and `deriveCounterSpaceSizes`.
- `StateWatcherSerializer.ts` — one encoder per watcher behind a registry mapped over `StateWatcherName`, which pins each encoder to its own key's entry shape, and `serializeStateWatchers`.
- `SavedCardRefResolver.ts` — a uuid-keyed index and `tryLookupByUuid`. Every ref handed out is a fresh copy, so no two document positions alias one object.
- `StateWatcher.rawEntries` — the unmapped read the writer needs.
- `EngineOnlyFacts.buildWatcherEntryFacts` is removed; `watcherEntry` now means one dropped entry, not one unencoded watcher.

### Durable decisions, with their re-check conditions

**An in-play id is published as a relation, never a number.** Each stint field encodes `'live' | 'prior' | null` against its own referent's live comparison key, and the loader resolves `'live'` back to the loaded card's key. The alternative — writing the raw number and having the loader reproduce it — needs the loader to control `_mostRecentInPlayId` exactly, which it cannot while `P2-C1` is unlanded. The published invariant is `entry.inPlayId === liveStintKey(loadedCard)` and it names no specific number on purpose: **a deck-origin card is already at `0` before it is ever played, not `-1`** (`ZoneName.Deck` is hidden and `DeckZone.initializeDeck` calls `initializeZone` with no previous zone, so the visible-to-hidden branch fires once during construction). Re-check if `P2-C1` changes injection so an injected card's `_mostRecentInPlayId` is not what `liveStintKey` returns for it.

**`PRIOR_STINT_ID = -2`.** `_mostRecentInPlayId` is initialised `-1` and only ever incremented (both mutation sites are `+= 1`), so `-2` is below every past and future key of every card. The argument depends on that global minimum alone. Re-check only if an initialiser or a decrement appears.

**Live-comparison counters are minted from a strictly negative, order-preserving range.** The writer emits dense save-local ordinals into two document-scoped spaces (game-event ids; attack ids); the loader maps ordinal `i` of a space of size `n` to `i - n`. Both live generators only ever produce values `>= 0`, so no minted id can collide with one. The spaces are document-scoped rather than per-watcher because `AttackEntry.attackId` and `DamageDealtEntry.activeAttackId` come from one generator and are compared against each other. `spaceSize` is not published as a field; it is derived by `deriveCounterSpaceSizes(document)`, which ships alongside `mintCounterId` for the same reason `resolveStintId` does. **`mintCounterId`'s `ordinal >= spaceSize` guard is not what makes the derivation safe** — it fires only when the supplied size falls below an ordinal in the section being decoded, which an under-derived size need not do. Two attacks where only the first deals damage is the counterexample: a per-section derivation gives the damage section size 1, mints its entry to `-1`, and points it at the *second* attack with no error raised. Shipping the derivation is what closes that, not the guard. Which members share a space is declared once, in `counterSpaceMembers`, and **both halves read it**: the writer's `CounterSpaces.record` resolves its space through `spaceOf(watcher, key)` rather than taking a space argument, and refuses the document if a recording member has no row. The alternative — the writer naming its space at the call site and the table serving only the loader — was what the first implementation did, and it made the table's "single source of truth" claim false: a fourth member could join a space on the writer side while the loader under-derived it, mis-grouping every surviving member of that space with no error. Re-check if a member joins either space: the table row is now mandatory, but the row's *space* is still a human judgement.

**A base-zone Force or Credit token gets a referent coordinate.** `hasTheForce`/`creditTokens` stay the canonical representation — the tokens are not emitted as document members — but `{ zone: 'forceToken', ordinal: 0 }` and `{ zone: 'creditTokens', ordinal: k }` name them so a watcher entry can resolve. Without this, `CreateForceTokenSystem` and `CreateCreditTokenSystem` (both `OnTokensCreated` + `moveTo(ZoneName.Base)`) made every `tokensCreatedThisPhase` entry drop on an ordinary play path, costing `TheClientPleaseLowerYourBlaster` and `JarJarBinksBombadGeneral` an ability after a load. Credit tokens are interchangeable, so the ordinal is a position rather than an identity. The alternative — emitting these tokens as real document members with their own array, the way arena cards are — was rejected because it publishes two representations of one fact (`creditTokens: 3` and a three-element array) that a loader would have to reconcile, for tokens that carry no state of their own. Re-check when a base-zone token acquires distinguishing per-token state — damage, an attachment, or a per-token flag — at which point the count is no longer lossless and these tokens need emitted positions rather than synthesised coordinates.

**`ISavedCardRef.parent.seat`.** The nested coordinate was ambiguous: `parent.zone`/`parent.ordinal` index into the *parent's* controller's arrays, while `controllerSeat` is the nested card's own. `AttachUpgradeSystem.getFinalController` and `TakeControlOfUnitSystem` (which re-controls only *token* upgrades) both produce the mismatch.

**`formatVersion` stays at `1`.** Lifecycle is dev and the format has no producer outside tests, so a shape change replaces version 1 in place rather than bumping. The exemption is written into the constant's own doc comment and ends at the first save produced outside a test (`P2-D`).

**Set payloads are serialized, not dropped.** The three `Set<Trait>` payloads encode as `{ "$set": [...] }` with members sorted lexicographically, matching Plan 3's tag. Sorting rather than preserving insertion order makes the document diff-stable and makes a round-trip property independent of how the loader materialises the Set.

**Sections are emitted in `StateWatcherName` declaration order**, not registration order, so the document does not vary with which card happened to register a watcher first. A watcher with no surviving entry emits no section: absent and empty mean the same thing and absent is the smaller canonical form.

### Five engine findings, published rather than fixed

Three are watcher updaters reading a property their source object does not have; the fourth is a member declared mandatory that the event does not always carry; the fifth is a damage type with no updater branch. Repairing any of them changes live watcher semantics and belongs to a card-behaviour unit.

1. `AttackEntry.targetInPlayId` reads `event.attack.targetInPlayId`; `Attack` exposes `targetInPlayMap`. Always `undefined`. Published as an always-`null` schema member.
2. `DefeatedCardEntry.wasDefeatedWhileAttacking` was **declared** `IDefeatSource` but holds the boolean `event.isDefeatedWhileAttacking`, and its only consumer uses it as a truthiness test. The declared type is corrected here — type-only, no runtime effect — because the serializer cannot honestly type its input otherwise.
3. `DamageDealtEntry.damageSourceEventId` reads `event.damageSource.eventId`; no variant of `IDamageSource` declares it. Always `undefined`, and unlike (1) it has no consumer. Published as an always-`null` schema member.
4. `DamageDealtEntry.isIndirect` is declared `boolean` but copies `event.isIndirect`, which combat and overwhelm damage events never set — observed absent on every combat damage entry. Published as `boolean | null`. `damageSourcePlayer` and `targetController` are the same story in weaker form: the updater writes both through an optional chain, so both are published `string | null` while every other seat member in the section is non-null.
5. `DamageDealtThisPhaseWatcher`'s updater branches on `DamageType.Combat`, `Overwhelm` and `Ability` only. `DamageType.Excess` — reachable through `BlizzardAssaultAtat` and `WipeThemOut` — falls through all three, so such an entry carries no sources and no targets. The saved shape publishes it faithfully: `damageSourceCards: []` and `targets: []` are a legal, reachable shape rather than corruption, and both declarations now say so, because a loader told to hard-fail on schema violations would otherwise be right to reject the document.

The two always-`null` members are held by an exact `toBeNull` assertion, not by their declared type: `tsconfig.json` enables neither `strict` nor `strictNullChecks`, so a passed-through `undefined` would type-check against a `null`-typed member. Both also carry a dev-mode tripwire on the *raw* field, so repairing either engine bug surfaces immediately instead of leaving the writer quietly emitting `null` forever. That tripwire **reports** through `Game.reportError` at `Normal` severity rather than throwing: a save is a bug-report artifact and must degrade, never halt, and an assertion here would mean that repairing one of these engine bugs makes every dev `save()` on a board with an attack or damage entry fail outright. `Lobby.handleError` logs a `Normal` report and leaves the game alone, so the document is still produced; the test harness's router spy rethrows every reported error, so the same note fails the suite instead, which is the wanted outcome there. Notes are deduplicated per save, because `Lobby` escalates to `SevereHaltGame` once one request exceeds its error ceiling and a board can hold many attack entries. It deliberately does not emit an `engineOnlyFacts` entry either — `watcherEntry` means one dropped entry and nothing else, and `P2-C2` may rely on that.

### Nullability is a published contract in both directions

A `stateWatchers` member declared without `| null` is guaranteed present; a `null` there is a schema violation a consumer may hard-fail on. Where the live struct marks a member mandatory but the value is absent, the writer **drops the whole entry** and enumerates it as a `watcherEntry` fact rather than widening the member. Where the live struct marks it optional, the document declares `| null` and `null` means absent. Six members are declared `| null` although their live member is *not* optional — `attackerAttributes`, both `lastKnownInformation` members, and `damageSourcePlayer`, `targetController` and `isIndirect` — and each carries its own note saying why; in all six `null` still means absent, never degraded. Every `| null` in the section names what produces it. The one path that previously widened silently — a non-`Set` traits payload encoding to `null` with no fact — now routes through the same drop-and-enumerate channel, so there is exactly one degraded outcome in the section and it is always enumerated.

### The writer never reaches the game object manager

`StateWatcher.getCurrentValue()` maps every id through `Game.getFromId`, which reports `SevereHaltGame` and rethrows for an id whose object no longer exists. A save is a bug-report artifact and must degrade, never halt. Every referent is therefore resolved from the writer's own position index, keyed by `card.uuid` — the plain getter, not `getObjectId()`, which calls `markReferenced` and would give the read-only writer a side effect. An entry whose *present* referent occupies no emitted position is dropped and enumerated as exactly one `watcherEntry` fact naming the watcher, the entry index and the offending field; an *absent* optional reference is `null` and is not degradation. The reachable producer is a token removed from the game: `AsToken.removeFromGame` nulls `zone` but leaves the object registered.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run validate-cards` | exit 0 |
| `npm run test-parallel` | 8407 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8220 specs, 0 failures, 16 pending |

Baselines at `3500a4516` were 8386/0/13 and 8199/0/16; both suites rise by exactly 21, the number of new `it`s. `npm run benchmark` was **not** run — `P2-E` owns the Plan 2 capture.

### Out of scope, deliberately

Work items C (loader, headless prompt driver, `P2-C1` injection helpers), D (server plumbing), and E (verification suite). `resolveStintId` and `mintCounterId` ship here because the stint/sentinel and ordinal/mint pairs are only meaningful defined together, but they are pure, `Game`-free functions — the published contract, not a loader.

### Notes for the next agent

- A unit cannot attack on the turn it is played, so a spec that needs an attacker with a superseded stint must place it on the board at setup, bounce it, and replay it — not play it and attack in one turn.
- `Sentinel` makes its unit the only legal attack target; a fixture with a Pyke Sentinel on the defending board forces every attack onto it.
- `game.actionNumber` is incremented *after* an attack's watcher entry records it, so an entry's `actionNumber` is one below the post-action live value. Comparing a published value against the live `rawEntries` value is the reliable "preserved verbatim" oracle.
- `CounterSpaces` stages recorded values per entry and commits only on survival, so a dropped entry's raw value never enters a space. This is tidiness, not correctness: committing it would make the space *sparser*, not wrong, since `spaceSize = max(ordinal) + 1` still satisfies `ordinal < spaceSize` and every minted id stays negative and order-preserving.
- A watcher entry can reference a Force or Credit token in the base zone. Nothing else in the document indexes those, so they need their own zone names; see the durable decision above.
- **For `P2-C2` and `P2-E`: the `null`/`undefined` mapping is not symmetric.** The live watcher structs carry `undefined` for absent optional members while the document must carry `null`. A document-to-document round-trip property is unaffected; a property that compares reconstructed *live* entries needs the loader to write `undefined` where the document says `null`, or it fails on every optional member.

---

## `P2-C1` — Headless setup runner + engine-side state injection (Plan 2, work item C, steps 3–4)

| | |
|---|---|
| Task ID | `p2-c1` |
| Date | 2026-09-14 |
| Lane / tier | full, tier 3 (Large 🟡), proof level standard |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item C steps 3 and 4; [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md) unit `P2-C1` |
| Parent | `a9e77897f` |
| Commit | `841c46cb8` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

Two pieces of logic that previously existed only under `test/helpers/` are now supported engine code under `server/game/core/stateSerialization/`:

- `ScriptedSetupRunner.ts` — answers the three setup-phase prompts (initiative, mulligan, resource) through the same public entry points the client uses (`Game.menuButton`, `Game.cardClicked`, `Game.continue`), identified by engine prompt type/class, never by title text.
- `GameStateInjector.ts` — free functions for placing cards into zones and setting per-card state: `moveAllNonBaseZonesToStaging`, `setHand`/`setDeck`/`setDiscard`/`setResources`, `setOutsideTheGame` + `assertStagingZoneMatches`, `setArenaUnits`, `attachUpgrade`/`captureCard`, `setLeaderStatus` + `markLeaderDeployUsed`, `setBaseStatus`, `setHasTheForce`, `setCreditTokenCount`, `setMostRecentInPlayId`, and the token-name table (`isTokenUnitName`/`isTokenUpgradeName`/`isTokenCardName`/`resolveTokenName`/`generateToken`).
- `InPlayCard.setMostRecentInPlayIdForStateInjection` — a public write path for `_mostRecentInPlayId`, guarded by exactly the `mostRecentInPlayId` getter's predicate.
- `Damage.setDamageForStateInjection` — a public, non-clamping write path for `damage`, added to `ICardWithDamageProperty`.
- `Card.setZoneForStateInjectionBatch` — a narrow, undocumented-elsewhere addition (see Deviations below): raw zone re-parenting for the bulk "move everything to staging" operation only, bypassing the per-card move pipeline's event/re-init overhead.
- The `menuButton` handler chain and `IButton.arg` are now `PromptButtonArg = string | number` (`PromptInterfaces.ts` and 18 more files), correcting a declaration that has been wrong since `HandlerMenuPrompt` started emitting numeric args; the `perCardMenuButton` chain is untouched (no numeric producer).
- `PlayerInteractionWrapper.ts`, `GameFlowWrapper.js` and `Util.js` are reduced to call the injector/runner instead of doing the mechanics inline, preserving public method shapes and test-facing error messages (`TestSetupError`) where specs depend on them.
- New spec: `test/server/core/stateSerialization/GameStateInjector.spec.ts` (7 `it`s, see Verification).

### Durable decisions (see plan §9 for full text; summarized here with re-check conditions)

1. Prompts are identified by class where a dedicated prompt class exists (`MulliganPrompt`, `ResourcePrompt`), and by `PromptType.Initiative` for the classless initiative `HandlerMenuPrompt`. No `PromptType.Mulligan` was added. Re-check if mulligan stops being its own class or the client needs to distinguish it.
2. The leader deploy limit is spent by instance handle (`LeaderUnitCard.deployEpicActionLimit`), never by walking action abilities — the same handle `AbilityLimitSerializer` already uses. Re-check if a leader ever gains a second, independent deploy limit.
3. Injection must precede watcher restore; `setMostRecentInPlayIdForStateInjection` enforces exactly the getter's zone predicate (`!isInPlay() && zone.hiddenForPlayers == null`), not the weaker `!isInPlay()` alone, because `liveStintKey` returns `null` in a hidden zone regardless of the field. Re-check if `P2-C2` reorders its restore pass or a zone's `hiddenForPlayers` changes.
4. `outsideTheGame` order is a saved fact (`MatchSerializer` indexes it by ordinal); `setOutsideTheGame` is ordered (remove+re-add to reorder an already-staged card, since `moveTo` no-ops within a zone) and `assertStagingZoneMatches` is an ordered comparison with three distinct failure modes. Re-check if `outsideTheGame` ever leaves `SavedArrayRefZone`.
5. `IButton.arg`/`PromptButtonArg` — decided at the gate (scope revision 1) over a localized cast in the runner. The `perCardMenuButton` chain stays `string`. Re-check if a numeric `arg` ever appears on a per-card button.

### Deviations from the plan, with evidence

The plan was followed as the ordered edit sequence, but implementation surfaced three defects the plan's own reasoning missed. All three are disclosed here rather than silently absorbed, per protocol's requirement to distinguish an observed fact from a causal hypothesis and to report justified departures.

1. **`Card.moveAllNonBaseZonesToStaging`'s batched reparent needed a new `Card` method.** The plan's step 3 called for porting `PlayerInteractionWrapper.moveAllNonBaseZonesToRemoved`'s `card.zone = outsideZone` batched reassignment verbatim. `Card.zone`'s setter is `protected`; the original test-helper file only compiles because its `player`/`Card` types resolve loosely (confirmed empirically: an isolated probe assigning to a properly-typed `Card.zone` from outside the class fails `TS2445`). A genuine engine file cannot replicate that assignment without a cast, and casts are prohibited in this unit's new engine files. Added `Card.setZoneForStateInjectionBatch(zone)` — a minimal, clearly-scoped public method with the same doc-comment discipline as steps 4a/4b, doing only the raw reference swap the batch operation needs (no event, no re-init, no controller reset). This is outside the plan's literal step list but required for step 3 to compile at all; flagged here rather than silently widening `Card.zone`'s own visibility or using a cast.
2. **`setArenaUnits`'s damage write must precede upgrade/capture attachment, not follow it.** The plan's proof reasoning for collapsing the ported helper's two damage writes into one explicitly kept "the write after attachment" — reasoning only about the non-clamping setter making the two writes' *stored value* equal. It missed that `InPlayCard.attachTo` can run an attach condition that reads the target's *current* damage during the call (`MarkMyWords.ts`: `context.attachTarget.damage > 0`), discovered via a real suite failure (`Mark My Words - integration - should grant Overwhelm to the attached unit`) under `test-parallel`. The dropped write is genuinely dead only when it is the *second* one; the implementation keeps the *first* write (damage set, then upgrades/captures attach) and drops the second, which is the actual behavior-preserving collapse. See the doc comment on `GameStateInjector.setArenaUnits`.
3. **Batching name resolution ahead of placement breaks duplicate-name and mid-test-reuse cases the ported helpers handled by interleaving resolve-then-move.** Every ported helper (`setHand`, `setDeck`, `setDiscard`, `setResourceCards`, `setArenaUnits`) used to resolve one name and immediately move that card before resolving the next, so a repeated name (e.g. three `battlefield-marine`s) or a name currently occupying the very zone being replaced (e.g. `setResourceCount` called mid-test when the same filler card is already resourced) naturally found a different, correctly-available copy each time. Separating "resolve all names" from "place them" (as the injector's batch functions require, since they take pre-resolved `Card[]`) broke both: duplicate names in one call aliased to the same object, and a mid-test re-set of a zone couldn't find a card sitting in the very zone about to be cleared. Fixed in `PlayerInteractionWrapper.ts`: a private `resolveCardsByName` helper (order-preserving, excludes cards already claimed in the same call) replaces ad hoc single-lookup resolution everywhere a batch is built, and `setHand`/`setDiscard`/`setResourceCards`/`setArenaUnits` explicitly return the zone's *current* contents to the deck before resolving new names, mirroring the ordering the interleaved helpers used to get for free. Caught by two real suite failures under `test-parallel` (`InDebtToCrimsonDawn`/`TheConflictWithin`'s `setResourceCount` calls, and the initial `SetupPhase.spec.ts` hand-size assertion) before being generalized to the other batch methods.

None of these change the plan's public API shapes, ordered edits, or durable decisions; they are implementation-level corrections the plan's own proof.md-style verification (running the full suite) is exactly designed to catch, and did.

### Verification

| Check | Result |
|---|---|
| `npm run build` | exit 0, no diagnostics |
| step-0 completeness check A (`grep -rl "PromptButtonArg" server/`) | exactly the 19 expected files |
| step-0 completeness check B (`grep -rn "arg: string" ...`) | exactly the 9 expected residue sites |
| `npm run lint` | exit 0 |
| `npm run validate-cards` | exit 0 (1983 card files, 2 exempt; 1960 test files) |
| `npm run test-parallel` | 8414 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8227 specs, 0 failures, 16 pending |

Baseline at `a9e77897f` was 8407/0/13 and 8220/0/16. Both deltas are exactly the 7 new `it`s in `GameStateInjector.spec.ts` (run as `undoIt`s under `test-parallel-undo`'s `ENABLE_UNDO_ALL_TESTS` mode); no other change is a regression. `npm run benchmark` was not run — out of scope by instruction (owned by `P2-E`).

This table records the state at the end of the initial implementation. Fix cycle 1 below added one further spec and supersedes these counts; see "Fix cycle 1 verification" for the numbers this unit actually commits at.

### Out of scope, deliberately

`MatchLoader` (`P2-C2`), work item C steps 1, 2, 5 and 6, work items D and E. `npm run benchmark`.

### Notes for the next agent

- **Injection must run before watcher restore.** `P2-C2`'s restore pass must place cards (including `setMostRecentInPlayId`) before resolving any watcher entry, or the `entry.inPlayId === liveStintKey(loadedCard)` pairing `P2-A2` established breaks silently.
- **`markLeaderDeployUsed` is test-wrapper-only.** `P2-C2`'s restore pass owns all ability-limit counts itself; do not call it from the loader.
- `Card.zone`'s setter is `protected` by design. Any future bulk zone-reassignment need should extend `Card.setZoneForStateInjectionBatch`'s doc-commented, narrowly-scoped pattern rather than reaching for a cast or widening the setter's visibility.
- A batch operation that takes a list of names to resolve into distinct cards (repeated names, or names that may currently occupy the zone being replaced) needs either interleaved resolve-then-move, or an explicit "return current zone contents to the pool" step before resolution — see `PlayerInteractionWrapper.resolveCardsByName` and its callers for the pattern now used throughout the test wrapper.
- `PromptButtonArg` (`PromptInterfaces.ts`) is the type an engine-side prompt driver imports for `menuButton`/`cardClicked`-adjacent code; `P2-C2` inherits it rather than re-deriving the union.
- **`outsideTheGame` is never empty, and a staging assertion that hardcodes its expected contents will intermittently fail on the Force token.** `Player.initialiseAsync` calls `this.game.generateToken(this, TokenCardName.Force)` unconditionally, before any test- or loader-specific board setup runs (`Player.ts:797`, landing in `Game.generateToken` → `player.outsideTheGameZone.addCard(token)`, `Game.ts:1664-1673`). The token sits in `outsideTheGame` for the lifetime of the player unless something explicitly moves it (e.g. `setHasTheForce` granting it to a unit). `P2-C2`'s restore pass, which stages everything then places cards and asserts the staging zone is clean, will see this token as "unexpected residue" unless it samples the zone's actual pre-existing contents (or the token's known position) before asserting, rather than asserting against a literal `[]` or a hardcoded card list. `GameStateInjector.spec.ts`'s `moveTo`-branch spec hit exactly this (see Fix cycle 1 note below) and is the worked example of the correct pattern: sample `outsideTheGameZone.cards` immediately before the call under test, fold that into the expected list, don't assume the zone starts empty.

### Fix cycle 1 (findings repair pass, `RUN_ID=p2-c1-2026-09-14T01:00:44.598482+00:00`)

Three cold reviewers found no BLOCKING issues but converged on several WARNING-level defects, repaired here:

1. **`Card.setZoneForStateInjectionBatch` narrowed and guarded**, rather than moved onto `OutsideTheGameZone` outright: the reviewer-preferred fix (a zone-side method performing both the reparent and the list insertion atomically) is not achievable without either a cast or widening `Card.zone`'s setter beyond `protected`, since `OutsideTheGameZone` cannot write another class's protected member across files. Applied the documented fallback instead: the parameter is now typed `OutsideTheGameZone` (not the full `Zone` union), and the method asserts the card is not already present in its current zone's own card list before the swap, which is exactly the phantom-double-membership hazard the reviewers raised. `Card.zone`'s setter was already `protected` (unchanged); this remains the one narrow public entry point.
2. **`InPlayCard.setMostRecentInPlayIdForStateInjection`** now asserts `Contract.assertNonNegative` + integer, matching its sibling `Damage.setDamageForStateInjection`'s guard discipline; also guards `this.zone` against `null` before dereferencing, matching `WatcherEntryEncoding.liveStintKey`'s handling of the same case.
3. **`ScriptedSetupRunner.runSetupPhase`** now asserts, after driving all three prompts, that every player *gained* exactly `cardsPerPlayer` resources during the call — closing the silent-no-op paths in `answerResourcePrompts` (prompt absent) and `ResourcePrompt.menuCommand` (returns `false` on insufficient selection) that the ported-from `clickDone` used to convert into a loud `TestSetupError`. First attempt asserted an *absolute* post-count of `cardsPerPlayer`, which regressed 6 specs (e.g. `Improvised Identity`) that pre-load resources before calling this driver; fixed to compare against each player's resource count captured immediately before the driver runs, not zero.
4. **`resolveCardsByName`'s resolution order now mirrors placement order** for `setDeck`/`setDiscard`/`setResourceCards`: each reverses its input before resolving, then reverses the resolved array back, restoring the pre-port helper's behavior exactly for duplicate-named entries whose physical copies span multiple zones. The plan's claim that the only behavioral difference here was caller-array-identity was wrong; this was a real, if narrow, defect (no suite spec exercises duplicate-named entries, per `CLAUDE.md`'s own guidance against them).
5. **`GameStateInjector.ts` now routes every caller/input-shape violation through `StateInjectionError`**, not `Contract` — the arena-mismatch check, the undeployed-damage check, both `markLeaderDeployUsed` guards, all three `setHasTheForce` guards, and `setCreditTokenCount`'s negative-count guard. The module header now states the principled rule explicitly (`StateInjectionError` for caller/input mistakes; `Contract` reserved for a primitive's own value-domain guards elsewhere, e.g. `Damage`/`InPlayCard`), so `P2-C2`'s `catch (e) { if (e instanceof StateInjectionError) }` discrimination is no longer half-blind.
6. Nits: `GameStateInjector.spec.ts`'s two bare `toThrowError()` calls now match `/mostRecentInPlayId/`; a new spec exercises `setOutsideTheGame`'s `moveTo` branch (previously only the already-staged remove+re-add branch ran); `resolveCardsByName`'s exhaustion error now names the copy-count shortfall instead of reusing "not found" wording; `PlayerInteractionWrapper.setLeaderStatus`'s `onStartingSide` mapping is now gated on `!deployed`, restoring the removed helper's exact behavior for `{ deployed: true, flipped: true }` (previously silently ignored, now silently ignored again rather than newly throwing/flipping); the three `as any` casts at the wrapper→engine seam (`setArenaUnits`'s arena, `setCapturedUnits`'s captor, `setResourceCards`'s card) are now `as Arena` / `IAttackableCard` param typing / `as ICardWithExhaustProperty`.

7. **The `moveTo`-branch spec added under IC-08 (item 6 above) itself hardcoded `outsideTheGame`'s expected post-call contents to `['wampa', 'battlefield-marine']`, ignoring the Force token every player already carries there** (`Player.initialiseAsync` → `Game.generateToken`, see "Notes for the next agent" above). This is the one failing spec this fix cycle introduced and is now corrected: the spec samples `player.outsideTheGameZone.cards` immediately before calling `setOutsideTheGame` and folds that sampled residue into the expected order, rather than assuming the zone starts empty. Confirmed the mechanism is the Force token's unconditional creation at game init, not a `moveTo`/`postMoveSteps` side effect triggered by the call under test — `setOutsideTheGame`/`Card.moveTo` do nothing to generate tokens, and re-running the corrected spec in isolation (`npm run test-fast -- "**/GameStateInjector.spec.js"`) plus the full `test-parallel`/`test-parallel-undo` gate both pass clean (see Verification below). No production code was at fault; only the spec's expectation was wrong.

Not touched, per reviewer disposition: P2C1-IA-05 (log lists three deviations, which is accurate, not an error), P2C1-IA-06 (incidental local `IButton`, confirmed harmless), P2C1-IA-07 (positive finding, no action).

#### Fix cycle 1 verification (cold restart, spec fix + full re-run)

| Check | Result |
|---|---|
| `npm run test-fast -- "**/GameStateInjector.spec.js"` (isolated) | 8 specs, 0 failures |
| `npm run test-parallel` | 8415 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8228 specs, 0 failures, 16 pending |

Matches the expected 8407/0/13 + 8 new `it`s and 8220/0/16 + 8 new `undoIt`s exactly (7 original `GameStateInjector.spec.ts` its from the `P2-C1` unit itself, plus the 1 added under fix-cycle item 6). No regression outside the one spec this cycle's own repairs introduced and item 7 above corrects.

Every check in this table was re-run by the orchestrator directly against the final repaired tree before the commit gate, rather than inherited from the fix-pass agent's own reporting: `npm run build` exit 0, `npm run lint` exit 0, completeness check A 19 files, completeness check B 9 residue sites, plus both suite runs above. The two completeness greps matter more than the compile here: this repo sets neither `strict` nor `strictFunctionTypes`, and TypeScript checks method-override parameters bivariantly, so a narrowed override signature left behind by the widening compiles clean — verified empirically with the repo's own `tsc`. The greps are therefore the real detector for the `PromptButtonArg` work, and a clean `npm run build` alone must not be read as proving it.

## `P2-C2` — `MatchLoader` (Plan 2, work item C, steps 1, 2, 5 and 6)

| | |
|---|---|
| Task ID | `p2-c2` |
| Date | 2026-09-14 |
| Lane / tier | full, tier 3 (Large 🟡), proof level hardened |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item C steps 1, 2, 5 and 6; [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md) unit `P2-C2` |
| Parent | `104e3b983` |
| Commit | `61d24772d` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

`MatchLoader.loadAsync(saved, config)` now reconstructs a live `Game` from an `ISavedMatch` and re-enters the pipeline mid-action-phase. Nine new modules under `server/game/core/stateSerialization/`:

- `MatchLoader.ts` — the entry point: validation, seat binding, game construction + driven setup, injection, the fixed restore order, and pipeline re-entry.
- `SavedMatchValidator.ts` — document validation. Gates `formatVersion`; deliberately does **not** gate `cardDataVersion` (reported only as error diagnostics). Resolves every `internalName`, token name and `abilityIdentifier` against current card data, checks decklist/document multiset coverage, and validates the RNG state's structure.
- `LoadedPositionIndex.ts` — resolves `ISavedCardRef` coordinates back to live cards.
- `WatcherEntryDecoding.ts` / `StateWatcherDeserializer.ts` — the load-side inverse of `P2-A2`'s encoders, one decoder per `StateWatcherName`.
- `MatchPositionInjector.ts` — orchestrates `GameStateInjector` across all seats in four phases (stage every seat → resolve-and-place across seats → base-zone tokens → `setOutsideTheGame` + staging assertion for every seat last).
- `AbilityLimitRestorer.ts` — the single authority for all per-copy limit counts, including `epicDeployUsed`.
- `ChatRestorer.ts` — replaces the message log wholesale, never appends.
- `MatchLoadError.ts` — the single exception type for load-side failures.

Plus four engine write surfaces: `SimpleActionTimer.restoreRemainingSecondsPaused`, `IByoyomiTimer`/`ByoyomiTimer`/`NoopActionTimer.restoreMainTimeRemainingSeconds`, `StateWatcher.setRawEntriesForStateInjection`, and `EventName.OnLoadStateResolution`. `GameStateInjector.IResourceEntry` gains an optional `controller` (the one authorized edit to a `P2-C1` file — see Durable decisions 1).

Three new spec files (`MatchLoader.spec.ts`, `MatchLoaderContinuation.spec.ts`, `MatchLoaderRejection.spec.ts`) plus `test/helpers/MatchLoaderHarness.ts`: 42 specs.

### Durable decisions (with re-check conditions)

1. **Cross-owned resources travel as `IResourceEntry.controller`, not a loader-side pre-pass.** A loader-side `takeControl` before `setResources` is provably self-defeating: `setResources` evacuates the resource zone through the deck, and `zoneMoveRequiresControllerReset(Resource, Deck)` resets `controller` to `owner` (`EnumHelpers.ts:182-185`, `Card.ts:988-990`). Mirrors the already-landed `IArenaUnitEntry.controller`. Re-check if `setResources` ever stops evacuating through the deck.
2. **Ability-limit counts are restored *after* `resolveGameState(true)`, not before.** This deviates from the plan's literal step order, deliberately: `resolveGameState`'s moved-card sweep calls `resolveAbilitiesForNewZone()`, which calls `limit.reset()` on every action/triggered ability for any non-arena-to-arena move — true of every injected card. Restoring first wiped every count. Re-check if the moved-card sweep stops resetting limits.
3. **Seats bind by identity (`game.getPlayerById`), never by position.** `Game.getPlayers()` is `Object.values(playersAndSpectators)` keyed by `player.id`, and JavaScript orders array-index-like string keys numerically ahead of all others — so ids like `'user-a'` and `'7'` silently reverse seat order. Re-check if `playersAndSpectators` ever stops being keyed by user id.
4. **Step 6 drives its `EventWindow` on `game.pipeline` itself, never a standalone `GamePipeline`.** `Game.queueStep` always targets `this.pipeline`, so a private pipeline never runs the ability resolvers and prompts the drive queues, and `postRollbackOperations` then clears them — which silently produced illegal boards (two copies of a unique in play). Re-check if `Game.queueStep` ever becomes pipeline-parameterised.
5. **A router proxy converts the engine's report-and-continue convention into throws for the whole span of the load.** `BaseStepWithPipeline.continue()` catches any exception, routes it to `Game.reportError`, and returns `true` — correct for live play, wrong for a loader that promises to throw. `Game._router` is `private readonly`, so a `Proxy` scoped by a flag is the only available seam. The flag is set before the `Game` is constructed and cleared in a whole-body `finally`, so it covers construction, driven setup, injection, restoration, the resolution drive **and** `postRollbackOperations`' pipeline re-entry, while guaranteeing the returned game's router behaves normally during play. Scoping it more narrowly was tried twice and left a hole each time. Re-check if `Game` ever gains a router setter, which would allow a cleaner swap.
6. **Watchers named by the document are registered on demand**; a harness-built source game registers all 15, a production game only what its cards request.
7. **Nested `ISavedCardRef`s match on `internalName` + `ownerSeat`**, since `ISavedAttachedCard` records no controller.

### Deviations from the plan, with evidence

1. **Ability-limit restore moved after `resolveGameState`** — Durable decision 2 above. Caught by a failing AC4; confirmed independently by all three reviewers against `Game.ts:1604-1608` and `Card.ts:1162-1184`.
2. **The event-window mechanism for degraded saves is not in the plan at all.** The plan assumed step 6 could call `resolveGameState(true)` bare. It cannot: a degraded save whose dropped for-this-phase buff was keeping a unit alive defeats that unit during `resolveGameState`, which reaches `Game.addSubwindowEvents` and dereferences a null `currentEventWindow`, crashing the load. The plan's own residual-risk note pre-committed this outcome to the gate rather than absorbing it. Resolved by decision at the gate (see below).

### Verification

| Check | Result |
|---|---|
| `npm run build` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run validate-cards` | exit 0 (1983 card files, 2 exempt; 1960 test files) |
| `npm run test-parallel` | 8458 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8271 specs, 0 failures, 16 pending |

Baseline at `104e3b983` was 8415/0/13 and 8228/0/16; both deltas are exactly the 43 new specs. Every row was re-run by the orchestrator directly against the final tree before the commit gate, not inherited from the fix-pass agent's reporting; two independent cold reviewers also ran both suites and reported identical counts. `npm run benchmark` was not run — out of scope by instruction (owned by `P2-E`).

This unit went through three implementation review rounds (nine cold reviews, three concurrent lenses each) plus two user-approved bounded extensions, each with its own confirming review. Rounds 1 and 2 both returned unanimous REJECTED; the defects they found are recorded in the decisions and deviations above rather than only in the run's disposable state.

**The error-swallow hole took three attempts to close, and the reason is worth remembering.** `BaseStepWithPipeline.continue()`'s catch-and-report-`true` is reached from *every* pipeline drive, so each time the rethrow window was scoped to the drive that had been measured, the next unmeasured drive still swallowed: first only step 6 was covered (step 3's driven setup still swallowed, measured at 5-7 exceptions per load), then steps 3-6 (leaving `postRollbackOperations`' re-entry, measured resolving over a half-built pipeline). Only a whole-body window closed it. If a future change introduces another engine drive inside `loadAsync`, it is inside the window already — but if one is added *outside* it, the same hole reopens.

**Test-quality note worth carrying forward.** Two specs in this unit passed against the very defect they named (AC4 passed when *both* copies of a card were wrongly restored at max; the deploy-limit rejection spec used an identifier shape that can never match a real minted identifier, so it exercised the wrong branch entirely). Both were caught by reviewers reading assertions rather than test names. The final round's reviewers verified the new specs discriminate by reverting each fix in the compiled `build/` tree and confirming the specs fail — a technique worth reusing whenever a spec is the sole evidence for a repair.

### Known residuals, all disclosed and accepted at the gate

1. **Nested-controller divergence is only detected coincidentally.** `ISavedAttachedCard` records `{card, ownerSeat}` with no controller, so a card whose live controller differs from its owner (reachable via `EvidenceOfTheCrime` and at least four other implemented cards) loads under its owner's control unless some *other* document fact happens to name it. Documented on `LoadedPositionIndex.resolveRef`. A general fix needs a schema extension — that is work item A's territory, not the loader's.
2. **No structured discriminator between "bad document" and "engine bug."** Everything is a `MatchLoadError` with the original in `diagnostics.cause`. `P2-D` needs this distinction for its user-facing error path; put it on that unit's acceptance criteria.
3. **`Lobby.handleGameEnd()` acts on the router's own `this.game`.** A degraded save that resolves into an outright win calls the real router's end-of-game path against whatever game the router currently thinks is active, before `loadAsync` can reject. Documented on `loadAsync`.
4. Silent decoder defaults for a few optional watcher fields, and a hardcoded starting-hand size in the validator, were not investigated.

### Notes for the next agent (`P2-D`)

- The loader constructs the `Game` itself and takes its collaborators through `IMatchLoadConfig`; it returns `IMatchLoadResult { game, engineOnlyFacts, playersBySeat }`. The `engineOnlyFacts` manifest is surfaced there because `P2-D` is the first thing that can show it to a dev.
- **`players[].name` round-trips only if the caller binds usernames matching the saved ones.** This is a caller obligation, documented on `IMatchLoadConfig.seats`.
- **Two seats bound to the same username are rejected**, because engine limit maps key on `player.name` and would silently merge the two seats' counts.
- **A save taken after Bo3 sideboarding always fails to load**, because the document's decklist is `originalDeckList`, which sideboarding does not update. The validator produces a diagnostic naming that cause. Making such saves loadable is a writer-side change (work item A), not a loader change.
- Residuals 2 and 3 above are `P2-D`'s to resolve or consciously accept.

---

## `P2-D` — Server plumbing + the armed one-shot save trigger (Plan 2, work item D)

| | |
|---|---|
| Task ID | `p2-d` |
| Date | 2026-09-15 |
| Lane / tier | full, tier 2 (Medium 🟡), proof level standard |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item D; [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md) unit `P2-D` |
| Parent | `58f5c4ca7` |
| Commit | `5b1fdb70b` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

The three surfaces work item D asked for: a save *request* folded into the existing bug-report flow, the armed one-shot that decides *when* the save is actually taken, and a dev-only load route.

- `Game.ts` / `GameInterfaces.ts` — the armed-save state and its `IArmedSaveSurface`: `request()`, `checkTrigger()`, `clear()`, plus mutable `onFired`/`onCleared` callbacks wired from `GameConfiguration`. `request()` refuses outside the action phase, saves inline when `getCurrentOpenPrompt() === currentActionWindow`, and otherwise arms `{requestedAtActionNumber, requestedAtPhase}` with `??=` coalescing.
- `ActionWindow.ts` — a per-instance `boundaryFired` latch set on the window's first `continue()`, which calls `game.armedSave.checkTrigger()`. Five lines, and the single most load-bearing decision in the unit (see below).
- `Lobby.ts` — `submitReport` gains a fourth arg (`requestSave`, honoured only for bug reports with a live game); the report body splits into a synchronous preamble and `finishReportSubmission`; a per-user `pendingSaveReports` map holds deferred reports; `onArmedSaveFired`/`onArmedSaveCleared`/`drainPendingSaveReports` resolve them; and `loadSavedMatchAsync` wraps `MatchLoader.loadAsync`.
- `DiscordDispatcher.ts` — the completed `ISavedMatch` attaches as `files[2]` on the bug-report branch (confirmed unused there; the player-report branch's existing `files[2]` chat attachment is untouched), behind a combined-payload size budget.
- `GameServer.ts` / `UserFactory.ts` — `POST /api/dev/load-saved-match`, registered only under `ENVIRONMENT === 'development'`, gated by `ServerRole.Developer` and `areGamesEnabled()`, returning `{success, gameId, engineOnlyFacts}` and nothing else. `getExistingUserByIdAsync` requires a genuine account before a seat is bound.
- `MatchLoader.ts` — the one authorized `stateSerialization/` edit: an optional `IMatchLoadConfig.onGameConstructed` hook plus its single call site, retiring the two TODOs that file addressed to `P2-D` by name.

Four new spec files, 30 specs: `ArmedSaveTrigger.spec.ts` (7), `LobbySaveReportDrain.spec.ts` (11), `DevMatchLoad.spec.ts` (6), `DiscordDispatcherSavedMatch.spec.ts` (6). Net 1427 insertions, 41 deletions across 13 files.

### The boundary hook cannot key off the snapshot manager, and the first plan got this wrong

The plan text says to arm "independently of `undoMode`, guarding the `SnapshotManager` early-returns at `:116,:134`". The obvious reading — hook inside `ActionWindow.checkUpdateSnapshot`'s existing `if`, which does not itself mention `undoMode` — is wrong, and plan review caught it before any code was written.

That guard reads `snapshotManager.currentSnapshottedTimepointType` and `currentSnapshottedAction`. Both resolve to `SnapshotFactory.currentActionSnapshot?.<field>`, and `currentActionSnapshot` is assigned only at the end of `createSnapshotForCurrentTimepoint`, which `moveToNextTimepoint` reaches **only past** its `UndoMode.Disabled` early return. Under `UndoMode.Disabled` the field is permanently unset, both getters return null, and the guard is unconditionally true **on every tick**. The guard's outer shape is undo-independent; its operands are entirely undo-dependent.

This mattered concretely: `integration()` defaults to `UndoMode.Disabled`, and `ENABLE_UNDO_ALL_TESTS=true` rebinds it to `Free`. A drift assertion written against that hook would have passed one gating suite and failed the other.

**The fix is a per-`ActionWindow` `boundaryFired` field**, set on the instance's first `continue()`. One `ActionWindow` is constructed per action (`ActionPhase.queueNextAction`, the only construction site) regardless of `undoMode`, and `getNextActionNumber()` increments `game.actionNumber` immediately *before* construction — so the declared drift is exactly one action in both modes, by construction rather than by observation. `ActionWindow` extends `BaseStep`, a plain class with no `@registerState`, so the latch is outside `state` and cannot be corrupted by snapshot/restore.

**Carry this forward:** `checkUpdateSnapshot`'s guard is not a usable "once per boundary" signal for anything. Any future per-action-boundary hook needs its own latch.

### Four clear conditions, because rollback is one of them

The plan named three (game end, phase exit to regroup, disconnect). Review established a fourth is mandatory: `GameStateManager.rollbackToSnapshot` replaces `game.state` wholesale via `v8.deserialize`, **not** through property setters, so a plain field survives rollback untouched *and* the `currentPhase`-setter hook never fires on a rollback-driven phase change. Without it, a request armed at round 3 action 7 survives an undo and fires against a replayed timeline, declaring a drift computed against an action number the position never had — the one failure mode the unit's own brief says it must not ship.

The clear lives at the top of `Game.postRollbackOperations`, which is the single re-entry point for every rollback path in the codebase (live undo via `Game.rollbackToSnapshotInternal`, and `MatchLoader`'s own load-time call). The error-recovery path inside `GameStateManager` deliberately does *not* reach it, which is correct: that path restores the original timeline, so the armed request is still valid.

Two more clear sites were added during implementation review: `handleError`'s `SevereHaltGame` branch and `handleSerializationFailure`. Neither calls `endGame` nor marks anyone disconnected, and a halted game remains driveable — so without them a pending report was lost outright *and* the stale trigger survived to fire against a much later action.

### Anything public on `Game` or `Lobby` is a client-invocable command

`Lobby.onGameMessage` dispatches `{type:'game', command}` to `this.game[command]` with no allowlist, guarded only by `typeof !== 'function'`. `Lobby.onLobbyMessage` does the same for `this[command]` — and **reaches `private` members**, since TypeScript's `private` is compile-time only. The repo already depends on this: `submitReport` itself is a dispatched private.

Both halves of this unit tripped over it, in successive review rounds. First, five bare public `Game` members would have let a client emit `game:onArmedSaveFired` in a loop (an unbounded `MatchSerializer.save` loop, each result discarded) or `game:checkArmedSaveTrigger` to force a save mid-resolution — a document stamped `kind:'deferred'` with drift 0, taken at a moment the design doc lists as an explicit non-goal. The fix is the non-function `armedSave` container: an object, not a function, so the dispatcher's guard rejects it and nothing inside is reachable by a single command-name lookup.

The *second* round found the same hazard had simply moved: the fire and drain handlers now lived on `Lobby`, where the dispatcher is strictly more permissive. Fixed with argument-shape guards, which work because the dispatcher binds `this[command](socket, ...args)` — the `Socket` always occupies argument 0, so a client cannot place a conforming object in the guarded position, while the real internal caller always supplies a number and a string (`request()` only arms inside `PhaseName.Action`).

**Carry this forward:** `onLobbyMessage` remains generally unguarded for the ~40 other private `Lobby` methods. That is a real, separately-scoped finding — a general allowlist was offered at both gates and explicitly declined as out of scope for this unit, twice. It is worth its own task.

### Decisions worth re-checking later

1. **The client is acked immediately for every outcome** (`saveStatus: 'included' | 'pending' | 'unavailable'`); only the Discord POST is deferred. The plan originally withheld the ack until the save landed, reading "the report submits when the save lands" as covering the ack too. That reading created an indefinite client hang whenever the one-shot never fired, and a permanent one on the halt paths. Re-check if the client ever needs to distinguish "pending, will arrive" from "sent".
2. **Report *content* is captured at request time; only the save moves.** `captureGameState`, `getLogMessages` and the opponent lookup stay in the synchronous preamble, so `files[0]` describes the moment the player clicked, and the declared one-action drift applies to the save alone. An earlier split had both move together, silently changing the existing bug-report channel's meaning.
3. **A second concurrent save-requesting report degrades rather than being refused** — it submits immediately with `saveStatus: 'unavailable'`, so the player's typed description is never discarded. `pendingSaveReports` is capped at one entry per user.
4. **The dev-load route is development-only.** `setupDevAppRoutes` is registered only under `ENVIRONMENT === 'development'`; `ServerRole.Developer` and `areGamesEnabled()` are defense in depth, not the primary control. The route-scoped 5 MB body parser is mounted under the same environment check and *before* the global `express.json()`, since Express runs parsers in registration order and a later per-route parser would be inert behind the global 100 kB default.
5. **Hidden information stays cleartext, by product decision.** Deck order and hands are in the file because the recipient is the dev team and that is what makes a report reproducible. No scrubbing writer mode exists. Re-check when player-to-player sharing is proposed.

### Verification

| Check | Result |
|---|---|
| `npm run build` | exit 0 |
| `npx tsc -p ./test/tsconfig.json` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run validate-cards` | exit 0 |
| `npm run test-parallel` | 8488 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8301 specs, 0 failures, 17 pending |

Baseline at `58f5c4ca7` was 8458/0/13 and 8271/0/16. Both suites are up exactly 30, matching the 30 new specs — collected and run in **both** modes, not silently skipped in one. The extra undo-suite pending is the `undoIntegration` rollback-clear case, which `ENABLE_UNDO_ALL_TESTS=true` deliberately `xit`s; it runs for real under `test-parallel`. `npm run benchmark` was not run — out of scope by instruction (owned by `P2-E`).

Harness semantics worth stating once, because two successive plan revisions got them backwards: `integration(defs, enableUndo = false)` defaults to `UndoMode.Disabled`, and under `ENABLE_UNDO_ALL_TESTS=true` its **second argument is dropped**, so there is no way to pin `Disabled` under the undo sweep; `undoIntegration` bodies are replaced with an `xit` skip under that same variable.

### Review history

Two plan-review rounds (the second a user-approved bounded extension) and two implementation-review rounds. Both first rounds returned REJECTED, and in both cases the defect was in the mechanism the unit exists to protect:

- Plan round 1: 5 BLOCKING, including the undo-dependent hook above and the missing rollback clear.
- Implementation round 1: 1 BLOCKING — the client-dispatch containment had been applied to `Game` and defeated on `Lobby`.

The confirming delta review verified each repair against the dispatcher's actual argument binding rather than the finding's prose, and re-verified that `Game.ts` and `ActionWindow.ts` were byte-identical to the previously-approved subject, so the safety invariant did not need re-deriving.

### Known residuals, disclosed and accepted at the gate

1. **`onLobbyMessage`'s general lack of a command allowlist** (above) — declined twice as out of scope; worth its own task.
2. **Three test/diagnostic NITs from the final review, fixed in fix cycle 2** (not carried as open residuals): the two containment specs now assert a positive control (`lobby.userLastActivity.has('u1')`) proving `onLobbyMessage` actually reached the dispatched handler, rather than only negatives that would pass vacuously if a future refactor made `updateUserLastActivity` throw for this stub shape; the halt-path specs' stub game now carries `snapshotManager`/`id`, so `finishReportSubmission` runs to completion instead of throwing into an absorbed rejection, and both cases assert `formatAndSendReportAsync` was actually called, not just that the map emptied; and `loadSavedMatchAsync`'s own containment guard was narrowed to a plain shape check (`saved == null || typeof saved !== 'object' || !Array.isArray(seats)`), leaving `formatVersion` policy solely to `SavedMatchValidator`. The narrowed contract still rejects the dispatched `Socket` (it has no `seats` property, so `Array.isArray(seats)` is `false`), and Plan 6 now only has to touch the validator when it adds schema migration.
3. **The dev route's HTTP path has no executable evidence** — body-parser ordering and the auth middleware are verified by inspection only, since no HTTP/Express harness exists anywhere in this suite. The `areGamesEnabled()` gate *is* tested, by capturing the handler through `setupDevAppRoutes.call(stub, fakeApp)`.
4. **The 5 MB body limit and the 7 MB Discord attachment budget are structural estimates**, not measured against a real production-sized `ISavedMatch`.
5. **`P2-C2`'s residual 2 is still open**: there is no structured discriminator between "bad document" and "engine bug" — everything is a `MatchLoadError` with the original in `diagnostics.cause`. The dev route translates every one to a 400. `P2-C2` named this as `P2-D`'s to resolve or accept; it is consciously accepted, since the route's only consumer is the dev team, who has the server logs.

`P2-C2`'s residual 3 (`Lobby.handleGameEnd()` acting on the router's own `this.game`) **is** resolved, by the `onGameConstructed` hook.

### Notes for the next agent (`P2-E`)

- The armed trigger's observable surface for testing is `game.armedSave` — `request()` returns `{kind}`, and `onFired`/`onCleared` are reassignable directly on `context.game` after `setupTestAsync()` returns. The harness has no `GameConfiguration` passthrough, so that post-construction assignment is the only route.
- The four clear conditions are: `Game.currentPhase`'s setter (exit from `PhaseName.Action`), `Game.endGame`, `Lobby.setUserDisconnected` (inside the player branch, after the socket-id check — a spectator or superseded socket must not clear), and `Game.postRollbackOperations`. The halt paths clear too, via `Lobby.handleError`/`handleSerializationFailure`.
- `saveTrigger.kind` is `'immediate'` when the request arrived at a boundary and `'deferred'` when it was armed; `requestedAtActionNumber` read against the document's own `game.actionNumber` is the declared drift, and it is exactly 0 or 1 respectively.
- Work item E's trigger-matrix group should include the undo-disabled case explicitly — that is the mode where the naive hook silently misbehaves, and it is the default mode for ordinary `integration()` specs.

---

## `P2-E` — Verification suite + degradation measurement (Plan 2, work item E)

| | |
|---|---|
| Task ID | `p2-e` |
| Date | 2026-09-15 |
| Lane / tier | full, tier 2 (Medium 🟡), proof level standard |
| Plan | [02-semantic-save-load.md](02-semantic-save-load.md) work item E; [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md) unit `P2-E` |
| Parent | `9b55eaf01` |
| Commit | `ce083a972` |
| Branch | `experimental/rollback-saves-optimizations` |

**This is the final unit of Plan 2.** No file under `server/` changed.

### What changed

25 specs across four new files and two extensions, one shared helper, a non-gating degradation measurement, and the closing performance capture.

- `test/helpers/SaveLoadHarness.ts` — the shared helper. `normalizeSavedMatch` (excludes `savedAt`; renders `stateWatchers` as a name-keyed map so absent ≡ empty), `saveLoadSaveAsync`, `wrapLoadedGame`, and `expectContinuationMatchesOriginalAsync` — the differential oracle, which drives an identical action sequence into both the original and the loaded game and compares the two resulting documents.
- `SaveLoadRoundTrip.spec.ts` (5), `SaveLoadContinuation.spec.ts` (8), `EngineOnlyFactsManifest.spec.ts` (5), `ArmedSaveEndToEnd.spec.ts` (3), plus 4 appended specs across `ArmedSaveTrigger.spec.ts` and `MatchLoaderRejection.spec.ts`.
- `SaveDegradationProbe.js` + `scripts/measure-save-degradation.js` + `npm run measure-degradation` — env-gated behind `MEASURE_SAVE_DEGRADATION`, sampling one terminal quiescent action-phase board per integration spec, called from the **tail of** `IntegrationHelper.js`'s existing `afterEach` rather than a second registration, because jasmine runs same-suite `afterEach`s in reverse declaration order.
- `docs/plans/performance/after-plan-02.{json,md}` — the closing capture.

### The suite's own oracle was vacuous, and the suites passing did not reveal it

The differential oracle excluded `stateWatchers` sections absent from the pre-save document, to filter noise from `GameStateBuilder.registerAllStateWatchers`, which stress-registers all 15 watchers on a test game while a loaded game registers only what its document named.

The first repair narrowed that predicate to the registrar set difference. It was correctly implemented, its timing argument was sound, and it was still wrong: only 4 of the 15 watcher types are registered unconditionally (`UnitProperties.ts:342-345`); the other 11 are opt-in per card. For a generic fixture those 11 exist on the source side *only* as harness artifact, so they stayed excluded. A cold reviewer proved it by running the real oracle against the shipped attack scenario: the original document carried 8 populated watcher sections, the loaded one carried 2, **and the assertion passed**.

Both gating suites were green at unchanged counts throughout. That is what a vacuous comparison looks like from the outside, and it is why the second repair was required to produce a discriminating experiment rather than another green run.

The fix removes the filter entirely: mirror the same reflective registration onto the loaded game after `loadAsync`, assert the two registrars are equal, then compare the full documents. Scenario 1 went from 2 compared watcher sections to 8.

**Carry this forward:** when a test's own oracle is the deliverable, a passing suite is not evidence that the oracle works. Mutate something the oracle must catch and confirm it fails. Both retained probes are at `.anvil/p2-e/experiments/fix2-watcher-oracle/`.

### The measurement found a real writer defect on its first run

`npm run measure-degradation` over 6,128 real boards: **90.1% save clean, 9.9% degrade** — by category, `lastingEffect` 410 boards, `delayedEffect` 129, `gainedAbility` 50, `watcherEntry` 40, `pilotLeader` 8.

**57 boards (~0.9%) fail to save at all**, throwing `SaveIntegrityError` from the writer's own `assertCompleteness`: a card that is owned and in a zone never got indexed. Sampled names across two runs — `gold-leader#fastest-ship-in-the-fleet`, `max-rebo#encore`, `sneaking-suspicion`, `the-daughter#embodiment-of-light` — span several card shapes, so this is broader than any single mechanic.

This is a **pre-existing defect in the shipped writer (work item A)**, not in this unit, recorded as finding `P2E-I1-01`. It is distinct from both prior open residuals: `P2-C2` residual 1 is a *load-time* fidelity bug that still produces a document; this is a *save-time hard refusal* that produces none. Impact is bounded — both `Lobby` call sites catch and degrade to `saveStatus: 'unavailable'`, so the bug report still submits — but the attachment is silently lost for exactly the complex-interaction positions most likely to need it, with only a server log as trace. The design designates `pilotLeader` as a *degrade-with-manifest* category, so at least some of these should degrade rather than refuse.

**`P2E-I1-01` is resolved.** The diagnosis was not the "nested two levels deep" shape the reviewer hypothesised — that accounted for none of it. Two causes, in a ~78:1 ratio:

1. **The arena walk filtered on `card.isLeaderUnit()`** to skip the leader that `buildLeaderEntry` emits separately. That predicate is not an identity claim: `UnitProperties.isLeaderUnit` returns `isLeaderAttachedToThis()`, i.e. `hasOngoingEffect(EffectName.IsLeader)`, which is true for **any ordinary unit** currently carrying that effect. Two live sources grant it — a pilot-deployed leader registered through `LeaderUnitCard.addPilotDeploy` (which always passes `makeAttachedUnitALeader: true`), and the plain upgrade `the-darksaber#icon-of-leadership`. Every such host unit was dropped from the document, and with it the host's own upgrades, which are only reachable through its arena entry. That is why the sampled names (`gold-leader#fastest-ship-in-the-fleet`, `the-daughter#embodiment-of-light`, `cartel-spacer`, …) looked like unrelated card shapes: the cards were incidental, the *position* was the defect. Fixed by filtering on identity against the seated players' `deckLeader`s. Note the existing `pilotLeader` specs never caught it because Poe Dameron's deploy path does not grant `IsLeader`.
2. **A captive stranded in a `CaptureZone` its captor has replaced.** `UnitProperties.setCaptureZoneEnabled` mints a *fresh* `CaptureZone` each time capture is re-enabled, so bouncing a captor to hand and replaying it leaves the captive pointing at the old zone while the captor's live `capturedUnits` is empty. No walk of the captor can reach it and `ISavedCardRef` has no coordinate for it, so this is genuinely unrepresentable and now degrades with a new `unrepresentedCard` manifest entry.

The degrade-vs-refuse boundary the finding flagged was revisited accordingly: `assertCompleteness` now accepts a card that is *either* at a coordinate *or* enumerated as `unrepresentedCard`, and the sweep that declares one only ever forgives a card nested under another card (captor or parent). A card missing from a plain zone — the shape cause 1 produced — still hard-fails exactly as loudly as before, so the check that caught this could catch it again.

Post-fix measurement, two runs: **0 completeness failures** (from 84–88 per run at the same ~6,080 sample size). `pilotLeader` boards rose 9 → ~60, which is the same populations now saving degraded instead of refusing; `unrepresentedCard` appears on 2 boards. The only remaining `SaveIntegrityError`s are the 2 `Card.nextAbilityIdx` coordinate-drift refusals the design intends — one from a deliberately tampered fixture, one on `clone` that is worth a separate look. Regression coverage is `test/server/core/stateSerialization/MatchSerializerCompleteness.spec.ts`, whose three specs were each confirmed red against the pre-fix writer.

### Verification

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |
| `npx tsc -p ./test/tsconfig.json` | exit 0 |
| `npm run validate-cards` | exit 0 (1983 card files, 1960 test files) |
| `npm run test-parallel` | 8513 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8326 specs, 0 failures, 17 pending |
| `npm run measure-degradation` | 6128 sampled, 9.9% degraded, 57 hard failures |
| `npm run benchmark` | capture written |

Baseline was 8488/0/13 and 8301/0/17; both suites are up exactly **+25**, matching the 25 new specs and confirming they are collected in **both** modes rather than skipped in one.

### The benchmark says Plan 2 moved nothing on the hot path

Against `initial-performance` the deltas are large and favourable, but that comparison is **cross-machine** (Ryzen 7 9850X3D / Node v24.13.0 here against i9-13900HX / Node v22.11.0) and is now retired outright rather than merely discounted — a control run showed the machine change alone reproduces most of that movement. The roadmap's comparison target is `pre-roadmap-baseline` at `3dcaecdb0`; see the [capture index](performance/README.md).

**The heading overstates what the evidence supports, and the single capture it rested on was a fast run.** Six replicate runs at each of `3dcaecdb0`, `5787a3314` and `ce083a972` were taken afterwards, and they change the picture in two ways.

Memory moved, clearly and in one direction. Rollback memory/op is up 7.9% to 10.1% and `sustained/snapshotAndUndoCycle` memory/op up 14% to 55% in every scenario, against a run-to-run spread of about 1.5% on those rows. That roughly cancels Plan 1's saving, leaving `pre-roadmap-baseline` → `after-plan-02` memory at a median +1.2% overall. Payload is up a consistent +0.2% per snapshot. The `+463%` `compact-board` sustained-memory figure in the generated report is a machine artifact — the same row against `pre-roadmap-baseline` is -2.2% — but these smaller numbers are real.

Timing points the same way and is not conclusive. `manager/rollbackTo(Manual)` is up 6.7% to 21.0% in all five scenarios, with an overall median of +8.3% across the 30 rows. Consistent direction across every scenario is the bar the capture index's rule 4 sets, so this is no longer dismissible as scatter; but each row's own within-arm spread runs 16% to 59%, wider than the effect, so it is a **possible small regression worth re-measuring, not an established one**. The original single capture showed the opposite because it happened to be a fast run — three of its `rollbackTo(Manual)` rows fall below the baseline's entire six-run range.

So the answer to the question this capture existed to answer is weaker than first written: **no evidence has been found that the `P2-B` dev-mode JSON assertion sits on a hot path, and the rollback-path cost that six replicates do suggest is small, unconfirmed, and not yet attributed to any particular work item.** Attributing it would need a capture per work item, which was not taken.

### Review history

Two plan reviews (the second a user-authorised bounded extension past the tier-2 ceiling) and three implementation reviews across two fix cycles. The extension paid for itself twice: the first plan review caught the fixture that silently ignores `{deployed: true, flipped: true}` and the backwards `afterEach` ordering assumption; the delta review independently re-derived the `chat[].date` divergence hunt across `gameId`, `rng.state`, counter ordinals and stint refs and found no missed case.

The first implementation review returned APPROVED-WITH-FINDINGS; its one warning became the BLOCKING vacuity finding once a reviewer actually ran the oracle.

### Known residuals, disclosed and accepted at the gate

1. ~~**`P2E-I1-01`** — the writer completeness gap above. Not this unit's to fix; needs its own task.~~ Resolved in its own task; see the resolution note above.
2. **`P2E-I3-01`** — the 4 core-registered watchers are live during `loadAsync`'s step-6 `resolveGameState` window, which the source game never runs. No current scenario is degraded, so it cannot manifest today, and it predates this unit. Whoever adds a **degraded-save continuation scenario** should expect a spurious loaded-side-only entry and check this first.
3. **`P2E-I3-02`** — the reflective `StateWatcherLibrary` walk is duplicated between `SaveLoadHarness.ts` and `GameStateBuilder.js`. A desync would fail loudly via the new registrar-equality assertion rather than drift silently.
4. **Counter-ordinal mutations are invisible by design.** `CounterSpaces` re-derives ordinals as dense order-preserving ranks, so a uniform shift of decoded counter ids re-encodes identically. No oracle over the saved representation can catch it; pick a categorically-encoded field for any future mutation probe.

### Notes for the next agent

- `expectContinuationMatchesOriginalAsync` compares **whole documents**. Adding a continuation scenario needs no filter maintenance — but if a member ever diverges between two separately-driven games for a non-defect reason, normalise it **by name with a written reason**, never by widening the comparison. Two such members are already settled: `chat[].date` is excluded in differential mode only; `timers` is deliberately kept, because `NoopActionTimer` returns a constant here.
- A `sequence` closure must resolve cards through its own wrappers (`p1.findCardByName(...)`), never through `context.<cardName>` — the two games hold different card objects.
- `buildLoadConfig` defaults `autoSingleTarget: true` while `setupTestAsync` does not, so a single-legal-target prompt auto-resolves on the loaded side but not the original. Fixtures driven through both games must avoid single-target prompts or account for the click-count difference.
- `context.p1Leader`/`p2Leader` and `context.flow` are declared in `IntegrationHelper.d.ts` but are `undefined` at runtime. Use `context.player1Object.deckLeader` and the `proxiedGameFlowWrapperMethods` allowlist instead.

---

## `P3-PA0` — StateWatcher bag migration (Plan 3, Phase A step 0)

| | |
|---|---|
| Task ID | `p3-pa0` |
| Date | 2026-09-15 |
| Lane / tier | full, tier 2 (Medium 🟡) |
| Plan | [03-codegen-serializers.md](03-codegen-serializers.md), Phase A step 0 |
| Parent | `1cfceda6f` |
| Commit | `b48378f99` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

`StateWatcher.ts`'s `entries` field moves from a raw write into the `GameObjectBase` state bag to `@stateValue() private accessor entries: TState[] = [];`, routing every read/write (the constructor, `getCurrentValue`, the `entryCount`/`rawEntries` getters, `setRawEntriesForStateInjection`, and the listener-driven update handler) through the decorated accessor. The constructor's direct `this.state.entries = []` write is deleted; the accessor's own `init()` subsumes it at the same relative point in construction.

`GameObjectUtils.ts`'s `CopyMode.UseBulkCopy` and `copyState`'s `bulkCopyMetadata`-gated skip are retired — `StateWatcher` was their only user, confirmed by grep across `server/`, `scripts/`, and `test/`. `copyState`'s `metaSimples` reassignment loop, previously skipped for bulk-copy classes, is now unconditional. `registerState`'s JSDoc is rewritten (not deleted) to describe the single remaining `CopyMode`. The now-stale "Known coverage gaps" doc comment on `assertJsonSafeStateValue`, which had correctly noted that `StateWatcher` entries bypassed the check, is updated — after this change they don't.

This is Phase A step 0 of Plan 3, landing first as its own PR per that plan's own sequencing: a generator that scans decorated fields would otherwise emit an empty watcher serializer, since `entries` previously had no decorated accessor at all.

Audited for other direct state-bag writers: none found beyond the migrated file. `TokenCards.ts`'s `declare state: never` is inert (no write), and `Game.ts`'s ~29 `this.state.` matches are `Game.state: IGameState` — an unrelated property, since `Game` does not extend `GameObjectBase`.

Added one hardened-proof-level test (`test/scenarios/undo/Undo.spec.ts`, `CardsDefeatedThisPhaseWatcher` describe block): a Wampa defeats a Battlefield Marine, populating `CardsDefeatedThisPhaseWatcher`'s `lastKnownInformation.traits` with a real, non-empty `Set<Trait>`, *before* `rollback()`'s snapshot point — so the rollback it exercises actually reassigns the populated value via `copyState`'s now-unconditional field-copy, not an empty array. (The first version of this test defeated the unit *inside* the `rollback()` callback, which meant the snapshot always captured an empty `entries` array; a cold implementation review caught this, and the fix-pass restructured the test to snapshot after population — see Review history below.)

### Why this needed its own gate, not just lint

Watcher restore changes from a bulk-copy skip to the standard field-copy reassignment — same data, different mechanism — and this is also the first time `StateWatcher` entries pass through `assertJsonSafeStateValue`'s dev-mode JSON-safety check (added by an unrelated Plan 2 commit after this plan step's text was last written; the design doc's own Phase A framing still says step 2's encoder is "deliberately the first enforcement point" for these entries, which this migration supersedes one step early). Both are covered directly by the new test rather than left to incidental coverage, and both gate on the full suite plus `npm run test-parallel-undo`, per this repo's standing rule for anything touching `GameObjectUtils.ts`.

### Verification

Full-suite and undo-suite results were independently reproduced by the orchestrator (not just taken from the implementer's report) using a temporary, disposable jasmine reporter (`.anvil/p3-pa0/evidence-reporter.js`, never committed) that records exact per-case outcomes, to satisfy `forge.md`'s requirement for real per-case evidence rather than a runner exit code alone.

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run test-parallel` | 8517 specs, 0 failures, 13 pending |
| `npm run test-parallel-undo` | 8329 specs, 0 failures, 17 pending |

Baseline (pre-edit, same HEAD) was identical in shape (8517/0/13, 8329/0/17 after the fix-pass; the implementer's original pre-fix run matched too), so these are zero new failures and an unchanged pending count, not merely a passing run.

### Review history

One plan review (APPROVED WITH CONCERNS, 2 warnings, 1 nit — all three folded into the plan as implementer instructions: update the now-stale `assertJsonSafeStateValue` coverage-gap comment, document the `_uuid` reassignment blast radius from removing `isFullCopy`, and clarify which gate command actually exercises the new dev-mode check). Two implementation reviews: the first (APPROVED WITH CONCERNS, 1 warning) caught that the new rollback test's `rollback()` call wrapped the defeat itself, so the snapshot it took was always pre-population — the restore path being changed by this migration was never actually exercised with real data. One fix cycle restructured the test to populate the watcher entry before the snapshot point; the confirming delta review returned APPROVED with zero findings.

### Known residuals, disclosed and accepted at the gate

None. This unit's scope (Phase A step 0 only) is fully closed by the commit above; Phase A steps 1-6 and all of Phase B remain for `P3-PA1` onward per [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md). The performance capture is explicitly out of scope for this unit, owned by `P3-PB3`.

### Notes for the next agent

- `rollback(contextRef, assertion, altAssertion)` (`test/helpers/IntegrationHelper.js`) takes its snapshot **before** `assertion()` first runs, then replays the same `assertion()` after restoring to it. Any state meant to "survive a rollback unchanged" must already exist by the time `rollback()` is called — creating it *inside* the callback only ever exercises a rollback to an empty/prior value, never a populated one.
- The full-suite and undo-suite jasmine runs require `NODE_ENV=test` (set by the npm scripts via `cross-env`) for correct behavior: `TextHelper.ts` and several other modules branch on `process.env.NODE_ENV === 'test'` for message rendering. Running `jasmine` directly without it produces large numbers of spurious message-mismatch failures unrelated to any code change — confirmed here (~1000 spurious failures without `NODE_ENV=test`, zero with it, both runs otherwise identical) while building independent per-case verification evidence outside the npm scripts.
- `isFullCopy` was confirmed `true` (via temporary, reverted instrumentation of `copyState()` against the unmodified baseline) for all 15 concrete `StateWatcher` subclasses pre-migration, closing the `GameObjectUtils.ts` "NEEDS VERIFICATION" note about decorator-metadata prototype inheritance. Future `@registerState`/`@registerStateBase` work can rely on that inheritance mechanism without re-deriving it.

---

## `P3-PA1` — Codegen state serializers: generator, record format, registry key policy, lint fix (Plan 3, Phase A steps 1-2 + Phase B steps 6 and 10)

| | |
|---|---|
| Task ID | `p3-pa1` |
| Date | 2026-09-16 |
| Lane / tier | full, tier 3 (Large 🟡) |
| Plan | [03-codegen-serializers.md](03-codegen-serializers.md), Phase A steps 1-2, Phase B steps 6 and 10 |
| Parent | `dc7f8e2e8` |
| Commit | `75665d015` |
| Branch | `experimental/rollback-saves-optimizations` |

### What changed

Three new runtime modules and three new build-tooling modules, all additive and gitignored/dead-code for this unit - nothing in the live engine imports them, and the state bag / `copyState` / `v8.serialize` remain the sole snapshot authority (see `StateSerializers.ts`'s own file comment).

- **`server/game/core/StateEncoding.ts`** (new, leaf module): `STATE_RECORD_FORMAT_VERSION`, `STATE_ENCODING_TAGS` (`$map`/`$set`/`$num`), `SerializedStateRecord`/`SerializedPrimitive`/`IStateSerializer`/`IGeneratedSerializerEntry` types, and the encode/decode pairs for `value`/`ref`/`refArray`/`refMap`/`refSet`/`refRecord`. Ref encoders read `.uuid` directly and never call `getObjectId()` (AC2).
- **`scripts/stateSerializerModel.js`** (new, pure CommonJS): candidate-file scan, the generation-cache and schema-surface hashes, the cache header format, `selectTargets` (excludes mixin-fragment classes), and `assertModelIsGeneratable` (the two generation-time hard-fails).
- **`scripts/stateSerializerGenerator.js`** (new; loads `ts-morph` only on a cache miss): ports the retained planning pilot's mixin-chain resolver, emits `ISerialized<Class>` interfaces, `serialize<Class>`/`deserialize<Class>` functions, `generatedStateSerializerEntries`, and the schema-surface hash into the artifact.
- **`scripts/generate-state-serializers.js`** (new CLI entry, wired into `package.json`'s `generate-serializers` script): cache gate, `--print-model` for the AC1 completeness table, and a `require.cache` self-check that the warm path never loads `ts-morph`.
- **`server/game/core/StateSerializers.ts`** (new): the name-keyed registry, `getStateSerializerFor` (prototype-chain walk, per-constructor cache), and the one non-optional import of the generated artifact - the edge that turns a missing/ungenerated artifact into a `tsc` `TS2307` build failure.
- Build scripts (`scripts/build-server.js`, `build-dev.js`, `build-test.js`) prepend `node scripts/generate-state-serializers.js`. **`build-test.js`'s placement is unconditional, before the `isFast` branch entirely** - not inside the `!fs.existsSync('./build/server')` guard, which only fires on a tree's first build (see Known residuals; R18 below).
- `eslint.config.mjs`'s top-level `ignores` gains `server/game/core/generated/**` and `.anvil/**`, each with a comment recording the actual verified mechanism (see Known residuals; R15 below) rather than the plan doc's original, disproven claim.
- `.gitignore` gains `server/game/core/generated/`; `test/tsconfig.json`'s `include` gains `../scripts/stateSerializerModel.js` so its pure functions can be unit-tested normally; `package.json` gains `ts-morph@28.0.0` (exact pin, `devDependencies`) and the `generate-serializers` script.
- Exported the two previously-module-local `@registerState` classes for Plan 5: `FirstLightSmuggleAction` (`FirstLightHeadquartersOfTheCrimsonDawn.ts`) and `CustomDurationEvent` (`OngoingEffectEngine.ts`). Both are otherwise unused outside their files; `Index.ts`'s card discovery reads only `.default`, so the extra named export is invisible to it.
- `docs/plans/03-codegen-serializers.md`: corrected Phase B step 6 (registry key policy - structural rule, either decorator, not `@registerState`-only; the literal original rule would make lookup throw for every card) and Phase B step 10 (the eslint claim - the non-optional import does not trip `import-x`'s resolver on this config; the real hazard is the opposite one, an existing generated artifact being linted).

### Registry key policy - the load-bearing deviation from the plan doc's literal text

Verified against live code (all 138 registered classes, 126 top-level): no card class carries `@registerState` at all, so the plan doc's literal "registry keys are concrete `@registerState` classes" rule would give the registry zero entries for any card, and lookup would throw for every card instance. The rule actually implemented is structural: a class is a registry key if it carries **either** `@registerState` or `@registerStateBase` and is declared at module top level (not inside a mixin factory function body). Each entry also carries its decorator kind and `abstract` modifier so Plan 5 can recover concreteness without re-running the resolver. The generator's hard-fail on a module-local non-abstract registered class is extended from `@registerState` alone to both decorators for the same reason.

### A real bug the design's own "assign through the public accessor" contract exposed

Assigning a freshly-decoded, **non-empty** `Map`/`Set` through a `@stateRefMap`/`@stateRefSet` field's public setter crashes: `GameObjectUtils.ts`'s `UndoMap`/`UndoSet` override `set()`/`add()` to also write into the state bag, and that override reads a private field (`#init`) that is not yet initialized while the `Map`/`Set` base constructor is still running `super(entries)` for the initial entries - `TypeError: Cannot read private member from an object whose class did not declare it`. The engine's own rollback hydration path avoids this today by constructing empty and populating through `Map.prototype.set.call`/`Set.prototype.add.call` (bypassing the override). The generated deserializer for `refMap`/`refSet` fields reproduces that same shape at the call site (assign empty through the accessor, then populate via the live object's own `set()`/`add()`) rather than assigning a pre-populated collection - GameObjectUtils.ts itself was not touched. Caught by the `StateWatcherRegistrar.watchers` field in the full-object serialize-deserialize-serialize symmetry spec; not previously reachable because no engine code path assigns a pre-populated Map/Set through this setter (the documented usage is always populate-in-place after an empty `init`).

### Verification

Cold and warm generator wall-clock (Phase A acceptance numbers, not a `npm run benchmark` capture): **cold 5.2s** (fresh ts-morph project load + 126-target resolution + file emission), **warm 0.2-1.4s** (candidate-file scan + hash, no ts-morph loaded; range reflects this machine's filesystem I/O variance, confirmed via a `require.cache` self-check on every warm run). Materially higher than the retained planning pilot's narrower probe (2.85s / 83-96ms) because the real CLI also emits and atomically writes the artifact and hashes the full candidate-file-content set, which the pilot's probes measured separately.

**Re-measured (P3PA1-IB-1, implementation-review fix-pass)**, because an independent reviewer could not reproduce the warm 0.2-1.4s range (measured a tight 130-190ms over 28 runs) and flagged the original number as unreproducible/unmethodical. Re-ran `node scripts/generate-state-serializers.js` this machine, this tree, both cold and warm, with the script's own internal timers as well as external wall-clock:
- **Warm, 25 consecutive cache-hit runs:** internal "warm gate" timer (candidate-scan-and-hash only, excludes Node process startup) ranged **110-192ms**, average 124ms, one outlier at 192ms (24 of 25 runs fell in 110-152ms) - this closely matches the reviewer's independently-measured 130-190ms and **narrows the original 0.2-1.4s claim**, which does not reproduce on this run. Full CLI wall-clock (including Node startup) for the same 25 runs ranged 188-294ms.
- **Cold, 3 runs (artifact deleted between each):** internal "total" timer ranged **3.6-4.5s** (3611ms, 4347ms, 4514ms); external wall-clock 3.7-4.6s. Somewhat lower than the originally recorded 5.2s and the reviewer's independently-measured 5.27s, but the same order of magnitude and consistent with "fresh ts-morph project load + 126-target resolution" being the dominant, machine-load-sensitive cost; not contradicted, both numbers are in a 3.5-5.5s band on different runs of the same machine.
- Method: `date +%s%N` around each `node scripts/generate-state-serializers.js` invocation from a Git Bash shell, plus the script's own printed internal timers; the artifact's cache header sha256 was unchanged before/after (`e3ac70109aeec28f0bf8c870523b6cd3aac74d40d98264c6965ef611864de7cf`), confirming warm runs were genuine cache hits and cold runs regenerated identical output. No other build/test process ran concurrently.
- **Conclusion:** narrow the warm figure to **110-192ms (internal timer) / 188-294ms (full CLI wall-clock)**, superseding the 0.2-1.4s range above, which this and the independent reviewer's measurement both fail to reproduce and which is now treated as a one-off outlier of unknown cause on the original run. The cold figure is retained at ~3.6-5.3s (union of both measured samples); AC6's required behaviors (warm skips ts-morph, cold regenerates) are independently verified and unaffected by either number.

| Check | Result |
|---|---|
| `npm run lint` | exit 0, with the generated artifact absent, present, and with `.anvil/` populated by this run |
| `npx tsc --noEmit`, artifact absent | fails `TS2307` naming `./generated/GeneratedStateSerializers` |
| `npm run build` / `build-dev` / `build-test` / `test-fast` (twice in a row) | all exit 0; `test-fast` run twice confirmed generation runs on **both** invocations, not just the first |
| `--print-model` completeness table | 126 targets, 0 resolve errors, 0 empty field sets, sha256 `d45edc88898ad4cfbab6e8be160ef4a2bb55f98eda150448032c90e2766e59fb` - byte-exact match to the retained planning table, no reconciliation needed |
| `npm run test-parallel` (reporter-based, exact case identities) | 8586 specs: 8573 passed, 13 pending (unchanged identities), 0 failed - baseline's 8504 passing + this unit's 69 new cases |
| `npm run test-parallel-undo` (reporter-based, exact case identities) | 8398 specs: 8381 passed, 17 pending (unchanged identities), 0 failed - baseline's 8312 passing + this unit's 69 new cases |
| Real-tree injected-failure experiment | injected duplicate class name and injected module-local non-abstract class both threw the expected error; `git status` clean after revert; a subsequent run cache-hit |

New tests (all under `test/server/core/`, hardened proof level), **as committed** (69 total cases: 56 at the original delivery, 12 added by the first fix-pass, 1 by the second):

- `StateEncoding.spec.ts` (35 runtime cases: 33 literal `it(...)` sites, one inside a 3-element loop) - encoder/decoder domain, 15 reject-domain throw cases (13 from the original delivery plus P3PA1-IA-1's undefined-Map-value and undefined-Set-member cases), alias-freedom both directions, null-vs-empty collection distinction, populated `refSet`/`refRecord` round trips (round-2 review finding R17), and P3PA1-IA-3's six new decode-validation-throws cases (extra own key alongside `$map`/`$set`, non-array `$map`/`$set` payload, malformed `$map` entry shape, reserved tag with no decode branch). P3PA1-IA-8's vacuous `NaN`-assignment assertion was dropped from the existing non-finite-number test (modified, not removed as a case). The second fix-pass added P3PA1-D-2's nested-tagged-`$map`-value case, which asserts the exact encoded shape and that the nested values decode back as genuine `Map`/`Set` instances rather than plain objects.
- `GeneratedStateSerializers.spec.ts` (8 cases, up from 6) - registry coverage over a real played-out game, the Wampa-to-`NonLeaderUnitCard` mixin-flattening proof, entry metadata, the `getObjectId`-throwing-stub side-effect-freedom spec (P3PA1-IA-6: the unfalsifiable `hasRef`/`cannotHaveRefs` before/after pair was dropped from this case, not replaced, since AC2 is fully carried by the throwing stub), the live-record JSON round trip, the serialize-deserialize-serialize symmetry case (P3PA1-IA-7: rewritten to mutate state - Wampa damage, a hand-to-discard move - between passes, deserialize the pre-mutation record, and assert the mutation is undone, plus an identity check that the `UndoArray` reference actually changed rather than just asserting its type name), and two new P3PA1-IA-5 cases proving the `refMap`/`refSet` deserialize workaround repopulates the state bag (not just the live backing field) - one against the real `StateWatcherRegistrar.watchers`, one against a new purpose-built `RefSetWorkaroundFixture` (`refSet` has zero live users to exercise this against otherwise).
- `StateEncodingConstantsParity.spec.ts` (2 cases, new file, P3PA1-IC-1) - asserts `STATE_ENCODING_TAGS`/`STATE_RECORD_FORMAT_VERSION` deep-equality between the compiled `StateEncoding` module and `scripts/stateSerializerModel.js`'s hand-duplicated literals.
- `StateSerializerGeneration.spec.ts` (24 cases, unchanged) - `stateSerializerModel.js` over temporary fixture directories, including the visited-list cache-miss pair with its control, the missing-visited-file and `tsconfig.json` miss cases, path-separator independence, and the schema-surface-hash stability/sensitivity matrix.

No existing test was removed; two existing cases were narrowed (P3PA1-IA-6, P3PA1-IA-8) to remove assertions that could not fail, without reducing what they cover (AC2 remains fully carried by the throwing-`getObjectId`-stub assertion in both cases).

### Review history

Two plan reviews (round 2 APPROVED WITH CONCERNS, 4 findings - R15/R16/R18 warnings, R17 nit - all carried as disclosed residual risk per the reviewer's own recommendation, with R17 and R18 additionally acted on during implementation per the task's explicit instruction).

Implementation review round 1 (three cold lenses: correctness/security, ordering/performance/resources, architecture/contracts) - APPROVED WITH CONCERNS, 0 BLOCKING, 9 WARNING, 5 NIT, 2 questions. Full findings retained at `.anvil/p3-pa1/review-impl-round1-findings.md`. Fix-pass disposition:

- **Fixed (product code):** P3PA1-IA-1 (`Map`/`Set` `undefined` values now throw, mirroring the array-element rule), P3PA1-IA-3 (`decodeStateValue` now validates tagged-object shape: exactly one own key, `$map`/`$set` array-ness and pair shape, and throws on any reserved tag with no decode branch), P3PA1-IA-10 (`registerStateSerializers` now clears `lookupCache`).
- **Fixed (tests):** P3PA1-IA-5 (new specs assert the `refMap`/`refSet` workaround repopulates the state bag, not just the live backing field - one against the real `StateWatcherRegistrar.watchers`, one against a new purpose-built `RefSetWorkaroundFixture`), P3PA1-IA-7 (the symmetry spec now mutates state - Wampa damage, a hand-to-discard card move - between passes, deserializes the pre-mutation record, and asserts the mutation is undone; the `UndoArray` assertion is now paired with an identity check that the array reference actually changed), P3PA1-IA-6 (dropped the `hasRef`/`cannotHaveRefs` before/after pair that could not fail by construction; kept and documented why the throwing-`getObjectId` stub alone still carries AC2), P3PA1-IA-8 (dropped the vacuous `record.field = NaN; expect(...).toBeNaN()` assertion), P3PA1-IC-1 (new `StateEncodingConstantsParity.spec.ts` asserts `STATE_ENCODING_TAGS`/`STATE_RECORD_FORMAT_VERSION` deep-equality between the compiled `StateEncoding` module and `stateSerializerModel.js`; also closes P3PA1-IC-2, the same root cause).
- **Documented only, no code change (orchestrator disposition, scope fence forbids touching `GameObjectUtils.ts`):** P3PA1-IA-2/Q1 (shared-substructure non-preservation added as an explicit fourth narrowing to `StateEncoding.ts`'s doc comment, plus the twelve-live-`@stateValue`-payload audit below), P3PA1-IA-4/Q2 (the `refRecord`-null `Proxy(null, …)` TypeError recorded as a landmine below, beside the `UndoMap` finding).
- **Corrected:** P3PA1-IA-9 (`refMap` has three live users, not one - see the corrected "real bug" residual above), P3PA1-IB-1 (warm/cold generator wall-clock re-measured - see the timing addendum above).
- All eight required checks re-run against the new subject: full suite, undo suite, unit specs (74 cases now: the prior 56 + this fix-pass's 18 new/changed cases), lint/build, generator-model (`--print-model` sha256 unchanged, byte-exact), generator-hard-fails, `@stateValue` audit, docs.

**Audit of the twelve live `@stateValue` payloads for shared-substructure reliance (P3PA1-IA-2/Q1's disposition):** `AbilityLimit.useCount` (×2, one per subclass), `AdditionalPhaseEffect._phaseStartedForRounds`/`_phaseEndedForRounds`, `GainAbility._abilityUuidByTargetCard`, `GainNonKeywordAbilitiesFromUnitEffect`'s three `*UuidsByTargetCard` maps, `MutableOngoingEffectValueWrapper._value`, `Player.passedActionPhase`/`_decklist`, `StateWatcher.entries` - twelve, matching the reviewer's count. All are Maps/Sets keyed or valued by primitives (strings, numbers, string arrays), a nullable primitive, a nullable deck-list value object, or (for `MutableOngoingEffectValueWrapper._value`) a single independently-owned value per wrapper instance. None store the same object at two positions within one field's own value tree, and none is known to be aliased with another `@stateValue` field's payload in a way current code relies on for post-round-trip identity (`MutableOngoingEffectValueWrapper._value` may alias a live object it does not own, e.g. `card.aspects`, but that class's own doc comment already treats the stored value as read-only and does not depend on decode reproducing the same reference). Conclusion: no live payload today relies on `$ref`-style identity preservation; re-audit before Plan 6 ships if the live `@stateValue` set has grown, since adding one is free now but becomes a breaking save-format change (new tag, `STATE_RECORD_FORMAT_VERSION` bump) once Plan 6's save-compatibility gate exists.

### Known residuals, disclosed and accepted at the gate

1. **R15 (plan round 2)** - resolved during implementation: the eslint `ignores` comment states the actual verified mechanism (a local `npm run lint` in a tree containing `.anvil/`, not the repository's CI lint gate, since `.anvil/` is excluded via `.git/info/exclude` and never reaches a checkout) rather than the plan doc's overstated blast-radius prose.
2. **R16 (plan round 2)** - accepted as disclosed residual risk per the reviewer's recommendation. Not triggered this run: `--print-model`'s table reproduced the retained planning sha256 byte-for-byte with no reconciliation needed, since no unrelated commit changed a decorated field between planning and this implementation.
3. **R17 (plan round 2, nit)** - resolved during implementation: `StateEncoding.spec.ts` adds one populated (non-null) round-trip case each for `refSet` and `refRecord`, beyond the null-handling and side-effect-freedom cases the plan originally scoped.
4. **R18 (plan round 2)** - resolved during implementation: the generation call in `build-test.js` is unconditional and placed once before the `isFast` branch, verified by running `test-fast` twice in a row in a tree where `build/server` already existed and confirming generation ran both times.
5. **New, found during implementation (not in the plan's residual list):** the `UndoMap`/`UndoSet` private-field-during-`super()` issue described above. Disclosed here rather than silently worked around; `GameObjectUtils.ts` was not modified per the scope fence, and the generated deserializer's `refMap`/`refSet` code shape (assign empty, then populate via the live object's own mutation methods) is the compensating design choice. `refSet` has zero live users today, so this was only reachable through a live `refMap` user via this unit's own full-object round-trip spec - not through any existing engine path. **Correction (P3PA1-IA-9, implementation-review fix-pass):** `refMap` has **three** live users, not one as originally recorded here - `StateWatcherRegistrar.watchers` (`StateWatcherRegistrar.ts:15`), `DetachedOngoingEffectValueWrapper._targetStates` (`DetachedOngoingEffectValueWrapper.ts:16`), and `DynamicOngoingEffectImpl.values` (`DynamicOngoingEffectImpl.ts:20`); verified by grep for `@stateRefMap()` under `server/game/`, matching the artifact's three `encodeRefMap` call sites. The round-trip spec happened to reach the bug through `StateWatcherRegistrar.watchers` specifically, but any of the three would have. `P3-PA2`/`P3-PA3` should scope their handoff against three users, not one.
6. **Emitter is new code (plan's own disclosed risk).** The pilot proved the resolution *model* was right; this unit's build was its first real compile, and needed one fix (`as unknown as ISerialized<Class>` instead of a direct `as` cast, since `SerializedStateRecord` and the per-class interfaces don't structurally overlap for `tsc`'s "may be a mistake" check) beyond what the plan anticipated.

### Notes for the next agent

- The registry entry's `decorator`/`isAbstract` fields are **not** schema-surface-hash inputs by design (plan §4.5); do not add them without also updating `computeSchemaSurfaceHash` and its doc comment, or a flipped-to-abstract class will silently move the hash Plan 6 gates save compatibility on.
- `scripts/stateSerializerModel.js` duplicates `StateEncoding.ts`'s `STATE_ENCODING_TAGS`/`STATE_RECORD_FORMAT_VERSION` literals by hand (documented at the duplication site) because the generator is plain CommonJS and cannot import the TypeScript leaf module. **As of the implementation-review fix-pass (P3PA1-IC-1), a mismatch is no longer silent:** `test/server/core/StateEncodingConstantsParity.spec.ts` asserts deep equality of both constants between the two sources, converting the "keep in sync by hand" obligation into an enforced one. A mismatch still only ever under/over-invalidates the schema-surface hash rather than corrupting a record, since encode/decode still runs from `StateEncoding.ts` at runtime - but the new spec now fails the build if it happens.
- `P3-PA2`'s restore-leg parity harness needs the `UndoMap`/`UndoSet` finding above if it ever exercises `refMap`/`refSet` through the *generated* deserializer against a populated collection - it will not reproduce against `copyState`'s own hydration path, which already avoids the same landmine differently.
- The retained 126-target completeness table sha256 is a snapshot of the tree at the time of this run; per the plan's own §13 residual, an unrelated commit that adds or removes a decorated field will legitimately change it, and the fix is to reconcile line-by-line and record the reason, never to silently re-baseline or falsely report AC1 as failed.
- **Landmine, beside the `UndoMap`/`UndoSet` finding above (P3PA1-IA-4, disposition: document only, scope fence forbids touching `GameObjectUtils.ts`):** a generated `deserialize<Class>` for a `@stateRefRecord` field assigns a `null` decoded record straight through the field's public setter. `stateRefRecord`'s `init` accessor guards a `null` value, but its `set` accessor does not - `UndoSafeRecord(this, null, name)` reaches `new Proxy(null, …)`, which throws a `TypeError`. Latent today (`@stateRefRecord` has zero live users, so `scripts/stateSerializerGenerator.js:213`'s emitted code path is untested against real data), but it will crash the first time any unit adds a `@stateRefRecord` field and that field is ever `null` at deserialize time. Note the internal asymmetry with `refMap`/`refSet`, which both got an explicit null branch in their generated deserializer shape; `refRecord`'s single-assignment form inherited the unguarded setter instead. Whichever unit first wires in a `@stateRefRecord` field must either add a null guard to the generated deserializer shape or fix `stateRefRecord`'s `set` accessor in `GameObjectUtils.ts` (out of scope for every unit under this task's scope fence).
- **Forward-looking notes for Plan 4/5, recorded while cheap (P3PA1-IA-11):** (a) the deserialize leg reaches `markReferenced`'s `assertInitialized` on the *referent* for every ref-kind assignment, so Plan 5 must construct **and initialize** every object before any deserialize runs against it - constructing-then-deferred-initializing will throw partway through a restore. (b) the `refMap`/`refSet` workaround emits *N* individual `.set()`/`.add()` calls to repopulate a collection (see the `UndoMap`/`UndoSet` finding above), so any Plan 4 per-mutation delta hook observing those calls will record *N* separate entry mutations per collection on the restore leg, not one field-replacement mutation - a delta-based diff/journal design that assumes one mutation per restored field will undercount or misattribute these.

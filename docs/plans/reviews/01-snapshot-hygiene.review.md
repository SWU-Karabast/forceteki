# Adversarial Review: `docs/plans/01-snapshot-hygiene.md`

## Verdict

This plan is grounded in a genuinely accurate code survey — nearly every file/line reference checks out against main (`SnapshotFactory.ts:149`, `GameStateManager.ts:143-223`, `Game.ts:339`/`665-667`, `GameObjectUtils.ts:820`, `IntegrationHelper.js:78`, `GameObjectBase.ts:73-76`, the dead-code claims, the RNG claims — all verified). But it has two blocker-level defects in its *directions*: work item A's "cache the framework context per game" instruction would produce a correctness bug if followed literally, and work item B's acceptance test is unachievable as ordered because rollback itself allocates GameObjects (via the very `refreshContext` churn item A fixes), which contradicts the "each work item can land alone" claim. Additionally, item A's problem statement misdescribes the retention mechanism (transient wrappers are already pruned; only value-*changes* pin wrappers), and both of its proposed remediation options collide head-on with the fact that wrapper values can be functions and GameObject-bearing objects — which cannot become serialized state under the plan set's own Invariant 1. The plan should be revised before implementation starts; the work items themselves are directionally right.

---

## Blocker

### B1. Item A's "related fix" — caching the framework context per game — would break effect resolution

**Plan says:** "Cache the framework context/source per game (it is stateless) so rollback stops allocating."

**Code shows:** The context is *not* stateless after `refreshContext` runs. `OngoingEffect.refreshContext` (`server/game/core/ongoingEffect/OngoingEffect.ts:98-105`) mutates the context per effect: `context.source = this.source`, `context.ongoingEffect = this.ongoingEffect`, and `context.player` is derived per-effect from `this.source.controller` (via `abilityPlayer()`, line 94-96). The mutated context is then stored into the impl via `impl.setContext(this.context)` and consulted by `condition(this.context)` and `isEffectActive()` (`OngoingEffect.ts:141-165`).

**Why it matters:** One shared per-game `AbilityContext` across all `OngoingEffect`s is last-writer-wins on `source`/`player`/`ongoingEffect`. Every effect except the most recently refreshed one would evaluate its condition against the wrong source and wrong player. This is silent wrong-answers, not a crash.

**Fix to the plan:** Reword to "cache the context *per OngoingEffect* and mutate its fields in `refreshContext` instead of reallocating" — the field updates are still needed on rollback (controller can change). Separately, the throwaway `OngoingEffectSource` allocation (`AbilityContext.ts:63`) can be eliminated by letting `getFrameworkContext` accept/receive a shared per-game `OngoingEffectSource`, since `refreshContext` overwrites `context.source` immediately anyway.

### B2. Item B's acceptance test cannot pass unless item A's related fix lands first — the "independent PRs" claim is false for B

**Plan says:** Item B can "land alone"; acceptance is "snapshots, creates objects, rolls back, recreates the same game actions, and asserts the recreated objects receive the same uuids."

**Code shows:** Rollback *itself allocates GameObjects*. `GameStateManager.rollbackToSnapshot` calls `afterSetAllState` on every updated object (`GameStateManager.ts:214-217`); for each live `OngoingEffect` this runs `refreshContext` (`OngoingEffect.ts:205-207`) → `new AbilityContext` → `new OngoingEffectSource` (`AbilityContext.ts:63`), each of which passes through `register()` and increments `_lastGameObjectId` (`GameStateManager.ts:87-89`).

**Why it matters:** Two bad orderings, pick your poison:
- **Restore counter, then run `afterSetAllState`:** the transient `OngoingEffectSource`s consume ids `N+1..N+k` immediately, so replayed objects get `N+k+1...` — never matching pre-rollback ids. The acceptance test fails in any game with at least one live ongoing effect, i.e., essentially always.
- **Run `afterSetAllState`, then restore counter:** transients hold ids above the restored counter and stay registered in `gameObjectMapping` until the next `removeUnusedGameObjects` (next timepoint). Replayed objects counting up from `N` can collide with a still-registered transient uuid, and `register()` does a silent `gameObjectMapping.set` overwrite (`GameStateManager.ts:93`) — no assert protects the mapping, only the per-object uuid setter (`GameObjectBase.ts:73-76`).

**Fix to the plan:** State explicitly that item B depends on eliminating rollback-time GameObject allocation (item A's related fix), or on a `_isRollingBack` guard that hard-fails on registration during rollback (the hook for this already exists: `GameStateManager.ts:35-36`). Also note that the error-recovery path (`rollbackToSnapshot(beforeRollbackSnapshot)`, `GameStateManager.ts:191-200`) must restore the counter too.

---

## Major

### M1. Item A's problem statement misstates the retention mechanism — "every wrapper is permanently retained" is false

**Plan says:** "every wrapper is permanently retained and re-serialized into every snapshot thereafter," with the 10× `resolveEffects` loop as the multiplier making this "the dominant memory-growth term."

**Code shows:** A wrapper only receives `getObjectId()` → `_hasRef` when it is *stored*, and `DynamicOngoingEffectImpl.recalculate` only stores when the value **changed** (`DynamicOngoingEffectImpl.ts:34-44` — `compareValues` returns true on *difference*). Wrappers allocated while the value is stable — the overwhelmingly common case inside the 10× fixpoint loop — never get `hasRef` and are swept by `removeUnusedGameObjects`, which runs at every timepoint in both undo-enabled and undo-disabled modes (`GameStateManager.ts:98-118`, `:136-141`; `SnapshotManager.ts:116-120`).

**Why it matters:** The *permanent* growth term is one pinned wrapper per actual value change per target — real, but a very different magnitude than "10× per game-state resolution." This affects prioritization, the heap-benchmark expectations, and the acceptance test: "a unit with a `calculate`-based stat buff" whose value never changes is **already bounded today** — the test must use a value that changes every round (e.g., "+1 per friendly unit" with a changing board) or it validates nothing.

**Fix to the plan:** Correct the mechanism description (allocation churn = transient GC pressure; pinning = per value change), and tighten the acceptance test to require a *changing* dynamic value.

### M2. Both of item A's remediation options collide with non-serializable wrapper values

**Plan says:** Option 1: "The wrapper's value becomes decorated state; recalculation mutates instead of allocating." Option 2: "store the computed value as plain state... and stop making the wrapper a GameObject at all."

**Code shows:** Wrapper values are not JSON-safe in general: `compareValues` explicitly handles **function-typed values** (`DynamicOngoingEffectImpl.ts:69-71`) and objects/arrays **containing live GameObject references** (the JSON-replacer at `:77-88` exists precisely because of this). Today the value lives in a plain non-decorated field (`OngoingEffectValueWrapperBase.value`, `OngoingEffectValueWrapper.ts:11`) and rollback correctness rides entirely on wrapper-instance *immutability plus permanent retention*: state stores only the wrapper uuid (`stateRefMap` → `UndoMap.set` → `getObjectId`, `GameObjectUtils.ts:815-823`), and the old value survives rollback because the old instance survives. Additionally, `calculate` can return wrapper *subclass instances* directly (`recalculateValue`, `:60-62`) — `GainAbility` is a state-carrying GameObject with its own `@stateRef`/`@stateValue` fields (`GainAbility.ts:20-28`), so "stop making the wrapper a GameObject" cannot apply to that path.

**Why it matters:** Following either option as written for function- or GameObject-bearing values violates the plan set's own Invariant 1 (JSON-representable state) and would either crash `v8.serialize` or silently produce rollbacks that keep post-snapshot values. The plan's caveat ("check what depends on wrapper object identity") points at the wrong hazard — identity is checkable; serializability of the value domain is the actual wall.

**Fix to the plan:** Scope the fix to the churn path only (raw values wrapped at `:64`), and either (a) restrict in-place mutation + decorated state to provably serializable values while keeping immutable pinned wrappers for functions/objects, or (b) key the demotion on value type. Name `GainAbility`/`AdditionalPhaseEffect` as explicitly out of scope.

### M3. Item B underplays the client-protocol consequence of uuid reuse

**Plan says:** "Audit any external logging that assumes uuid uniqueness across the whole game session."

**Code shows:** uuids are not just logging — they are the **client's card identifiers**. `Card.getSummary` sends `uuid` to the client (`Card.ts:1420`, `:1435`) and client actions come back keyed by it (`Game.cardClicked(sourcePlayerId, cardId)`, `Game.ts:797`; `findAnyCardInPlayByUuid`, `:677`).

**Why it matters:** Today, counter drift guarantees a stale client message (e.g., a card click racing an opponent's undo) either resolves to the same object or fails lookup loudly. With reuse, a stale uuid can silently bind to a *different* card that recycled the id post-rollback. That's a user-visible wrong-action bug with a real race window, not a logging nicety.

**Fix to the plan:** Add the client protocol to the audit list and require either action-sequence guards on inbound messages around rollback, or a demonstration that all inbound messages are drained/invalidated before rollback completes.

---

## Minor

### m1. Item D's threat model is overstated — manual snapshots are not client-reachable today

**Plan says:** "A hostile or enthusiastic client can grow memory without limit."

**Code shows:** `Game.takeManualSnapshot` (`Game.ts:1794`) is called **only from test helpers** (`test/helpers/IntegrationHelper.js:50,111,316` and undo specs). There is no socket handler in `server/gamenode/` that triggers a manual snapshot — grep of `Lobby.ts`/`GameServer.ts` finds undo/rollback plumbing but no bookmark-creation route. The unbounded `SnapshotMap` (`SnapshotManager.ts:214-226`) is real but dormant.

Also: the plan's eviction proposal doesn't account for `rollbackManualSnapshot`'s `Contract.assertNotNullLike` (`SnapshotManager.ts:350`) — rolling back to an evicted bookmark would *throw through the game error handler* rather than fail gracefully. The eviction PR needs a "bookmark expired" path and client-visible signaling.

**Fix:** Reframe as "defense-in-depth before the feature ships to clients," and add the graceful-failure requirement.

### m2. Item C's "zero cost" ignores that the seed *is* the deck order

**Plan says:** "improves bug reports at zero cost."

**Code shows:** Consumption is fully seed-deterministic (`Randomness.ts`, seedrandom; all consumers via `game.randomGenerator`; no `Math.random`/crypto entropy in `server/game/`), so seed + message history ⇒ current deck order. The proposed sinks are safe today — `captureGameState` output goes only to the Discord dispatcher (`Lobby.ts:2450-2467`) and server logs — but the plan never states the constraint that the seed must not appear in any *client-bound* payload (lobby state, game state, undo messages), and a Bo3 lobby reusing one seed across games would make game 2's shuffles predictable.

**Fix:** Add "seed is a server-side secret for the duration of the match; one seed per `Game` instance" to the direction.

### m3. Item B's risk-note example is a non-example

**Plan says:** "confirm no map keyed by uuid outlives a rollback (e.g. `GainAbility._abilityUuidByTargetCard`)."

**Code shows:** That map is `@stateValue`-decorated (`GainAbility.ts:28`) — it lives *inside* the state object (`GameObjectUtils.ts:656-668`), is v8-serialized into every snapshot, and is rolled back with everything else. By construction it cannot outlive a rollback. The audit should target **non-state-tracked** structures keyed by uuid; citing a state-tracked one as the example will send the implementer to check exactly the safe cases.

---

## Nit

- **Line drift:** the `values.set` call is `DynamicOngoingEffectImpl.ts:52`, not `:53` (`:53` is `value.apply(target)`). README pre-excuses drift; noted for completeness.
- **Branch inventory:** `feature/undo-json` and `feature/gameobject-family-undo-initialize` exist only as *local* branches (no `origin/` counterpart in this clone), and none of the three deletion candidates are git-ancestors of `main` (consistent with squash-merges, but it means deletion requires `-D` and the "landed as PR #2179" claim can't be verified from the repo alone — `gh` was unavailable during this review). The plan should say "verify supersession via diff, not ancestry, before deleting."
- Everything else in item E checks out cleanly: `SnapshotArray` is `@deprecated` and reachable only via the equally deprecated `SnapshotFactory.createSnapshotArray` (`SnapshotFactory.ts:75-87`); `GameObjectBase.getState()` has zero callers (only `_promptState.getState()` matches, a different class); `UndoLimit.reset()`/`isPerGameLimit()` are never called (`incrementUses`/`hasReachedLimit` *are* — `Game.ts:1867,1878` — so the deletion must be surgical); the `UndoMode.Full` bug at `IntegrationHelper.js:78` is exactly as described.

---

## What I'd ask the author

1. For work item A, what is the intended rollback story for dynamic values that are functions or contain GameObject references? The current design handles them only via immutable-pinned-wrapper identity — is the real plan to keep pinning for those and only fix the primitive-value churn path, and if so, why isn't that scoping in the doc?
2. Item B's acceptance test asserts uuid-identity across a rollback-and-replay — was it written with the knowledge that `afterSetAllState` allocates GameObjects during rollback, and if so, where in the sequence do you intend to restore the counter?
3. For item D, is there a product roadmap item that actually exposes manual snapshots ("bookmarks") to clients? If not, is bounding a dormant test-only feature worth a PR ahead of, say, adding the missing graceful-failure path for rollback-to-missing-bookmark?

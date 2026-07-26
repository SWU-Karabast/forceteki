# Plan 1 — Snapshot Hygiene & Enablers

**Status:** Proposed (revised after adversarial review)
**Depends on:** Nothing
**Unblocks:** Shrinks the payload every later plan operates on; enables replay-for-repro
**Shape:** 4 small PRs (items A, B, C, E; item D is documented as a
prerequisite for a future feature, not scheduled work). Work items are
independent of each other **except B, which requires item A's
rollback-allocation fix to land first** (see B's direction for why).

## Goal

Fix the known memory-growth pathologies in the current snapshot system, close
two small correctness gaps, and land the cheap enablers (RNG seeding) that keep
future options open — all without architectural change.

---

## Work item A: Eliminate `OngoingEffectValueWrapper` churn

**Problem.** There are two distinct cost terms here; do not conflate them:

1. **Permanent pinning, one wrapper per value change.** A wrapper only becomes
   permanently retained when it is *stored*: `DynamicOngoingEffectImpl.recalculate`
   calls `setValue` only when `compareValues` detects a **difference**
   (`server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts:34-44`),
   and it is `UndoMap.set` on the `@stateRefMap values` map (`:52`) that calls
   `getObjectId()` (`GameObjectUtils.ts:820`) and sets the monotonic `_hasRef`
   latch. Nothing tracks reference death, so each superseded wrapper stays
   registered forever and is re-serialized into every subsequent snapshot. Net
   growth: one pinned wrapper per (effect, target) at first application, plus
   one per *actual value change* thereafter.
2. **Transient allocation churn.** `recalculateValue()` constructs a fresh
   `OngoingEffectValueWrapper` (a GameObject) every time it runs (`:64`), and
   `OngoingEffectEngine.resolveEffects` re-enters up to 10× per game-state
   resolution (`OngoingEffectEngine.ts:208-224`). Wrappers whose value did not
   change never get `hasRef` and are swept by
   `GameStateManager.removeUnusedGameObjects`, which runs at every timepoint in
   both undo-enabled and undo-disabled modes (`GameStateManager.ts:98-118`,
   `:136-141`; `SnapshotManager.ts:113-120`). This term is GC pressure and
   registration overhead, not snapshot growth.

**Scope constraint (important).** Wrapper values are **not JSON-safe in
general**: `compareValues` explicitly handles function-typed values
(`DynamicOngoingEffectImpl.ts:69-71`) and objects/arrays containing live
GameObject references (the JSON-replacer at `:77-88` exists for exactly this).
Today the value lives in a plain non-decorated field
(`OngoingEffectValueWrapperBase.value`, `OngoingEffectValueWrapper.ts:11`) and
rollback correctness rides on wrapper-instance *immutability plus retention*:
state stores only the wrapper uuid, and the old value survives rollback because
the old instance survives. Additionally, `calculate` can return wrapper
*subclass instances* directly (`recalculateValue`, `:60-62`) — `GainAbility` is
a state-carrying GameObject with its own `@stateRef`/`@stateValue` fields
(`GainAbility.ts:25-28`), as is `AdditionalPhaseEffect`. Moving function- or
GameObject-bearing values into decorated state would violate Invariant 1
(JSON-representable state). Therefore:

- **In scope:** the raw-value churn path only — values wrapped at `:64`.
- **Out of scope:** wrapper subclass instances returned directly by `calculate`
  (`GainAbility`, `AdditionalPhaseEffect`) and any value that is a function or
  contains GameObject references. These keep today's immutable-pinned-wrapper
  semantics.

**Direction.** Options, in order of preference (implementer to validate):

1. **Reuse:** keep one wrapper per (effect, target) and update its value in
   place, with the value as decorated state — **restricted to provably
   JSON-serializable values** (primitives; plain data at most). Keep allocating
   immutable pinned wrappers for everything else, keyed on a value-type check
   at the wrap site.
2. **Demote:** store the computed value as plain state on the impl (keyed map
   of target-uuid → value) and stop making the wrapper a GameObject — same
   value-type restriction, and only for the `:64` wrap path (the subclass path
   must keep returning GameObjects). Check what depends on wrapper object
   identity (`setContext`, effect description plumbing) before choosing this.

Prefer option 1 unless validation rules it out: Plan 5's stage 5b builds its
`OngoingEffectValueWrapper` recreation recipe on exactly the JSON-safe
decorated-value subset option 1 establishes (see Plan 5, "Closure-bearing
families" — the wrapper family split), so choosing option 2 would force that
plan to redo the state-modeling work.

Either way, also kill the transient-churn term: when the value is unchanged,
avoid registering a throwaway GameObject at all (e.g. compare before wrapping,
or use the existing `createWithoutRefsUnsafe` pattern deliberately).

**Related fix in the same area (prerequisite for item B):**
`OngoingEffect.refreshContext()` runs on every rollback via `afterSetAllState`
(`OngoingEffect.ts:205-207`) and allocates a new `AbilityContext` plus a new
framework `OngoingEffectSource` GameObject each time (`OngoingEffect.ts:99` →
`Game.getFrameworkContext()`, `Game.ts:1421-1423` → `AbilityContext.ts:63`).

Do **not** cache the framework context per game: `refreshContext` mutates the
context per effect (`context.source`, `context.ongoingEffect`,
`OngoingEffect.ts:98-105`) and `context.player` is derived per-effect from
`this.source.controller` (`abilityPlayer()`, `:94-96`); the mutated context is
consulted by `condition(this.context)` and `isEffectActive()` (`:141-165`). A
single shared context would be last-writer-wins on `source`/`player` — every
effect but the most recently refreshed one would evaluate its condition against
the wrong source and player, silently. Instead:

- Cache the context **per `OngoingEffect`** and have `refreshContext` update
  its fields in place instead of reallocating (the field updates are still
  needed on rollback — the controller can change).
- The remaining throwaway allocation — the `OngoingEffectSource` created when
  `AbilityContext` is constructed without a source (`AbilityContext.ts:63`) —
  can become a shared per-game instance supplied via `getFrameworkContext`,
  since `refreshContext` overwrites `context.source` immediately anyway.

**Acceptance.**
- Heap benchmark before/after over a scripted long game (port or adapt the
  benchmark harness from `feature/quick-undo-deltas-morph`'s
  `test/scenarios/undo/Performance.spec.ts` / `scripts/card-memory-benchmark.js`
  if useful).
- GameObject count after N rounds is bounded for a game using a dynamic ongoing
  effect **whose value actually changes every round** (e.g. a `calculate`-based
  buff of "+1 per friendly unit" over a changing board). A stable dynamic value
  is already bounded today and validates nothing.
- After the related fix: a rollback performs **zero** GameObject registrations
  (assertable via `GameStateManager.lastGameObjectId` before/after, or the
  item-B rollback guard once it exists).
- Full suite + `npm run test-undo` pass.

## Work item B: Restore `lastGameObjectId` on rollback

**Problem.** `IGameSnapshot.lastGameObjectId` is written at snapshot time
(`SnapshotFactory.ts:149`) but never read: `GameStateManager.rollbackToSnapshot`
(`GameStateManager.ts:143-223`) does not restore `_lastGameObjectId`. The
counter drifts upward across undo timelines. Harmless today (prevents uuid
collisions by accident), but it makes uuid assignment non-reproducible, which
Plans 5/6 need, and it silently grows uuid strings.

**Ordering dependency.** This item **cannot land alone**: rollback itself
currently allocates GameObjects. The `afterSetAllState` pass
(`GameStateManager.ts:214-217`) runs `OngoingEffect.refreshContext`
(`OngoingEffect.ts:205-207`) → `new AbilityContext` → `new OngoingEffectSource`
(`AbilityContext.ts:63`), each registering via the `GameObjectBase` constructor
(`GameObjectBase.ts:87`) and incrementing `_lastGameObjectId`
(`GameStateManager.ts:87-89`). Restoring the counter before that pass means the
transients consume the ids replayed objects should get; restoring it after
leaves transients registered above the counter until the next sweep, and a
replayed object counting up from the restored value can collide —
`register()` does a **silent** `gameObjectMapping.set` overwrite
(`GameStateManager.ts:93`); only the per-object uuid setter asserts
(`GameObjectBase.ts:73-76`). So: **item A's related fix (no rollback-time
allocation) must land first.**

**Direction.**
- Land after A's related fix. Additionally, activate the existing
  `_isRollingBack` hook (`GameStateManager.ts:35-36`) so that `register()`
  hard-fails during rollback — no silent degradation (Invariant 4). This turns
  any future reintroduction of rollback-time allocation into a loud test
  failure instead of a uuid-drift regression. (This item lands the guard
  unconditional; Plan 5's A2 rehydration scopes later relax its contract to
  "registration *outside an active rehydration scope* hard-fails" — the
  carve-out arrives with Plan 5, not here.)
- Restore `_lastGameObjectId` from the snapshot at the end of rollback (after
  `afterSetAllState`, which by then allocates nothing). The error-recovery path
  (`rollbackToSnapshot(beforeRollbackSnapshot)`, `GameStateManager.ts:190-200`)
  must restore the counter too.
- Add an assert in `register()` against overwriting an existing
  `gameObjectMapping` key while you are here — no longer optional: Plan 5's
  A2 scope-close protocol requires this occupancy assert (it is what turns
  the silent overwrite at `GameStateManager.ts:93` into a loud failure).
- Verify no code relies on post-rollback uuids being globally unique versus
  pre-rollback removed ones — removed objects are deleted from
  `gameObjectMapping`, and re-created objects would now reuse their ids.
- **Client protocol audit (not just logging).** uuids are the client's card
  identifiers: `Card.getSummary` sends `uuid` to the client (`Card.ts:1420`,
  `:1435`) and client actions come back keyed by it
  (`Game.cardClicked(sourcePlayerId, cardId)`, `Game.ts:797`;
  `findAnyCardInPlayByUuid`, `:677`). Today, a stale client message racing an
  undo either resolves to the same object or fails lookup loudly; with reuse, a
  stale uuid can silently bind to a *different* card that recycled the id
  post-rollback. Require either action-sequence guards on inbound messages
  around rollback, or a demonstration that all inbound messages are
  drained/invalidated before rollback completes.

**Acceptance.** A test on a game containing at least one live ongoing effect
that: snapshots, creates objects, rolls back, recreates the same game actions,
and asserts (a) the recreated objects receive the same uuids and (b) the
rollback itself performed zero registrations (the `_isRollingBack` guard did
not fire). Full suite + `npm run test-undo`.

## Work item C: Seed the RNG in production and surface the seed

**Problem.** `Game` constructs `new Randomness()` unseeded (`Game.ts:339`);
`setRandomSeed` (`Game.ts:665-667`) is called only from tests. The engine is
otherwise fully deterministic (no `Math.random` in `server/`; all consumers go
through `game.randomGenerator`). An explicit logged seed is a prerequisite for
any future replay-based repro tooling and improves bug reports at low cost.

**Direction.**
- Generate an explicit seed at `Game` construction (e.g. from the lobby or a
  crypto-random string), pass it to `Randomness`, store it on the game.
- Include the seed in `captureGameState` bug-report output and in the
  game-start log line. Both sinks are server-side only today — the Discord
  dispatcher (`Lobby.ts:1652-1665`, `:1686-1699`) and server logs — keep it
  that way.
- **The seed is a server-side secret for the duration of the match.** Because
  the engine is fully seed-deterministic (`Randomness.ts` wraps seedrandom),
  seed + message history reveals the deck order. The seed must never appear in
  any client-bound payload (lobby state, game state, undo messages).
- **One seed per `Game` instance.** A Bo3 lobby must generate a fresh seed for
  each game; reusing one would make game 2's shuffles predictable to a player
  who saw game 1's.
- Optionally accept a seed in `GameConfiguration` for repro runs.

**Acceptance.** Two games created with the same seed and same decks produce
identical shuffles. Seed visible in bug-report payload. A check (test or code
review gate) that the seed is absent from client-bound game/lobby state.

## Work item D: Bound manual snapshots — not scheduled; prerequisite for client-facing bookmarks

**Status: dropped from near-term scope. No PR planned.** `Game.takeManualSnapshot`
(`Game.ts:1794`) is reachable only from test helpers
(`test/helpers/IntegrationHelper.js:50,111,316`) and undo specs — no socket
handler in `server/gamenode/` creates a manual snapshot — so the unbounded map
is dormant, and a cap value cannot be chosen sensibly without knowing the
product shape of the feature that would expose it. The analysis below is kept
for the future implementer; its status is prerequisite-only.

**The problem (real, verified).** Manual snapshots are stored in `SnapshotMap`
keyed by `snapshotId`, one map per player, unbounded in key count
(`SnapshotManager.ts:214-226`). Each retained snapshot holds full game-state
buffers.

**Prerequisite contract.** Whatever feature first exposes manual snapshots
("bookmarks") to clients must land, **in the same change**:

- (a) a bound on the per-player map (cap + oldest-first eviction), and
- (b) a graceful "bookmark expired" path with client-visible signaling —
  eviction makes rollback-to-a-missing-bookmark a reachable state, and
  `rollbackManualSnapshot` currently hard-asserts on a missing snapshot via
  `Contract.assertNotNullLike` (`SnapshotManager.ts:350`), which would throw
  through the game error handler.

The cap value is chosen when that feature is specified, and should derive from
the existing undo retention window rather than a magic constant.

**Acceptance (for that future change, not this plan).** Unit test on eviction
behavior; a test that rolling back to an evicted snapshot id fails gracefully
(no thrown contract error, player-visible message); existing manual-snapshot
specs pass.

## Work item E: Housekeeping (single cleanup PR)

- Delete deprecated dead code: `SnapshotArray`
  (`container/SnapshotArray.ts`, marked `@deprecated` and reachable only via
  the equally deprecated `SnapshotFactory.createSnapshotArray`,
  `SnapshotFactory.ts:75-87`).
- Delete dead `GameObjectBase.getState()` (the `structuredClone` path;
  the snapshot path uses `getStateUnsafe()` exclusively).
- Fix `test/helpers/IntegrationHelper.js:78`: passes nonexistent
  `UndoMode.Full` (evaluates to `undefined`, silently defaulted to `Free` by
  `GameFlowWrapper.js:21`). Change to `UndoMode.Free` explicitly.
- Remove never-called `UndoLimit.reset()` / `isPerGameLimit()` or wire them up
  intentionally. **Surgical deletion only**: `incrementUses` and
  `hasReachedLimit` *are* called (`Game.ts:1867`, `:1878`) and must stay.
- Delete merged/superseded branches: `feature/undo-json`,
  `feature/gameobject-family-undo`, `feature/gameobject-family-undo-initialize`.
  Notes: `feature/undo-json` and `feature/gameobject-family-undo-initialize`
  exist only as local branches (no `origin/` counterpart); none of the three is
  a git-ancestor of `main` (consistent with squash-merges), so **verify
  supersession via diff against `main`, not ancestry**, before deleting —
  deletion requires `git branch -D`. Optionally archive-tag the delta/ts-morph
  branches referenced by Plans 3–4 before any deletion.

## Explicit non-goals

- No changes to snapshot cadence, format, or the decorator system.
- No delta or codegen work (Plans 3–4).
- Work item A must not change observable game behavior — only allocation
  patterns.
- Work item A does not change retention semantics for function-typed or
  GameObject-bearing wrapper values, nor for wrapper subclasses
  (`GainAbility`, `AdditionalPhaseEffect`) — those keep the
  immutable-pinned-wrapper model.

## Risks / notes for reviewer

- Work item A touches the ongoing-effect engine, the most stateful subsystem;
  the undo-all-tests run (`ENABLE_UNDO_ALL_TESTS=true`) is the real gate, not
  just the default suite.
- Work item B changes uuid reuse semantics after rollback. The
  `GameObjectBase.uuid` setter asserts single assignment
  (`GameObjectBase.ts:73-76`) — recreated-after-rollback objects are *new*
  instances so this is fine. The audit for maps keyed by uuid that outlive a
  rollback must target **non-state-tracked** structures (client/lobby-layer
  maps, logging, anything outside the state system). State-decorated maps such
  as `GainAbility._abilityUuidByTargetCard` (`@stateValue`, `GainAbility.ts:28`)
  live inside the serialized state and are rolled back with everything else —
  they are safe by construction and not what the audit is for.
- Work items A and B are ordered (B depends on A's related fix); the header's
  "independent PRs" applies to the rest.

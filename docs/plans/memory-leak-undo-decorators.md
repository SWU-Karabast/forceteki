# Memory Leak Analysis: Undo Decorators & State Mapping Cache

## Context

A steady memory increase in the application server was traced to the "Full Undo Decoration Migration" release (#2179) and subsequent "Game State Optimizations" (#2275). These PRs introduced `@stateRef*` decorators that maintain a **dual-storage** system for each decorated property: a serializable state (IDs) and a live cache (actual object references). This analysis identifies the root cause(s) of the memory growth and recommends targeted fixes.

---

## Root Cause #1 — `hasRef` is Irreversible, Preventing GO Cleanup (PRIMARY)

**Location:** `server/game/core/GameObjectBase.ts:158`, `server/game/core/snapshot/GameStateManager.ts:98-118`

**The bug:** The `_hasRef` flag is set to `true` permanently the first time `getObjectId()` is called on a `GameObjectBase`. It is **never reset** to `false`. `removeUnusedGameObjects()` only removes GOs where `!go.hasRef`.

**Why this is a leak:** With the decorator migration, every GO stored in a `@stateRefArray`, `@stateRefMap`, or `@stateRefSet` collection has `getObjectId()` called on it during the `set` callback (via `createIdArray`, `createIdMap`, `createIdSet`). Once a `OngoingEffect`, `CustomDurationEvent`, or similar transient GO is added to any state-tracked collection, it gets `hasRef = true` and **can never be removed by `removeUnusedGameObjects()`**, even after it expires and is removed from the collection.

**Concrete example:**
```typescript
// OngoingEffectEngine.ts
@stateRefArray()
public accessor effects: readonly OngoingEffect[] = [];

// In add():
this.effects = [...this.effects, effect];  // triggers set → createIdArray → getObjectId() → hasRef = true

// In unapplyAndRemove():
this.effects = remainingEffects;  // removed effects still have hasRef = true → stuck in allGameObjects forever
```

**Impact:** `allGameObjects` and `gameObjectMapping` in `GameStateManager` grow monotonically throughout the game as effects are created and expired. Since `buildGameStateForSnapshot()` calls `removeUnusedGameObjects()` before serializing, the snapshot `states` buffers grow larger with every snapshot taken as the game progresses. With undo enabled, 3 action snapshots + 2 phase snapshots accumulate large buffers.

**The unimplemented fix:** `GameStateManager.afterTakeSnapshot()` was left as an empty TODO for exactly this purpose. This method is empty **and never called**, meaning the intended cleanup path was never implemented.

---

## Root Cause #2 — `SnapshotManager.clearAllSnapshots()` Omits `quickSnapshots`

**Location:** `server/game/core/snapshot/SnapshotManager.ts`

**The bug:** `quickSnapshots: Map<string, MetaSnapshotArray>` was never cleared by `clearAllSnapshots()`. Each `MetaSnapshotArray.entries` grows with every action snapshot taken (one entry added per `addSnapshotFromMap` call) and is only pruned during rollback. In games without undo, entries accumulate for the whole game.

Additionally, `clearAllSnapshots()` itself was never called anywhere in the game lifecycle (not in `Game.ts` or `Lobby.ts`), so snapshot buffers lingered indefinitely after game end.

---

## Root Cause #3 — Double UndoMap Creation During `stateRefMap` Hydration (INVESTIGATED, NOT CONFIRMED)

**Location:** `server/game/core/GameObjectUtils.ts` (stateRefMap hydrator)

**Initially suspected:** During `copyState` (called from `setState` during rollback), the hydrator for `stateRefMap` was thought to call through the decorated accessor, triggering redundant ID map creation and a second `UndoMap` allocation.

**Finding on investigation:** The hydrators call `target.set` which refers to the **raw backing field setter** captured in the decorator's closure — not the decorated accessor. No double-allocation occurs. This root cause was dismissed.

---

## Fixes Implemented

### Fix 1 — `MetaSnapshotArray.clearAllEntries()`

**File:** `server/game/core/snapshot/container/MetaSnapshotArray.ts`

Added a new public method to allow full cleanup of the entries array:

```typescript
public clearAllEntries(): void {
    this.entries = [];
}
```

### Fix 2 — `SnapshotManager.clearAllSnapshots()` now clears `quickSnapshots`

**File:** `server/game/core/snapshot/SnapshotManager.ts`

Updated `clearAllSnapshots()` to iterate `quickSnapshots` and clear both its entries and the outer map. Also clears the `manualSnapshots` outer map (previously only iterated its values):

```typescript
public clearAllSnapshots(): void {
    this.actionSnapshots.clearAllSnapshots();
    this.phaseSnapshots.clearAllSnapshots();
    this.snapshotFactory.clearCurrentSnapshot();

    for (const playerSnapshots of this.manualSnapshots.values()) {
        playerSnapshots.clearAllSnapshots();
    }

    for (const quickSnapshotArray of this.quickSnapshots.values()) {
        quickSnapshotArray.clearAllEntries();
    }
    this.quickSnapshots.clear();
    this.manualSnapshots.clear();
}
```

### Fix 3 — Call `clearAllSnapshots()` at game end

**File:** `server/game/core/Game.ts`

Added explicit cleanup in `endGame()` immediately after `finishedAt` is set, freeing all snapshot memory once undo is no longer possible:

```typescript
this.finishedAt = new Date();

// Free snapshot memory now that the game is over and undo is no longer possible.
this._snapshotManager.clearAllSnapshots();

this._router.handleGameEnd();
```

### Fix 4 — Documentation of deferred `hasRef` fix

**Files:** `server/game/core/snapshot/GameStateManager.ts`

Added detailed explanatory comments to `removeUnusedGameObjects()` and `afterTakeSnapshot()` describing the accumulation problem and the required implementation path for the full fix (see "Deferred Work" below).

---

## Deferred Work — Snapshot-Aware GO Cleanup (Root Cause #1)

The primary leak (expired GOs accumulating in `allGameObjects` forever) requires an architectural change that was out of scope for this fix. The `afterTakeSnapshot()` method in `GameStateManager` remains a no-op pending this work.

**Required implementation steps:**

1. Replace the `_hasRef: boolean` on `GameObjectBase` with a `refCount: number`. Increment it inside `UndoArray`/`UndoMap`/`UndoSet` `set`/`add` operations; decrement it in `delete`/`splice`/`clear` operations.

2. Track the minimum `lastGameObjectId` across all live snapshots in `SnapshotHistoryMap`. Each `IGameSnapshot` already stores `lastGameObjectId`.

3. After evicting old snapshots, remove GOs from `allGameObjects` whose `refCount === 0` AND whose id is older than the minimum live snapshot's `lastGameObjectId` (so rollback can still find GOs it needs).

4. Call `afterTakeSnapshot()` (currently empty and unused) after each snapshot is taken and after old snapshots are evicted.

**Why this was deferred:** Incorrect implementation of step 3 would silently break rollback — `rollbackToSnapshot` restores state from the registry, and a missing GO cannot be reconstructed. The snapshot-awareness gating in step 3 requires careful coordination between `SnapshotHistoryMap` eviction events and `GameStateManager` cleanup, which warrants its own focused PR with thorough rollback test coverage.

---

## Verification

1. **Memory profiling:** Run a game to completion with undo enabled. Take a heap snapshot before the game starts and after each round. Verify that `allGameObjects` size no longer grows after game end (Fixes 2–3), and ideally stabilizes or shrinks as effects expire during the game (requires deferred Fix above).
2. **Unit test:** Add a test that creates an `OngoingEffect`, adds it to the engine, removes it, then calls `removeUnusedGameObjects()` and verifies the effect is removed from `allGameObjects`. This test will fail until the deferred ref-counting work is done.
3. **Snapshot buffer size:** Log the size of `states` buffer in `IGameSnapshot` over the course of a game. With the full fix, it should not grow monotonically with each snapshot.
4. **Rollback correctness:** Ensure existing rollback tests still pass after any `hasRef` / ref-count changes.

# Delta-Based Quick Snapshots

## Problem

Every time `moveToNextTimepoint` fires (every player action, phase boundary, regroup step, etc.), `SnapshotFactory.createSnapshotForCurrentTimepoint` calls `v8.serialize` on the state of **all ~200–500 GameObjects** plus `Game.state`. This happens at every single player action (dozens per game). Quick snapshots — used for the lightweight "undo last action" feature — are currently pointers into these full snapshots via `MetaSnapshotArray`.

The goal is to **stop creating full snapshots at every timepoint** during the action phase. Instead, track field-level changes via reverse deltas for quick/action undo. Full snapshots remain at phase boundaries and for manual snapshots.

## Background & Architecture

### Current Snapshot Flow

```
moveToNextTimepoint(timepoint)
  → game.resetForNewTimepoint()
  → snapshotFactory.createSnapshotForCurrentTimepoint(timepoint)   // EXPENSIVE
    → v8.serialize(game.state)                                      // ~1-2KB
    → gameStateManager.buildGameStateForSnapshot()                  // v8.serialize ALL GO states
  → takeSnapshot(settings)
    → store in actionSnapshots / phaseSnapshots container
    → addQuickActionSnapshot(playerId)                              // pointer into actionSnapshots
```

### Key Files

| File | Role |
|---|---|
| `server/game/core/GameObjectUtils.ts` | State decorators (`@statePrimitive`, `@stateRef`, `@stateRefArray`, etc.), `Undo*` collection classes, `copyState` |
| `server/game/core/GameObjectBase.ts` | Base class for all game objects. Owns `state` object. `setState()`, `getState()`, `copyState()` |
| `server/game/core/snapshot/SnapshotManager.ts` | Orchestrates all snapshot types. `moveToNextTimepoint()`, `takeSnapshot()`, `rollbackTo()` |
| `server/game/core/snapshot/SnapshotFactory.ts` | Creates `IGameSnapshot` objects, manages snapshot ID counters, `clearNewerSnapshots` |
| `server/game/core/snapshot/GameStateManager.ts` | Manages GO registry. `buildGameStateForSnapshot()`, `rollbackToSnapshot()`, `register()` |
| `server/game/core/snapshot/SnapshotInterfaces.ts` | `IGameSnapshot`, `SnapshotTimepoint`, `IGameState`, snapshot settings interfaces |
| `server/game/core/snapshot/container/MetaSnapshotArray.ts` | Current quick snapshot container (pointers to full snapshots) |
| `server/game/core/snapshot/container/SnapshotHistoryMap.ts` | Bounded container for action/phase snapshots |
| `server/game/core/snapshot/container/SnapshotContainerBase.ts` | Base class with `clearNewerSnapshots` binding |
| `server/game/core/Game.js` | `Game.state` (plain object, not a GameObjectBase). Manual getters/setters for state fields |

### How State Decorators Work

Every `GameObjectBase` subclass uses decorators on accessors:

- **`@statePrimitive()`**: `string | number | boolean`. Setter writes directly to `this.state[name]`.
- **`@stateValue()`**: Arbitrary structuredClone-compatible values. Same as `statePrimitive`.
- **`@stateRef()`**: Single `GameObjectBase` reference. State stores `GameObjectRef` (`{isRef: true, uuid}`), backing field caches the resolved live object.
- **`@stateRefArray(readonly)`**: Array of GO refs. State stores `GameObjectRef[]`. Mutable variant wraps in `UndoArray` proxy.
- **`@stateRefMap()`**: `Map<string, GO>`. State stores `Map<string, GameObjectRef>`. Uses `UndoMap` proxy.
- **`@stateRefSet()`**: `Set<GO>`. State stores `Set<string>` (UUIDs). Uses `UndoSet` proxy.
- **`@stateRefRecord()`**: `Record<string, GO>`. State stores `Record<string, GameObjectRef>`. Uses `UndoSafeRecord` proxy.

`UndoArray`, `UndoMap`, `UndoSet`, and `UndoSafeRecord` all override mutation methods (`push`, `pop`, `set`, `delete`, `clear`, `splice`, etc.) to mirror changes into `this.go.state[this.prop]`.

### How Rollback Currently Works (`GameStateManager.rollbackToSnapshot`)

1. `game.state = v8.deserialize(snapshot.gameState)`
2. `snapshotStatesByUuid = v8.deserialize(snapshot.states)` → `Record<uuid, state>`
3. For each GO in `allGameObjects` (reverse order):
   - If UUID not in snapshot → mark for removal
   - Otherwise → `go.setState(updatedState)` (replaces `this.state`, calls `copyState` to rebuild caches, calls `afterSetState`)
4. Call `cleanupOnRemove(oldState)` on removed GOs, remove from registry
5. Call `afterSetAllState(oldState)` on all updated GOs (cross-GO dependencies like ongoing effects)

Error handling: on failure, attempts to restore pre-rollback state. If that also fails, calls `reportSevereRollbackFailure` which halts the game.

### `afterSetState` / `afterSetAllState` Overrides

These hooks have side effects that must also run during delta rollback:

- **`afterSetState`**: `TriggeredAbility`, `AbilityLimit`, `CustomDurationEvent` — register/unregister event listeners on `Game` based on `isRegistered` changing.
- **`afterSetAllState`**: `OngoingEffect` — `refreshContext()`. `OngoingEffectEngine` — `resolveEffects(true)`. **These run on ALL GOs during full rollback**, not just changed ones — delta rollback must match this scope (see Edge Case 3a).

### Quick Snapshot Lifecycle

Quick snapshots are entries in `MetaSnapshotArray` (per player). They store closures over the source snapshot container (`actionSnapshots` or `phaseSnapshots`):

```typescript
entries.push({
    rollback: () => snapshotMap.rollbackById(snapshotId),
    checkAvailable: () => snapshotMap.hasSnapshotId(snapshotId),
    snapshotProperties: () => snapshotMap.getSnapshotPropertiesById(snapshotId),
    snapshotId
});
```

`QuickRollbackPoint.Current` = last entry, `QuickRollbackPoint.Previous` = second-to-last.

Created when:
- `SnapshotType.Action` is taken → `addQuickActionSnapshot(playerId)`
- `SnapshotType.Phase` is taken for Regroup/Setup → `addQuickStartOfPhaseSnapshots(phase)` (all players)
- Action phase starts → `addQuickStartOfActionSnapshot(playerId)` (references the Action phase start snapshot)

Pruned by `clearNewerSnapshots(snapshotId)` which filters entries where `snapshotId > threshold`.

---

## Design: Reverse Delta Snapshots

### Core Concept

A **reverse delta** records the **old values** of fields before they were mutated during a tracking window. To undo changes, restore the old values. Only the first write per field per GO is recorded (subsequent writes are no-ops since the original value is already saved).

```
Delta storage shape:
  Map<string /*uuid*/, Record<string /*fieldName*/, any /*previousValue*/>>
```

### What Changes When

| Timepoint | Current | Proposed |
|---|---|---|
| `StartOfPhase` | Full snapshot | **Full snapshot** (unchanged — delta chain anchor) |
| `EndOfPhase` | Full snapshot | **Full snapshot** (unchanged) |
| `Action` | Full snapshot | **Delta only** (the big win) |
| `Mulligan` | Full snapshot | Full snapshot (setup, infrequent) |
| `SetupResource` | Full snapshot | Full snapshot (setup, infrequent) |
| `RegroupResource` | Full snapshot | **Delta only** |
| `RegroupReadyCards` | Full snapshot | **Delta only** |

### Delta Chaining for Multi-Step Rollback

```
Phase Start (full snapshot at T0)
  → Action 1: Delta D1 (records T0→T1 field changes before they happened)
  → Action 2: Delta D2 (records T1→T2 field changes)
  → Action 3: Delta D3 (records T2→T3 field changes)
  ← Current state is T3

To rollback 1 action (to T2): apply D3
To rollback 2 actions (to T1): apply D3, then D2
To rollback 3 actions (to T0): apply D3, D2, D1
Phase undo (to T0): use the full phase snapshot directly
```

Maximum delta chain length is bounded by the action snapshot limit (**currently 3** per player in `SnapshotManager.SnapshotLimits`).

### `Game.state` Handling

`Game.state` is a plain object (~11 fields, ~1-2KB serialized). It is **not** a `GameObjectBase`. Continue using `v8.serialize(game.state)` in delta snapshots — the cost is negligible and avoids the complexity of intercepting the manual getters/setters in `Game.js`.

### Collection Handling

When any element in a collection (array/map/set/record) is mutated in-place, **bulk copy** the entire state-side collection on the first mutation. Subsequent mutations to the same collection during the same tracking window are no-ops for delta purposes.

```
First push to zone.cards during this window:
  delta[zone.uuid]["cards"] = zone.state.cards.concat()  // shallow copy of ref array
  
Second push to zone.cards:
  no-op (old value already recorded)
```

This is simple and fast enough. Typical collection sizes:
- Zone card lists: 0–40 refs (most common mutation target)
- Ability arrays per card: 1–5 refs
- Upgrades/ongoing effects: 0–10 refs
- Maps/Sets: rarely used, small

### Error Handling

On delta rollback failure, match the existing error handling pattern:
- If rollback fails, attempt to restore from `beforeRollbackSnapshot` (same pattern as full snapshot rollback today).
- If restore also fails (or there is no `beforeRollbackSnapshot`), call `reportSevereRollbackFailure(error)`.
- Preserve the existing user-facing alert path when recovery from `beforeRollbackSnapshot` succeeds.

---

## Implementation Steps

### Step 1: Define `IDeltaSnapshot` Interface

**File**: `server/game/core/snapshot/SnapshotInterfaces.ts`

Add:

```typescript
export interface IDeltaSnapshot {
    /** Monotonically increasing snapshot ID (from SnapshotFactory) */
    id: number;

    /** Field-level changes: uuid → { fieldName: previousValue } */
    changedFields: Map<string, Record<string, any>>;

    /** UUIDs of GOs created during this delta window (to remove on rollback) */
    createdObjectUuids: string[];

    /**
     * v8-serialized Game.state at the START of this delta window.
     * Captured by DeltaTracker.startTracking(), NOT at checkpoint time.
     */
    gameState: Buffer;

    /**
     * RNG state at the START of this delta window.
     * Captured by DeltaTracker.startTracking(), NOT at checkpoint time.
     */
    rngState: IRandomness['rngState'];

    /**
     * Last GO ID at the START of this delta window.
     * Captured by DeltaTracker.startTracking(), NOT at checkpoint time.
     */
    lastGameObjectId: number;

    // Metadata (same purpose as IGameSnapshot)
    actionNumber: number;
    roundNumber: number;
    phase: PhaseName;
    timepoint: SnapshotTimepoint;
    timepointNumber: number;
    activePlayerId?: string;
    requiresConfirmationToRollback: boolean;

    /**
     * Same semantics as IGameSnapshot.nextSnapshotIsSamePlayer.
     * Used by quick-undo confirmation checks to detect whether opponent acted since this checkpoint.
     */
    nextSnapshotIsSamePlayer?: boolean;
}
```

### Step 2: Create `DeltaTracker` Class

**New file**: `server/game/core/snapshot/DeltaTracker.ts`

Core design:

```typescript
import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IDeltaSnapshot } from './SnapshotInterfaces';
import * as v8 from 'v8';

export class DeltaTracker {
    readonly #game: Game;

    private _tracking = false;
    private changedFields = new Map<string, Record<string, any>>();
    private createdObjectUuids: string[] = [];

    // Captured at startTracking() — these represent the state at the START of the delta window.
    // They must be captured here (not at checkpoint time) because game state will have been
    // mutated by the time checkpoint() is called.
    private _windowStartGameState: Buffer | null = null;
    private _windowStartRngState: any = null;
    private _windowStartLastGameObjectId: number = 0;

    public get isTracking(): boolean {
        return this._tracking;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    /**
     * Begin a new tracking window. Captures Game.state, RNG state, and lastGameObjectId
     * at this moment — these are the values that will be restored on rollback.
     */
    public startTracking(): void {
        this._tracking = true;
        this.changedFields.clear();
        this.createdObjectUuids = [];

        // Snapshot the start-of-window state NOW, before any mutations happen
        this._windowStartGameState = v8.serialize(this.#game.state);
        this._windowStartRngState = this.#game.randomGenerator.rngState;
        this._windowStartLastGameObjectId = this.#game.gameStateManager.lastGameObjectId;
    }

    public stopTracking(): void {
        this._tracking = false;
    }

    /**
     * Called by state decorator setters and Undo* mutation methods BEFORE mutating `go.state[fieldName]`.
     * Records the old value on first change; no-ops on subsequent changes to the same field.
     */
    public recordFieldChange(go: GameObjectBase, fieldName: string): void {
        if (!this._tracking) {
            return;
        }

        let goEntry = this.changedFields.get(go.uuid);
        if (!goEntry) {
            goEntry = {};
            this.changedFields.set(go.uuid, goEntry);
        }

        // Only record the FIRST old value — subsequent changes are no-ops
        if (!(fieldName in goEntry)) {
            const currentValue = go.state[fieldName];
            goEntry[fieldName] = this.snapshotValue(currentValue);
        }
    }

    /**
     * Called by GameStateManager.register() when a new GO is created during tracking.
     */
    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }
        this.createdObjectUuids.push(uuid);
    }

    /**
     * Freezes the current delta and resets tracking for the next window.
     * Uses the gameState/rngState/lastGameObjectId captured at startTracking() time,
     * NOT current values (which have been mutated during the window).
     * The caller (SnapshotManager) provides the remaining metadata.
     */
    public checkpoint(metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'gameState' | 'rngState' | 'lastGameObjectId'>): IDeltaSnapshot {
        const delta: IDeltaSnapshot = {
            ...metadata,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            gameState: this._windowStartGameState,
            rngState: this._windowStartRngState,
            lastGameObjectId: this._windowStartLastGameObjectId,
        };

        // Reset for next window (startTracking will be called to begin the next window)
        this.changedFields = new Map();
        this.createdObjectUuids = [];

        return delta;
    }

    /**
     * Shallow-copy collections; return primitives and refs directly.
     * Collections at the state level are:
     *   - Array (of GameObjectRef) for @stateRefArray
     *   - Map (string → GameObjectRef) for @stateRefMap
     *   - Set (of string UUIDs) for @stateRefSet
     *   - Plain object (Record<string, GameObjectRef>) for @stateRefRecord
     */
    private snapshotValue(value: any): any {
        if (value == null || typeof value !== 'object') {
            return value; // primitives, null, undefined
        }
        if (Array.isArray(value)) {
            return value.concat();
        }
        if (value instanceof Map) {
            return new Map(value);
        }
        if (value instanceof Set) {
            return new Set(value);
        }
        // GameObjectRef ({isRef: true, uuid: string}) or other plain objects —
        // return as-is. Refs are small immutable objects; stateValue objects
        // will need structuredClone for safety.
        if (value.isRef) {
            return value; // refs are effectively immutable
        }
        // For @stateValue (arbitrary objects), use structuredClone
        return structuredClone(value);
    }
}
```

`metadata` must include `nextSnapshotIsSamePlayer` so quick rollback confirmation logic remains equivalent to full snapshots.

**Key considerations**:
- The `recordFieldChange` fast-path (field already recorded) is a `Map.get` + `in` check — very fast.
- `snapshotValue` must shallow-copy collections because the state-side collection will be mutated in place by `Undo*` classes.
- For `@statePrimitive` / `@stateRef` values, no copy is needed: primitives are values, refs are small and treated as immutable.
- For `@stateValue` (arbitrary objects like `decklist`), use `structuredClone` for safety.
- **IMPORTANT**: Decorator setters see the state *object property* (which may be a raw ref, a ref array, a Map, etc.), not the resolved GO. This is correct — the delta stores state-level values that can be written back directly.

### Step 3: Add `deltaTracker` to `Game`

**File**: `server/game/core/Game.js`

- Add a `DeltaTracker` instance as a property on `Game`, created in the constructor.
- It should be accessible as `this.game.deltaTracker` from any `GameObjectBase`.

```javascript
// In constructor, after snapshotManager is created:
this.deltaTracker = new DeltaTracker(this);
```

Alternatively, the `DeltaTracker` could live on `SnapshotManager` and be exposed via a getter. Choose whichever is cleaner — the important thing is that decorator setters can access it via `this.game.deltaTracker` (since every `GameObjectBase` has a `game` reference).

### Step 4: Add Delta Recording Hooks to State Decorators

**File**: `server/game/core/GameObjectUtils.ts`

For each decorator's **setter**, add a `deltaTracker.recordFieldChange` call **before** the state mutation.

#### `@statePrimitive` (around line 128)

```typescript
// Current:
set(this: T, newValue: TValue) {
    this.state[name] = newValue;
},

// New:
set(this: T, newValue: TValue) {
    this.game.deltaTracker?.recordFieldChange(this, name);
    this.state[name] = newValue;
},
```

#### `@stateValue` (around line 398)

Same pattern as `@statePrimitive`.

#### `@stateRef` (around line 341)

```typescript
// Current:
set(this, newValue) {
    this.state[context.name as string] = newValue?.getRef();
    target.set.call(this, newValue);
},

// New:
set(this, newValue) {
    this.game.deltaTracker?.recordFieldChange(this, context.name as string);
    this.state[context.name as string] = newValue?.getRef();
    target.set.call(this, newValue);
},
```

#### `@stateRefArray` — readonly variant (around line 170)

```typescript
// Current:
set(this: T, newValue: TValue[]) {
    this.state[name] = newValue?.map((x) => x.getRef());
    target.set.call(this, newValue);
},

// New:
set(this: T, newValue: TValue[]) {
    this.game.deltaTracker?.recordFieldChange(this, name);
    this.state[name] = newValue?.map((x) => x.getRef());
    target.set.call(this, newValue);
},
```

#### `@stateRefArray` — mutable variant (around line 190)

Same pattern — add `this.game.deltaTracker?.recordFieldChange(this, name)` before the state mutation in the setter.

#### `@stateRefMap` (around line 228)

```typescript
set(this: GameObjectBase, newValue) {
    this.game.deltaTracker?.recordFieldChange(this, name);
    this.state[name] = newValue ? new Map(...) : newValue;
    target.set.call(this, newValue ? new UndoMap(...) : newValue);
},
```

#### `@stateRefSet` (around line 262)

Same pattern.

#### `@stateRefRecord` (around line 305)

Same pattern.

**Important**: Do NOT add recording in the `init` function of any decorator. `init` runs during construction (before tracking starts) and should not generate deltas.

### Step 5: Add Delta Recording Hooks to `Undo*` Classes

**File**: `server/game/core/GameObjectUtils.ts`

These classes mutate `this.go.state[this.prop]` directly. Add recording at the start of each mutation method, **before** the state write.

#### `UndoArray` (lines ~697–774)

In `push`, `unshift`, `pop`, `shift`, `reverse`, `splice`:

```typescript
// Example for push:
public override push(...items: TValue[]): number {
    this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
    // ... existing implementation
}
```

Do the same for all mutation methods. Note the `accessing` flag — when `accessing` is true, the array is being constructed/initialized and should NOT record deltas. Either check `this.accessing` before recording, or rely on the fact that `deltaTracker.isTracking` will be false during construction. **Verify this assumption during implementation** — if objects are constructed mid-game (during tracking), the `init` flag / `accessing` flag must prevent delta recording.

Similarly for `UndoMap` (lines ~614–649), `UndoSet` (lines ~651–695), and `UndoSafeRecord` (proxy handler, lines ~410–428).

#### `UndoMap.set`, `delete`, `clear`

```typescript
public override set(key: string, value: TValue): this {
    this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
    // ... existing
}
```

Check the `init` flag — `UndoMap` has `private init = false` which is set to `true` after construction. During `super(entries)` in the constructor, `set` is called but `init` is still `false`, and the code already skips the state write with `if (!this.init) return this;`. Delta recording should similarly skip when `!this.init`. The simplest approach: only record if `this.init` is `true`:

```typescript
public override set(key: string, value: TValue): this {
    if (this.init) {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
    }
    // ... existing
}
```

#### `UndoSet.add`, `delete`, `clear`

Same pattern with the `init` guard.

#### `UndoSafeRecord` Proxy Handler

In the proxy's `set` and `deleteProperty` traps (around lines 414–428):

```typescript
set(target, prop, value) {
    go.game.deltaTracker?.recordFieldChange(go, name);
    // ... existing
}

deleteProperty(target, prop: string) {
    go.game.deltaTracker?.recordFieldChange(go, name);
    // ... existing
}
```

**Existing bug to fix**: The `deleteProperty` trap (line 425) currently deletes `go.state[prop]` instead of `go.state[name][prop]`. The `set` trap correctly accesses `go.state[name]` (line 417), but `deleteProperty` deletes from `go.state` directly, which corrupts the state object. Fix this while adding the delta hook:

```typescript
// Current (buggy):
delete go.state[prop];

// Fixed:
delete go.state[name][prop];
```

### Step 6: Track GO Creation in `GameStateManager.register`

**File**: `server/game/core/snapshot/GameStateManager.ts`

In `register()` (around line 87), after adding the GO to the registry:

```typescript
public register(gameObject: GameObjectBase | GameObjectBase[]) {
    gameObject = Helpers.asArray(gameObject);
    for (const go of gameObject) {
        // ... existing UUID assignment and registration ...

        if (!this._disableRegistration) {
            this.allGameObjects.push(go);
            this.gameObjectMapping.set(go.uuid, go);
            this.#game.deltaTracker?.recordObjectCreation(go.uuid);
        }
    }
}
```

### Step 7: Create Delta Rollback Method

**File**: `server/game/core/snapshot/GameStateManager.ts`

Add a new method `rollbackToDeltaChain(deltas: IDeltaSnapshot[], beforeRollbackSnapshot?: IGameSnapshot)` plus a private helper `applyDelta`. The chain method handles chaining correctly by **deferring all hooks** (`afterSetState`, `afterSetAllState`) until after every delta in the chain has been applied. This avoids side effects (event listener registration, effect resolution) at intermediate states.

The existing `rollbackToSnapshot` iterates GOs in reverse creation order (`for (let i = this.allGameObjects.length - 1; i >= 0; i--)`). Delta rollback must match this ordering for consistency.

**Important**: Delta tracking must be **stopped before rollback begins**. `copyState()` assigns through decorator setters (e.g., `instance[field] = newState[field]` at line 557 of `GameObjectUtils.ts`), which would trigger `recordFieldChange` if tracking were active. This would create spurious delta entries. The same concern applies to `rollbackToSnapshot` after delta hooks are added to decorators — it must also stop tracking before running. The caller (`SnapshotManager.rollbackToInternal`) should call `deltaTracker.stopTracking()` before any rollback and `deltaTracker.startTracking()` after.

```typescript
/**
 * Applies one or more deltas in reverse chronological order (most recent first).
 * Hooks (afterSetState, afterSetAllState) are deferred until ALL deltas are applied
 * to avoid side effects at intermediate states.
 */
public rollbackToDeltaChain(deltas: IDeltaSnapshot[], beforeRollbackSnapshot?: IGameSnapshot): boolean {
    this._isRollingBack = true;
    try {
        const allRemovals: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
        const allUpdates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
        // Track which GOs have been seen across the chain so we only store the
        // FIRST oldState (from the most-recent delta) for each GO.
        const seenUpdateUuids = new Set<string>();

        let rollbackError: Error | null = null;
        try {
            for (const delta of deltas) {
                // Restore Game.state (each delta overwrites with its window-start state;
                // the last delta in the chain sets the final correct value)
                this.#game.state = v8.deserialize(delta.gameState);
                this.#game.randomGenerator.restore(delta.rngState);
                this._lastGameObjectId = delta.lastGameObjectId;

                // Collect GOs created during this delta window
                for (const uuid of delta.createdObjectUuids) {
                    const go = this.gameObjectMapping.get(uuid);
                    if (go) {
                        allRemovals.push({ go, oldState: go.getState() });
                    }
                }

                // Restore changed fields — process in reverse registration order
                // to match the ordering used by rollbackToSnapshot
                const changedUuids = new Set(delta.changedFields.keys());
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    if (!changedUuids.has(go.uuid)) {
                        continue;
                    }

                    const fields = delta.changedFields.get(go.uuid);

                    // Capture oldState only on first encounter (most-recent delta)
                    if (!seenUpdateUuids.has(go.uuid)) {
                        seenUpdateUuids.add(go.uuid);
                        allUpdates.push({ go, oldState: go.getState() });
                    }

                    // Write old values back to state
                    for (const [fieldName, oldValue] of Object.entries(fields)) {
                        // @ts-expect-error Overriding state accessibility (matches Undo* pattern)
                        go.state[fieldName] = oldValue;
                    }

                    // Rebuild caches (UndoArray, resolved refs, etc.)
                    copyState(go, go.state);
                }
            }

            // Cleanup removed GOs (after all deltas applied)
            for (const removed of allRemovals) {
                removed.go.cleanupOnRemove(removed.oldState);
            }

            // Remove created GOs from registry
            const removalUuids = new Set(allRemovals.map((r) => r.go.uuid));
            this.allGameObjects = this.allGameObjects.filter((go) => !removalUuids.has(go.uuid));
            for (const uuid of removalUuids) {
                this.gameObjectMapping.delete(uuid);
            }

            // afterSetState on updated GOs — deferred until all deltas applied
            for (const update of allUpdates) {
                update.go.notifyAfterSetState(update.oldState);
            }

            // afterSetAllState on ALL registered GOs (not just changed ones).
            // This matches the semantics of rollbackToSnapshot where every GO gets
            // afterSetAllState called. This is critical for:
            //   - OngoingEffectEngine.resolveEffects(true) — must re-resolve even if
            //     the engine's own state fields didn't change
            //   - OngoingEffect.refreshContext() — effect context may depend on
            //     other GOs whose state was restored
            // Most GOs have an empty afterSetAllState, so the cost is negligible.
            const oldStateByUuid = new Map(allUpdates.map((u) => [u.go.uuid, u.oldState]));
            for (const go of this.allGameObjects) {
                // Use a sentinel oldState for GOs that weren't directly updated
                go.afterSetAllState(oldStateByUuid.get(go.uuid) ?? go.getState());
            }
        } catch (error) {
            if (!beforeRollbackSnapshot) {
                logger.error('Error during delta rollback and no beforeRollbackSnapshot provided', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                this.#game.reportSevereRollbackFailure(error);
            }
            rollbackError = error;
            logger.error('Error during delta rollback. Attempting to restore state from full snapshot.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
        }

        if (rollbackError) {
            try {
                this.rollbackToSnapshot(beforeRollbackSnapshot);
                this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.');
                return false;
            } catch (error) {
                logger.error('Attempt to restore from full snapshot after delta rollback failure has also failed.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                this.#game.reportSevereRollbackFailure(error);
            }
        }

        return true;
    } finally {
        this._isRollingBack = false;
    }
}
```

Implementation note: construct `oldStateByUuid` once outside the loop (not inside) to avoid repeated allocations.

**Note on `afterSetState` access**: `afterSetState` is `protected` on `GameObjectBase`. Add a package-internal accessor to `GameObjectBase`:

```typescript
/** Internal method for GameStateManager to call afterSetState during rollback. */
public notifyAfterSetState(oldState: IGameObjectBaseState): void {
    this.afterSetState(oldState);
}
```

This is cleaner than using `// @ts-expect-error` bracket access and matches the existing `afterSetAllState` (which is already `public`).

**Note on `go.state` access**: `state` is `protected` on `GameObjectBase`. `GameStateManager` already accesses it via `getStateUnsafe()`. For delta rollback field writes, use `// @ts-expect-error` to bypass the access modifier (matching existing patterns in `Undo*` classes, see lines 700, 710, etc. in `GameObjectUtils.ts`).

### Step 8: Create Delta Snapshot Container

**New file**: `server/game/core/snapshot/container/DeltaSnapshotContainer.ts`

This container stores `IDeltaSnapshot[]` per player and replaces `MetaSnapshotArray` for quick undo during the action phase. It should:

- Extend or follow the pattern of `SnapshotContainerBase` for `clearNewerSnapshots` registration
- Store deltas per player: `Map<string, IDeltaSnapshot[]>`
- Support `QuickRollbackPoint.Current` (last delta) and `.Previous` (second-to-last)
- Support chained rollback (return the N most recent deltas for a player)
- Implement `clearNewerSnapshots(snapshotId)` to prune deltas with `id > snapshotId`

Register this container with `SnapshotFactory` so it participates in the `clearNewerSnapshots` broadcast. Use the existing `createSnapshotContainerWithClearSnapshotsBinding` method on `SnapshotFactory` (lines 196–212) or add a new factory method.

Also expose metadata/property accessors equivalent to existing snapshot containers (`getSnapshotPropertiesById`, `hasSnapshotId`) so `MetaSnapshotArray` semantics and quick-undo checks stay unchanged.

### Step 9: Modify `SnapshotManager.moveToNextTimepoint`

**File**: `server/game/core/snapshot/SnapshotManager.ts` (lines 113–132)

Change the logic to create deltas instead of full snapshots for action-phase timepoints:

```typescript
public moveToNextTimepoint(timepoint: SnapshotTimepoint) {
    this.#game.resetForNewTimepoint();

    if (this._undoMode === UndoMode.Disabled) {
        this._gameStateManager.removeUnusedGameObjects();
        return;
    }

    if (this.shouldUseDelta(timepoint)) {
        // Checkpoint the current delta and start a new tracking window
        this.checkpointDelta(timepoint);
    } else {
        // Full snapshot for phase boundaries, setup, etc.
        this.#game.deltaTracker.stopTracking();
        
        if (timepoint === SnapshotTimepoint.Action) {
            this.snapshotFactory.setNextSnapshotIsSamePlayer(
                this.#game.actionPhaseActivePlayer.id === this.currentSnapshottedActivePlayer
            );
        }

        this.snapshotFactory.createSnapshotForCurrentTimepoint(timepoint);
        
        // Start tracking for the next delta window
        this.#game.deltaTracker.startTracking();
    }

    if (this._gameStepsSinceLastUndo != null) {
        this._gameStepsSinceLastUndo++;
    }
}

private shouldUseDelta(timepoint: SnapshotTimepoint): boolean {
    return [
        SnapshotTimepoint.Action,
        SnapshotTimepoint.RegroupResource,
        SnapshotTimepoint.RegroupReadyCards,
    ].includes(timepoint);
}
```

`checkpointDelta` would:
1. Call `removeUnusedGameObjects()` (previously done in `buildGameStateForSnapshot`)
2. Allocate/update snapshot metadata via `SnapshotFactory` so `currentSnapshotId/currentSnapshotted*` getters remain the single source of truth for both full and delta checkpoints
3. Build the metadata for the delta (id, round, phase, etc.), including `nextSnapshotIsSamePlayer` for action timepoints — note that `gameState`, `rngState`, and `lastGameObjectId` are NOT passed here; they were already captured by `startTracking()` at the beginning of the window
4. Call `deltaTracker.checkpoint(metadata)` to freeze the current delta
5. Store the delta in the `DeltaSnapshotContainer`
6. Call `deltaTracker.startTracking()` to begin the next window (this captures the current `game.state`, `rngState`, and `lastGameObjectId` for the next delta)

Factory coordination requirement:
- Keep `SnapshotFactory` as the canonical owner of snapshot IDs and current snapshot metadata for all snapshot styles.
- Add a lightweight delta metadata path (e.g. `createDeltaMetadataForCurrentTimepoint(...)`) rather than duplicating counters in `SnapshotManager`.

### Step 10: Modify `SnapshotManager.takeSnapshot` and Replace `MetaSnapshotArray`

**Files**: `server/game/core/snapshot/SnapshotManager.ts`, `server/game/core/snapshot/container/DeltaSnapshotContainer.ts` (from Step 8), `server/game/core/snapshot/SnapshotFactory.ts`

The `DeltaSnapshotContainer` from Step 8 replaces **both** `actionSnapshots` (for delta-based action undo) and `MetaSnapshotArray` (for quick undo). This eliminates the indirection layer where `MetaSnapshotArray` stores closures pointing back into `SnapshotHistoryMap` — instead, deltas are stored directly and full-snapshot references are stored alongside them for phase boundaries. One container per player serves as the single source of truth for both quick undo and action undo.

#### 10a: Unified Entry Type in `DeltaSnapshotContainer`

The container stores a **unified ordered timeline** of entries per player. Each entry is one of two discriminated types:

```typescript
interface IDeltaEntry {
    type: 'delta';
    delta: IDeltaSnapshot;
}

interface IFullSnapshotEntry {
    type: 'full';
    snapshotId: number;
    rollback: () => number | null;
    checkAvailable: () => boolean;
    snapshotProperties: () => ISnapshotProperties | null;
}

type QuickRollbackEntry = IDeltaEntry | IFullSnapshotEntry;
```

`IFullSnapshotEntry` is structurally identical to the existing `IQuickRollbackEntry` in `MetaSnapshotArray` — closures that reference a `SnapshotHistoryMap` or `SnapshotMap` entry. This preserves the phase-boundary quick undo path unchanged.

Entries are ordered chronologically by snapshot ID. `QuickRollbackPoint.Current` = last entry, `.Previous` = second-to-last. A typical timeline for a player looks like:

```
[Full(Regroup)] → [Delta(RegroupResource)] → [Full(Action)] → [Delta(Action1)] → [Delta(Action2)]
```

#### 10b: Replace `quickSnapshots` Field Type and Remove `actionSnapshots`

In `SnapshotManager`, change the field type and remove the now-unused action snapshot map:

```typescript
// Before:
protected readonly actionSnapshots: SnapshotHistoryMap<string>;
protected readonly quickSnapshots: Map<string, MetaSnapshotArray>;

// After:
protected readonly quickSnapshots: Map<string, DeltaSnapshotContainer>;
```

Remove the `actionSnapshots` construction from the constructor. Remove the `MetaSnapshotArray` import and add `DeltaSnapshotContainer`.

Add a helper to lazily create per-player containers:

```typescript
private getOrCreateDeltaContainer(playerId: string): DeltaSnapshotContainer {
    let container = this.quickSnapshots.get(playerId);
    if (!container) {
        container = this.snapshotFactory.createDeltaSnapshotContainer();
        this.quickSnapshots.set(playerId, container);
    }
    return container;
}
```

#### 10c: Store Most Recent Checkpointed Delta

When `checkpointDelta` (Step 9) freezes a delta, store it on `SnapshotManager` so `takeSnapshot` can retrieve it. This mirrors how `SnapshotFactory.currentActionSnapshot` makes the latest full snapshot available to `SnapshotHistoryMap.takeSnapshot()` via `getCurrentSnapshotFn()`:

```typescript
private _currentDelta: IDeltaSnapshot | null = null;

// In checkpointDelta(), after calling deltaTracker.checkpoint():
this._currentDelta = this.#game.deltaTracker.checkpoint(metadata);
```

#### 10d: Modify `takeSnapshot(SnapshotType.Action)`

Replace the three-step process (`actionSnapshots.takeSnapshot` → `addQuickActionSnapshot` → quick entry closures) with a single store into the delta container:

```typescript
case SnapshotType.Action:
    Contract.assertNotNullLike(this._currentDelta, 'No delta available for action snapshot');

    const container = this.getOrCreateDeltaContainer(settings.playerId);
    const deltaId = this._currentDelta.id;
    container.addDelta(this._currentDelta);
    this._currentDelta = null;
    return deltaId;
```

**Remove `addQuickActionSnapshot()`** entirely — the delta container now serves as both the action undo store and the quick undo store, so a separate quick entry step is unnecessary.

#### 10e: Modify Phase Snapshot Quick Entries

`addQuickStartOfPhaseSnapshots` and `addQuickStartOfActionSnapshot` add **full-snapshot references** into `DeltaSnapshotContainer` instead of `MetaSnapshotArray`. The `addSnapshotFromMap` API is identical:

```typescript
private addQuickStartOfPhaseSnapshots(phase: PhaseName.Regroup | PhaseName.Setup) {
    // sanity check (unchanged)
    const phaseSnapshotId = this.phaseSnapshots.getSnapshotProperties(phase)?.snapshotId;
    Contract.assertTrue(phaseSnapshotId === this.currentSnapshotId, ...);

    for (const player of this.#game.getPlayers()) {
        const container = this.getOrCreateDeltaContainer(player.id);
        container.addSnapshotFromMap(this.phaseSnapshots, phase);
    }
}
```

`addQuickStartOfActionSnapshot` is the same pattern, referencing `phaseSnapshots` with `PhaseName.Action`. These entries are stored as `IFullSnapshotEntry` in the container's timeline, interleaved with delta entries.

#### 10f: `DeltaSnapshotContainer` Full API

The container exposes the same public interface as `MetaSnapshotArray` so `SnapshotManager` call sites require minimal changes. It does NOT extend `SnapshotContainerBase` — it only needs the `clearNewerSnapshots` binding, not the full `getCurrentSnapshotFn` / `rollbackToSnapshotInternal` plumbing.

```typescript
import type Game from '../../Game';
import type { GameStateManager } from '../GameStateManager';
import type { SnapshotFactory } from '../SnapshotFactory';
import type { IDeltaSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { SnapshotHistoryMap } from './SnapshotHistoryMap';
import type { SnapshotMap } from './SnapshotMap';
import { QuickRollbackPoint } from './MetaSnapshotArray';
import * as Contract from '../../utils/Contract.js';

interface IDeltaEntry {
    type: 'delta';
    delta: IDeltaSnapshot;
}

interface IFullSnapshotEntry {
    type: 'full';
    snapshotId: number;
    rollback: () => number | null;
    checkAvailable: () => boolean;
    snapshotProperties: () => ISnapshotProperties | null;
}

type QuickRollbackEntry = IDeltaEntry | IFullSnapshotEntry;

export class DeltaSnapshotContainer {
    private static readonly MaxDeltaEntries = 3;

    private entries: QuickRollbackEntry[] = [];
    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;
    private readonly snapshotFactory: SnapshotFactory;

    public constructor(
        game: Game,
        gameStateManager: GameStateManager,
        snapshotFactory: SnapshotFactory,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.game = game;
        this.gameStateManager = gameStateManager;
        this.snapshotFactory = snapshotFactory;
        clearNewerSnapshotsBinding.clearNewerSnapshots = (id) => this.clearNewerSnapshots(id);
    }

    // ── Mutation ──

    /** Add a delta entry (action/regroup-phase undo). */
    public addDelta(delta: IDeltaSnapshot): void {
        this.entries.push({ type: 'delta', delta });
        this.enforceMaxDeltaCount();
    }

    /** Add a full-snapshot reference (phase-boundary undo). Same signature as MetaSnapshotArray. */
    public addSnapshotFromMap<T>(
        snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>,
        key: T
    ): void {
        const snapshotId = snapshotMap.getSnapshotProperties(key)?.snapshotId;
        Contract.assertNotNullLike(snapshotId);

        this.entries.push({
            type: 'full',
            snapshotId,
            rollback: () => snapshotMap.rollbackById(snapshotId),
            checkAvailable: () => snapshotMap.hasSnapshotId(snapshotId),
            snapshotProperties: () => snapshotMap.getSnapshotPropertiesById(snapshotId),
        });
    }

    // ── Query ──

    public getMostRecentSnapshotId(): number | null {
        if (this.entries.length === 0) {
            return null;
        }
        return this.getEntrySnapshotId(this.entries[this.entries.length - 1]);
    }

    public getSnapshotProperties(rollbackPoint: QuickRollbackPoint): ISnapshotProperties | null {
        const entry = this.getEntry(rollbackPoint);
        if (!entry) {
            return null;
        }

        if (entry.type === 'full') {
            return entry.snapshotProperties();
        }

        // Extract properties from the IDeltaSnapshot (same fields as ISnapshotProperties)
        return {
            roundNumber: entry.delta.roundNumber,
            actionNumber: entry.delta.actionNumber,
            currentPhase: entry.delta.phase,
            snapshotId: entry.delta.id,
            requiresConfirmationToRollback: entry.delta.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: entry.delta.nextSnapshotIsSamePlayer,
            timepoint: entry.delta.timepoint,
            timepointNumber: entry.delta.timepointNumber,
        };
    }

    public hasQuickSnapshot(rollbackPoint: QuickRollbackPoint): boolean {
        const entry = this.getEntry(rollbackPoint);
        if (!entry) {
            return false;
        }
        if (entry.type === 'full') {
            return entry.checkAvailable();
        }
        return true; // deltas are always available until pruned by clearNewerSnapshots
    }

    public getDeltaCount(): number {
        return this.entries.filter((e) => e.type === 'delta').length;
    }

    public setRequiresConfirmationOnMostRecentDelta(): void {
        for (let i = this.entries.length - 1; i >= 0; i--) {
            const entry = this.entries[i];
            if (entry.type === 'delta') {
                entry.delta.requiresConfirmationToRollback = true;
                return;
            }
        }
    }

    // ── Rollback ──

    /**
     * Roll back to the given quick rollback point.
     *
     * For a full-snapshot entry: delegates to the source container's closure (unchanged behavior).
     *
     * For a delta entry: builds a chain of all consecutive delta entries from the target
     * through the end of the list (most-recent-first). Takes a fresh full snapshot for
     * error recovery, then calls `gameStateManager.rollbackToDeltaChain()`. Updates the
     * SnapshotFactory metadata to reflect the rolled-back state.
     *
     * The chain must not cross a full-snapshot boundary — if it does, that is a logic error
     * (full-snapshot entries only appear at phase boundaries, and delta entries within a phase
     * are always consecutive).
     */
    public rollbackToSnapshot(rollbackPoint: QuickRollbackPoint): number | null {
        Contract.assertNonEmpty(this.entries, 'Attempting to quick rollback with no entries');

        const targetIdx = this.getEntryIndex(rollbackPoint);
        if (targetIdx == null || targetIdx < 0) {
            return null;
        }

        const entry = this.entries[targetIdx];

        // ── Full-snapshot path (phase boundary) ──
        if (entry.type === 'full') {
            return entry.rollback();
        }

        // ── Delta path ──
        // Collect all entries from targetIdx to end. They must all be deltas —
        // a full-snapshot entry in this span means the delta chain crosses a
        // phase boundary, which should never happen.
        const chain: IDeltaSnapshot[] = [];
        for (let i = this.entries.length - 1; i >= targetIdx; i--) {
            const e = this.entries[i];
            Contract.assertTrue(
                e.type === 'delta',
                'Delta chain unexpectedly contains a full-snapshot entry'
            );
            chain.push(e.delta);
        }

        if (chain.length === 0) {
            return null;
        }

        // Take a fresh full snapshot for error recovery before rollback.
        // This matches the existing pattern where rollbackToSnapshotInternal
        // passes getCurrentSnapshotFn() as the beforeRollbackSnapshot.
        const beforeRollbackSnapshot = this.snapshotFactory.createRecoverySnapshot();

        const success = this.gameStateManager.rollbackToDeltaChain(chain, beforeRollbackSnapshot);
        if (!success) {
            return null;
        }

        // Update SnapshotFactory metadata so its getters (currentSnapshotId,
        // currentSnapshottedPhase, etc.) reflect the rolled-back state.
        const targetDelta = entry.delta;
        this.snapshotFactory.updateCurrentSnapshotFromDelta(targetDelta);

        return targetDelta.id;
    }

    public clearAllSnapshots(): void {
        this.entries = [];
    }

    // ── Internal ──

    private getEntry(point: QuickRollbackPoint): QuickRollbackEntry | null {
        const idx = this.getEntryIndex(point);
        return idx != null ? this.entries[idx] : null;
    }

    private getEntryIndex(point: QuickRollbackPoint): number | null {
        switch (point) {
            case QuickRollbackPoint.Current:
                return this.entries.length > 0 ? this.entries.length - 1 : null;
            case QuickRollbackPoint.Previous:
                return this.entries.length > 1 ? this.entries.length - 2 : null;
            default:
                return null;
        }
    }

    private getEntrySnapshotId(entry: QuickRollbackEntry): number {
        return entry.type === 'delta' ? entry.delta.id : entry.snapshotId;
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.entries = this.entries.filter(
            (entry) => this.getEntrySnapshotId(entry) <= snapshotId
        );
    }

    /**
     * Enforce the delta entry limit. Only delta entries count toward the cap;
     * full-snapshot references are lightweight and unlimited.
     */
    private enforceMaxDeltaCount(): void {
        let deltaCount = 0;
        for (const e of this.entries) {
            if (e.type === 'delta') {
                deltaCount++;
            }
        }
        while (deltaCount > DeltaSnapshotContainer.MaxDeltaEntries) {
            const oldestIdx = this.entries.findIndex((e) => e.type === 'delta');
            if (oldestIdx >= 0) {
                this.entries.splice(oldestIdx, 1);
                deltaCount--;
            } else {
                break;
            }
        }
    }
}
```

#### 10g: Modify `SnapshotType.Action` Rollback in `rollbackToInternal`

The `SnapshotType.Action` case in `rollbackToInternal` previously went through `actionSnapshots.rollbackToSnapshot(playerId, offset)`. It now queries the delta container using the same offset semantics as before.

**Important compatibility requirement**: preserve existing `actionOffset` behavior (`0`, `-1`, `-2` with current history limit 3). Do **not** collapse action rollback into `QuickRollbackPoint` (`Current` / `Previous`) only.

```typescript
case SnapshotType.Action:
    const deltaContainer = this.quickSnapshots.get(settings.playerId);
    Contract.assertNotNullLike(deltaContainer, `No delta container for player ${settings.playerId}`);

    rolledBackSnapshotIdx = deltaContainer.rollbackToActionOffset(
        this.checkGetOffset(settings.actionOffset)
    );
    break;
```

`rollbackToActionOffset(offset)` in `DeltaSnapshotContainer` should:
- Support `offset <= 0` with the same meaning as `SnapshotHistoryMap.rollbackToSnapshot` today
- Build the delta chain from the target delta to the newest delta
- Reject offsets beyond available delta history (return `null`)

`QuickRollbackPoint` remains for **quick undo only**; action undo remains **offset-based**.

#### 10h: Update `countAvailableActionSnapshots` and `setRequiresConfirmation`

These methods previously queried `actionSnapshots`. Redirect to the delta container:

```typescript
public countAvailableActionSnapshots(playerId: string): number {
    if (this._undoMode !== UndoMode.Free) {
        return 0;
    }
    return this.quickSnapshots.get(playerId)?.getDeltaCount() ?? 0;
}

public setRequiresConfirmationToRollbackCurrentSnapshot(playerId: string) {
    this.quickSnapshots.get(playerId)?.setRequiresConfirmationOnMostRecentDelta();
}
```

#### 10i: Add Factory Methods to `SnapshotFactory`

Replace `createMetaSnapshotArray()` with a new factory method. The `DeltaSnapshotContainer` receives a reference to the `SnapshotFactory` so it can call `createRecoverySnapshot()` and `updateCurrentSnapshotFromDelta()` during rollback:

```typescript
public createDeltaSnapshotContainer(): DeltaSnapshotContainer {
    return this.createSnapshotContainerWithClearSnapshotsBinding((binding) =>
        new DeltaSnapshotContainer(this.game, this.gameStateManager, this, binding)
    );
}
```

Add two new methods for delta rollback support:

```typescript
/**
 * Creates a one-off full snapshot of the current state for error recovery during delta rollback.
 * Not stored in any container.
 */
public createRecoverySnapshot(): IGameSnapshot {
    return {
        id: this.lastAssignedSnapshotId,
        lastGameObjectId: this.gameStateManager.lastGameObjectId,
        actionNumber: this.game.actionNumber,
        roundNumber: this.game.roundNumber,
        timepoint: this.currentActionSnapshot?.timepoint,
        timepointNumber: this.lastAssignedTimepointNumber,
        phase: this.game.currentPhase,
        gameState: v8.serialize(this.game.state),
        states: this.gameStateManager.buildGameStateForSnapshot(),
        rngState: this.game.randomGenerator.rngState,
        requiresConfirmationToRollback: false,
        activePlayerId: this.game.actionPhaseActivePlayer?.id,
    };
}

/**
 * Updates the factory's current snapshot metadata after a delta rollback.
 * Ensures getters (currentSnapshotId, currentSnapshottedPhase, etc.) reflect the rolled-back
 * state. Does NOT store full state buffers — just updates the metadata pointers.
 */
public updateCurrentSnapshotFromDelta(delta: IDeltaSnapshot): void {
    this.currentActionSnapshot = {
        id: delta.id,
        lastGameObjectId: delta.lastGameObjectId,
        actionNumber: delta.actionNumber,
        roundNumber: delta.roundNumber,
        timepoint: delta.timepoint,
        timepointNumber: delta.timepointNumber,
        phase: delta.phase,
        activePlayerId: delta.activePlayerId,
        requiresConfirmationToRollback: false,
        nextSnapshotIsSamePlayer: delta.nextSnapshotIsSamePlayer,
        // gameState/states buffers are stale placeholders — the next moveToNextTimepoint
        // will overwrite currentActionSnapshot with a fresh snapshot or delta.
        gameState: delta.gameState,
        states: Buffer.alloc(0),
        rngState: delta.rngState,
    };
    this.lastAssignedTimepointNumber = delta.timepointNumber;
}
```

#### 10j: Update `clearAllSnapshots`

Remove the `actionSnapshots.clearAllSnapshots()` call and add delta container clearing:

```typescript
public clearAllSnapshots(): void {
    this.phaseSnapshots.clearAllSnapshots();
    this.snapshotFactory.clearCurrentSnapshot();

    for (const container of this.quickSnapshots.values()) {
        container.clearAllSnapshots();
    }

    for (const playerSnapshots of this.manualSnapshots.values()) {
        playerSnapshots.clearAllSnapshots();
    }
}
```

#### 10k: `QuickRollbackPoint` Enum Stays in Existing Location

`QuickRollbackPoint` remains exported from `MetaSnapshotArray.ts` (or is moved to `SnapshotInterfaces.ts` for cleanliness). `DeltaSnapshotContainer` imports it. `MetaSnapshotArray` itself is no longer instantiated but the enum can remain co-located or be relocated as a separate cleanup step.

### Step 11: Modify `SnapshotManager.rollbackToInternal`

**File**: `server/game/core/snapshot/SnapshotManager.ts` (lines 241–276)

For `SnapshotType.Quick` and `SnapshotType.Action`: retrieve deltas from the delta container and call `gameStateManager.rollbackToDeltaChain`.

For `SnapshotType.Phase` and `SnapshotType.Manual`: unchanged (full snapshot rollback).

**Critical**: Delta tracking must be stopped **before** any rollback begins and restarted **after**. Both `rollbackToDeltaChain` and `rollbackToSnapshot` will trigger `copyState()`, which assigns through decorator setters. Without stopping tracking, these assignments would call `recordFieldChange` and create spurious delta entries.

```typescript
// In rollbackToInternal, wrap the rollback call:
this.#game.deltaTracker.stopTracking();

// ... perform the rollback (delta or full snapshot) ...

// After rollback completes:
// 1. clearNewerSnapshots clears both full snapshot and delta containers
this.snapshotFactory.clearNewerSnapshots(rolledBackSnapshotIdx);

// 2. Restart tracking for the new delta window
this.#game.deltaTracker.startTracking();
```

Use rollback plumbing that preserves current responsibilities:
- Delta rollback path should still update the active/current snapshot metadata in `SnapshotFactory`.
- RNG restoration should continue using `randomGenerator.restore(...)`.

### Step 12: Handle `removeUnusedGameObjects` Timing

Currently called inside `buildGameStateForSnapshot()`. With delta snapshots:
- Call during `deltaTracker.checkpoint()` — before recording the delta
- Keep calling during `buildGameStateForSnapshot()` for full snapshots
- Keep calling in `moveToNextTimepoint` when undo is disabled

---

## Edge Cases & Gotchas

### 1. GO Construction During Tracking

When a GO is constructed mid-game (e.g., creating a token card), `register()` runs and the constructor sets default state via `setupDefaultState()`. The `init` functions of decorators run during construction. These must NOT generate deltas.

**Mitigation**: 
- `register()` records the UUID in `createdObjectUuids` — on rollback, the whole GO is removed
- Decorator `init` functions don't call `recordFieldChange` (only `set` does)
- `Undo*` classes' `init`/`accessing` flags prevent recording during construction
- **Verify**: if `onInitialize()` of a newly created GO sets state fields via `set`, those WILL trigger delta recording. This is actually correct — the entire GO is rolled back via `createdObjectUuids` removal, so the field-level deltas for it are redundant but harmless. For efficiency, `recordFieldChange` could skip recording for UUIDs already in `createdObjectUuids`, but this is an optimization, not a correctness issue.

### 2. Delta Tracking Across Phase Boundaries

When `moveToNextTimepoint(StartOfPhase)` fires:
1. Stop tracking
2. Take a full snapshot (this captures everything including any pending changes)
3. Start tracking for the new phase

The full snapshot serves as the "zero point" for the delta chain. Delta chaining never crosses a phase boundary.

Bootstrap detail:
- At game start (or when enabling undo), initialize tracking immediately after the first full snapshot anchor is created so the first action/regroup delta has a valid start-of-window baseline.
- `Game` constructs `SnapshotManager` before `Randomness`, so avoid calling `deltaTracker.startTracking()` from `SnapshotManager` constructor-time code.
- Add an explicit runtime guard before `startTracking()` (e.g., assert `game.randomGenerator` exists and there is a current full-snapshot anchor) to fail fast if initialization order regresses.

### 3. `copyState` After Delta Restore

After restoring state fields from a delta, `copyState(go, go.state)` must be called for each affected GO. This rebuilds:
- Resolved GO references (from `GameObjectRef` → live `GameObjectBase`)
- `UndoArray` / `UndoMap` / `UndoSet` wrappers
- Any cached derived state

This is the same function called in the existing `setState()` path. The difference: in full rollback, `copyState` is called on **every** GO; in delta rollback, only on GOs with changed fields.

**Critical**: `copyState` assigns through decorator setters (e.g., `instance[field] = newState[field]` at line 557). These setters will trigger `recordFieldChange` if delta tracking is active. **Delta tracking must be stopped before any rollback** to prevent creating spurious delta entries. See Step 11 for the tracking stop/start pattern around rollback calls.

### 3a. `afterSetAllState` Must Cover All GOs

In the existing `rollbackToSnapshot`, `afterSetAllState` is called on every GO that existed at snapshot time (all GOs get `setState`). The delta rollback must match this scope by calling `afterSetAllState` on **all registered GOs**, not just those with changed fields.

This is critical because:
- `OngoingEffectEngine.afterSetAllState` calls `resolveEffects(true)` — effects must be re-resolved even if the engine's own state didn't change, because the targets it references may have moved zones
- `OngoingEffect.afterSetAllState` calls `refreshContext()` — effect context may depend on other GOs whose state was restored
- Most GOs have an empty `afterSetAllState` so the cost is negligible

### 3b. Chained Rollback Must Defer Hooks

When rolling back multiple deltas (e.g., undo 3 actions), all hooks (`afterSetState`, `afterSetAllState`, `cleanupOnRemove`) must be **deferred** until after every delta in the chain has been applied. Calling hooks at intermediate states would cause:
- Event listeners to be registered/unregistered at transient states (via `afterSetState` in `TriggeredAbility`, `AbilityLimit`, `CustomDurationEvent`)
- `resolveEffects(true)` to run against partially-rolled-back state
- Incorrect context refreshes in `OngoingEffect`

The `rollbackToDeltaChain` method handles this by collecting all removals and updates across the full chain, then firing hooks once at the end.

### 4. RNG State

`rngState` is stored in the delta metadata and must be restored on rollback. The random generator's state is set directly:
```typescript
this.#game.randomGenerator.restore(delta.rngState);
```

### 5. `lastGameObjectId` on Rollback

The delta stores `lastGameObjectId` at the time the delta was created. On rollback, restore it:
```typescript
this._lastGameObjectId = delta.lastGameObjectId;
```

This ensures that new GOs created after rollback get fresh unique IDs (though they may reuse IDs from the rolled-back window — this is fine since those GOs no longer exist).

### 6. `clearAllSnapshots`

`SnapshotManager.clearAllSnapshots()` currently clears `actionSnapshots`, `phaseSnapshots`, and `manualSnapshots`. It must also clear the delta container and stop delta tracking.

### 7. StateWatcher (`CopyMode.UseBulkCopy`) Objects

`StateWatcher` uses `@registerState(CopyMode.UseBulkCopy)` and stores all state in a single `state.entries: TState[]` array. It bypasses decorator setters entirely — mutations happen via direct assignment in an event handler closure (`this.state.entries = updatedStateValue` in `registerListeners()`). Without special handling, the delta tracker would never see StateWatcher mutations.

**Solution**: A manual `this.game.deltaTracker?.recordFieldChange(this, 'entries')` call is added in `StateWatcher.ts` at the single mutation point (the `stateUpdateHandler` closure), before the state write. This is sufficient because:

- All 13 subclasses inherit the hook via the base class — no subclass changes needed
- The `entries` array is always mutated via `concat()` (creates a new array), so the delta tracker's shallow copy (`value.concat()`) correctly preserves the old array
- `copyState` is a no-op for BulkCopy objects, so delta rollback just restores the old `entries` array directly
- `GameObjectRef`s embedded in entries are resolved on-demand at read time via `mapCurrentValue()`, not during state copying

**Why not rework to use decorators**: The `entries` array contains arbitrary typed entry objects with embedded `GameObjectRef`s — no existing decorator fits this shape (`@stateRefArray` expects `GameObjectBase[]`, not plain objects with embedded refs). `@stateValue` would use `structuredClone` (heavy) and introduces `UseBulkCopy` interaction complexity for no benefit.

**Why not always snapshot BulkCopy objects**: Would copy all 13 watchers' state at every checkpoint even when unchanged. The manual hook is more targeted and only records when a mutation actually occurs.

### 8. `UndoSafeRecord.deleteProperty` Existing Bug

The `deleteProperty` trap (line 425 of `GameObjectUtils.ts`) currently does `delete go.state[prop]` instead of `delete go.state[name][prop]`. This deletes from the GO's state object directly rather than from the record stored at `go.state[name]`. The `set` trap (line 417) correctly accesses `go.state[name]`. Fix this bug as part of the delta work since the delta recording hook for `deleteProperty` needs the correct state path.

---

## Testing Strategy

### Unit Tests for `DeltaTracker`

- Record field changes for multiple GOs, verify only first-write is kept
- Verify `checkpoint()` returns correct delta and resets internal state
- Verify `recordObjectCreation` tracks UUIDs
- Verify `isTracking` guards prevent recording when stopped
- Verify collection shallow-copy correctness (mutating the original after recording doesn't affect the delta)

### Unit Tests for Delta Rollback

- Create known state, mutate fields, checkpoint delta, apply reverse delta, verify state matches pre-mutation
- Test with all decorator types: primitive, ref, refArray, refMap, refSet, refRecord, value
- Test GO creation + rollback (GO should be removed)
- Test chained rollback (3 deltas in sequence)
- Test `afterSetState` / `afterSetAllState` hooks fire correctly during delta rollback
- Test that `afterSetAllState` is called on ALL GOs (including unchanged ones) — specifically verify `OngoingEffectEngine.resolveEffects` fires
- Test chained rollback defers hooks: hooks should fire only once, after the full chain, not at intermediate states
- Test that no spurious delta entries are created during rollback (tracking is stopped)
- Test that `gameState`, `rngState`, and `lastGameObjectId` are restored to start-of-window values (not checkpoint-time values)

### Integration Tests

- Run existing quick undo test scenarios (search for `QuickRollbackPoint` / `SnapshotType.Quick` in test files) — these should pass unchanged
- Run existing action undo tests — these should pass with delta-based action snapshots
- Phase undo tests — should be unaffected (still full snapshots)
- Test ongoing effects remain correct after delta rollback (effects whose own state didn't change but whose targets moved)

### Performance Validation

- Compare snapshot creation time: full `v8.serialize` of all GOs vs `deltaTracker.checkpoint()` at ~300 GOs with ~10 mutated
- Memory usage comparison: full `Buffer` per snapshot vs delta `Map` per snapshot
- Verify rollback time is acceptable for chained deltas (up to 3)

---

## Summary of Design Decisions

| Decision | Rationale |
|---|---|
| Collections use **bulk copy** on first mutation | Simple, fast enough for typical collection sizes (0–40 elements). Granular operation tracking deferred unless profiling identifies a need. |
| `Game.state` stays **v8-serialized** in deltas | ~1-2KB, not worth the complexity of intercepting manual getters/setters in `Game.js`. |
| Action undo **chains deltas** (max 3 per player) | No full snapshots during action phase. Phase snapshots at phase boundaries serve as safety checkpoints. |
| Delta rollback failure **attempts recovery first** | Matches existing rollback behavior: restore from `beforeRollbackSnapshot`, then severe-halt only if recovery fails. |
| Full snapshots remain at **phase boundaries, setup, and manual snapshots** | Infrequent, provides safe anchors for delta chains. |
| Recording hooks go in **decorator setters** and **`Undo*` mutation methods** | These are the only paths that mutate `go.state[field]`. Complete coverage of all state mutations. |
| `startTracking()` captures `gameState`, `rngState`, `lastGameObjectId` | These must be snapshotted at the START of the window, not at checkpoint time, because game state is mutated during the window. |
| `afterSetAllState` runs on **all GOs**, not just changed ones | Matches full-rollback semantics. `OngoingEffectEngine.resolveEffects(true)` must run even if the engine's own state didn't change. Most GOs have empty implementations so cost is negligible. |
| Chained delta rollback **defers all hooks** to the end | Firing `afterSetState`/`afterSetAllState` at intermediate states causes incorrect event listener registration and effect resolution. |
| Delta tracking **stopped during rollback** | `copyState()` assigns through decorator setters, which would trigger `recordFieldChange` and create spurious deltas if tracking were active. |
| Changed GOs processed in **reverse registration order** | Matches `rollbackToSnapshot`'s reverse iteration. Ensures dependencies between GOs are resolved correctly. |
| Add `notifyAfterSetState()` public method on `GameObjectBase` | Cleaner than `// @ts-expect-error` bracket access for the `protected afterSetState`. Matches `afterSetAllState` which is already `public`. |
| `SnapshotFactory` remains **metadata authority** | Prevents drift in `currentSnapshotId/currentSnapshotted*` and keeps quick-undo / rollback entry-point logic stable across full + delta checkpoints. |
| Include `nextSnapshotIsSamePlayer` in deltas | Preserves existing quick-undo confirmation behavior that checks whether opponent acted since the rollback point. |
| Action rollback stays **offset-based** | Preserves existing `actionOffset` contract (`0/-1/-2`) and existing tests; `QuickRollbackPoint` remains quick-undo-only. |
| `startTracking()` has **startup guards** | Prevents invalid capture before `randomGenerator` and initial full-snapshot anchor are ready given constructor initialization order. |

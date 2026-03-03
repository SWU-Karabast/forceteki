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

- **`afterSetState`**: `TriggeredAbility`, `AbilityLimit`, `CustomDurationEvent` — register/unregister event listeners on `Game` based on `isRegistered` changing. `Damage` mixin — nulls out transient `_activeAttack`.
- **`afterSetAllState`**: `OngoingEffect` — `refreshContext()`. `OngoingEffectEngine` — `resolveEffects(true)`.

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
  delta[zone.uuid]["cards"] = [...zone.state.cards]  // shallow copy of ref array
  
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
- Call `reportSevereRollbackFailure(error)` which halts the game in production and throws in tests.
- There is no "graceful fallback" — a corrupted delta is treated as a fatal error, same as a corrupted full snapshot rollback.

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

    /** v8-serialized Game.state at the start of this delta window */
    gameState: Buffer;

    /** RNG state for deterministic replay */
    rngState: IRandomness['rngState'];

    /** Last GO ID at the start of this delta window */
    lastGameObjectId: number;

    // Metadata (same purpose as IGameSnapshot)
    actionNumber: number;
    roundNumber: number;
    phase: PhaseName;
    timepoint: SnapshotTimepoint;
    timepointNumber: number;
    activePlayerId?: string;
    requiresConfirmationToRollback: boolean;
}
```

### Step 2: Create `DeltaTracker` Class

**New file**: `server/game/core/snapshot/DeltaTracker.ts`

Core design:

```typescript
import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IDeltaSnapshot } from './SnapshotInterfaces';

export class DeltaTracker {
    readonly #game: Game;

    private _tracking = false;
    private changedFields = new Map<string, Record<string, any>>();
    private createdObjectUuids: string[] = [];

    public get isTracking(): boolean {
        return this._tracking;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    public startTracking(): void {
        this._tracking = true;
        this.changedFields.clear();
        this.createdObjectUuids = [];
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
     * The caller (SnapshotManager) provides the metadata.
     */
    public checkpoint(metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids'>): IDeltaSnapshot {
        const delta: IDeltaSnapshot = {
            ...metadata,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
        };

        // Reset for next window
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
            return [...value];
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

Add a new method `rollbackToDelta(delta: IDeltaSnapshot, beforeRollbackSnapshot?: IGameSnapshot)`. This mirrors the error handling structure of the existing `rollbackToSnapshot` method (lines 150–218).

```typescript
public rollbackToDelta(delta: IDeltaSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
    this._isRollingBack = true;
    try {
        const removals: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
        const updates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];

        let rollbackError: Error | null = null;
        try {
            // 1. Restore Game.state
            this.#game.state = v8.deserialize(delta.gameState);

            // 2. Remove GOs created during this delta window
            for (const uuid of delta.createdObjectUuids) {
                const go = this.gameObjectMapping.get(uuid);
                if (go) {
                    removals.push({ go, oldState: go.getState() });
                }
            }

            // 3. Restore changed fields
            for (const [uuid, fields] of delta.changedFields) {
                const go = this.gameObjectMapping.get(uuid);
                if (!go) {
                    // GO may have been removed in a previous delta in the chain — skip
                    continue;
                }

                updates.push({ go, oldState: go.getState() });

                // Write old values back to state
                for (const [fieldName, oldValue] of Object.entries(fields)) {
                    go.state[fieldName] = oldValue;
                }

                // Rebuild caches (UndoArray, resolved refs, etc.)
                copyState(go, go.state);
            }

            // 4. Cleanup removed GOs
            for (const removed of removals) {
                removed.go.cleanupOnRemove(removed.oldState);
            }

            // 5. afterSetState on updated GOs
            for (const update of updates) {
                // afterSetState handles event listener registration changes
                update.go['afterSetState'](update.oldState);
            }
        } catch (error) {
            if (!beforeRollbackSnapshot) {
                logger.error('Error during delta rollback and no beforeRollbackSnapshot provided', { error, lobbyId: this.#game.lobbyId });
                this.#game.reportSevereRollbackFailure(error);
            }
            rollbackError = error;
            logger.error('Error during delta rollback. Attempting to restore state from full snapshot.', { error, lobbyId: this.#game.lobbyId });
        }

        if (rollbackError) {
            try {
                this.rollbackToSnapshot(beforeRollbackSnapshot);
                this.#game.addAlert(AlertType.Danger, 'An error occurred during undo...');
                return false;
            } catch (error) {
                logger.error('Attempt to restore from full snapshot after delta rollback failure has also failed.', { error, lobbyId: this.#game.lobbyId });
                this.#game.reportSevereRollbackFailure(error);
            }
        }

        // Remove created GOs from registry
        const removalUuids = new Set(removals.map((r) => r.go.uuid));
        this.allGameObjects = this.allGameObjects.filter((go) => !removalUuids.has(go.uuid));
        for (const uuid of removalUuids) {
            this.gameObjectMapping.delete(uuid);
        }

        // 6. afterSetAllState on updated GOs (cross-GO dependencies)
        for (const update of updates) {
            update.go.afterSetAllState(update.oldState);
        }

        return true;
    } finally {
        this._isRollingBack = false;
    }
}
```

**For chaining multiple deltas** (action undo up to 3 back), apply deltas in reverse chronological order. Add a method:

```typescript
public rollbackToDeltaChain(deltas: IDeltaSnapshot[], beforeRollbackSnapshot?: IGameSnapshot): boolean {
    // deltas should be in reverse chronological order (most recent first)
    for (const delta of deltas) {
        if (!this.rollbackToDelta(delta, beforeRollbackSnapshot)) {
            return false;
        }
    }
    return true;
}
```

**Note on `go.state` access**: `state` is `protected` on `GameObjectBase`. `GameStateManager` already accesses it via `getStateUnsafe()`. For delta rollback, you'll need to either:
- Add a method on `GameObjectBase` for setting individual state fields (e.g., `setStateField(name, value)`)
- Use `// @ts-expect-error` to bypass the access modifier (matching existing patterns in `Undo*` classes)
- Temporarily make `state` accessible via a method that returns a reference (similar to `getStateUnsafe()` but writable)

Choose the approach that best fits the existing code style. The `Undo*` classes already use `// @ts-expect-error` for this.

### Step 8: Create Delta Snapshot Container

**New file**: `server/game/core/snapshot/container/DeltaSnapshotContainer.ts`

This container stores `IDeltaSnapshot[]` per player and replaces `MetaSnapshotArray` for quick undo during the action phase. It should:

- Extend or follow the pattern of `SnapshotContainerBase` for `clearNewerSnapshots` registration
- Store deltas per player: `Map<string, IDeltaSnapshot[]>`
- Support `QuickRollbackPoint.Current` (last delta) and `.Previous` (second-to-last)
- Support chained rollback (return the N most recent deltas for a player)
- Implement `clearNewerSnapshots(snapshotId)` to prune deltas with `id > snapshotId`

Register this container with `SnapshotFactory` so it participates in the `clearNewerSnapshots` broadcast. Use the existing `createSnapshotContainerWithClearSnapshotsBinding` method on `SnapshotFactory` (lines 196–212) or add a new factory method.

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
2. Build the metadata for the delta (id, round, phase, etc.)
3. Call `deltaTracker.checkpoint(metadata)` to freeze the current delta
4. Store the delta in the `DeltaSnapshotContainer`
5. Start a fresh tracking window

### Step 10: Modify `SnapshotManager.takeSnapshot`

**File**: `server/game/core/snapshot/SnapshotManager.ts` (lines 134–153)

For `SnapshotType.Action`: instead of storing a full snapshot in `actionSnapshots`, store the current delta in the delta container. The quick snapshot reference should point to the delta.

The exact integration depends on whether you keep `MetaSnapshotArray` as a thin adapter over the delta container or replace it entirely. The cleanest approach is likely to have the delta container serve both as the action undo store and the quick undo store.

### Step 11: Modify `SnapshotManager.rollbackToInternal`

**File**: `server/game/core/snapshot/SnapshotManager.ts` (lines 241–276)

For `SnapshotType.Quick` and `SnapshotType.Action`: retrieve deltas from the delta container and call `gameStateManager.rollbackToDelta` or `rollbackToDeltaChain`.

For `SnapshotType.Phase` and `SnapshotType.Manual`: unchanged (full snapshot rollback).

After any rollback:
1. `clearNewerSnapshots` clears both full snapshot and delta containers
2. Stop delta tracking, then restart it for the new tracking window

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

### 3. `copyState` After Delta Restore

After restoring state fields from a delta, `copyState(go, go.state)` must be called for each affected GO. This rebuilds:
- Resolved GO references (from `GameObjectRef` → live `GameObjectBase`)
- `UndoArray` / `UndoMap` / `UndoSet` wrappers
- Any cached derived state

This is the same function called in the existing `setState()` path. The difference: in full rollback, `copyState` is called on **every** GO; in delta rollback, only on GOs with changed fields.

### 4. RNG State

`rngState` is stored in the delta metadata and must be restored on rollback. The random generator's state is set directly:
```typescript
this.#game.randomGenerator.rngState = delta.rngState;
```

### 5. `lastGameObjectId` on Rollback

The delta stores `lastGameObjectId` at the time the delta was created. On rollback, restore it:
```typescript
this._lastGameObjectId = delta.lastGameObjectId;
```

This ensures that new GOs created after rollback get fresh unique IDs (though they may reuse IDs from the rolled-back window — this is fine since those GOs no longer exist).

### 6. `clearAllSnapshots`

`SnapshotManager.clearAllSnapshots()` currently clears `actionSnapshots`, `phaseSnapshots`, and `manualSnapshots`. It must also clear the delta container and stop delta tracking.

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

### Integration Tests

- Run existing quick undo test scenarios (search for `QuickRollbackPoint` / `SnapshotType.Quick` in test files) — these should pass unchanged
- Run existing action undo tests — these should pass with delta-based action snapshots
- Phase undo tests — should be unaffected (still full snapshots)

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
| Delta rollback failure **halts the game** | Matches the existing `reportSevereRollbackFailure` pattern. No graceful fallback. |
| Full snapshots remain at **phase boundaries, setup, and manual snapshots** | Infrequent, provides safe anchors for delta chains. |
| Recording hooks go in **decorator setters** and **`Undo*` mutation methods** | These are the only paths that mutate `go.state[field]`. Complete coverage of all state mutations. |

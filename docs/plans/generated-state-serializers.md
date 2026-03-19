# Plan: Replace v8.serialize with Generated Per-Class State Serializers

## Summary

Replace the current `this.state` object plus the `v8.serialize`-backed **GameObject snapshot path** with **ts-morph-generated** `serialize()`/`deserialize()` functions per `@registerState`/`@registerStateBase` class. This:

1. **Eliminates the `state` object** from `GameObjectBase` — decorated fields store values directly in backing fields instead of proxying through `this.state[name]`
2. **Removes all UndoSafe collection wrappers** (`UndoArray`, `UndoMap`, `UndoSet`, proxied records/arrays) — mutations no longer need to be mirrored to a parallel state object in real-time
3. **Produces faster, customized serialization** — a build-time code generator creates per-class serialize/deserialize functions that know exactly which fields to capture, avoiding runtime metadata walking

A **build-time script** using ts-morph reads the TypeScript source, walks the decorator metadata for each class, and emits typed serialize/deserialize function pairs into a single generated file with a class-name registry. The generated per-object snapshots are already copied values, so they can be stored directly in snapshot objects without an additional `v8.serialize()` pass. `Game.state` can remain on its existing serialized path until it has an equivalent dedicated serializer.

## Motivation

The current system maintains a **dual representation** at all times: every decorated field stores its value both in the accessor backing field (for runtime reads) and in `this.state[fieldName]` (for snapshot serialization). This requires:

- Every `set` operation to write to both locations
- Complex UndoSafe wrappers (`UndoArray`, `UndoMap`, `UndoSet`, proxied records) that intercept mutations (`push`, `pop`, `set`, `delete`) and mirror them to the state object
- A runtime `copyState()` function that walks `Symbol.metadata` up the prototype chain during rollback to rehydrate the backing fields from the state

By generating serializers, we capture the state **only at snapshot time** (serialize) and restore it **only at rollback time** (deserialize). Normal gameplay has zero overhead from the state system — plain JS arrays, Maps, and Sets with no proxies. Because the generated snapshot payload is already detached from live objects, the GameObject snapshot path no longer needs a follow-up `v8.serialize()` / `v8.deserialize()` cycle just to force copying.

---

## Prerequisite: Rename `CopyMode` Enum Values

Before starting the main work, rename the `CopyMode` enum values in [server/game/core/GameObjectUtils.ts](../server/game/core/GameObjectUtils.ts#L31) for clarity:

| Old Name | New Name | New JSDoc |
|---|---|---|
| `UseMetaDataOnly` | `CompileTime` | All serialization logic is fully resolved at code-generation time (ts-morph). Each field is copied individually by the generated serializer. |
| `UseBulkCopy` | `RuntimeClone` | Uses `structuredClone` at runtime to copy the entire state, then re-applies any ref collection fields to recreate hydrated values. Slower but safe for complex / opaque state shapes. |

**Files to update:**
- [GameObjectUtils.ts](../server/game/core/GameObjectUtils.ts) — enum definition (L31-38), all references: `CopyMode.UseMetaDataOnly` → `CopyMode.CompileTime` (L192, L200), `CopyMode.UseBulkCopy` → `CopyMode.RuntimeClone` (L222), JSDoc on `registerState` (L208)
- [StateWatcher.ts](../server/game/core/stateWatcher/StateWatcher.ts#L33) — `@registerStateBase(CopyMode.UseMetaDataOnly)` → `@registerStateBase(CopyMode.CompileTime)`

---

## Phase 1: ts-morph Code Generator Script

### Goal
Create a **build-time script** that generates per-class `serialize`/`deserialize` functions by statically analyzing the TypeScript source.

### Steps

1. **Add `ts-morph` as a dev dependency** in [package.json](../package.json):
   ```
   npm install --save-dev ts-morph
   ```

2. **Create `scripts/generate-state-serializers.ts`** with this logic:
   - Load the TypeScript project via ts-morph using the existing `tsconfig.json`
   - Find all classes decorated with `@registerState` or `@registerStateBase`
   - For each class, walk up the prototype chain (including mixin return types — see [Mixin Handling](#mixin-handling)) collecting all accessor fields decorated with any state decorator
   - Determine the decorator type and parameters (e.g., `readonly` flag on `stateRefArray`) from the decorator call expression
   - Emit serialize/deserialize functions and an `ISerialized*` interface per class
   - Emit a registry map keyed by class name
   - Write output to `server/game/core/generated/StateSerializers.ts`

3. **Integrate into build scripts:**
   - [scripts/build-dev.js](../scripts/build-dev.js): Add `ts-node scripts/generate-state-serializers.ts` **before** the existing `concurrently "tsc" ...` line
   - [scripts/build-server.js](../scripts/build-server.js): Add the same **before** `tsc`
    - [scripts/build-test.js](../scripts/build-test.js): Add the same before both the fast-path `tsc -p ./test/tsconfig.json` build and the full `concurrently ...` build so tests never run against stale generated output

### Serialization Rules Per Decorator

| Decorator | Serialize (instance → snapshot) | Deserialize (snapshot → instance) |
|---|---|---|
| `@statePrimitive()` | `instance._field` (direct copy) | `(instance as any)._field = state._field` |
| `@stateValue()` | `structuredClone(instance._field)` | `(instance as any)._field = state._field` |
| `@stateRef()` | `instance._field?.getObjectId() ?? null` | `(instance as any)._field = state._field != null ? game.getFromUuidUnsafe(state._field) : null` |
| `@stateRefArray(true)` | `instance._field?.map(x => x.getObjectId()) ?? null` | `(instance as any)._field = state._field?.map(id => game.getFromUuidUnsafe(id)) ?? null` |
| `@stateRefArray(false)` | Same as `true` | Same as `true` (no UndoArray needed — plain array) |
| `@stateRefMap()` | `Map<string, GameObjectId<T>>` copy | `Map<string, T>` hydrated from the copied ID map |
| `@stateRefSet()` | `Set<GameObjectId<T>>` copy | `Set<T>` hydrated from the copied ID set |
| `@stateRefRecord()` | Object with values → IDs | Object with IDs → hydrated objects |

**Note:** `@stateRefSet()` and `@stateRefRecord()` are defined but currently unused in the codebase. Generate serializers for them anyway for completeness.

### Example Generated Output

For a class like `OngoingEffectSource` with a prototype chain of `GameObjectBase → GameObject → OngoingEffectSource`:

```ts
// AUTO-GENERATED — do not edit. Re-run scripts/generate-state-serializers.ts to regenerate.
import type { Game } from '../Game';
import type { OngoingEffectSource } from '../ongoingEffect/OngoingEffectSource';
// ... other imports

export interface ISerializedOngoingEffectSource {
    // From GameObjectBase
    _uuid: string;
    // From GameObject
    _ongoingEffects: string[] | null;
    _displayName: string;
    _id: string;
    // From OngoingEffectSource
    // (any additional fields)
}

export function serializeOngoingEffectSource(instance: OngoingEffectSource): ISerializedOngoingEffectSource {
    return {
        _uuid: (instance as any)._uuid,
        _ongoingEffects: (instance as any)._ongoingEffects?.map((e: any) => e.getObjectId()) ?? null,
        _displayName: (instance as any)._displayName,
        _id: (instance as any)._id,
    };
}

export function deserializeOngoingEffectSource(game: Game, instance: OngoingEffectSource, state: ISerializedOngoingEffectSource): void {
    (instance as any)._uuid = state._uuid;
    (instance as any)._ongoingEffects = state._ongoingEffects?.map((id: string) => game.getFromUuidUnsafe(id)) ?? null;
    (instance as any)._displayName = state._displayName;
    (instance as any)._id = state._id;
}
```

And at the bottom of the file, a registry:

```ts
export const stateSerializerRegistry = new Map<string, {
    serialize: (instance: any) => any;
    deserialize: (game: Game, instance: any, state: any) => void;
}>([
    ['OngoingEffectSource', { serialize: serializeOngoingEffectSource, deserialize: deserializeOngoingEffectSource }],
    ['Player', { serialize: serializePlayer, deserialize: deserializePlayer }],
    // ... all @registerState and @registerStateBase classes
]);
```

### Mixin Handling

TypeScript mixins in this codebase use the pattern:

```ts
export function WithDamage<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    @registerStateBase()
    class WithDamage extends WithPrintedHp(BaseClass) {
        @statePrimitive() private accessor _damage: number | null = null;
        // ...
    }
    return WithDamage;
}
```

The card type hierarchy composes these as (example for `NonLeaderUnitCard`):
```
NonLeaderUnitCard → WithUnitProperties(WithStandardAbilitySetup(InPlayCard))
InPlayCard → WithAllAbilityTypes(WithCost(PlayableOrDeployableCard))
```

**ts-morph approach:** The generator must resolve these mixin compositions:
1. When encountering a class that `extends SomeFunction(Base)`, recognize this as a mixin application
2. Find the mixin function, inspect its return type / inner class definition
3. Extract the decorated fields from the inner class
4. Recursively resolve nested mixins (e.g., `WithDamage` internally applies `WithPrintedHp`)

If ts-morph cannot automatically follow TypeScript mixin return types, **fallback approach**: maintain a small configuration mapping in the generator that explicitly lists mixin functions and their source files, e.g.:
```ts
const mixinSources = {
    'WithDamage': 'server/game/core/card/propertyMixins/Damage.ts',
    'WithCost': 'server/game/core/card/propertyMixins/Cost.ts',
    // ...
};
```

**Prototype this first** against `NonLeaderUnitCard` (the most mixin-heavy class) to validate feasibility before building the full generator.

### Card Implementation Handling

Card implementations (hundreds of files in `server/game/cards/`) do NOT add state decorators — they inherit all state from their base class (`NonLeaderUnitCard`, `EventCard`, `UpgradeCard`, `LeaderUnitCard`, `DoubleSidedLeaderCard`). They are wrapped at runtime by `buildAutoInitializingCardClass()` in [server/game/cards/Index.ts](../server/game/cards/Index.ts).

**At runtime**, `GameStateManager` should walk the prototype chain on first encounter of each class and cache which serializer to use:
1. Check `stateSerializerRegistry.get(instance.constructor.name)`
2. If not found, walk `Object.getPrototypeOf(constructor)` until a registered class is found
3. Cache the result for future lookups

This means card implementations automatically use their base class's serializer without any codegen or annotation.

### StateWatcher Handling

`StateWatcher` now uses `CopyMode.CompileTime` (currently `UseMetaDataOnly`) and stores its history in an `@stateValue()` accessor named `entries`. That means the generator can treat watcher history like any other decorator-backed value field.

The generated serializer for `StateWatcher` should serialize `entries` via `structuredClone()`, exactly like any other `@stateValue()` field. No special `RuntimeClone` path should be required for `StateWatcher` once this lands.

`CopyMode.RuntimeClone` should remain available only for classes that still genuinely need a bulk runtime clone fallback because their snapshot state is not fully representable through the generated per-field logic.

---

## Phase 2: Parallel Validation (Before Swapping)

### Goal
Prove the generated serializers produce **identical output** to the existing system before making any behavioral changes.

### Steps

1. **Write a validation test** (`test/server/core/GeneratedSerializerParity.spec.ts`):
   - Boot a game via the existing test harness (e.g. `IntegrationHelper`)
   - After game setup, iterate over every `GameObjectBase` registered in the `GameStateManager`
   - For each GO:
     a. Capture `go.getStateUnsafe()` (existing system, returns the `this.state` object)
     b. Call the generated `serialize(go)` function
     c. Assert deep equality — the serialized output should have the same field names and values
   - Run this at several game states (after setup, after a few actions, after a rollback)
     - Make this test part of the normal test build path so it runs through [scripts/build-test.js](../scripts/build-test.js), not just ad hoc dev builds

2. **Write a roundtrip test**:
   - For each GO: `serialize → deserialize → serialize` should produce identical output
   - This validates that deserialization correctly restores all fields

3. **Run within existing integration tests** to build confidence across the full game lifecycle

### Expected Discrepancies to Handle
- Current `state` stores `GameObjectId` strings for `@stateRef*` fields; generated serializer also produces `GameObjectId` strings → should match
- Current `state` stores `Map` / `Set` instances containing `GameObjectId` values for `@stateRefMap` / `@stateRefSet`; generated serializer should emit the same container shapes, so parity assertions should compare contents rather than identity
- `@stateValue` and `@statePrimitive` fields store values directly in state → should match exactly

---

## Phase 3: Swap Snapshot Path to Use Generated Serializers

### Goal
Replace the serialization/deserialization code paths in `GameStateManager` to use the generated functions.

### Changes

#### 3a. `buildGameStateForSnapshot()` — [GameStateManager.ts L136](../server/game/core/snapshot/GameStateManager.ts#L136)

**Current:**
```ts
public buildGameStateForSnapshot(): Buffer {
    this.removeUnusedGameObjects();
    return v8.serialize(to.record(this.allGameObjects, (item) => item.uuid, (item) => item.getStateUnsafe()));
}
```

**New:**
```ts
public buildGameStateForSnapshot(): Record<string, unknown> {
    this.removeUnusedGameObjects();
    const states: Record<string, unknown> = {};
    for (const go of this.allGameObjects) {
        const serializer = this.getSerializer(go);
        states[go.uuid] = serializer.serialize(go);
    }
    return states;
}
```

Where `getSerializer(go)` is a cached prototype-chain lookup into the `stateSerializerRegistry`.

Also update [SnapshotInterfaces.ts](../server/game/core/snapshot/SnapshotInterfaces.ts) so `IGameSnapshot.states` stores the serialized object graph directly instead of a `Buffer`, and update [SnapshotFactory.ts](../server/game/core/snapshot/SnapshotFactory.ts) and [GameStateManager.ts](../server/game/core/snapshot/GameStateManager.ts) accordingly.

This removes an otherwise redundant `v8.serialize()` / `v8.deserialize()` cycle for GameObject snapshots. The main benefit of keeping `v8.serialize()` here would be defensive deep-copying of the already-generated snapshot payload, but the generator's job is to produce a detached snapshot in the first place. If extra mutation safety is still desired, prefer a development-only guard such as freezing the snapshot payload rather than paying the runtime cost on every snapshot.

#### 3b. `rollbackToSnapshot()` — [GameStateManager.ts L143](../server/game/core/snapshot/GameStateManager.ts#L143)

**Current:**
```ts
const oldState = go.getStateUnsafe();
// ...
go.setState(updatedState);  // calls copyState() internally
```

**New:**
```ts
const serializer = this.getSerializer(go);
const oldState = serializer.serialize(go);  // capture pre-rollback state for hooks
// ...
go.applySerializedState(this.#game, serializer, updatedState, oldState);
```

`applySerializedState(...)` is a new narrow lifecycle helper on `GameObjectBase` that performs the deserialize and then immediately invokes `afterSetState(oldState)`. Do not call `serializer.deserialize(...)` directly from `GameStateManager`, because that bypasses per-object rollback side effects.

The rollback lifecycle must stay:

1. Capture `oldState` for the object being updated
2. Deserialize the new serialized snapshot state onto that object
3. Invoke `afterSetState(oldState)` for that object immediately
4. After all objects are updated, invoke `afterSetAllState(oldState)` for each updated object
5. For removed objects, invoke `cleanupOnRemove(oldState)`

With that lifecycle preserved, the existing hook implementations continue to work because:

- `TriggeredAbility.afterSetState()` checks `oldState.isRegistered` — this field exists in the serialized format
- `AbilityLimit.afterSetState()` checks `oldState.isRegistered` — same
- `Damage.afterSetState()` sets `_activeAttack = null` — doesn't use oldState
- `OngoingEffectEngine.afterSetState()` checks `oldState.isRegistered` — same
- `OngoingEffect.afterSetAllState()` calls `refreshContext()` — doesn't use oldState
- `OngoingEffectEngine.afterSetAllState()` calls `resolveEffects(true)` — doesn't use oldState
- `cleanupOnRemove()` overrides check `oldState.isRegistered` — same pattern

#### 3c. `Game.state` — No Change

`Game.state` serialization stays as-is: `v8.serialize(this.game.state)` in [SnapshotFactory.ts L155](../server/game/core/snapshot/SnapshotFactory.ts#L155). `Game` is not a `GameObjectBase` and has its own small, manually-managed `IGameState`.

---

## Phase 4: Simplify Decorators — Remove State Object

### Goal
Once Phase 3 is stable and tests pass, decorators become **pure metadata markers**. The `this.state` object and all UndoSafe wrappers are removed.

### Changes

#### 4a. Simplify Decorator Implementations — [GameObjectUtils.ts](../server/game/core/GameObjectUtils.ts)

All decorators become trivial markers — they only record metadata (field name + type) for the generator and then return nothing, allowing the default accessor behavior to remain in effect:

**`@statePrimitive()` / `@stateValue()`** — record metadata only, no `this.state` sync:
```ts
return;
```

Decorator returns should only be used if a specific decorator still needs to transform initialization or accessor behavior. If a decorator just records metadata, falling through with no return value is the simplest implementation.

**`@stateRef()`** — same pattern, no ID conversion at set time

**`@stateRefArray()`** — returns plain array, no `UndoArray`/`UndoSafeArray` wrapping. The `readonly` parameter becomes a no-op for state sync but can still be used for type narrowing if desired.

**`@stateRefMap()`** — returns plain `Map`, no `UndoMap` wrapping

**`@stateRefSet()`** — returns plain `Set`, no `UndoSet` wrapping

**`@stateRefRecord()`** — returns plain object, no `Proxy` wrapping

#### 4b. Remove `protected state` from GameObjectBase — [GameObjectBase.ts](../server/game/core/GameObjectBase.ts)

- Delete `protected state: IGameObjectBaseState = {} as unknown as IGameObjectBaseState;` (L43)
- Delete `setState()` (L110), `getState()` (L124), `getStateUnsafe()` (L120) methods
- Delete `IGameObjectBaseState` interface (L5)
- Remove `declare state:` patterns from subclasses:
  - [TokenCards.ts](../server/game/core/card/TokenCards.ts) — `public declare state: never`

#### 4c. Remove UndoSafe Collections — [GameObjectUtils.ts](../server/game/core/GameObjectUtils.ts)

Delete entirely:
- `UndoArray` class (L974)
- `UndoMap` class (L899)
- `UndoSet` class (L937)
- `UndoSafeRecord` function (L673)
- `UndoSafeArray` export function (L698)
- `UndoArrayInternal` export function (L745)
- `CreateUndoArrayInternal`, `CreateUndoArrayInternalFromIds`, `CreateUndoArrayBase`, `CreateUndoArrayProxy` functions
- Helper functions: `createIdArray`, `createIdMap`, `createIdSet`, `createIdRecord`, `pushIdsOntoStateArray`, `unshiftIdsOntoStateArray`, `getStateIdArray`
- Hydration functions: `hydrateReadonlyArrayFromIds`, `hydrateUndoMapFromIds`, `hydrateUndoSetFromIds`, `hydrateUndoRecordFromIds`, `hydrateIdFromState`

#### 4d. Remove `copyState()` — [GameObjectUtils.ts L832](../server/game/core/GameObjectUtils.ts#L832)

Delete the entire function and the `registerStateHydrator` helper.

#### 4e. Remove Unused Metadata / Types

- Delete symbols: `stateHydrationMetadata` (L13), `bulkCopyMetadata` (L14)
- Delete `CopyMode` enum (L31) — no longer needed at runtime; the generator reads the decorator argument from source if needed
- Delete `StateHydrationHandler` type
- Keep `stateSimpleMetadata`, `stateArrayMetadata`, etc. symbols — the decorators still register field names into metadata for the ts-morph generator to validate against (or remove them if the generator reads source AST only and doesn't need runtime metadata)

---

## Phase 5: Cleanup and Optimization

1. **Remove remaining dead code** referencing `this.state`, `UndoSafe*`, `copyState`, `CopyMode`
2. **Simplify `buildAutoInitializingCardClass`** ([GameObjectUtils.ts L315](../server/game/core/GameObjectUtils.ts#L315)) — it no longer needs to propagate `Symbol.metadata` for state copy behavior. It just needs the constructor wrapper for `initialize()` and `registerStateClassMarker`.
3. **Consider splitting `@registerState` responsibilities:**
   - Constructor wrapping for `initialize()` → keep or move to a dedicated `@autoInitialize` decorator
   - Parent validation (must have `@registerStateBase`) → keep
   - State metadata tracking → generator reads source directly, so this might be removable
4. **Run full test suite** — all integration tests in `test/scenarios/` must pass unchanged
5. **Benchmark** — compare `buildGameStateForSnapshot()` and `rollbackToSnapshot()` timings before/after

---

## Files Reference

### Core Files to Modify

| File | What Changes |
|------|-------------|
| [server/game/core/GameObjectUtils.ts](../server/game/core/GameObjectUtils.ts) | Simplify decorators, remove UndoSafe collections, remove `copyState`, remove `CopyMode`, rename enum values first |
| [server/game/core/GameObjectBase.ts](../server/game/core/GameObjectBase.ts) | Remove `state` property, `setState`/`getState`/`getStateUnsafe`, `IGameObjectBaseState` |
| [server/game/core/snapshot/GameStateManager.ts](../server/game/core/snapshot/GameStateManager.ts) | Swap `buildGameStateForSnapshot` and `rollbackToSnapshot` to use generated serializers |
| [server/game/core/snapshot/SnapshotInterfaces.ts](../server/game/core/snapshot/SnapshotInterfaces.ts) | Change `IGameSnapshot.states` from `Buffer` to the generated serialized state object type |
| [server/game/core/snapshot/SnapshotFactory.ts](../server/game/core/snapshot/SnapshotFactory.ts) | Store the generated GameObject snapshot object directly, while leaving `gameState` on `v8.serialize()` |
| [server/game/core/stateWatcher/StateWatcher.ts](../server/game/core/stateWatcher/StateWatcher.ts) | Update `CopyMode.UseMetaDataOnly` → `.CompileTime`; keep `entries` as `@stateValue()` |
| [server/game/core/card/TokenCards.ts](../server/game/core/card/TokenCards.ts) | Remove `declare state: never` |

### New Files

| File | Purpose |
|------|---------|
| `scripts/generate-state-serializers.ts` | ts-morph code generator |
| `server/game/core/generated/StateSerializers.ts` | Generated output (single file, ~40 serialize/deserialize pairs + registry) |

### Build Scripts to Update

| File | Change |
|------|--------|
| [scripts/build-dev.js](../scripts/build-dev.js) | Add `ts-node scripts/generate-state-serializers.ts` before `concurrently "tsc" ...` |
| [scripts/build-server.js](../scripts/build-server.js) | Add same before `tsc` |
| [scripts/build-test.js](../scripts/build-test.js) | Add same before both the fast test build path and the full concurrent test build path |
| [package.json](../package.json) | Add `ts-morph` to devDependencies |

### Files with State Decorator Usages (~31 files, ~81 usages)

These files have state decorator annotations that the generator will read. They don't need modification (the decorators stay as markers), but the generator must correctly parse them all:

| File | Decorators Used |
|------|----------------|
| [GameObjectBase.ts](../server/game/core/GameObjectBase.ts) | `@statePrimitive` (1× `_uuid`) |
| [GameObject.ts](../server/game/core/GameObject.ts) | `@stateRefArray(false)`, `@statePrimitive` (2×) |
| [Player.ts](../server/game/core/Player.ts) | `@stateRef` (8×), `@stateRefArray(false)` (1×), `@stateValue` (2×) |
| [Card.ts](../server/game/core/card/Card.ts) | `@statePrimitive` (5×), `@stateRefArray(false)` (3×), `@stateRef` (3×) |
| [InPlayCard.ts](../server/game/core/card/baseClasses/InPlayCard.ts) | `@statePrimitive` (3×), `@stateRef` (1×) |
| [PlayableOrDeployableCard.ts](../server/game/core/card/baseClasses/PlayableOrDeployableCard.ts) | `@statePrimitive` (1×) |
| [EventCard.ts](../server/game/core/card/EventCard.ts) | `@stateRef` (1×) |
| [LeaderUnitCard.ts](../server/game/core/card/LeaderUnitCard.ts) | `@stateRef` (1×) |
| [UnitProperties.ts](../server/game/core/card/propertyMixins/UnitProperties.ts) | `@stateRef` (2×), `@stateRefArray` (8×), `@statePrimitive` (1×) |
| [Damage.ts](../server/game/core/card/propertyMixins/Damage.ts) | `@statePrimitive` (2×) |
| [SimpleZone.ts](../server/game/core/zone/SimpleZone.ts) | `@stateRefArray(true)` (1×) |
| [DeckZone.ts](../server/game/core/zone/DeckZone.ts) | `@stateRefArray(false)` (2×) |
| [BaseZone.ts](../server/game/core/zone/BaseZone.ts) | `@stateRef` (2×), `@stateRefArray` (1×) |
| [CostAdjuster.ts](../server/game/core/cost/CostAdjuster.ts) | `@stateRef` (2×), `@statePrimitive` (1×) |
| [TriggeredAbility.ts](../server/game/core/ability/TriggeredAbility.ts) | `@statePrimitive` (1×) |
| [AbilityLimit.ts](../server/game/core/ability/AbilityLimit.ts) | `@statePrimitive` (2×), `@stateValue` (2×) |
| [ConstantAbility.ts](../server/game/core/ability/ConstantAbility.ts) | `@stateRefArray(false)` (1×) |
| [OngoingEffect.ts](../server/game/core/ongoingEffect/OngoingEffect.ts) | `@stateRefArray` (1×) |
| [OngoingEffectEngine.ts](../server/game/core/ongoingEffect/OngoingEffectEngine.ts) | `@statePrimitive` (1×), `@stateRefArray` (2×) |
| [DynamicOngoingEffectImpl.ts](../server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl.ts) | `@stateRefMap` (1×) |
| [DetachedOngoingEffectValueWrapper.ts](../server/game/core/ongoingEffect/effectImpl/DetachedOngoingEffectValueWrapper.ts) | `@stateRefMap` (1×) |
| [AdditionalPhaseEffect.ts](../server/game/core/ongoingEffect/effectImpl/AdditionalPhaseEffect.ts) | `@stateValue` (2×), `@stateRef` (1×) |
| [StateWatcherRegistrar.ts](../server/game/core/stateWatcher/StateWatcherRegistrar.ts) | `@stateRefMap` (1×) |
| [StateWatcher.ts](../server/game/core/stateWatcher/StateWatcher.ts) | `@stateValue` (1×) |

---

## Verification Checklist

1. **Generator output audit**: Inspect generated serializers for `Player`, `Card`/`NonLeaderUnitCard`, `OngoingEffectEngine` — verify field lists match a hand-audit of the source
2. **Serialize parity test**: Generated `serialize()` output matches existing `getStateUnsafe()` for every GO in test games
3. **Roundtrip test**: `serialize → deserialize → serialize` produces identical output
4. **Full integration suite**: All existing tests in `test/scenarios/` pass — game behavior unchanged
5. **Rollback correctness**: Undo/redo works correctly through existing snapshot tests
6. **Performance benchmark**: Time `buildGameStateForSnapshot` and `rollbackToSnapshot` before and after

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| ts-morph can't follow mixin return types | Fallback: maintain explicit mixin config mapping in generator; prototype against `NonLeaderUnitCard` first |
| Private field access in generated code | Use `(instance as any)._fieldName` — type-safe at codegen time, runtime bypass is acceptable for serialization |
| Per-object rollback hooks are skipped by direct deserialize calls | Route all state application through a helper that performs `deserialize` and then invokes `afterSetState(oldState)` before the later `afterSetAllState(oldState)` pass. Validate this in rollback parity tests. |
| `StateWatcher` history contains complex plain-data entries | Keep `entries` as `@stateValue()` and serialize it with `structuredClone()` like any other value field |
| Card implementations not in registry | Prototype-chain walk with caching resolves to nearest registered base class |
| Generated file becomes stale | Generator runs in every dev, prod, and test build. Could add a git pre-commit hook or CI check. |

## Execution Order

1. Rename `CopyMode` enum values (prerequisite, small standalone change)
2. Phase 1: Build the generator script (largest effort — prototype mixin resolution first)
3. Phase 2: Write and run parity/roundtrip tests (validates Phase 1)
4. Phase 3: Swap snapshot code paths (core behavioral change)
5. Phase 4: Simplify decorators and remove state object (cleanup)
6. Phase 5: Final cleanup and benchmark

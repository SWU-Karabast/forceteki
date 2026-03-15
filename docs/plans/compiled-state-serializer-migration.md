# Compiled State Serializer Migration Plan

## Status

Proposed implementation plan for a follow-up coding agent.

## Reimplementation Notes

If this plan needs to be reimplemented later, keep these issues and constraints in mind:

1. Reachability cannot be switched in one step.
  - A pure traversal of current live roots initially pruned GameObjects that were still needed by older snapshots during rollback.
  - The safe migration path was: generated snapshot serialization first, then traversal-based reachability, then only after validation remove the `getObjectId()` retention side effect.

2. Snapshot reachability must account for older snapshots, not only the current live graph.
  - The runtime needed a sticky set of snapshot-reachable UUIDs so objects reachable from earlier snapshots were not collected before rollback finished with them.
  - Reimplementations should explicitly model this instead of assuming current liveness is enough.

3. Traversing serialized state alone was not sufficient.
  - Some GameObjects were only reachable through non-state own-properties and helper references.
  - Reachability had to traverse both serialized GameObject state and selected non-state object properties, while excluding engine internals like `game`, `state`, `_uuid`, `_initialized`, and transient flags.

4. Runtime decorators can be simplified only after rollback hydration is off metadata.
  - Deleting `Symbol.metadata`, hydrator registration, and `copyState()` before generated hydration is active will break rollback.
  - The safe order was: generated write path, generated read path, then decorator/runtime cleanup.

5. Removing Undo wrappers changes the live-state contract.
  - Once `stateRef*` decorators stop mirroring IDs into `this.state`, live state becomes reference-rich and snapshot conversion must be the only place that converts refs to IDs.
  - Reimplementations should audit any direct `state` access before this step, especially `Game.ts`, rollback callbacks, and any Runtime classes.

6. Rollback callbacks receive old live state, not snapshot-safe state.
  - `afterSetState`, `afterSetAllState`, and `cleanupOnRemove` now receive the prior in-memory state object shape.
  - Existing callbacks were safe because they only inspected primitive flags, but any future callback that expects raw IDs or mirrored collections will break.

7. `StateWatcher` should stay Runtime until separately migrated.
  - Its state intentionally stores `GameObjectId` payloads and rejects direct GameObject references.
  - It is a good Runtime reference case and should not be silently pulled into the CompileTime path during a broad cleanup.

8. Dynamic class coverage is still sensitive.
  - Preserving constructor names made class-name lookup work for wrapped card classes, but constructor-based dispatch would be safer than name-only lookup if this is rebuilt again.
  - Reimplementations should treat duplicate class names and mixin-produced classes as explicit validation targets.

9. Transient objects still need a hard guard.
  - `createWithoutRefsUnsafe()` and `setCannotHaveRefs()` remained necessary for objects intentionally created outside the tracked GameObject graph.
  - `getObjectId()` should enforce that guard, but it should not drive retention.

10. Build integration must be mandatory, not advisory.
   - The generated registry has to be refreshed before every normal build/test entry point.
   - Missing generation should fail loudly with a targeted error instead of degrading into runtime lookup failures.

11. Validation needs undo-specific coverage, not just compile success.
   - The failures surfaced in undo / rollback scenarios first, especially phase snapshot flows.
   - A reimplementation should always rerun `npm run build-test`, `npm run jasmine-fail-fast`, and the undo scenario coverage before considering the migration safe.

## Objective

Replace the current runtime metadata-driven `@registerState` snapshot system with generated serializers and deserializers built with `ts-morph`.

The desired end state is:

- `CopyMode.CompileTime` uses generated serializer/deserializer code.
- `CopyMode.Runtime` uses `structuredClone` on the state payload for classes that should remain runtime-managed.
- Runtime decorators become thin property helpers instead of metadata registrars and hydrator builders.
- Snapshot write and rollback read both flow through generated code instead of assuming the live in-memory state object is already snapshot-safe.
- GameObject reachability is redesigned so the engine no longer depends on `getObjectId()` and Undo wrappers to decide whether an object is still referenced.

## Explicit Decisions

- Use a full migration plan, not a narrow spike.
- Generate build-only TypeScript files rather than committing generated output.
- Keep a Runtime escape hatch for unsupported or intentionally opaque classes, with `StateWatcher` as the initial Runtime reference case.
- Redesign reference tracking instead of keeping the current `getObjectId()` retention model.

## Why This Is Larger Than A Serializer Swap

The current system in `server/game/core/GameObjectUtils.ts` does more than serialize state:

1. It discovers state shape at runtime using decorators and `Symbol.metadata`.
2. It rebuilds hydrated values during rollback in `copyState()`.
3. It uses `UndoArray`, `UndoMap`, `UndoSet`, and proxy wrappers to keep mutable state collections synchronized when code mutates them in place.
4. It marks GameObjects as referenced when IDs are created so `GameStateManager.removeUnusedGameObjects()` can prune unreachable objects.

Because of that, removing the metadata and ID-copy layers requires changes in three areas:

- code generation
- snapshot serialization and rollback hydration
- GameObject reachability / pruning

## Current Hotspots

- `server/game/core/GameObjectUtils.ts`
  - current decorators
  - `CopyMode`
  - `copyState()`
  - Undo wrappers and proxy mutation logic
- `server/game/core/GameObjectBase.ts`
  - `setState()` / `getState()` / `getStateUnsafe()` lifecycle
  - registration guardrails
- `server/game/core/snapshot/GameStateManager.ts`
  - snapshot write path
  - rollback application
  - `removeUnusedGameObjects()` pruning logic
- `server/game/core/snapshot/SnapshotManager.ts`
  - snapshot orchestration and rollback entry points
- `server/game/core/stateWatcher/StateWatcher.ts`
  - only current bulk-copy user
  - should map to `CopyMode.Runtime`
- `server/game/cards/Index.ts`
  - dynamic card wrapping via `buildAutoInitializingCardClass()`
- `server/game/core/Player.ts`
  - representative `stateRef`, `stateRefArray(false)`, `stateValue` usage
- `server/game/core/zone/DeckZone.ts`
  - representative mutable array state
- `server/game/core/ongoingEffect/effectImpl/DetachedOngoingEffectValueWrapper.ts`
  - representative map mutation state
- `test/helpers/IntegrationHelper.js`
  - rollback and undo integration harness
- `test/helpers/CustomMatchers.js`
  - contains UndoArray-aware matchers that may need adjustment once wrappers are removed

## Target Architecture

### 1. Two Distinct State Forms

Split the concept of state into two forms:

- live state: the in-memory data shape gameplay code mutates during normal execution
- snapshot state: the serialized payload written into snapshots and consumed during rollback

Do not require live state to be directly snapshot-safe anymore.

### 2. Generated Registry

Generate a registry keyed by runtime class identity or constructor lookup that can answer:

- how to serialize a given object into snapshot state
- how to deserialize snapshot state back into live state
- whether the class is `CompileTime` or `Runtime`

The registry must support:

- `@registerState()` leaf classes
- `@registerStateBase()` inheritance chains
- dynamically wrapped card classes
- mixin-produced classes that participate in the register-state hierarchy

### 3. `CopyMode` Rename

Update `CopyMode` in `server/game/core/GameObjectUtils.ts`:

- `UseMetaDataOnly` -> `CompileTime`
- `UseBulkCopy` -> `Runtime`

Semantics:

- `CompileTime`: use generated serializers / deserializers
- `Runtime`: use runtime `structuredClone` behavior for snapshot payloads

### 4. Decorator Scope After Migration

After generated code becomes authoritative, the decorators should only do lightweight property forwarding.

They should no longer be responsible for:

- building metadata registries
- registering hydrators
- walking inheritance for rollback copying
- creating Undo wrappers solely to translate to IDs

## Generator Requirements

Implement a `ts-morph` generator that:

1. Loads the workspace TypeScript program using the repo `tsconfig.json`.
2. Finds all register-state participants.
3. Resolves inherited decorated accessors across `@registerStateBase()` chains.
4. Detects the state decorator kind for each accessor.
5. Emits serializer/deserializer code for each `CompileTime` class.
6. Emits explicit Runtime registry entries for `Runtime` classes.
7. Produces actionable diagnostics for unsupported shapes.

The generator must handle these field categories:

- `statePrimitive`
- `stateValue`
- `stateRef`
- `stateRefArray(true)`
- `stateRefArray(false)`
- `stateRefMap`
- `stateRefSet`
- `stateRefRecord` if retained

The generator should not silently skip unsupported patterns. It should fail fast with clear diagnostics.

## Recommended Serialization Semantics

### `statePrimitive`

Serialize directly.

### `stateValue`

Serialize directly as snapshot payload data.

For `CompileTime`, generated code can pass values through unchanged unless a later restriction is added.

### `stateRef`

Serialize as `GameObjectId` in snapshot state.

Deserialize to a direct object reference in live state.

### `stateRefArray`

Serialize as arrays of `GameObjectId`.

Deserialize to arrays of object references.

Distinguish readonly versus mutable arrays at generation time.

### `stateRefMap` / `stateRefSet` / `stateRefRecord`

Serialize contained GameObject references as IDs.

Deserialize back to live collections containing direct object references.

Do not reintroduce the current runtime hydration metadata path.

## Reachability Redesign

This is the highest-risk change.

Today, GameObjects are retained largely because creating `GameObjectId`s marks them as referenced. If live state starts holding direct object references and plain collections, that implicit retention signal disappears.

Implement a new reachability mechanism before removing the current wrapper-based approach.

Recommended direction:

1. Define root objects that are always considered live.
2. Before snapshot pruning, traverse live references from those roots.
3. Mark all reachable GameObjects.
4. Remove only unreachable GameObjects.

This should replace the current `hasRef`-driven assumption in `GameStateManager.removeUnusedGameObjects()`.

Do not remove the existing retention model until the replacement is working and covered by tests.

## Runtime Escape Hatch

`StateWatcher` should remain on the Runtime path initially.

Reasons:

- it is the only current bulk-copy user
- it already relies on structured-clone-friendly state payloads
- it provides a clear example of a class family that is intentionally not migrated to generated field-by-field serialization

This means the first pass does not need to force `StateWatcher` subclasses onto the compile-time path.

## Build Integration

Add a generation step before TypeScript compilation.

Expected integration points:

- `scripts/build-dev.js`
- `scripts/build-server.js`
- `scripts/build-test.js`

Recommended script additions:

- add a dedicated generator script, for example `scripts/generate-state-serializers.js`
- add a package script for explicit generation
- ensure build and test fail clearly if generated files are missing or stale

Because output is build-only, the coding agent should make editor and CI behavior predictable. Avoid hidden dependencies on a manually run generation command.

## Implementation Phases

### Phase 1: Contracts And Surface Area

1. Rename `CopyMode` values and update call sites.
2. Define the snapshot-state versus live-state contract.
3. Decide where generated registry code lives in the build output and how runtime imports it.
4. Define the supported decorator field matrix and unsupported diagnostics.

### Phase 2: Generator Foundation

1. Add `ts-morph`.
2. Build AST discovery for register-state classes and inheritance trees.
3. Emit a generated registry file for discovered classes.
4. Emit Runtime entries for Runtime classes.
5. Make generation deterministic and fail on unsupported cases.

### Phase 3: Snapshot Write Path

1. Refactor `GameStateManager.buildGameStateForSnapshot()` to serialize via the generated registry.
2. Stop assuming `getStateUnsafe()` returns snapshot-ready data for `CompileTime` classes.
3. Preserve Runtime behavior for Runtime classes.

### Phase 4: Rollback Read Path

1. Refactor `GameObjectBase.setState()` and related helpers to deserialize via generated code.
2. Replace `copyState()` metadata walking for `CompileTime` classes.
3. Keep a Runtime path for Runtime classes.

### Phase 5: Runtime Decorator Simplification

1. Reduce register-state decorators to lightweight runtime helpers.
2. Remove metadata registration and hydration plumbing that is no longer needed.
3. Keep guardrails for missing registration, but validate against generated coverage rather than metadata presence.

### Phase 6: Reachability Migration

1. Introduce the new reachability model.
2. Validate that pruning still works correctly.
3. Only then remove dependence on `getObjectId()`-based retention.

### Phase 7: Remove Undo Wrapper Dependence

1. Replace `UndoArray`, `UndoMap`, `UndoSet`, and proxy record synchronization for migrated classes.
2. Keep live mutable collections as plain JS structures where possible.
3. Update tests and matchers that are wrapper-specific.

### Phase 8: Dynamic Runtime Coverage

1. Ensure `buildAutoInitializingCardClass()` works with generated registry lookup.
2. Validate card implementations and mixin-produced classes resolve the correct serializer behavior.
3. Preserve runtime safety checks for missing register-state participation.

## Validation Requirements

The follow-up agent should not treat this as complete without validation.

Minimum required checks:

1. Generator coverage checks
   - every `CompileTime` register-state class has a generated registry entry
   - every `Runtime` class is explicitly marked Runtime

2. Build checks
   - `npm run build-test`
   - `npm test`

3. Rollback coverage
   - run the undo integration harness in `test/helpers/IntegrationHelper.js`
   - run scenario coverage under `test/scenarios/undo`

4. Representative round-trip tests
   - inheritance case
   - mutable array case
   - mutable map/set case
   - card-related case
   - Runtime `StateWatcher` case

5. Memory / GC evaluation
   - compare before and after heap behavior under snapshot-heavy flows
   - verify the experiment actually reduces memory pressure instead of only moving complexity around

## Recommended Early Test Targets

- `server/game/core/Player.ts`
- `server/game/core/zone/DeckZone.ts`
- `server/game/core/ongoingEffect/effectImpl/DetachedOngoingEffectValueWrapper.ts`
- `server/game/abilities/keyword/exploit/ExploitCostAdjuster.ts`
- `server/game/core/stateWatcher/StateWatcher.ts`

These give coverage for:

- inheritance
- mutable arrays
- mutable maps
- `stateValue`
- Runtime-mode classes

## Key Risks

### 1. Reachability Regression

If the new retention model is wrong, live GameObjects may be pruned incorrectly.

### 2. Mutation Semantics Regression

Many call sites mutate arrays, maps, and sets in place. Removing wrappers without preserving behavior at the snapshot boundary can create silent rollback bugs.

### 3. Dynamic Class Coverage Gaps

Card wrappers and mixin-generated classes must resolve generated entries correctly.

### 4. Build Ergonomics

Build-only generated files can make local development brittle if generation is not wired into all normal entry points.

## Non-Goals

- Do not refactor unrelated gameplay behavior outside the snapshot / state system unless required by the migration.
- Do not migrate Runtime classes to CompileTime unless there is a clear benefit and test coverage.
- Do not remove Runtime fallback support in the first pass.

## Handoff Notes For The Implementing Agent

- Start by proving the generator can discover the right class graph before editing runtime behavior.
- Keep Runtime support operational throughout the migration.
- Treat `GameStateManager` and reachability as part of scope from the beginning, not as cleanup work.
- Do not remove Undo wrappers until the new snapshot path and reachability path are already validated.
- Prefer constructor-based or registry-based dispatch over class-name-only lookup because of dynamic card wrapping.

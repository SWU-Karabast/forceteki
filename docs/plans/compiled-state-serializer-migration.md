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
  - Preserving constructor names made a name-based lookup viable for wrapped card classes, but constructor-attached handlers or constructor-keyed dispatch is safer than class-name lookup if this is rebuilt again.
  - Reimplementations should treat duplicate class names and mixin-produced classes as explicit validation targets.

9. Transient objects still need a hard guard.
  - `createWithoutRefsUnsafe()` and `setCannotHaveRefs()` remained necessary for objects intentionally created outside the tracked GameObject graph.
  - `getObjectId()` should enforce that guard, but it should not drive retention.

10. Build integration must be mandatory, not advisory.
  - The generated serializer module has to be refreshed before every normal build/test entry point.
  - Missing generation should fail loudly with a targeted error instead of degrading into runtime lookup failures.

11. Validation needs undo-specific coverage, not just compile success.
   - The failures surfaced in undo / rollback scenarios first, especially phase snapshot flows.
   - A reimplementation should always rerun `npm run build-test`, `npm run jasmine-parallel-fail-fast`, and the undo scenario coverage before considering the migration safe.

12. Missing compile-time handlers should fail loudly.
  - A temporary metadata-derived fallback hid real generator coverage gaps and pushed the design back toward the runtime metadata system this migration is removing.
  - If a `CompileTime` class cannot resolve generated handlers, snapshot serialization should throw a targeted error instead of rebuilding serializer behavior from decorator metadata.

13. Serializer generation scope must stay tied to `@registerState()`.
  - Generating handlers for every constructible framework class or every wrapped runtime leaf caused mapping counts to explode without improving correctness.
  - The serializer registration set should be driven by classes explicitly marked with `@registerState()`. If a stateful ancestor needs handlers, derive a empty class from it and flag it as @registerState, see OngoingEffectSource and OngoingEffectSourceBase as an example.

14. Card implementations do not need individual serializers.
  - Dynamically wrapped card implementations are runtime discovery and dispatch roots, not serializer-definition roots.
  - Card implementations should resolve to the nearest generated `@registerState()` ancestor in their prototype chain rather than receiving one serializer per implementation.

15. Source-time card discovery must work during generation.
  - When the generator runs under source / `ts-node`, card discovery may need `.ts` inputs rather than built `.js` outputs.
  - If source-time discovery is wrong, the generator can appear to have no card coverage and tempt incorrect fixes elsewhere in the serializer mapping logic.

## Objective

Replace the current runtime metadata-driven `@registerState` snapshot system with generated serializers and deserializers built with `ts-morph`. The goal of this is to cut down on dynamic allocations and GC by making the serializers static.

The desired end state is:

- `CopyMode.CompileTime` uses generated per-class serializer/deserializer functions with inherited fields expanded inline.
- `CopyMode.CompileTime` serializer output is fully detached from live state, so callers can trust it without a follow-up `structuredClone`.
- `CopyMode.Runtime` uses `structuredClone` on the state payload for classes that should remain runtime-managed.
- Runtime decorators become thin property helpers instead of metadata registrars and hydrator builders.
- Snapshot write and rollback read both flow through generated code instead of assuming the live in-memory state object is already snapshot-safe.
- GameObject reachability is redesigned so the engine no longer depends on `getObjectId()` and Undo wrappers to decide whether an object is still referenced.

## Explicit Decisions

- Use a full migration plan, not a narrow spike.
- Generate build-only TypeScript files rather than committing generated output.
- Treat generated serializer output as ignored repository state: add the generated path to `.gitignore` and do not review or commit it as source.
- Do not generate a per-field runtime registry; generate straight-line serializer/deserializer functions for each concrete registered class and only keep minimal dispatch glue.
- Keep a Runtime escape hatch for unsupported or intentionally opaque classes, with `StateWatcher` as the initial Runtime reference case.
- Redesign reference tracking instead of keeping the current `getObjectId()` retention model.
- Only classes explicitly marked with `@registerState()` need generated serializer registrations. Card implementations and other runtime leaf classes should resolve through their nearest generated `@registerState()` ancestor rather than receiving individual serializers.
- Do not rely on `structuredClone` as a compile-time safety net. If a compile-time serializer cannot emit a detached payload using copied values only, generation should fail or the class should stay `Runtime`.

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

### 2. Generated Serializer Module

Generate a module that emits one serializer function and one deserializer function for each concrete `@registerState()` class, with ancestor fields expanded directly into the emitted function body.

For dynamic card coverage:

- dynamically wrapped card classes are discovery/runtime dispatch roots, not serializer-definition roots
- do not emit one serializer per card implementation
- emit handlers only for classes explicitly marked with `@registerState()`; wrapped card implementations should dispatch to the nearest generated ancestor in their prototype chain

The generated output should not rebuild a runtime list of field descriptors and walk them later. The point is to emit the equivalent of handwritten code such as:

```ts
export function serializeOngoingEffectSource(instance: OngoingEffectSource) {
  return {
    _uuid: instance.state._uuid,
    _ongoingEffects: instance.state._ongoingEffects?.map((effect) => effect.getObjectId())
  };
}

export function deserializeOngoingEffectSource(game: Game, instance: OngoingEffectSource, serializedState: any) {
  instance.state._uuid = serializedState._uuid;
  instance.state._ongoingEffects = serializedState._ongoingEffects?.map((id) => game.getFromUuidUnsafe(id));
}
```

Only a minimal dispatch layer is needed at runtime:

- resolve which generated function pair belongs to a concrete class
- identify whether the class is `CompileTime` or `Runtime`

The generated output must be safe for `v8.serialize()` / `v8.deserialize()` round-tripping, since `GameStateManager` uses Node.js v8 binary serialization for snapshot storage. This means generated serializer output must consist only of detached plain objects, detached arrays, primitives, detached `Map`, and detached `Set` — no class instances, Symbols, reused live collection references, or other exotic types.

The generated module should be emitted to a predictable path at `server/game/core/generated/stateSerializers.ts` so runtime code can import it without conditional discovery.

The generated module must support:

- `@registerState()` leaf classes
- `@registerStateBase()` inheritance chains
- dynamically wrapped card classes
- mixin-produced classes that participate in the register-state hierarchy

Generation scope rule:

- `@registerStateBase()` classes do not need generated handlers unless they are intentionally promoted to `@registerState()` because they directly own serialized state
- do not generate handlers for every runtime descendant of a registered class
- do not generate handlers for individual card implementations unless a card implementation itself is explicitly `@registerState()`

Mixin discovery strategy: The generator should identify mixin-produced classes by detecting functions that return class expressions extending a parameterized base. If a mixin-produced class cannot be statically resolved by ts-morph, the generator should emit an explicit diagnostic and the class should be assigned to `CopyMode.Runtime` rather than silently skipped. The implementing agent should survey existing mixins early in Phase 2 and treat them as explicit validation targets.

### 3. `GameObjectBase` Snapshot Hooks

Add explicit snapshot hooks on `GameObjectBase` so the snapshot system calls instance methods instead of reaching into generator internals directly.

Add these methods:

- `serializeStateForSnapshot(): IGameObjectBaseState`
- `deserializeStateFromSnapshot(serializedState: IGameObjectBaseState): void`

For `CompileTime` classes, these methods should delegate to generated handlers for the concrete runtime constructor.

Important constraint:

- prefer constructor-attached handler functions or constructor-keyed dispatch over `constructor.name` string lookup for correctness with wrappers, mixins, and duplicate names

The `@registerState()` wrapper and `buildAutoInitializingCardClass()` should attach the generated serializer/deserializer pair to the wrapped constructor so `GameObjectBase` can dispatch correctly from the final runtime type.

Transitional note: during the migration (Phases 2-4, before metadata removal in Phase 5), the generator must resolve card class metadata through prototype-chain inheritance rather than assuming it is attached to the runtime constructor. `@registerState()` explicitly copies `Symbol.metadata` from the original class to the wrapper, but `buildAutoInitializingCardClass()` does not — card metadata works today only because `copyState()` walks the prototype chain. This asymmetry is irrelevant in the target state since `Symbol.metadata` is removed entirely (see Section 5).

Implement dispatch this way:

- use constructor-attached handlers as the primary dispatch mechanism
- store them on the final wrapped constructor via symbols or non-enumerable static properties
- if a generated manifest exists, use it for startup validation and diagnostics, not for the hot-path dispatch itself

This keeps snapshot calls to a direct constructor property lookup instead of a `Map` or registry lookup, minimizes runtime allocations and indirection on the serialization path, and works cleanly with the existing wrapper model as long as the handlers are attached to the final runtime constructor.

### 4. `CopyMode` Rename

Update `CopyMode` in `server/game/core/GameObjectUtils.ts`:

- `UseMetaDataOnly` -> `CompileTime`
- `UseBulkCopy` -> `Runtime`

Semantics:

- `CompileTime`: use generated serializers / deserializers
- `Runtime`: use runtime `structuredClone` behavior for snapshot payloads

### 5. Decorator Scope And Metadata Removal

In the target architecture, `Symbol.metadata` is not needed. All of its current responsibilities are replaced:

- field lists for `copyState()` → generated serializer/deserializer functions
- hydration function registration → generated deserializer inlines the logic
- `bulkCopyMetadata` (CopyMode flag) → generated Runtime dispatch entries
- registration validation (parent class checks) → `registerStateClassMarker` on constructor (already exists)

After generated code becomes authoritative (end of Phase 4), Phase 5 should remove `Symbol.metadata` usage entirely:

- delete the `Symbol.metadata` polyfill and all metadata symbol keys
- remove metadata copying from `@registerState()` constructor wrapping
- remove metadata walking from `copyState()` (which itself is removed)
- remove hydrator registration from all property decorators

After this cleanup, the decorators should only do lightweight property forwarding (getter/setter pairs that marshal between the backing field and `this.state`). Each decorator's getter/setter is self-contained and does not need metadata to function.

The decorators should no longer be responsible for:

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
5. Emits straight-line serializer/deserializer functions for each `CompileTime` `@registerState()` class.
6. Emits explicit Runtime dispatch entries for `Runtime` classes.
7. Produces actionable diagnostics for unsupported shapes.

Generator scoping requirements:

- the serializer registration set should be driven by explicit `@registerState()` classes, not by every constructible descendant discovered at runtime
- dynamically wrapped card implementations should be used to validate runtime dispatch coverage, but they should not automatically cause per-implementation serializer emission
- if a card hierarchy needs generated coverage and the nearest stateful ancestor is only `@registerStateBase()`, If a stateful ancestor needs handlers, derive a empty class from it and flag it as @registerState, see OngoingEffectSource and OngoingEffectSourceBase as an example.

The generator should flatten inheritance at generation time. For a leaf `@registerState()` class, its emitted serializer/deserializer pair should include fields declared on that class and every `@registerStateBase()` ancestor in the correct order, without runtime metadata walking.

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

## Generated Function Shape

The generated compile-time path should look like direct handwritten code, not a runtime interpreter over metadata.

Requirements:

- emit one serializer function and one deserializer function per concrete compile-time class
- use explicit field assignments for primitives and values
- inline reference conversion logic per field category
- emit fresh arrays, maps, sets, records, and nested plain values instead of reusing live references from the gameplay object graph
- write deserialized values back onto the live `instance.state` shape expected by gameplay code
- allow a small generated dispatch object or constructor-to-function map, but do not generate per-field metadata arrays or prototype walkers

Runtime wiring:

- `GameObjectBase.serializeStateForSnapshot()` delegates to a handler attached to the concrete constructor or resolved from a constructor-keyed dispatch table
- `GameObjectBase.deserializeStateFromSnapshot()` delegates the same way
- `@registerState()` and card auto-wrappers are responsible for preserving that linkage on the final wrapped constructor

Avoid making name-based lookup the primary contract.

Use constructor-attached handlers as the normal path.

- constructor-keyed tables may exist only as a secondary validation or migration aid
- class-name dispatch should not be the authoritative runtime mechanism

## Serialization Semantics

### `statePrimitive`

Serialize directly.

Deserialize by direct assignment onto `instance.state`.

### `stateValue`

Serialize directly as snapshot payload data.

For `CompileTime`, generated code must only emit detached values. Reusing a live object, array, `Map`, or `Set` reference is not allowed.

Deserialize by direct assignment unless a class explicitly remains `Runtime`.

Implement `stateValue` this way:

- allow primitives and other explicitly supported copied payload shapes only
- reject or diagnose `stateValue` usages that would require handing a live mutable reference through the serializer
- prefer moving unusual classes to `Runtime` mode over preserving pass-through semantics that would force a post-serialization `structuredClone`

This keeps the compile-time contract simple: the serializer itself is responsible for producing a safe snapshot payload, and callers do not need to deep-clone it afterward.

Note: `v8.serialize()` remains the snapshot storage boundary, but compile-time serializers should already have eliminated live references before that point. The snapshot layer should not be relied on to repair reference-sharing bugs in serializer output.

### `stateRef`

Serialize as `GameObjectId` in snapshot state.

Deserialize to a direct object reference in live state.

### `stateRefArray`

Serialize as newly allocated arrays of `GameObjectId`.

Deserialize to arrays of object references.

Distinguish readonly versus mutable arrays at generation time.

Decorator contract requirement:

- collection decorators must only serialize primitive payload elements (`GameObjectId`, string, number, boolean, null, undefined) so the emitted collection is always detached and copy-safe
- if a collection field would need to serialize nested objects or other mutable references, it should use a different representation or remain `Runtime`

Implement `stateRefArray` migration this way:

- keep existing Undo wrapper behavior only long enough to de-risk the initial serializer/deserializer bring-up
- after compile-time serialization is validated, migrate `CompileTime` classes to plain JS arrays, maps, and sets

Removing wrapper and proxy layers is important to the GC/allocation goal of this project. Do not combine that entire change with the first serializer rollout if doing so makes regressions harder to isolate. Treat wrappers as transitional compatibility machinery, not part of the target design.

### `stateRefMap` / `stateRefSet` / `stateRefRecord`

Serialize contained GameObject references as IDs in newly allocated collections.

Deserialize back to live collections containing direct object references.

Decorator contract requirement:

- array/map/set/record decorators should be restricted to primitive snapshot payload members only
- map values, set entries, record values, and array elements must serialize to copied primitive values rather than nested mutable objects
- any field that cannot meet that rule should be rejected from `CompileTime` generation or explicitly assigned to `Runtime`

Do not reintroduce the current runtime hydration metadata path.

For `CompileTime` classes, the intended end state is plain JS collection types rather than `UndoMap`, `UndoSet`, proxy arrays, or proxy records.

If transitional compatibility requires recreating wrappers during the first compile-time rollout, that should be explicitly temporary and removed once rollback correctness is proven.

## Reachability Redesign

This is the highest-risk change.

Today, GameObjects are retained largely because creating `GameObjectId`s marks them as referenced. If live state starts holding direct object references and plain collections, that implicit retention signal disappears.

Implement a new reachability mechanism before removing the current wrapper-based approach.

Reachability implementation:

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

Add these scripts and build hooks:

- add a dedicated generator script, for example `scripts/generate-state-serializers.js`
- add a package script for explicit generation
- emit the generated module to `server/game/core/generated/stateSerializers.ts` so runtime code can import it without conditional discovery
- ensure build and test fail clearly if generated files are missing or stale
- the `--fast-build` path in `build-test.js` currently only compiles test files, skipping server compilation — generation must also run in the fast-build path, since a developer changing a state decorator and using `--fast-build` would otherwise get stale generated serializers

Staleness strategy: prefer always-regenerating on every build over implementing a staleness detection mechanism. The class count (~30 registered classes) is small enough that ts-morph generation time should be negligible compared to tsc compilation. This avoids the complexity of hash-based or timestamp-based staleness checks.

Because output is build-only, the coding agent should make editor and CI behavior predictable. Avoid hidden dependencies on a manually run generation command.

## Implementation Phases

### Phase 1a: CopyMode Rename

1. Rename `CopyMode` values (`UseMetaDataOnly` -> `CompileTime`, `UseBulkCopy` -> `Runtime`) and update all call sites.
2. This is a mechanical change that can merge independently and unblock naming clarity in the rest of the codebase.

### Phase 1b: Snapshot Contracts And Hooks

1. Define the snapshot-state versus live-state contract.
2. Add `GameObjectBase` snapshot hook methods (`serializeStateForSnapshot`, `deserializeStateFromSnapshot`) and use constructor-attached handlers as the default dispatch mechanism.
3. Define the supported decorator field matrix and unsupported diagnostics.

### Phase 1c: Generated Module Layout

1. Decide where the generated serializer module lives in the build output (`server/game/core/generated/stateSerializers.ts`) and how runtime imports it.
2. This can be done in parallel with Phase 1b.

### Phase 2: Generator Foundation And Reachability Design

1. Add `ts-morph`.
2. Build AST discovery for register-state classes and inheritance trees.
3. Survey existing mixins and mixin-produced classes. Validate that all can be statically resolved or explicitly assign unresolvable ones to `CopyMode.Runtime`.
4. Emit direct serializer/deserializer functions for discovered compile-time `@registerState()` classes with inherited fields flattened into the function body.
5. Emit Runtime dispatch entries for Runtime classes.
6. Make generation deterministic and fail on unsupported cases.
7. Begin designing the new reachability model in parallel with generator work. Define root objects, traversal rules, and the sticky reachable UUID set needed to keep objects alive across multiple held snapshots (see Reimplementation Note 2). This is design and scaffolding only — activation happens in Phase 6.

### Phase 3: Snapshot Write Path

1. Refactor `GameStateManager.buildGameStateForSnapshot()` to call `GameObjectBase.serializeStateForSnapshot()`.
2. Stop assuming `getStateUnsafe()` returns snapshot-ready data for `CompileTime` classes.
3. Preserve Runtime behavior for Runtime classes.

### Phase 4: Rollback Read Path

1. Refactor `GameObjectBase.setState()` and related helpers to call `deserializeStateFromSnapshot()` for `CompileTime` classes.
2. Replace `copyState()` metadata walking for `CompileTime` classes.
3. Keep a Runtime path for Runtime classes.
4. If needed for safety, temporarily recreate Undo wrappers here for migrated classes during the first rollout.
5. Audit all `afterSetState()` and `afterSetAllState()` overrides. Once `CompileTime` classes stop mirroring IDs into `this.state`, the `oldState` parameter passed to these hooks will contain the prior live in-memory state shape (with direct object references), not the serialized snapshot form (with `GameObjectId` strings). Existing callbacks are safe because they only inspect primitive flags, but add debug-mode assertions that validate the expected shape to catch future regressions.

### Phase 5: Runtime Decorator Simplification And Metadata Removal

1. Remove `Symbol.metadata` polyfill, all metadata symbol keys, and metadata copying from `@registerState()` and `@registerStateBase()`.
2. Remove `copyState()` and all hydrator registration from property decorators.
3. Reduce register-state decorators to lightweight property-forwarding helpers (getter/setter only).
3. Keep guardrails for missing registration, but validate against generated coverage rather than metadata presence.

### Phase 6: Reachability Migration

1. Activate the reachability model designed in Phase 2. Add reachability scaffolding (root traversal, diagnostic logging) added as a parallel no-op track during Phases 3-4.
2. Implement the sticky reachable UUID set that unions across all currently held snapshots (from Reimplementation Note 2). Objects reachable from any held snapshot must not be collected until that snapshot is discarded. This must be modeled explicitly rather than assuming current liveness is sufficient.
3. Validate that pruning still works correctly.
4. Only then remove dependence on `getObjectId()`-based retention.

### Phase 7: Dynamic Runtime Coverage

1. Ensure `buildAutoInitializingCardClass()` attaches or preserves the generated serializer/deserializer handlers on the wrapped constructor.
2. Validate card implementations and mixin-produced classes resolve the correct concrete serializer behavior.
3. Keep serializer emission scoped to explicit `@registerState()` classes; card implementations should resolve to their nearest generated ancestor instead of receiving individual serializers.
4. Preserve runtime safety checks for missing register-state participation.

Note: This phase is independent of wrapper removal and should run before or concurrently with Phase 8 to catch card-wrapping issues earlier.

### Phase 8: Remove Undo Wrapper Dependence

1. Replace `UndoArray`, `UndoMap`, `UndoSet`, and proxy record synchronization for migrated classes.
2. Keep live mutable collections as plain JS structures where possible.
3. Update tests and matchers that are wrapper-specific.
4. Treat this as required for the GC/allocation objective, not optional cleanup.

## Validation Requirements

The follow-up agent should not treat this as complete without validation.

Minimum required checks:

1. Generator coverage checks
  - every `CompileTime` register-state class has a generated serializer/deserializer pair
  - every `Runtime` class is explicitly marked Runtime
  - every wrapped runtime constructor resolves the expected generated handlers without ambiguity

2. Build checks
   - `npm run build-test`
   - `npm test`
  - if the full suite has a known intentional failure unrelated to this migration, record that explicitly and still run the focused serializer/undo regressions that exercise snapshot dispatch and rollback

3. Rollback coverage
   - run the undo integration harness in `test/helpers/IntegrationHelper.js`
   - run scenario coverage under `test/scenarios/undo`

4. Representative round-trip tests
   - inheritance case
   - mutable array case
   - mutable map/set case
   - card-related case
  - wrapper-dispatch case (`@registerState()` wrapper and `buildAutoInitializingCardClass()`)
   - Runtime `StateWatcher` case
  - compile-time snapshot isolation case: mutating serializer output or `getStateUnsafe()` output must not mutate live state

5. Memory / GC evaluation
   - compare before and after heap behavior under snapshot-heavy flows
   - verify the experiment actually reduces memory pressure instead of only moving complexity around
   - measure snapshot sizes (byte count from `v8.serialize` output) before and after migration as a concrete regression metric
   - run a concrete benchmark: N rounds of a game with snapshots enabled, measuring peak RSS (resident set size) and total `v8.serialize()` byte throughput

6. Phase gate requirement
   - every phase must pass all `undoIt` tests (from `IntegrationHelper.js`) before proceeding to the next phase
   - this is the single most valuable existing test for this migration and should be treated as a hard gate, not advisory

## Early Test Targets

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

This risk is why wrapper removal should be staged, but the target architecture should still eliminate wrappers for `CompileTime` classes once correctness is established.

### 3. Dynamic Class Coverage Gaps

Card wrappers and mixin-generated classes must resolve generated entries correctly.

### 4. Build Ergonomics

Build-only generated files can make local development brittle if generation is not wired into all normal entry points.

## Non-Goals

- Do not refactor unrelated gameplay behavior outside the snapshot / state system unless required by the migration.
- Do not migrate Runtime classes to CompileTime unless there is a clear benefit and test coverage.
- Do not remove Runtime fallback support in the first pass.
- `Game.ts` is explicitly out of scope. It does not use `@registerState` — its state is serialized separately by `GameStateManager` via `v8.serialize` on `this.#game.state`. It should not be pulled into the generated serializer system.
- The `cleanupOnRemove()` lifecycle hook receives pre-rollback live state for already-removed objects. Generated deserializers do not need to handle this case.

## Handoff Notes For The Implementing Agent

- Start by proving the generator can discover the right class graph before editing runtime behavior.
- Keep Runtime support operational throughout the migration.
- Treat `GameStateManager` and reachability as part of scope from the beginning, not as cleanup work.
- Do not remove Undo wrappers until the new snapshot path and reachability path are already validated.
- Prefer constructor-attached or constructor-keyed dispatch over class-name-only lookup because of dynamic card wrapping.
- Each phase should be independently mergeable. Do not attempt to complete all 8 phases in a single session. Land each phase separately so regressions can be bisected.
- During the transition (Phases 2-4), be aware that `buildAutoInitializingCardClass()` does not copy `Symbol.metadata` to the wrapper, unlike `@registerState()`. Card metadata works today only because `copyState()` walks the prototype chain. This asymmetry becomes irrelevant after Phase 5 removes `Symbol.metadata` entirely.

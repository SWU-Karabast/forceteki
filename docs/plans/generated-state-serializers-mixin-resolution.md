# Plan: Generate Full State Mappings Across Mixin Chains

## Summary

Teach the generated state serializer pipeline to build the full field mapping for a concrete class by statically resolving its composed inheritance chain, including mixin factory calls.

This plan is intentionally narrower than [generated-state-serializers.md](./generated-state-serializers.md). That document covers the broader generated-serializer migration. This document covers the specific blocker where concrete exported classes such as `NonLeaderUnitCard` generate empty serializers because the generator only collects fields declared directly on the target class and does not reconstruct state contributed by mixins.

The preferred approach is:

1. Extend the generator in [scripts/generate-state-serializers.ts](../../scripts/generate-state-serializers.ts) to resolve mixin factory returns statically with ts-morph.
2. Aggregate decorated state fields across the full composed chain in base-to-derived order.
3. Keep explicit source-level descriptors only as a fallback for mixins that cannot be resolved with reasonable static analysis.

Do not make runtime metadata collection the default solution. The generator is build-time code, and the state shape should remain discoverable without executing game modules.

## Problem Statement

The current generator can find classes decorated with `@registerState` and `@registerStateBase`, and it can collect decorated accessors directly declared on those class bodies. That is sufficient for hidden mixin classes such as `AsUnit`, but it is not sufficient for concrete exported classes whose parent type is created through one or more mixin factory calls.

Example chain:

- [server/game/core/card/NonLeaderUnitCard.ts](../../server/game/core/card/NonLeaderUnitCard.ts) defines `NonLeaderUnitCardParent = WithUnitProperties(WithStandardAbilitySetup(InPlayCard))`
- `NonLeaderUnitCard` extends that alias
- [server/game/core/card/propertyMixins/UnitProperties.ts](../../server/game/core/card/propertyMixins/UnitProperties.ts) defines a returned inner class with many `@stateRef` and `@stateRefArray` accessors
- [server/game/core/card/propertyMixins/Damage.ts](../../server/game/core/card/propertyMixins/Damage.ts) defines another returned inner class with `@statePrimitive` accessors

Today, [server/game/core/generated/GeneratedStateSerializers.ts](../../server/game/core/generated/GeneratedStateSerializers.ts) contains serializers for the hidden mixin classes, but concrete classes like `NonLeaderUnitCard` still generate empty serializer fragments.

Runtime currently compensates by composing serializers across the constructor prototype chain in [server/game/core/snapshot/GameStateManager.ts](../../server/game/core/snapshot/GameStateManager.ts). That works only if the right serializer fragments exist. The generator still needs to understand the composed class graph well enough to emit correct mappings for the classes we care about.

## Goal

Generate a full state field mapping for each concrete decorated class by statically resolving:

- direct class inheritance
- identifier aliases that point to composed parent classes
- mixin factory calls that return decorated inner classes
- nested mixin chains inside those returned classes

The result should let another agent implement one of two end states:

1. Keep the existing runtime serializer composition in [server/game/core/snapshot/GameStateManager.ts](../../server/game/core/snapshot/GameStateManager.ts) but ensure every needed serializer fragment is generated correctly.
2. Optionally move later to flattened per-concrete-class serializers once the full chain is reliably discoverable.

This plan focuses on discovery and generation correctness first.

## Non-Goals

- Redesigning the state decorator API
- Replacing the serializer registry contract in [server/game/core/StateSerializers.ts](../../server/game/core/StateSerializers.ts) unless needed for this work
- Changing rollback semantics outside the generated serializer path
- Introducing runtime reflection or module execution as the primary discovery mechanism

## Recommended Implementation Strategy

### Phase 1: Model the Inheritance Source Graph

Update [scripts/generate-state-serializers.ts](../../scripts/generate-state-serializers.ts) so it records more than just `ClassDeclaration -> own decorated fields`.

Add helpers that can resolve the source of a class parent from:

1. A direct `extends SomeClass`
2. An identifier alias such as `const NonLeaderUnitCardParent = WithUnitProperties(...)`
3. A call expression such as `WithUnitProperties(WithStandardAbilitySetup(InPlayCard))`

The output of this phase should be an internal representation of a composed parent chain, not generated code yet.

Suggested internal model:

```ts
interface ResolvedStateClassNode {
    name: string;
    declaration: ClassDeclaration;
    ownFields: IStateField[];
    parent: ResolvedParentNode | null;
}

type ResolvedParentNode =
    | { kind: 'class'; node: ResolvedStateClassNode }
    | { kind: 'mixin'; mixinName: string; returnedClass: ResolvedStateClassNode; appliedBase: ResolvedParentNode | null };
```

The exact types can differ, but the generator needs a persistent structure it can recurse through without repeatedly re-parsing the same AST.

### Phase 2: Resolve Mixin Factory Returns

Add ts-morph helpers that can resolve a mixin factory into the inner class it returns.

The generator should support the current dominant mixin pattern used in files under [server/game/core/card/propertyMixins](../../server/game/core/card/propertyMixins):

```ts
export function WithDamage<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    const HpClass = WithPrintedHp(BaseClass);

    @registerStateBase()
    class WithDamage extends HpClass {
        @statePrimitive()
        private accessor _damage: number | null = null;
    }

    return WithDamage;
}
```

Required resolver capabilities:

1. Given a call expression, resolve the called symbol to a function declaration.
2. Inspect the function body to find the returned class.
3. Support `return InnerClass;` where `InnerClass` is declared in the function body.
4. Support local alias variables inside the mixin when the inner class extends another mixin application, for example `const HpClass = WithPrintedHp(BaseClass); class WithDamage extends HpClass`.
5. Recurse through nested mixin applications until the chain reaches a normal class declaration.

Do not try to support arbitrary higher-order TypeScript metaprogramming. This resolver only needs to cover the mixin shapes that actually exist in this codebase.

### Phase 3: Aggregate Full State Fields

Replace the current own-fields-only collection with full-chain aggregation.

For any target class selected for generation:

1. Resolve its parent source chain.
2. Walk from base to derived.
3. Collect decorated fields from each contributing class body.
4. Preserve deterministic ordering.
5. Detect duplicate field names and fail loudly with a useful error message.

Suggested behavior:

- Base class fields should appear before derived class fields.
- If two contributing nodes define the same field name, generation should throw with both source locations.
- If a parent source cannot be resolved, generation should fail rather than silently dropping fields.

This phase is the main correctness change.

### Phase 4: Decide Output Shape

Keep the first implementation conservative.

Recommended first step:

1. Continue generating serializer fragments for decorated classes, including returned inner mixin classes.
2. Add generation support for concrete classes whose state is inherited entirely from their resolved mixin chain.
3. Leave runtime composition in [server/game/core/snapshot/GameStateManager.ts](../../server/game/core/snapshot/GameStateManager.ts) intact until parity is verified.

Once discovery is reliable, a later change may choose to emit fully flattened serializers for concrete classes and simplify runtime lookup. That is optional follow-up work, not required to solve the current blocker.

### Phase 5: Add a Narrow Fallback Contract

If a small number of mixins cannot be resolved statically without overcomplicating the generator, add an explicit source-level fallback contract in those files.

Preferred fallback shape:

- a small exported descriptor object next to the mixin function
- consumed only by the generator
- names the returned class and, if needed, the parent contributors

Example direction:

```ts
export const stateMixinDescriptor = {
    mixinName: 'WithDamage',
    returnedClassName: 'WithDamage'
};
```

This should be a last resort for edge cases. Do not require every mixin to define one unless the AST approach proves too brittle in practice.

## Files Most Likely To Change

Primary implementation target:

- [scripts/generate-state-serializers.ts](../../scripts/generate-state-serializers.ts)

Representative inheritance and mixin-chain test cases:

- [server/game/core/card/NonLeaderUnitCard.ts](../../server/game/core/card/NonLeaderUnitCard.ts)
- [server/game/core/card/LeaderUnitCard.ts](../../server/game/core/card/LeaderUnitCard.ts)
- [server/game/core/card/propertyMixins/UnitProperties.ts](../../server/game/core/card/propertyMixins/UnitProperties.ts)
- [server/game/core/card/propertyMixins/Damage.ts](../../server/game/core/card/propertyMixins/Damage.ts)
- [server/game/core/card/propertyMixins/PrintedHp.ts](../../server/game/core/card/propertyMixins/PrintedHp.ts)
- [server/game/core/card/propertyMixins/StandardAbilitySetup.ts](../../server/game/core/card/propertyMixins/StandardAbilitySetup.ts)

Runtime integration references:

- [server/game/core/StateSerializers.ts](../../server/game/core/StateSerializers.ts)
- [server/game/core/snapshot/GameStateManager.ts](../../server/game/core/snapshot/GameStateManager.ts)

Generated output to inspect after each iteration:

- [server/game/core/generated/GeneratedStateSerializers.ts](../../server/game/core/generated/GeneratedStateSerializers.ts)

Tests to extend:

- [test/server/core/GeneratedStateSerializers.spec.ts](../../test/server/core/GeneratedStateSerializers.spec.ts)

## Concrete Tasks For The Implementing Agent

1. Refactor the generator so class collection returns richer metadata than only `className` and `fields`.
2. Implement AST resolution for extends identifiers, variable aliases, and mixin call expressions.
3. Implement mixin function analysis that finds the returned inner class declaration.
4. Cache resolved nodes so the generator does not repeatedly traverse the same mixin chain.
5. Add full-chain field aggregation and collision detection.
6. Regenerate [server/game/core/generated/GeneratedStateSerializers.ts](../../server/game/core/generated/GeneratedStateSerializers.ts).
7. Update tests to assert that deep composed classes produce complete state mappings.
8. Only if necessary, introduce a minimal descriptor fallback for unresolved mixins.

## Acceptance Criteria

The work is complete when all of the following are true:

1. A concrete class with no own decorated fields but inherited mixin state, such as `NonLeaderUnitCard`, no longer produces an empty serializer mapping.
2. Generated output for deep composed classes includes fields from the full chain, including examples such as `_uuid`, `_name`, `_controller`, `_zone`, `_attackEnabled`, `_damage`, and `_upgrades`.
3. The generator fails loudly on unresolved parent chains or duplicate state field names.
4. Existing runtime serializer lookup in [server/game/core/snapshot/GameStateManager.ts](../../server/game/core/snapshot/GameStateManager.ts) continues to work.
5. Tests in [test/server/core/GeneratedStateSerializers.spec.ts](../../test/server/core/GeneratedStateSerializers.spec.ts) cover at least one deep mixin chain and one shallow chain.

## Verification Plan

### Generated Output Checks

After each change, inspect [server/game/core/generated/GeneratedStateSerializers.ts](../../server/game/core/generated/GeneratedStateSerializers.ts) and verify:

1. `serializeNonLeaderUnitCard` is no longer empty.
2. `deserializeNonLeaderUnitCard` includes the same field set.
3. Hidden mixin serializers such as `serializeAsUnit` still generate correctly.
4. Field ordering is deterministic.

### Runtime Checks

Use the existing serializer tests in [test/server/core/GeneratedStateSerializers.spec.ts](../../test/server/core/GeneratedStateSerializers.spec.ts) and add assertions that:

1. The serializer for a player still contains expected base fields.
2. The serializer for a unit contains inherited fields from base classes and mixins.
3. A serialize -> deserialize -> serialize roundtrip remains stable.

### Suggested Additional Test Cases

Add generator coverage for these patterns:

1. Direct decorated class inheritance
2. Exported concrete class extending an identifier alias to a mixin application
3. Nested mixin application where one mixin extends a local alias created from another mixin call
4. Mixin chain node with no own state fields that still must remain in the resolved parent path

## Risks And Guardrails

### Risks

1. Overengineering the resolver to support patterns that do not exist in the repo
2. Silently dropping fields when a parent source cannot be resolved
3. Generating non-deterministic field order across deep chains
4. Treating runtime composition as a substitute for incorrect generation

### Guardrails

1. Support only the actual mixin patterns present in this repo.
2. Prefer explicit errors over partial output.
3. Cache resolved nodes and source lookups.
4. Keep the fallback descriptor mechanism small and optional.

## Recommended Order Of Implementation

1. Prototype the resolver against [server/game/core/card/NonLeaderUnitCard.ts](../../server/game/core/card/NonLeaderUnitCard.ts).
2. Extend it to handle the nested chain through [server/game/core/card/propertyMixins/UnitProperties.ts](../../server/game/core/card/propertyMixins/UnitProperties.ts) and [server/game/core/card/propertyMixins/Damage.ts](../../server/game/core/card/propertyMixins/Damage.ts).
3. Add caching and error handling.
4. Regenerate serializer output and inspect the concrete classes.
5. Add or update tests.
6. Only then decide whether any unresolved edge cases justify descriptor fallbacks.

## Decision Log

- Preferred strategy: ts-morph static mixin resolution
- Fallback strategy: explicit source-level descriptors for edge cases only
- Rejected as primary strategy: runtime metadata exposure on mixin-returned classes

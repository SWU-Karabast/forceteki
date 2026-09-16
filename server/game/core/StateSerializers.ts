import type { IGameObjectBase } from './GameObjectBase';
import { generatedStateSerializerEntries, GENERATED_SCHEMA_SURFACE_HASH } from './generated/GeneratedStateSerializers';
import type { IGeneratedSerializerEntry } from './StateEncoding';

/**
 * Name-keyed registry for the codegen state serializers (Plan 3, Phase A step 1 / Phase B step 6). Nothing
 * in the live engine imports this module yet, by design: the state bag, `copyState`, and `v8.serialize`
 * remain the sole snapshot authority for the whole of this unit (see B18 in the plan's behavior table).
 * This import is the one non-optional edge to the generated artifact - it is what turns a missing or
 * ungenerated artifact into a `tsc` `TS2307` build failure rather than a silently-skipped feature.
 *
 * The import is deliberately one-directional (this file imports the artifact; the artifact imports only the
 * leaf `StateEncoding.ts`) rather than the reverse - a generated module that itself called
 * `registerStateSerializers()` at load time would form a CommonJS load cycle with this file, and a probe
 * retained at `.anvil/p3-pa1/experiments/commonjs-cycle/` shows that cycle handing a `const` export
 * `undefined` at the point the cycle is entered. `generatedStateSerializerEntries` is a plain data export,
 * so no such cycle exists.
 */
export { GENERATED_SCHEMA_SURFACE_HASH };

const registry = new Map<string, IGeneratedSerializerEntry>();

// A constructor function, typed loosely enough to walk with Object.getPrototypeOf without importing every
// concrete class this registry might see.
type StateSerializerConstructor = abstract new (...args: never[]) => unknown;

// Per-constructor lookup cache: a class's nearest registered ancestor never changes at runtime, so the
// prototype-chain walk in getStateSerializerFor only needs to happen once per constructor.
const lookupCache = new Map<StateSerializerConstructor, IGeneratedSerializerEntry>();

export function registerStateSerializers(entries: readonly IGeneratedSerializerEntry[]): void {
    for (const entry of entries) {
        if (registry.has(entry.className)) {
            throw new Error(`Duplicate state serializer registration for class name "${entry.className}".`);
        }
        registry.set(entry.className, entry);
    }
    // A later registration can add a more-specific ancestor for a constructor whose lookup was already
    // cached against a farther one; drop the cache rather than serve a stale entry.
    lookupCache.clear();
}

/**
 * Walks `instance`'s prototype chain, by `constructor.name`, and returns the first registry entry found.
 * Fragment (mixin-body-declared) classes are never registry keys, so the first match is always the
 * instance's true nearest registered ancestor - never a coincidentally-named unrelated class, since
 * registered class names are asserted unique at generation time (see `assertModelIsGeneratable`).
 */
export function getStateSerializerFor(instance: IGameObjectBase): IGeneratedSerializerEntry {
    const ctor = (instance as unknown as { constructor: StateSerializerConstructor }).constructor;
    const cached = lookupCache.get(ctor);
    if (cached) {
        return cached;
    }

    let current: StateSerializerConstructor | null = ctor;
    while (current && current.name) {
        const entry = registry.get(current.name);
        if (entry) {
            lookupCache.set(ctor, entry);
            return entry;
        }
        current = Object.getPrototypeOf(current) as StateSerializerConstructor | null;
    }

    throw new Error(`No generated state serializer is registered for any class in the prototype chain of "${ctor?.name ?? 'unknown'}".`);
}

registerStateSerializers(generatedStateSerializerEntries);

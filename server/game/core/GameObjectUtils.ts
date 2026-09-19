import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
import { STATE_ENCODING_TAGS, UNENCODABLE_OBJECT_KEYS } from './StateEncoding';
import type { FieldKind } from './StateEncoding';
import { Contract } from './utils/Contract';
import { Helpers } from './utils/Helpers';

// @ts-expect-error Symbol.metadata is not yet a standard.
Symbol.metadata ??= Symbol.for('Symbol.metadata');
const stateMetadata = Symbol();
const stateSimpleMetadata = Symbol();
// P3-PA4: statePrimitive/stateValue both push into stateSimpleMetadata above with no way to tell them
// apart; this sub-bucket records each field's specific kind ('primitive' | 'value') alongside it, additive
// only - no decorator get/set/init behavior changes.
const stateSimpleKindMetadata = Symbol();
const stateArrayMetadata = Symbol();
const stateMapMetadata = Symbol();
const stateSetMetadata = Symbol();
const stateRecordMetadata = Symbol();
const stateObjectMetadata = Symbol();

const stateClassesStr: Record<string, string> = {};

export const registerStateClassMarker = Symbol('registerStateClassMarker');
export const registerStateAutoInitializeMarker = Symbol('registerStateAutoInitializeMarker');

/**
 * P3-PA4: every class actually passed through `registerState()`/`registerStateBase()`, captured at
 * decoration time - including abstract classes and mixin-fragment classes declared inside factory function
 * bodies (`WithCost`, `WithDamage`, and the other ten `declaredInFunction` classes). This registry's job is
 * to record everything registered at runtime; tolerance for fragments/test-fixtures belongs in
 * `StateSerializerCoverageCheck.ts`'s comparison logic, not here.
 */
export const registeredStateClassesByName = new Map<string, abstract new (...args: never[]) => unknown>();

// A generic helper type
declare const __brand: unique symbol;
declare const __gameObjectTypeBrand: unique symbol;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;
// A branded type for GameObject IDs. This is just a string, but the branding prevents it from being accidentally interchanged with other strings.
export type GameObjectId<T extends IGameObjectBase = IGameObjectBase> = Branded<string, 'GameObjectId'> & { readonly [__gameObjectTypeBrand]?: T };

export enum CopyMode {

    /** Copies from the state using only the Metadata fields. */
    UseMetaDataOnly = 0
}

export interface RegisterStateOptions {
    copyMode?: CopyMode;
    autoInitialize?: boolean;
}

/**
 * P3-PB2: eager ref *marking*. Before the state-bag cutover these latches were a side effect of building the
 * id mirror (`createIdArray`/`createIdMap`/... and `newValue?.getObjectId()`); with the mirror gone they have
 * to be explicit, because nothing else calls `getObjectId()` on a referent that is only ever reachable through
 * a ref field. Dropping a latch does not fail to compile and does not reliably fail a test: the referent
 * survives until `removeUnusedGameObjects()` culls it at the *next* snapshot, and the rollback after that dies
 * in `getFromUuidUnsafe` (a `SevereHaltGame`, two commits later). Keep every `markStateRef*` call paired with
 * the setter/mutator it guards.
 *
 * `getObjectId()`'s return value is deliberately discarded - the call is made purely for its `markReferenced()`
 * side effect. Serialization reads `.uuid` directly and never marks (`StateEncoding.ts`), which is what lets
 * capture run cull-then-serialize.
 */
function markStateRef(value: IGameObjectBase | null | undefined): void {
    if (value == null) {
        return;
    }

    value.getObjectId();
}

function markStateRefArray(values: readonly IGameObjectBase[] | null | undefined): void {
    if (values == null) {
        return;
    }

    for (const value of values) {
        value.getObjectId();
    }
}

function markStateRefMap(values: ReadonlyMap<string, IGameObjectBase> | null | undefined): void {
    if (values == null) {
        return;
    }

    for (const value of values.values()) {
        value.getObjectId();
    }
}

function markStateRefSet(values: ReadonlySet<IGameObjectBase> | null | undefined): void {
    if (values == null) {
        return;
    }

    for (const value of values) {
        value.getObjectId();
    }
}

function markStateRefRecord(values: Readonly<Record<string, IGameObjectBase>> | null | undefined): void {
    if (values == null) {
        return;
    }

    for (const key of Object.keys(values)) {
        values[key].getObjectId();
    }
}

function normalizeRegisterStateOptions(copyModeOrOptions: CopyMode | RegisterStateOptions | undefined): Required<RegisterStateOptions> {
    if (copyModeOrOptions == null || typeof copyModeOrOptions === 'number') {
        const copyMode = typeof copyModeOrOptions === 'number' ? copyModeOrOptions : CopyMode.UseMetaDataOnly;
        return {
            copyMode,
            autoInitialize: true
        };
    }

    return {
        copyMode: copyModeOrOptions.copyMode ?? CopyMode.UseMetaDataOnly,
        autoInitialize: copyModeOrOptions.autoInitialize ?? true
    };
}

/**
 * P3-PA4 (PA4-IR2-1 fix-pass): compares two classes' *own* (not inherited/flattened) field-declaration
 * metadata - the same per-class bucket `registerState()` writes to `context.metadata[targetClass.name]`
 * and `getRuntimeStateFieldModelByClassName()` reads per prototype-chain level - for structural equality:
 * same field names and same kind per field, across every bucket a field decorator populates.
 *
 * Own-metadata comparison (not a flattened prototype-chain walk) is what makes this usable on
 * `AsLeader`-style classes: `AsLeader`'s *flattened* model legitimately differs between
 * `WithLeaderProperties()` call sites because the base classes it extends differ, so comparing flattened
 * models would false-positive (throw) on that legitimate case. Its *own* bucket - just the fields
 * `AsLeader`'s class body itself declares - is identical every time, since it's the same source text
 * re-executed.
 */
function ownStateMetadataEquals(a: Record<string | symbol, any> | undefined, b: Record<string | symbol, any> | undefined): boolean {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }

    for (const bucket of [stateSimpleMetadata, stateArrayMetadata, stateMapMetadata, stateSetMetadata, stateRecordMetadata, stateObjectMetadata]) {
        const aFields = ((a[bucket] as string[] | undefined) ?? []).slice().sort();
        const bFields = ((b[bucket] as string[] | undefined) ?? []).slice().sort();
        if (aFields.length !== bFields.length || aFields.some((field, i) => field !== bFields[i])) {
            return false;
        }
    }

    const aKinds = (a[stateSimpleKindMetadata] as Record<string, FieldKind> | undefined) ?? {};
    const bKinds = (b[stateSimpleKindMetadata] as Record<string, FieldKind> | undefined) ?? {};
    const aKindKeys = Object.keys(aKinds).sort();
    const bKindKeys = Object.keys(bKinds).sort();
    if (aKindKeys.length !== bKindKeys.length || aKindKeys.some((key, i) => key !== bKindKeys[i] || aKinds[key] !== bKinds[key])) {
        return false;
    }

    return true;
}

/** Reads a registered class's own (not inherited) field-declaration metadata bucket, by the same key `registerState()` stores it under. */
function getOwnStateMetadata(registeredClass: abstract new (...args: never[]) => unknown, className: string): Record<string | symbol, any> | undefined {
    const metadata = (registeredClass as unknown as { [Symbol.metadata]?: Record<string, any> })[Symbol.metadata];
    return metadata?.[className] as Record<string | symbol, any> | undefined;
}

/**
 * Decorator to capture the names of any accessors flagged as &#64;statePrimitive, &#64;stateRef, or &#64;stateRefArray, and then clear the array for the next derived class to use.
 * This is meant for classes that are meant to be directly instantiated, they must be non-abstract and leafs.
 * @param copyModeOrOptions `CopyMode` currently has a single mode (metadata-only copy); the parameter is retained for options.autoInitialize and future modes.
 * If options.autoInitialize=false, the class is marked/registered without creating a constructor wrapper.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export function registerState<T extends GameObjectBase>(copyModeOrOptions?: CopyMode | RegisterStateOptions) {
    return function (targetClass: any, context: ClassDecoratorContext) {
        const options = normalizeRegisterStateOptions(copyModeOrOptions);
        const parentClass = Object.getPrototypeOf(targetClass);

        if (parentClass?.[registerStateAutoInitializeMarker] === true) {
            throw new Error(`class "${targetClass.name}" cannot extend @registerState class "${parentClass.name}". If a class needs to be both, split the class into a abstract base class and a concrete version (see ExploitCostAdjusterBase and ExploitCostAdjuster).`);
        }

        const metaState = context.metadata[stateMetadata] as Record<string | symbol, any>;
        if (metaState) {
            // Move metadata from the stateMedata symbol to the name of the class, so that we can look it up later by class name.
            context.metadata[targetClass.name] = metaState;
            // Delete field to clear for the next derived class, if any.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete context.metadata[stateMetadata];
        }

        // Add name to list as a safety check.
        stateClassesStr[targetClass.name] = parentClass.name;
        // Check to see if parent is missing @registerState. This will happen in order of lowest class to highest class, so we can rely on it checking if it's parent class was registered.
        if (parentClass.name && parentClass !== Object && stateClassesStr[parentClass.name] == null) {
            throw new Error(`class "${parentClass.name}" is missing @registerStateBase`);
        }

        Object.defineProperty(targetClass, registerStateClassMarker, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        if (!options.autoInitialize) {
            // P3-PA4: record the class actually returned by this decorator (targetClass here, since there
            // is no wrapper) - the class whose own [Symbol.metadata] the runtime ultimately populates from
            // context.metadata. `targetClass[Symbol.metadata]` itself is not yet reliable at this point in
            // a wrapped (autoInitialize=true) branch below, which is why this line is duplicated per
            // return rather than hoisted above the autoInitialize check.
            //
            // PA4-IR2-1 (fix-pass, round 2): this branch IS now guarded against a same-name collision with
            // a different field shape - it is not simply excluded from the threat. `registerStateBase()`
            // covers two structurally different situations and both need to keep working:
            //   - A class declared once, at module top level (`ZoneAbstract`, `Card`, `BaseCard`,
            //     `CardAbility`, `StateWatcher`, and ~25 others). These ARE real, name-compared,
            //     non-excluded forward-pass targets for `checkStateSerializerCoverage()` (`ZoneAbstract` is
            //     the retained falsifier proving this: removing it from the generator's emission makes the
            //     coverage check throw for it by name - see `impl-escape-proof-class-p3-pa4` in
            //     verification.jsonl). A same-name collision here is never legitimate and must throw, the
            //     same as the concrete branch below.
            //   - A class declared *inside* a factory function invoked more than once (`AsLeader` in
            //     `WithLeaderProperties()`, called from `LeaderProperties.ts`, `DoubleSidedLeaderCard.ts`,
            //     and `LeaderUnitCard.ts`). Each call re-executes the same class body, producing a
            //     structurally identical but distinct class object under the same name every time - a
            //     legitimate, expected re-registration that must NOT throw.
            // `ownStateMetadataEquals()` (above) tells these apart by comparing each class's *own* (not
            // flattened/inherited) field metadata: identical own fields/kinds means "same source re-run",
            // a genuine mismatch means "a different class reused this name" - e.g. a test fixture
            // shadowing a real production class, which is exactly the silent-corruption failure this
            // registry exists to prevent. A flattened comparison would not work here: `AsLeader`'s
            // flattened model legitimately differs per call site because the base classes it extends
            // differ, so it would false-positive on the exact case that must be allowed.
            if (registeredStateClassesByName.has(targetClass.name)) {
                const existingClass = registeredStateClassesByName.get(targetClass.name);
                const existingOwnMetadata = getOwnStateMetadata(existingClass, targetClass.name);
                if (!ownStateMetadataEquals(existingOwnMetadata, metaState)) {
                    throw new Error(`class "${targetClass.name}" is already registered via @registerState/@registerStateBase with a different field shape. registeredStateClassesByName is keyed by bare class name and is compared by name in checkStateSerializerCoverage(); a name collision with different fields (e.g. a test fixture shadowing a real production class) would silently corrupt that class's field-model lookup. If this is a legitimate factory-declared fragment re-registered from multiple call sites (like AsLeader in WithLeaderProperties()), its own declared fields must match exactly at every call site.`);
                }
                // Own metadata matches: this is the same factory-declared fragment class body re-executed
                // at another call site. `getRuntimeStateFieldModelByClassName()`'s prototype-chain walk
                // only needs *some* structurally-equivalent representative class object per name, not this
                // specific one, so keeping the earlier-registered object (rather than overwriting) is
                // equally correct; overwriting is kept here only to match this branch's prior behavior.
            }
            registeredStateClassesByName.set(targetClass.name, targetClass);
            return targetClass;
        }

        // Add the auto-initialize marker as a safety check to prevent multiple registrations and to allow for special handling of automatically initialized classes (like implemented Cards).
        Object.defineProperty(targetClass, registerStateAutoInitializeMarker, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        // Wrap the decorated class so framework initialization is guaranteed after the full constructor chain finishes.
        const wrappedClass: any = class extends targetClass {
            public constructor(...args: any[]) {
                super(...args);

                this.initialize();
            }
        };
        // Preserve the original class name for diagnostics and metadata lookups (e.g. getRuntimeStateFieldModelByClassName).
        Object.defineProperty(wrappedClass, 'name', { value: targetClass.name });

        // Mark the wrapper too; runtime enforcement checks the constructed class, not just the original targetClass.
        Object.defineProperty(wrappedClass, registerStateClassMarker, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        Object.defineProperty(wrappedClass, registerStateAutoInitializeMarker, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        // getRuntimeStateFieldModelByClassName walks Symbol.metadata on constructors in the prototype chain.
        // Re-expose the original metadata on the wrapper so the field-model lookup is unchanged.
        Object.defineProperty(wrappedClass, Symbol.metadata, {
            value: targetClass[Symbol.metadata],
            writable: false,
            enumerable: false,
            configurable: true
        });

        // P3-PA4: record the class actually returned by this decorator - here, wrappedClass, not
        // targetClass. `[Symbol.metadata]` on a class-decorator-replaced binding is populated by the
        // runtime's own decorator machinery onto whatever value the decorator returns, *after* this
        // function returns; `targetClass[Symbol.metadata]` at this point in the call is a stale, pre-
        // decoration snapshot (confirmed empirically: it retains the parent class's own metadata key, not
        // this class's), so the registry must hold the same object real instances resolve through
        // (`wrappedClass`), not the pre-wrap class.
        //
        // PA4-IR-1 (fix-pass): guarded against overwriting an existing entry, unlike the unwrapped
        // (`registerStateBase()`/fragment) branch above. Every concrete `@registerState()` class in this
        // codebase is declared once at module top level (verified: every real `@registerState()` call site
        // under `server/**` is immediately followed by a top-level class declaration, never one nested
        // inside a function body that could be invoked more than once), so a name collision here can only
        // mean a test fixture (or a future card/zone/etc. class) was accidentally given the same name as an
        // already-registered concrete class - silently overwriting that class's field-model lookup, which
        // is exactly the failure this registry exists to prevent. Throwing here is safe today (the full
        // gating suite runs clean with this guard in place) and does not touch the fragment path above,
        // where the same guard is unsafe (see that branch's comment).
        if (registeredStateClassesByName.has(targetClass.name)) {
            throw new Error(`class "${targetClass.name}" is already registered via @registerState/@registerStateBase. Concrete (auto-initializing) class names captured in registeredStateClassesByName must be unique across the whole process, including test fixtures, since lookups are keyed by bare class name.`);
        }
        registeredStateClassesByName.set(targetClass.name, wrappedClass);

        return wrappedClass;
    };
}

/**
 * Decorator to capture the names of any accessors flagged as &#64;statePrimitive, &#64;stateRef, or &#64;stateRefArray, and then clear the array for the next derived class to use.
 *
 * This is meant for base classes that need to be extended by &#64;registerState classes, but should not be directly instantiated themselves, and thus don't need the constructor wrapper that guarantees initialize() is called.
 */
export function registerStateBase<T extends GameObjectBase>(copyModeOrOptions?: CopyMode | Omit<RegisterStateOptions, 'autoInitialize'>) {
    const copyMode = typeof copyModeOrOptions === 'number' ? copyModeOrOptions : copyModeOrOptions?.copyMode;
    return registerState<T>({ copyMode, autoInitialize: false });
}

/**
 * Mirrors the wrapper pattern used in registerState() in GameObjectUtils.ts.
 * Used with the dynamically imported Cards to automatically wrap them with a constructor that calls initialize, and to mark them with the appropriate metadata for state copying.
 */
export function buildAutoInitializingCardClass(targetCardClass: any): any {
    const parentClass = Object.getPrototypeOf(targetCardClass);

    if (parentClass?.[registerStateAutoInitializeMarker] === true) {
        throw new Error(`class "${targetCardClass.name}" is a Card Implementation which is automatically registered, and does not need @registerState.`);
    }
    const wrappedClass: any = class extends targetCardClass {
        public constructor(...args: any[]) {
            super(...args);

            this.initialize();
        }
    };
    // Preserve the original class name for diagnostics and metadata lookups (e.g. getRuntimeStateFieldModelByClassName).
    Object.defineProperty(wrappedClass, 'name', { value: targetCardClass.name });

    Object.defineProperty(wrappedClass, registerStateClassMarker, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return wrappedClass;
}

export function statePrimitive<T extends GameObjectBase, TValue extends string | number | boolean>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);
        // P3-PA4: additive kind write disambiguating this field from a @stateValue field at the metadata level.
        (metaState[stateSimpleKindMetadata] ??= {})[context.name as string] = 'primitive' satisfies FieldKind;
        // P3-PB2: the native backing field is the sole storage; the decorator only records metadata.
        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: TValue) {
                target.set.call(this, newValue);
            },
            init(this: T, value: TValue) {
                return value;
            }
        };
    };
}

// Forces the incoming value to be either a boolean literal, or a constant boolean. This is meant to be used with const generic arguments.
type ConstantBoolean<T extends boolean> = boolean extends T ? never : T;

/**
 * @param readonly If false, returns a custom but more expensive mutatable array, best used for arrays that change frequently. If true, returns the array as-is and requires it be marked as readonly.
 */
export function stateRefArray<T extends GameObjectBase, TValue extends GameObjectBase, const TReadonly extends boolean>(readonly: ConstantBoolean<TReadonly> = (true as ConstantBoolean<TReadonly>)) {
    return function (
        target: ClassAccessorDecoratorTarget<T, typeof readonly extends true ? readonly TValue[] : IStateArray<TValue>>,
        context: ClassAccessorDecoratorContext<T, typeof readonly extends true ? readonly TValue[] : IStateArray<TValue>>
    ): ClassAccessorDecoratorResult<T, typeof readonly extends true ? readonly TValue[] : IStateArray<TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateArrayMetadata] ??= [];
        (metaState[stateArrayMetadata] as string[]).push(context.name);
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage. markStateRefArray replaces the id mirror's
        // incidental getObjectId() latching (see markStateRef's comment).
        if (readonly) {
            return {
                get(this: T) {
                    return target.get.call(this);
                },
                set(this: T, newValue: TValue[]) {
                    markStateRefArray(newValue);
                    target.set.call(this, newValue);
                },
                init(this: T, value: TValue[]) {
                    markStateRefArray(value);
                    return value;
                }
            };
        }

        return {
            get(this: T) {
                try {
                    return target.get.call(this);
                } catch (error) {
                    // @ts-ignore
                    console.error('This: ' + this.constructor.name, this.title ?? this.name ?? this.id);
                    throw error;
                }
            },
            set(this: T, newValue: TValue[]) {
                markStateRefArray(newValue);
                target.set.call(this, newValue ? CreateUndoArrayInternal(this, name, newValue) : newValue);
            },
            // P3-PB2: `init` now *copies* `value` into the wrapper rather than building an empty UndoArray
            // and writing the ids to the bag separately - with the bag gone the live field is the only
            // storage, so an empty wrapper would silently discard the initializer. All three mutable
            // @stateRefArray(false) users initialize with `= []` (GameObject.ts:30, DeckZone.ts:22,25), so
            // no live behavior differs today.
            init(this: T, value: TValue[]) {
                markStateRefArray(value);
                return value ? CreateUndoArrayInternal(this, name, value) : value;
            }
        };
    };
}

/** Creates a undo safe Map object that can be mutated in-place. */
export function stateRefMap<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Map<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, Map<string, TValue>>
    ): ClassAccessorDecoratorResult<T, Map<string, TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateMapMetadata] ??= [];
        (metaState[stateMapMetadata] as string[]).push(context.name);
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                // The caller marks the incoming entries here; CreateUndoMapInternal then populates via
                // Map.prototype.set, bypassing the override (see its doc comment). Keep the two paired.
                markStateRefMap(newValue);
                target.set.call(this, newValue ? CreateUndoMapInternal(this, name, newValue.entries()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoMap cannot be init with entries');
                // If this is not-null, create an equivalent wrapper. Otherwise, leave it as-is.
                return value ? CreateUndoMapInternal<TValue>(this, name) : value;
            },
        };
    };
}

/** Creates an undo safe Set object that can be mutated in-place. */
export function stateRefSet<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Set<TValue>>,
        context: ClassAccessorDecoratorContext<T, Set<TValue>>
    ): ClassAccessorDecoratorResult<T, Set<TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSetMetadata] ??= [];
        (metaState[stateSetMetadata] as string[]).push(context.name);
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                // Marked here for the same reason as stateRefMap's set: CreateUndoSetInternal populates via
                // Set.prototype.add and bypasses the override.
                markStateRefSet(newValue);
                target.set.call(this, newValue ? CreateUndoSetInternal(this, name, newValue.values()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoSet cannot be init with entries');
                // If this is not-null, create an equivalent wrapper. Otherwise, leave it as-is.
                return value ? CreateUndoSetInternal<TValue>(this, name) : value;
            },
        };
    };
}

/** A simpler alternative to Map. Unless there is a specific reason, prefer stateRefMap over this. */
export function stateRefRecord<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Record<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, Record<string, TValue>>
    ): ClassAccessorDecoratorResult<T, Record<string, TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateRecordMetadata] ??= [];
        (metaState[stateRecordMetadata] as string[]).push(context.name);
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this) {
                return target.get.call(this);
            },
            // The `newValue == null` guard closes the P3-PA1 landmine: the old body called
            // `UndoSafeRecord(this, newValue, name)` unconditionally, so assigning null reached
            // `new Proxy(null, ...)` and threw. `init` already guarded; `set` did not.
            set(this: GameObjectBase, newValue) {
                markStateRefRecord(newValue);
                target.set.call(this, newValue == null ? newValue : UndoSafeRecord(this, newValue, name));
            },
            init(this: GameObjectBase, value) {
                markStateRefRecord(value);
                return value ? UndoSafeRecord(this, value, name) : value;
            },
        };
    };
}

/** Creates a undo safe GameObject reference. */
export function stateRef<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateObjectMetadata] ??= [];
        (metaState[stateObjectMetadata] as string[]).push(context.name);

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                markStateRef(newValue);
                target.set.call(this, newValue);
            },
            init(value) {
                markStateRef(value);
                return value;
            }
        };
    };
}

/**
 * P3-PB1: excludes `Map`/`Set`/array-typed `TValue` from bare {@link stateValue}, since those now have
 * dedicated decorators ({@link stateMap}/{@link stateSet}/{@link stateArray}) that give in-place mutation an
 * interception point. Applied only to bare `stateValue()`'s constrained overload - the
 * `{ allowGenericValue: true }` overload deliberately skips this (see that overload's doc for why: TypeScript
 * cannot prove an *unresolved* generic type parameter satisfies this conditional, a distinct limitation from
 * ordinary union distribution - verified via a real `tsc` probe, plan_v2.md §1.4 point 4).
 */
type ForbidStateCollection<TValue> =
    TValue extends Map<any, any> ? never :
        TValue extends Set<any> ? never :
            TValue extends readonly any[] ? never :
                TValue;

/**
 * For any {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm structuredClone}-compatible
 * value that is **not** a primitive and **not** a {@link GameObjectBase}.
 * The value is stored directly in state without any conversion.
 *
 * Use this for complex state values (objects, arrays of plain data, etc.) that don't need
 * GameObjectBase ref resolution but do need to participate in the undo system.
 *
 * Prefer more specific decorators when applicable:
 * - {@link statePrimitive} for primitives (string, number, boolean)
 * - {@link stateRef} for single GameObjectBase references
 * - {@link stateRefArray} for arrays of GameObjectBase references
 * - {@link stateRefMap} for Map<string, GameObjectBase>
 * - {@link stateRefSet} for Set<GameObjectBase>
 * - {@link stateMap}/{@link stateSet}/{@link stateArray} for a `Map`/`Set`/`Array` of non-`GameObjectBase`
 *   values, including in-place mutation (`.set()`/`.add()`/`.push()`/etc.) - a bare, no-argument
 *   `@stateValue()` no longer accepts a concretely `Map`/`Set`/array-typed accessor (compile error).
 *
 * `@stateValue({ allowGenericValue: true })` is an explicit, disclosed escape hatch for a field whose
 * *declared* type is an unresolved class type parameter (e.g. `MutableOngoingEffectValueWrapper<TValue>._value:
 * TValue`) that cannot be proven non-collection at the declaration site. **This is a full bypass of the
 * compile-time collection check, not one narrowed to "only when TValue turns out non-collection"** -
 * TypeScript cannot express that distinction for an unresolved generic (verified, plan_v2.md §1.4 point 6), so
 * a concretely `Map`/`Set`/array-typed field could misuse this option to dodge `stateMap`/`stateSet`/
 * `stateArray` and the compiler would not catch it. Introducing a *new* use site is guarded by the
 * `forceteki/require-allow-generic-value-justification` lint rule (`eslint-rules/`) rather than left to review
 * alone: a use site must carry an adjacent `// allowGenericValue-justified:` comment explaining why the field's
 * type cannot be a concrete `Map`/`Set`/`Array` at its declaration site (P3-PB1 AC9). The rule resolves the
 * decorator call back to the real `stateValue` export before checking it, closing: a bare local identifier
 * bound by a named import; that import aliased; `Namespace.stateValue(...)` member access on a namespace
 * import; `const { stateValue } = Namespace` destructured off a namespace import (aliased or not); a
 * `const`/`let`-bound decorator reference chaining to any of the above; and all of the above through a
 * relative import path carrying a trailing `.js`/`.mjs`/`.cjs`/`.ts` extension. Three gaps are known and
 * accepted rather than closed, each requiring materially more infrastructure (typed linting / cross-file or
 * call-graph analysis) than this AST-only, single-file rule affords: (1) the rule cannot verify a
 * justification comment is *honest* against the field's actual declared type, (2) an arbitrary wrapper
 * function that itself calls and returns `stateValue({ allowGenericValue: true })` is not traced into and so
 * is not flagged, and (3) a re-export barrel (`export { stateValue } from './GameObjectUtils'` consumed via
 * `import { stateValue } from './proxy'`) is not traced through either, since the rule only inspects the
 * importing file's own import declaration. Human review remains the defense for all three. Do not describe
 * this coverage as "general" or as making indirection "unable to bypass it silently" - name the shapes. See
 * the rule's header comment for the full reasoning.
 *
 * @example
 * ⁣@stateValue() accessor decklist: IDeckListForLoading;
 */
export function stateValue<T extends GameObjectBase>(options: { allowGenericValue: true }): <TValue>(
    target: ClassAccessorDecoratorTarget<T, TValue>,
    context: ClassAccessorDecoratorContext<T, TValue>
) => ClassAccessorDecoratorResult<T, TValue>;
export function stateValue<T extends GameObjectBase, TValue>(): (
    target: ClassAccessorDecoratorTarget<T, ForbidStateCollection<TValue>>,
    context: ClassAccessorDecoratorContext<T, ForbidStateCollection<TValue>>
) => ClassAccessorDecoratorResult<T, ForbidStateCollection<TValue>>;
export function stateValue<T extends GameObjectBase, TValue>(_options?: { allowGenericValue?: boolean }) {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        // Get or create the state related metadata object.
        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);
        // P3-PA4: additive kind write disambiguating this field from a @statePrimitive field at the metadata level.
        (metaState[stateSimpleKindMetadata] ??= {})[context.name as string] = 'value' satisfies FieldKind;
        const name = context.name;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: TValue) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, newValue);
                }
                target.set.call(this, newValue);
            },
            init(this: T, value: TValue) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, value);
                }
                return value;
            }
        };
    };
}

/**
 * `Map<string, TValue>` of non-`GameObjectBase` values, with in-place mutation (`.set()`/`.delete()`/
 * `.clear()`) given a single, addressable call site via {@link ValueMap} - see that class's doc comment for
 * why no dual-write mirror is needed here, unlike {@link stateRefMap}'s `UndoMap`. Registers into the same
 * `stateSimpleMetadata`/`stateSimpleKindMetadata` buckets {@link stateValue} already uses (kind stays
 * `'value'`), so this is unobservable to the codegen serializer (P3-PB1 §1.2) and to rollback (§1.1) - only
 * the runtime accessor wraps the stored collection.
 */
export function stateMap<T extends GameObjectBase, TValue>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Map<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, Map<string, TValue>>
    ): ClassAccessorDecoratorResult<T, Map<string, TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);
        (metaState[stateSimpleKindMetadata] ??= {})[context.name as string] = 'value' satisfies FieldKind;
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: Map<string, TValue>) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, newValue);
                }
                target.set.call(this, newValue == null ? newValue : new ValueMap<TValue>(this, name, newValue.entries()));
            },
            init(this: T, value: Map<string, TValue>) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, value);
                }
                return value == null ? value : new ValueMap<TValue>(this, name, value.entries());
            }
        };
    };
}

/**
 * `Set<TValue>` of non-`GameObjectBase` values - mirrors {@link stateMap} exactly, against {@link ValueSet}.
 */
export function stateSet<T extends GameObjectBase, TValue>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Set<TValue>>,
        context: ClassAccessorDecoratorContext<T, Set<TValue>>
    ): ClassAccessorDecoratorResult<T, Set<TValue>> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);
        (metaState[stateSimpleKindMetadata] ??= {})[context.name as string] = 'value' satisfies FieldKind;
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: Set<TValue>) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, newValue);
                }
                target.set.call(this, newValue == null ? newValue : new ValueSet<TValue>(this, name, newValue.values()));
            },
            init(this: T, value: Set<TValue>) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, value);
                }
                return value == null ? value : new ValueSet<TValue>(this, name, value.values());
            }
        };
    };
}

/**
 * `TValue[]` of non-`GameObjectBase` values - mirrors {@link stateMap} against {@link ValueArray}. Uses
 * {@link CreateValueArrayInternal} (`ValueArray.from(arr).init(go, prop)`) rather than
 * `new ValueArray().init(...)` + index-assign, which produces a V8-serialized sparse array (measured
 * +7-9% larger; plan_v2.md §1.5/PB1-B2) - `.from()` is dense and byte-identical to a plain array.
 */
export function stateArray<T extends GameObjectBase, TValue>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue[]>,
        context: ClassAccessorDecoratorContext<T, TValue[]>
    ): ClassAccessorDecoratorResult<T, TValue[]> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);
        (metaState[stateSimpleKindMetadata] ??= {})[context.name as string] = 'value' satisfies FieldKind;
        const name = context.name as string;

        // P3-PB2: the native backing field is the sole storage.
        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: TValue[]) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, newValue);
                }
                target.set.call(this, newValue == null ? newValue : CreateValueArrayInternal(this, name, newValue));
            },
            init(this: T, value: TValue[]) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, value);
                }
                return value == null ? value : CreateValueArrayInternal(this, name, value);
            }
        };
    };
}

/**
 * Structural check for "is this a {@link GameObjectBase} instance", used in place of `instanceof
 * GameObjectBase` here. `GameObjectBase` is imported as a type only in this file: `GameObjectBase.ts`
 * imports values back from this module (the `@registerStateBase`/`@statePrimitive` decorators run at
 * class-definition time), so a value import here would create a runtime require cycle that throws
 * "Cannot access 'stateMetadata' before initialization" whenever something requires this module before
 * `GameObjectBase`. `getObjectId` is the identifying method every `GameObjectBase` exposes (see
 * `GameObjectBase.ts`). More generally: no value import in this module - not just `GameObjectBase`
 * itself - may transitively reach `GameObjectBase` or any other `@registerState`/`@registerStateBase`
 * class, since requiring any of them re-triggers the same class-definition-time decorator cycle; this
 * is a property of the whole file, not of one symbol, and nothing in lint or CI enforces it.
 */
function isGameObjectBaseInstance(value: object): value is GameObjectBase {
    return typeof (value as { getObjectId?: unknown }).getObjectId === 'function';
}

/**
 * The encoder's rejected own-key set, assembled from its own two exported sources rather than re-listed
 * here, so this write-site gate cannot drift away from the sink that has to serialize what it admits.
 */
const RESERVED_STATE_VALUE_KEYS = new Set<string>([...STATE_ENCODING_TAGS, ...UNENCODABLE_OBJECT_KEYS]);

/**
 * Describes why a value is not JSON-safe, for use in the {@link assertJsonSafeStateValue} error message.
 */
function describeInvalidJsonStateValue(value: unknown): string {
    if (typeof value === 'function') {
        return 'a function';
    }
    if (typeof value === 'symbol') {
        return 'a symbol';
    }
    if (typeof value === 'bigint') {
        return 'a bigint';
    }
    if (typeof value === 'number') {
        return `a non-finite number (${String(value)})`;
    }

    // Note: a GameObjectBase instance never reaches this function - assertJsonSafeStateValue detects it
    // structurally (see isGameObjectBaseInstance) and throws its own dedicated message first.

    const prototypeName = (Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null)?.constructor?.name;
    return `an instance of ${prototypeName ?? 'an unknown, non-plain type'}`;
}

/**
 * Dev-mode-only recursive check that a value assigned to a {@link stateValue} accessor is either
 * JSON-representable, or one of the known encodable types this repo's state system already models in
 * decorated state (`Map`, `Set`; a {@link GameObjectId} is just a branded `string` at runtime and needs no
 * special case). `Map` keys are restricted to `string`, matching the {@link stateValue} doc's
 * `Map<string, ...>` convention and every field actually declared this way - a non-string `Map` key is not
 * JSON-representable as an object key in the first place, which keeps Plan 3's encoder contract
 * well-defined.
 *
 * This does not change runtime behavior outside of `Helpers.isDevelopment()`; it exists to catch new
 * `@stateValue` state that would violate the JSON-safety invariant Plan 6 (see
 * `docs/plans/02-semantic-save-load.md`) depends on, before it can accumulate. `GameObjectId`s (branded
 * strings) are legal here - invariant 2 only bans them from save *files*, which is a separate, later
 * enforcement point (work item A2).
 *
 * Known coverage gaps, intentionally not closed here:
 * - This check only runs from the accessor's `set`/`init`, so **in-place** mutation of an already-stored
 *   `Map`/`Set`/`Array` never re-enters it - the accessor sees one `set`/`init` call with an empty
 *   collection and nothing thereafter, for as long as the collection is only ever mutated in place during
 *   normal play. **P3-PB1 gives every retargeted `@stateMap`/`@stateSet`/`@stateArray` field (`AbilityLimit`'s
 *   `useCount`, `GainAbility.ts`, `GainNonKeywordAbilitiesFromUnitEffect.ts`, `AdditionalPhaseEffect.ts`,
 *   `StateWatcher.entries`) an in-place-mutation call site (`ValueMap`/`ValueSet`/`ValueArray`'s overridden
 *   mutators) - but does not add re-validation to it; the wrapper's mutators are still pure pass-throughs.**
 *   For a field still declared with bare `@stateValue()` (not `@stateMap`/`@stateSet`/`@stateArray` - as of
 *   P3-PB1 only a plain-object/primitive-typed or `{ allowGenericValue: true }` field can be), this remains a
 *   real coverage gap, not a marginal one. Plan 3's encoder is the intended enforcement point for this
 *   population path; do not close either gap here by adding re-validation to the wrapper mutators, which is
 *   separate follow-up work, not this unit's scope. Note that rollback is not subject to either gap:
 *   the generated deserializer assigns every `value`-kind field through its public accessor
 *   (`i.field = decodeStateValue(...)`), re-entering the `set` accessor with whatever the field held at
 *   snapshot time - a populated collection included - so this check does re-validate in-place-mutated
 *   maps/sets/arrays on every rollback.
 *
 * Also note: this walks plain-object properties with `Object.keys`, which sees only *own enumerable
 * string-keyed* properties (a symbol-keyed or non-enumerable property is invisible to it), and which
 * invokes any getters on the object as part of walking it.
 *
 * `ancestors` tracks only the current recursion path (to reject a true cycle). P3-PB2 fix
 * (`PB2I1-CS-01`): this is now the encoder's domain restated at the write site, not a second opinion about
 * it. `isSnapshotSafeOngoingEffectValue` is the one remaining relative of this check and it delegates to
 * `encodeStateValue` outright, so the only surviving difference between the three is that this assert still
 * tolerates an `undefined` array element / Map value / Set member, which `encodeStateValue` refuses (see its
 * own comment for why). Do not add a fourth near-copy of these rules.
 */
export function assertJsonSafeStateValue(propertyName: string, value: unknown, ancestors: Set<object> = new Set<object>()): void {
    if (value === null || value === undefined) {
        return;
    }

    const valueType = typeof value;
    if (valueType === 'string' || valueType === 'boolean') {
        return;
    }

    if (valueType === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error(`State value "${propertyName}" is not JSON-safe: contains ${describeInvalidJsonStateValue(value)}. Use a finite number, or encode the special value explicitly (e.g. as a string) before storing it in state.`);
        }
        return;
    }

    if (valueType !== 'object') {
        // functions, symbols, bigints.
        throw new Error(`State value "${propertyName}" is not JSON-safe: contains ${describeInvalidJsonStateValue(value)}. Only JSON-representable values, plus Map/Set/GameObjectId, are allowed in @stateValue fields.`);
    }

    if (isGameObjectBaseInstance(value as object)) {
        const constructorName = (value as { constructor?: { name?: string } }).constructor?.name ?? 'unknown';
        throw new Error(`State value "${propertyName}" is not JSON-safe: contains a GameObjectBase instance (${constructorName}). Use GameObjectId instead and call go.getObjectId() to capture the reference in state.`);
    }

    if (ancestors.has(value as object)) {
        throw new Error(`State value "${propertyName}" is not JSON-safe: contains a circular reference.`);
    }

    if (Array.isArray(value)) {
        ancestors.add(value as object);
        for (let i = 0; i < value.length; i++) {
            assertJsonSafeStateValue(`${propertyName}[${i}]`, value[i], ancestors);
        }
        ancestors.delete(value as object);
        return;
    }

    if (value instanceof Map) {
        ancestors.add(value as object);
        for (const [key, entryValue] of value) {
            if (typeof key !== 'string') {
                throw new Error(`State value "${propertyName}" is not JSON-safe: contains a Map with a non-string key (typeof "${typeof key}"). Map keys must be strings to be JSON-representable as object keys.`);
            }
            assertJsonSafeStateValue(`${propertyName} (Map value for key "${key}")`, entryValue, ancestors);
        }
        ancestors.delete(value as object);
        return;
    }

    if (value instanceof Set) {
        ancestors.add(value as object);
        for (const entryValue of value) {
            assertJsonSafeStateValue(`${propertyName} (Set member)`, entryValue, ancestors);
        }
        ancestors.delete(value as object);
        return;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        // A class instance with a foreign prototype (Date, KeywordInstance, AbilityLimit, etc.) that isn't
        // one of the known encodable types handled above.
        throw new Error(`State value "${propertyName}" is not JSON-safe: contains ${describeInvalidJsonStateValue(value)}. Only plain objects, arrays, Map, Set, and JSON-representable primitives (or GameObjectId) are allowed in @stateValue fields.`);
    }

    // P3-PB2 fix (PB2I1-CS-01): both key rules are the encoder's, restated at the write site so a bad
    // payload is caught where it is produced rather than at the next snapshot capture. A reserved tag would
    // be indistinguishable from a tagged value on decode; `__proto__` cannot be stored as an own property by
    // the object-literal assignment both codec legs use. See `encodeStateValue` for both. The predicate
    // matches too, not just the key set: both sides test the enumerable own keys (`PB2I2-N2`), so this gate
    // cannot admit a key the encoder refuses.
    const ownKeys = Object.keys(value as Record<string, unknown>);
    for (const key of ownKeys) {
        if (RESERVED_STATE_VALUE_KEYS.has(key)) {
            throw new Error(`State value "${propertyName}" is not JSON-safe: plain object carries the reserved own key "${key}", which the state encoder cannot represent. Rename the property.`);
        }
    }

    ancestors.add(value as object);
    for (const key of ownKeys) {
        assertJsonSafeStateValue(`${propertyName}.${key}`, (value as Record<string, unknown>)[key], ancestors);
    }
    ancestors.delete(value as object);
}

/**
 * Uses a proxy to give in-place mutation of a `@stateRefRecord` field a single, addressable call site.
 * P3-PB2: the dual-write into the state bag is gone; the trap's remaining job is to latch `_hasRef` on a
 * newly stored referent, exactly as `UndoMap.set`/`UndoSet.add` do.
 *
 * `go`/`name` are retained unused for the same reason `ValueMap` retains `#go`/`#prop`: they are Plan 4's
 * (`docs/plans/04-delta-snapshots.md`) `recordFieldChange` hook point, and re-threading them later would
 * touch every call site again.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
function UndoSafeRecord<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, record: Record<string, TValue>, name: string) {
    const proxiedRecord = new Proxy(record, {
        set(target, prop, newValue, receiver) {
            markStateRef(newValue);
            return Reflect.set(target, prop, newValue, receiver);
        },
        deleteProperty(target, prop: string) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            return true;
        },
    });

    return proxiedRecord;
}

/** A proxy wrapper for UndoArray to prevent directly setting elements via the indexes of an array. */
function CreateUndoArrayInternal<TValue extends GameObjectBase>(go: GameObjectBase, prop: string, arr?: TValue[]) {
    const undoArr = CreateUndoArrayBase<TValue>(go, prop);
    if (arr) {
        undoArr.length = arr.length;
        for (let i = 0; i < arr.length; i++) {
            undoArr[i] = arr[i];
        }
    }

    return undoArr as IStateArray<TValue>;
}

function CreateUndoArrayBase<TValue extends GameObjectBase>(go: GameObjectBase, prop: string) {
    return new UndoArray<TValue>().init(go, prop);
}

/**
 * The only supported way to build an {@link UndoMap}: construct empty, `init()`, then populate - so no
 * mutator ever runs inside the pre-initialization window described on that class.
 *
 * Population goes through `Map.prototype.set` rather than the override, because every caller has already
 * marked the incoming entries before calling here (`markStateRefMap()` on the accessor's set path). **That
 * pairing is load-bearing after P3-PB2:** the override is now the only thing that latches `_hasRef` on a
 * stored referent, so a future caller that populates through here without marking first would leave those
 * referents unlatched and cullable. Anything added after construction goes through the override as usual.
 */
function CreateUndoMapInternal<TValue extends GameObjectBase>(go: GameObjectBase, prop: string, entries?: Iterable<readonly [string, TValue]> | null) {
    const undoMap = new UndoMap<TValue>().init(go, prop);
    if (entries) {
        for (const [key, value] of entries) {
            Map.prototype.set.call(undoMap, key, value);
        }
    }

    return undoMap;
}

/** {@link UndoSet} counterpart to {@link CreateUndoMapInternal}; same construct-init-populate ordering and same marking contract. */
function CreateUndoSetInternal<TValue extends GameObjectBase>(go: GameObjectBase, prop: string, values?: Iterable<TValue> | null) {
    const undoSet = new UndoSet<TValue>().init(go, prop);
    if (values) {
        for (const value of values) {
            Set.prototype.add.call(undoSet, value);
        }
    }

    return undoSet;
}

export interface IRuntimeStateFieldModelEntry {
    name: string;
    kind: FieldKind;
}

/**
 * P3-PA4: reads the flattened field name+kind model for a registered class by walking the prototype chain
 * and accumulating whatever metadata bucket each level itself claims. (This walk originated in the deleted
 * the metadata-driven state copier P3-PB2 replaced with the generated deserializers; it survives here because the
 * coverage cross-check still needs a runtime view of the declared fields.) Returns undefined if className was never
 * passed through registerState()/registerStateBase() (distinguishable from "found, zero fields" via Map
 * semantics). Used by StateSerializerCoverageCheck.ts to compare against the generated model.
 */
export function getRuntimeStateFieldModelByClassName(className: string): IRuntimeStateFieldModelEntry[] | undefined {
    const targetClass = registeredStateClassesByName.get(className);
    if (!targetClass) {
        return undefined;
    }

    const fields = new Map<string, FieldKind>();
    let baseClass = (targetClass as unknown as { prototype: object }).prototype;
    while (baseClass) {
        const constructor = (baseClass as { constructor: any }).constructor;
        const metadata = constructor[Symbol.metadata];
        const metaState = metadata?.[constructor.name] as Record<symbol, any>;

        if (metaState) {
            if (metaState[stateSimpleMetadata]) {
                const kinds = metaState[stateSimpleKindMetadata] as Record<string, FieldKind> | undefined;
                for (const field of metaState[stateSimpleMetadata] as string[]) {
                    fields.set(field, kinds?.[field] ?? 'primitive');
                }
            }
            if (metaState[stateArrayMetadata]) {
                for (const field of metaState[stateArrayMetadata] as string[]) {
                    fields.set(field, 'refArray');
                }
            }
            if (metaState[stateMapMetadata]) {
                for (const field of metaState[stateMapMetadata] as string[]) {
                    fields.set(field, 'refMap');
                }
            }
            if (metaState[stateSetMetadata]) {
                for (const field of metaState[stateSetMetadata] as string[]) {
                    fields.set(field, 'refSet');
                }
            }
            if (metaState[stateRecordMetadata]) {
                for (const field of metaState[stateRecordMetadata] as string[]) {
                    fields.set(field, 'refRecord');
                }
            }
            if (metaState[stateObjectMetadata]) {
                for (const field of metaState[stateObjectMetadata] as string[]) {
                    fields.set(field, 'ref');
                }
            }
        }

        const newBaseClass = Object.getPrototypeOf(baseClass);
        if (!newBaseClass || !newBaseClass.constructor.name || newBaseClass === Object.prototype) {
            break;
        }
        baseClass = newBaseClass;
    }

    return [...fields.entries()].map(([name, kind]) => ({ name, kind }));
}

/**
 * A custom class to pass through any values to the underlying state Map.
 *
 * Construction deliberately takes **no** `entries` argument, and there is deliberately no init-guard in
 * `set()`. `Map`'s own constructor calls this class's overridden `set()` once per entry of any iterable
 * passed to `super(...)`, and that happens *before* the subclass's private fields are installed on `this`
 * (per spec, private fields are installed only after `super()` returns). A private read from `set()` at
 * that point does not evaluate to `undefined`/`false` - it throws
 * `TypeError: Cannot read private member #x from an object whose class did not declare it`, so an
 * `#init`-style flag cannot guard the very window it exists for. The window is removed instead of guarded:
 * build through {@link CreateUndoMapInternal}, which constructs empty, calls `init()`, and only then
 * populates - the same recipe {@link UndoArray} already uses via {@link CreateUndoArrayBase}. See the
 * P3-PB1-fix comment on {@link ValueMap.set} for the alternatives that were weighed.
 */
class UndoMap<TValue extends GameObjectBase> extends Map<string, TValue> {
    // Properties are JS private to ensure they aren't enumerable. Otherwise this would break equality checks in tests.
    // P3-PB2 fix (PB2I1-AC-09): after the state-bag cutover these two are write-only - `init()` sets them and
    // nothing reads them. They are retained for the same reason `UndoSafeRecord`/`ValueMap` retain theirs:
    // they are Plan 4's (`docs/plans/04-delta-snapshots.md`) `recordFieldChange` hook point. A dead-code sweep,
    // or enabling `no-unused-private-class-members`, would delete them and make Plan 4 re-thread `init(go, prop)`
    // through four construction paths and every decorator call site.
    #go: GameObjectBase;
    #prop: string;

    public init(go: GameObjectBase, prop: string) {
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
        return this;
    }

    public override set(key: string, value: TValue): this {
        markStateRef(value);
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        return super.delete(key);
    }

    public override clear(): void {
        super.clear();
    }
}

/**
 * A custom class to pass through any values to the underlying state Set. `Set<TValue>` counterpart to
 * {@link UndoMap} - same no-`entries`-in-the-constructor rationale, same reason there is no init-guard in
 * `add()`. Build through {@link CreateUndoSetInternal}.
 */
class UndoSet<TValue extends GameObjectBase> extends Set<TValue> {
    // Properties are JS private to ensure they aren't enumerable. Otherwise this would break equality checks in tests.
    // P3-PB2 fix (PB2I1-AC-09): after the state-bag cutover these two are write-only - `init()` sets them and
    // nothing reads them. They are retained for the same reason `UndoSafeRecord`/`ValueMap` retain theirs:
    // they are Plan 4's (`docs/plans/04-delta-snapshots.md`) `recordFieldChange` hook point. A dead-code sweep,
    // or enabling `no-unused-private-class-members`, would delete them and make Plan 4 re-thread `init(go, prop)`
    // through four construction paths and every decorator call site.
    #go: GameObjectBase;
    #prop: string;

    public init(go: GameObjectBase, prop: string) {
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
        return this;
    }

    public override add(value: TValue): this {
        markStateRef(value);
        return super.add(value);
    }

    public override delete(value: TValue): boolean {
        return super.delete(value);
    }

    public override clear(): void {
        super.clear();
    }
}

/** An interface for stateRefArray decorator, prevents mutating elements directly to ensure the state tracking is used properly. */

export interface IStateArray<T> extends Array<T> {
    readonly [key: number]: T; // Readonly indexer
    readonly length: number;
}

class UndoArray<TValue extends GameObjectBase> extends Array<TValue> {
    // Properties are JS private to ensure they aren't enumerable. Otherwise this would break equality checks in tests.
    // P3-PB2 fix (PB2I1-AC-09): after the state-bag cutover these two are write-only - `init()` sets them and
    // nothing reads them. They are retained for the same reason `UndoSafeRecord`/`ValueMap` retain theirs:
    // they are Plan 4's (`docs/plans/04-delta-snapshots.md`) `recordFieldChange` hook point. A dead-code sweep,
    // or enabling `no-unused-private-class-members`, would delete them and make Plan 4 re-thread `init(go, prop)`
    // through four construction paths and every decorator call site.
    #go: GameObjectBase;
    #prop: string;

    public static override get [Symbol.species]() {
        return Array; // Return the native Array constructor
    }

    public init(go: GameObjectBase, prop: string) {
        this.#go = go;
        this.#prop = prop;
        return this;
    }

    public override push(...items: TValue[]): number {
        markStateRefArray(items);
        return super.push(...items);
    }

    public override unshift(...items: TValue[]): number {
        markStateRefArray(items);
        return super.unshift(...items);
    }

    public override pop(): TValue {
        return super.pop();
    }

    public override shift(): TValue {
        return super.shift();
    }

    public override reverse(): TValue[] {
        return super.reverse();
    }

    // P3-PB2: the position-indexed id mirror these two guarded is gone, but the restriction stays and the
    // reason changes. `fill(v)` would store `v` into every slot without ever routing it through
    // markStateRef, so a referent reachable only through this array would never latch `_hasRef` and would be
    // culled at the next snapshot. `sort` does not itself break the latch, but keeping both throwing
    // preserves the "mutate a ref array only through the tracked API" discipline that `IStateArray`'s
    // readonly indexer exists to enforce, and neither has a live call site. ValueArray's sort/fill remain
    // plain pass-throughs - it holds no refs, so it has nothing to latch (see its class doc comment).
    public override sort(): this {
        throw new Error('Sort is not supported in UndoArray.');
    }

    public override splice(start: number, deleteCount?: number): TValue[] {
        if (arguments.length > 2) {
            throw new Error('UndoArray.splice only supports up to two arguments.');
        }

        return super.splice(start, deleteCount);
    }

    // See sort() above for why this throws here but not in ValueArray.
    public override fill(value: TValue, start?: number, end?: number): this {
        throw new Error('Fill is not supported in UndoArray.');
    }
}

/**
 * Wraps a `Map<string, non-GameObjectBase>` field so in-place mutation (`set`/`delete`/`clear`) is a single,
 * addressable call site - mirroring `UndoMap`'s ref-collection pattern, but with **no dual-write mirror**: a
 * `@stateMap` field holds one live collection and the generated deserializer restores it by reassigning
 * the whole field through the public accessor, so in-place-mutated contents are restored correctly with or
 * without this wrapper (P3-PB1 §1.1). This wrapper's only job is to give Plan 4
 * (`docs/plans/04-delta-snapshots.md`) one call-site hook for its future
 * `this.game.deltaTracker?.recordFieldChange(...)` line; every mutator below is currently a pure pass-through.
 *
 * `#go`/`#prop` are JS-private (not merely TypeScript-private), so they are invisible to `Object.keys` and
 * to test equality checks - matching `UndoMap`'s exact shape (verified lint-clean under this repo's actual
 * flat config). P3-PB2 removed the reference-cycle note that used to sit here: `oldState` is now a plain
 * JSON-safe record produced by `encodeStateValue`, which walks this collection into a `$map` payload rather
 * than retaining the wrapper itself, so no `GameObjectBase` back-reference reaches a lifecycle hook.
 */
export class ValueMap<TValue> extends Map<string, TValue> {
    #go: GameObjectBase;
    #prop: string;

    public constructor(go: GameObjectBase, prop: string, entries?: Iterable<readonly [string, TValue]> | null) {
        super(entries);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
    }

    public override set(key: string, value: TValue): this {
        // Plan 4 hook point: this.#go.game.deltaTracker?.recordFieldChange(this.#go, this.#prop);
        //
        // P3-PB1-fix (PB1-R2): this class previously carried a `#init` field, assigned `true` at the end of
        // the constructor and never read, whose doc comment claimed it "guards against Map's own constructor
        // invoking this override before #go/#prop exist". That claim was false and would have crashed, not
        // guarded, the first time it was acted on: `Map`'s constructor invokes this overridden `set()` once
        // per entry of `entries` *during* `super(entries)`, i.e. before this class's own field initializers
        // (`#go`, `#prop`, and the removed `#init`) run - private fields are only installed on `this` after
        // `super()` returns. Reading any of those fields from inside `set()` at that point throws
        // `TypeError: Cannot read private member ... from an object whose class did not declare it`, it does
        // not read as `false`/`undefined` (reproduced: see review_implreview1.md PB1-R2). `#init` itself was
        // simply never wired up to skip that read, so it did nothing either way - it has been removed as dead
        // weight rather than left as a guard that doesn't guard.
        //
        // Plan 4 must NOT add a private-field read (`this.#go`/`this.#prop`, or a reintroduced init flag) to
        // this method's body as written, precisely because it constructs the map from a possibly-non-empty
        // `entries` iterable (a rollback restore, or any whole-field reassignment of a populated collection) -
        // not just the empty-default path this unit's own fields exercise. Options that survive the
        // pre-initialization window: (1) wrap the private-field read in try/catch and no-op on throw,
        // (2) key a module-level `WeakSet`/`WeakMap` by `this` instead of a private field (a `WeakSet` entry
        // can't be read before it's writable the way a private field can, since `has()` on an absent key just
        // returns `false`), or (3) do not populate via the constructor's `entries` parameter at all - route
        // construction through `.init(go, prop)` after an empty `super()`, the same recipe `ValueArray` uses
        // via `.from(arr).init(...)` - and have Plan 4's hook fire only from a call made after `.init()`.
        //
        // Option (3) is what `UndoMap`/`UndoSet` were moved to, since their mirror-writing guard really was
        // load-bearing and could not simply be deleted: see `CreateUndoMapInternal` and the `UndoMap` class
        // doc comment.
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        // Plan 4 hook point (see set()).
        return super.delete(key);
    }

    public override clear(): void {
        // Plan 4 hook point (see set()).
        super.clear();
    }
}

/**
 * `Set<TValue>` counterpart to {@link ValueMap} - same no-dual-write-mirror rationale, same `#go`/`#prop`
 * cycle note.
 */
export class ValueSet<TValue> extends Set<TValue> {
    #go: GameObjectBase;
    #prop: string;

    public constructor(go: GameObjectBase, prop: string, values?: Iterable<TValue> | null) {
        super(values);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
    }

    public override add(value: TValue): this {
        // Plan 4 hook point: this.#go.game.deltaTracker?.recordFieldChange(this.#go, this.#prop);
        // See ValueMap.set()'s comment (PB1-R2): the same pre-initialization-window hazard applies here -
        // `Set`'s constructor invokes this overridden `add()` once per element of `values` during
        // `super(values)`, before `#go`/`#prop` are installed. Do not add a private-field read to this method
        // without one of the three mitigations documented there.
        return super.add(value);
    }

    public override delete(value: TValue): boolean {
        // Plan 4 hook point (see add()).
        return super.delete(value);
    }

    public override clear(): void {
        // Plan 4 hook point (see add()).
        super.clear();
    }
}

/**
 * `TValue[]` counterpart to {@link ValueMap}/{@link ValueSet}, on `UndoArray`'s `[Symbol.species]` shape.
 * Unlike `UndoArray`, every mutator here is an unconditional pass-through - including `sort`/`fill`, which
 * `UndoArray` throws on (see `UndoArray.sort`'s comment for why that divergence is legitimate: `ValueArray`
 * has no position-indexed id mirror to desync).
 *
 * **Disclosed, not fixed:** `copyWithin` is overridden below for consistency, but direct index assignment
 * (`arr[3] = x`) and the `length` setter (including `arr.length = 0`) mutate elements without invoking any
 * overridden method, and JS provides no way to intercept them on a subclassed exotic `Array` without a
 * `Proxy`, which this class does not introduce (the identical, already-accepted gap `UndoArray` has for ref
 * arrays - mitigated there only by typing the *ref* case's public field `IStateArray<T>`, not applicable here
 * since these fields' declared types are plain mutable arrays that real call sites already index/reassign
 * directly). None of the fields using `stateArray` today exercises any of these three operations
 * (P3-PB1 plan_v2.md §1.3); Plan 4 must not assume they are covered.
 *
 * Construction must go through {@link CreateValueArrayInternal} (`ValueArray.from(arr).init(go, prop)`), never
 * `new ValueArray().init(...)` followed by `.length =`/index-assignment - that recipe produces a
 * holey/dictionary-mode array that V8's structured-clone serializer tags as sparse instead of dense (measured
 * +7-9% larger; plan_v2.md §1.5/PB1-B2). `.from()` is a static call, unaffected by the instance-level
 * `[Symbol.species]` override, and is dense by spec.
 */
export class ValueArray<TValue> extends Array<TValue> {
    #go: GameObjectBase;
    #prop: string;

    public static override get [Symbol.species]() {
        return Array;
    }

    public init(go: GameObjectBase, prop: string) {
        this.#go = go;
        this.#prop = prop;
        return this;
    }

    public override push(...items: TValue[]): number {
        // Plan 4 hook point (see ValueMap.set()).
        return super.push(...items);
    }

    public override unshift(...items: TValue[]): number {
        // Plan 4 hook point (see ValueMap.set()).
        return super.unshift(...items);
    }

    public override pop(): TValue {
        // Plan 4 hook point (see ValueMap.set()).
        return super.pop();
    }

    public override shift(): TValue {
        // Plan 4 hook point (see ValueMap.set()).
        return super.shift();
    }

    public override reverse(): TValue[] {
        // Plan 4 hook point (see ValueMap.set()).
        return super.reverse();
    }

    public override sort(compareFn?: (a: TValue, b: TValue) => number): this {
        // Plan 4 hook point (see ValueMap.set()). Unlike UndoArray.sort, this is a pass-through - see this
        // class's doc comment for why.
        return super.sort(compareFn);
    }

    public override splice(start: number, deleteCount?: number, ...items: TValue[]): TValue[] {
        // Plan 4 hook point (see ValueMap.set()).
        return items.length > 0 ? super.splice(start, deleteCount, ...items) : super.splice(start, deleteCount);
    }

    public override fill(value: TValue, start?: number, end?: number): this {
        // Plan 4 hook point (see ValueMap.set()). Unlike UndoArray.fill, this is a pass-through - see this
        // class's doc comment for why.
        return super.fill(value, start, end);
    }

    public override copyWithin(target: number, start: number, end?: number): this {
        // Plan 4 hook point (see ValueMap.set()). Overridden for consistency with the other mutators, but see
        // this class's doc comment: copyWithin, index assignment, and the length setter are not fully
        // interceptable on a subclassed exotic Array without a Proxy.
        return super.copyWithin(target, start, end);
    }
}

function CreateValueArrayInternal<TValue>(go: GameObjectBase, prop: string, arr: readonly TValue[]): ValueArray<TValue> {
    return (ValueArray.from(arr) as ValueArray<TValue>).init(go, prop);
}


import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
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
const stateHydrationMetadata = Symbol();

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

type StateHydrationHandler = (instance: GameObjectBase, rawValue: unknown) => void;

// Registers how a state field should be rebuilt from raw copied state during copyState().
function registerStateHydrator(metaState: Record<string | symbol, unknown>, fieldName: string, hydrator: StateHydrationHandler) {
    const hydrationMetadata = (metaState[stateHydrationMetadata] ??= {}) as Record<string, StateHydrationHandler>;
    hydrationMetadata[fieldName] = hydrator;
}

function createIdArray<TValue extends IGameObjectBase>(values: readonly TValue[] | TValue[] | null | undefined): GameObjectId<TValue>[] | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Array<GameObjectId<TValue>>(values.length);
    for (let i = 0; i < values.length; i++) {
        ids[i] = values[i].getObjectId();
    }

    return ids;
}

function createIdMap<TValue extends IGameObjectBase>(values: Map<string, TValue> | null | undefined): Map<string, GameObjectId<TValue>> | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Map<string, GameObjectId<TValue>>();
    for (const [key, value] of values) {
        ids.set(key, value.getObjectId());
    }

    return ids;
}

function createIdSet<TValue extends IGameObjectBase>(values: Set<TValue> | null | undefined): Set<GameObjectId<TValue>> | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Set<GameObjectId<TValue>>();
    for (const value of values) {
        ids.add(value.getObjectId());
    }

    return ids;
}

function createIdRecord<TValue extends IGameObjectBase>(values: Record<string, TValue> | null | undefined): Record<string, GameObjectId<TValue>> | null | undefined {
    if (values == null) {
        return null;
    }

    const ids: Record<string, GameObjectId<TValue>> = {};
    for (const key in values) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
            ids[key] = values[key].getObjectId();
        }
    }

    return ids;
}

function hydrateReadonlyArrayFromIds<TValue extends GameObjectBase>(instance: GameObjectBase, rawValue: readonly GameObjectId<TValue>[] | GameObjectId<TValue>[] | null | undefined): readonly TValue[] | null | undefined {
    if (rawValue == null) {
        return null;
    }

    const values = new Array<TValue>(rawValue.length);
    for (let i = 0; i < rawValue.length; i++) {
        values[i] = instance.game.getFromUuidUnsafe(rawValue[i]);
    }

    return values;
}

function hydrateUndoMapFromIds<TValue extends GameObjectBase>(instance: GameObjectBase, prop: string, rawValue: Map<string, GameObjectId<TValue>> | null | undefined): Map<string, TValue> | null | undefined {
    if (rawValue == null) {
        return null;
    }

    const hydratedMap = new UndoMap<TValue>(instance, prop);
    for (const [key, valueId] of rawValue) {
        Map.prototype.set.call(hydratedMap, key, instance.game.getFromUuidUnsafe(valueId));
    }

    return hydratedMap;
}

function hydrateUndoSetFromIds<TValue extends GameObjectBase>(instance: GameObjectBase, prop: string, rawValue: Set<GameObjectId<TValue>> | null | undefined): Set<TValue> | null | undefined {
    if (rawValue == null) {
        return null;
    }

    const hydratedSet = new UndoSet<TValue>(instance, prop);
    for (const id of rawValue) {
        Set.prototype.add.call(hydratedSet, instance.game.getFromUuidUnsafe(id));
    }

    return hydratedSet;
}

function hydrateUndoRecordFromIds<TValue extends GameObjectBase>(instance: GameObjectBase, prop: string, rawValue: Record<string, GameObjectId<TValue>> | null | undefined): Record<string, TValue> | null | undefined {
    if (rawValue == null) {
        return null;
    }

    const hydratedRecord: Record<string, TValue> = {};
    for (const key in rawValue) {
        if (Object.prototype.hasOwnProperty.call(rawValue, key)) {
            hydratedRecord[key] = instance.game.getFromUuidUnsafe(rawValue[key]);
        }
    }

    return UndoSafeRecord(instance, hydratedRecord, prop);
}

function hydrateIdFromState<TValue extends GameObjectBase>(instance: GameObjectBase, rawValue: GameObjectId<TValue> | null | undefined): TValue | null | undefined {
    if (rawValue == null) {
        return null;
    }

    return instance.game.getFromUuidUnsafe(rawValue);
}

function pushIdsOntoStateArray<TValue extends IGameObjectBase>(stateArray: GameObjectId<TValue>[], items: TValue[]): number {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < items.length; i++) {
        stateArray.push(items[i].getObjectId());
    }

    return stateArray.length;
}

function unshiftIdsOntoStateArray<TValue extends IGameObjectBase>(stateArray: GameObjectId<TValue>[], items: TValue[]): number {
    for (let i = items.length - 1; i >= 0; i--) {
        stateArray.unshift(items[i].getObjectId());
    }

    return stateArray.length;
}

function getStateIdArray<TValue extends IGameObjectBase>(go: GameObjectBase, name: string): GameObjectId<TValue>[] {
    return (go as GameObjectBase & { state: Record<string, GameObjectId<TValue>[]> }).state[name];
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
 * Deliberately excludes `stateHydrationMetadata`, whose values are closures (always reference-distinct,
 * so comparing them would always report a mismatch) and which is derived from the same field
 * declarations already compared via the other buckets, not an independent source of truth.
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
 * Decorator to capture the names of any accessors flagged as &#64;statePrimitive, &#64;stateRef, or &#64;stateRefArray for copyState, and then clear the array for the next derived class to use.
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
            // Move metadata from the stateMedata symbol to the name of the class, so that we can look it up later in copyStruct.
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
        // Preserve the original class name for diagnostics and metadata lookups (e.g. copyState).
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

        // copyState walks Symbol.metadata on constructors in the prototype chain.
        // Re-expose the original metadata on the wrapper so state copy behavior is unchanged.
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
 * Decorator to capture the names of any accessors flagged as &#64;statePrimitive, &#64;stateRef, or &#64;stateRefArray for copyState, and then clear the array for the next derived class to use.
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
    // Preserve the original class name for diagnostics and metadata lookups (e.g. copyState).
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
        const name = context.name;

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this: T) {
                return this.state[name];
            },
            set(this: T, newValue: TValue) {
                this.state[name] = newValue;
            },
            init(this: T, value: TValue) {
                this.state[name] = value;
                // We don't use the internal field and only use the data within state.
                return undefined;
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

        if (readonly) {
            registerStateHydrator(metaState, name, (instance, rawValue: GameObjectId<TValue>[] | null | undefined) => {
                target.set.call(instance as T, hydrateReadonlyArrayFromIds<TValue>(instance, rawValue) as readonly TValue[]);
            });
        } else {
            registerStateHydrator(metaState, name, (instance, rawValue: GameObjectId<TValue>[] | null | undefined) => {
                target.set.call(instance as T, CreateUndoArrayInternalFromIds<TValue>(instance, name, rawValue));
            });
        }

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                get(this: T) {
                    return target.get.call(this);
                },
                set(this: T, newValue: TValue[]) {
                    this.state[name] = createIdArray(newValue);
                    target.set.call(this, newValue);
                },
                init(this: T, value: TValue[]) {
                    this.state[name] = createIdArray(value);
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
                this.state[name] = createIdArray(newValue);
                target.set.call(this, newValue ? CreateUndoArrayInternal(this, name, newValue) : newValue);
            },
            init(this: T, value: TValue[]) {
                this.state[name] = createIdArray(value);
                return value ? CreateUndoArrayInternal(this, name) : value;
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

        registerStateHydrator(metaState, name, (instance, rawValue: Map<string, GameObjectId<TValue>> | null | undefined) => {
            target.set.call(instance as T, hydrateUndoMapFromIds<TValue>(instance, name, rawValue) as Map<string, TValue>);
        });

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                // The below UndoMap instantiation will also load the state map with all of it's values.
                this.state[name] = createIdMap(newValue);
                target.set.call(this, newValue ? new UndoMap(this, name, newValue.entries()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoMap cannot be init with entries');
                this.state[name] = value;
                // If this is not-null, create a equivalent map in the state. Otherwise, leave it as-is.
                return value ? new UndoMap(this, name) : value;
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

        registerStateHydrator(metaState, name, (instance, rawValue: Set<GameObjectId<TValue>> | null | undefined) => {
            target.set.call(instance as T, hydrateUndoSetFromIds<TValue>(instance, name, rawValue) as Set<TValue>);
        });

        // Use the backing fields as the cache, and write refs to the state.
        // State stores a Set<string> keyed by UUID so that delete can look up by key.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                // The below UndoSet instantiation will also load the state map with all of its values.
                this.state[name] = createIdSet(newValue);
                target.set.call(this, newValue ? new UndoSet(this, name, newValue.values()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoSet cannot be init with entries');
                this.state[name] = value ? new Set() : value;
                // If this is not-null, create an equivalent set in the state. Otherwise, leave it as-is.
                return value ? new UndoSet(this, name) : value;
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

        registerStateHydrator(metaState, name, (instance, rawValue: Record<string, GameObjectId<TValue>> | null | undefined) => {
            target.set.call(instance as T, hydrateUndoRecordFromIds<TValue>(instance, name, rawValue) as Record<string, TValue>);
        });

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                this.state[name] = createIdRecord(newValue);
                target.set.call(this, UndoSafeRecord(this, newValue, name));
            },
            init(this: GameObjectBase, value) {
                this.state[name] = value ? {} : value;
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
        const name = context.name as string;

        registerStateHydrator(metaState, name, (instance, rawValue: GameObjectId<TValue> | null | undefined) => {
            target.set.call(instance as unknown as T, hydrateIdFromState(instance, rawValue) as unknown as TValue);
        });

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[name] = newValue?.getObjectId();
                target.set.call(this, newValue);
            },
            init(value) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[name] = value?.getObjectId();
                return value;
            }
        };
    };
}

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
 * - Map<string, non-GameObjectBase>, including in-place Map mutations
 *
 * @example
 * ⁣@stateValue() accessor decklist: IDeckListForLoading;
 */
export function stateValue<T extends GameObjectBase, TValue>() {
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

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this: T) {
                return this.state[name];
            },
            set(this: T, newValue: TValue) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, newValue);
                }
                this.state[name] = newValue;
            },
            init(this: T, value: TValue) {
                if (Helpers.isDevelopment()) {
                    assertJsonSafeStateValue(name, value);
                }
                this.state[name] = value;
                // We don't use the internal field and only use the data within state.
                return undefined;
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
 *   `Map`/`Set` (e.g. `AbilityLimit.useCount.set(...)`, `GainAbility.ts`,
 *   `GainNonKeywordAbilitiesFromUnitEffect.ts`) never re-enters it - the accessor sees one `set`/`init` call
 *   with an empty collection and nothing thereafter, for as long as the collection is only ever mutated
 *   in place during normal play. This is the primary documented use of `@stateValue`
 *   maps above, so it is a real coverage gap, not a marginal one. Plan 3's
 *   encoder is the intended enforcement point for this population path; do not close it here by rerouting
 *   these fields through `UndoMap`/`UndoSet`, which is snapshot-layer work for a later unit. Note that
 *   rollback is not subject to this gap: `copyState` reassigns every `stateSimpleMetadata` field (which
 *   `@stateValue` registers into) via `instance[field] = newState[field]`, re-entering the `set` accessor
 *   with whatever the field held at snapshot time - a populated collection included - so this check does
 *   re-validate in-place-mutated maps/sets on every rollback.
 *
 * Also note: this walks plain-object properties with `Object.keys`, which sees only *own enumerable
 * string-keyed* properties (a symbol-keyed or non-enumerable property is invisible to it), and which
 * invokes any getters on the object as part of walking it.
 *
 * `ancestors` tracks only the current recursion path (to reject a true cycle) the same way
 * {@link isSnapshotSafeOngoingEffectValue} does, but this function is otherwise a distinct check for a
 * distinct invariant: it accepts `Map`/`Set` (which that structured-clone check rejects) and rejects
 * non-finite numbers (which that check allows, since `v8.serialize` round-trips them fine).
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

    ancestors.add(value as object);
    for (const key of Object.keys(value as Record<string, unknown>)) {
        assertJsonSafeStateValue(`${propertyName}.${key}`, (value as Record<string, unknown>)[key], ancestors);
    }
    ancestors.delete(value as object);
}

/** Experimental: Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
function UndoSafeRecord<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, record: Record<string, TValue>, name: string) {
    // @ts-expect-error these functions can bypass the accessibility safeties.
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go.state, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedRecord = new Proxy(record, {
        set(target, prop, newValue, receiver) {
            const result = Reflect.set(target, prop, newValue, receiver);
            // @ts-expect-error Override accessibility and set the same property on the internal state.
            Reflect.set(go.state[name], prop, newValue?.getObjectId(), go.state[name]);
            return result;
        },
        deleteProperty(target, prop: string) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            // @ts-expect-error Override accessibility and set the same property on the internal state.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete go.state[prop];
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

function CreateUndoArrayInternalFromIds<TValue extends GameObjectBase>(go: GameObjectBase, prop: string, ids?: readonly GameObjectId<TValue>[] | GameObjectId<TValue>[] | null) {
    if (ids == null) {
        return ids as unknown as IStateArray<TValue> | null | undefined;
    }

    const undoArr = CreateUndoArrayBase<TValue>(go, prop);
    undoArr.length = ids.length;
    for (let i = 0; i < ids.length; i++) {
        undoArr[i] = go.game.getFromUuidUnsafe(ids[i]);
    }

    return undoArr as IStateArray<TValue>;
}

function CreateUndoArrayBase<TValue extends GameObjectBase>(go: GameObjectBase, prop: string) {
    return new UndoArray<TValue>().init(go, prop);
}

export function copyState<T extends GameObjectBase>(instance: T, newState: Record<any, any>) {
    let baseClass = Object.getPrototypeOf(instance);
    while (baseClass) {
        const metadata = baseClass.constructor[Symbol.metadata];
        // Pull out any data provided by @registerState for this class.
        const metaState = metadata?.[baseClass.constructor.name] as Record<symbol, any>;

        // If there is any state, go through each of the types and do the copy process.
        if (metaState) {
            const hydrationMetadata = metaState[stateHydrationMetadata] as Record<string, StateHydrationHandler> | undefined;

            // STATE NOTE: We only need to copy this if we aren't using structuredClone.
            if (metaState[stateSimpleMetadata]) {
                const metaSimples = metaState[stateSimpleMetadata] as string[];
                for (const field of metaSimples) {
                    instance[field] = newState[field];
                }
            }

            // STATE TODO: Once objects can be GC'd and we can recreate objects during rollback, this will need to happen *after* the new objects are created.
            if (metaState[stateArrayMetadata]) {
                const metaArrays = metaState[stateArrayMetadata] as string[];
                for (const field of metaArrays) {
                    hydrationMetadata[field](instance, newState[field]);
                }
            }
            if (metaState[stateMapMetadata]) {
                const metaMaps = metaState[stateMapMetadata] as string[];
                for (const field of metaMaps) {
                    hydrationMetadata[field](instance, newState[field]);
                }
            }
            if (metaState[stateSetMetadata]) {
                const metaSets = metaState[stateSetMetadata] as string[];
                for (const field of metaSets) {
                    hydrationMetadata[field](instance, newState[field]);
                }
            }
            if (metaState[stateRecordMetadata]) {
                const metaRecords = metaState[stateRecordMetadata] as string[];
                for (const field of metaRecords) {
                    hydrationMetadata[field](instance, newState[field]);
                }
            }
            if (metaState[stateObjectMetadata]) {
                const metaObjects = metaState[stateObjectMetadata] as string[];
                for (const field of metaObjects) {
                    hydrationMetadata[field](instance, newState[field]);
                }
            }
        }

        const newBaseClass = Object.getPrototypeOf(baseClass);
        // Check if there's another parent class and that that class isn't the base Object of every class.
        if (!newBaseClass || !newBaseClass.constructor.name || newBaseClass === Object.prototype) {
            break;
        }
        // Continue to the next parent class in the prototype chain and check again.
        baseClass = newBaseClass;
    }
}

export interface IRuntimeStateFieldModelEntry {
    name: string;
    kind: FieldKind;
}

/**
 * P3-PA4: reads the flattened field name+kind model for a registered class, reusing copyState's exact walk
 * technique above (visit each level of the prototype chain, accumulate whatever metadata bucket that level
 * itself claims) - no new resolution logic, only new read access. Returns undefined if className was never
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

// A custom class to pass through any values to the underlying state Map.
class UndoMap<TValue extends GameObjectBase> extends Map<string, TValue> {
    #go: GameObjectBase;
    #prop: string;
    #init = false;

    public constructor(go: GameObjectBase, prop: string, entries?: Iterable<readonly [string, TValue]> | null) {
        super(entries);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
        this.#init = true;
    }

    public init(go: GameObjectBase, prop: string) {
        this.#go = go;
        this.#prop = prop;
        this.#init = true;
        return this;
    }

    public override set(key: string, value: TValue): this {
        // Set is called during instantiation, but "this.go" hasn't (and can't) be defined yet.
        if (this.#init) {
            // @ts-expect-error Overriding state accessibility
            const stateValue = this.#go.state[this.#prop] as Map<string, GameObjectId<TValue>>;
            stateValue.set(key, value.getObjectId());
        }
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.#go.state[this.#prop] as Map<string, GameObjectId<TValue>>;
        stateValue.delete(key);
        return super.delete(key);
    }

    public override clear(): void {
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.#go.state[this.#prop] as Map<string, GameObjectId<TValue>>;
        stateValue.clear();
        super.clear();
    }
}

// A custom class to pass through any values to the underlying state Set.
class UndoSet<TValue extends GameObjectBase> extends Set<TValue> {
    #go: GameObjectBase;
    #prop: string;
    #init = false;

    public constructor(go: GameObjectBase, prop: string, values?: Iterable<TValue> | null) {
        super(values);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.#go = go;
        this.#prop = prop;
        this.#init = true;
    }

    public init(go: GameObjectBase, prop: string) {
        this.#go = go;
        this.#prop = prop;
        this.#init = true;
        return this;
    }

    public override add(value: TValue): this {
        // Add is called during instantiation, but "this.#go" hasn't (and can't) be defined yet.
        if (this.#init) {
            // @ts-expect-error Overriding state accessibility
            const stateValue = this.#go.state[this.#prop] as Set<GameObjectId<TValue>>;
            stateValue.add(value.getObjectId());
        }
        return super.add(value);
    }

    public override delete(value: TValue): boolean {
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.#go.state[this.#prop] as Set<GameObjectId<TValue>>;
        stateValue.delete(value.getObjectId());
        return super.delete(value);
    }

    public override clear(): void {
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.#go.state[this.#prop] as Set<GameObjectId<TValue>>;
        stateValue.clear();
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
        // @ts-expect-error Overriding state accessibility
        pushIdsOntoStateArray(this.#go.state[this.#prop], items);
        return super.push(...items);
    }

    public override unshift(...items: TValue[]): number {
        // @ts-expect-error Overriding state accessibility
        unshiftIdsOntoStateArray(this.#go.state[this.#prop], items);
        return super.unshift(...items);
    }

    public override pop(): TValue {
        // @ts-expect-error Overriding state accessibility
        (this.#go.state[this.#prop] as GameObjectId[]).pop();
        return super.pop();
    }

    public override shift(): TValue {
        // @ts-expect-error Overriding state accessibility
        (this.#go.state[this.#prop] as GameObjectId[]).shift();
        return super.shift();
    }

    public override reverse(): TValue[] {
        // @ts-expect-error Overriding state accessibility
        (this.#go.state[this.#prop] as GameObjectId[]).reverse();
        return super.reverse();
    }

    public override sort(): this {
        throw new Error('Sort is not supported in UndoArray.');
    }

    public override splice(start: number, deleteCount?: number): TValue[] {
        if (arguments.length > 2) {
            throw new Error('UndoArray.splice only supports up to two arguments.');
        }

        // @ts-expect-error Overriding state accessibility
        (this.#go.state[this.#prop] as GameObjectId[]).splice(start, deleteCount);
        return super.splice(start, deleteCount);
    }

    public override fill(value: TValue, start?: number, end?: number): this {
        throw new Error('Fill is not supported in UndoArray.');
    }
}


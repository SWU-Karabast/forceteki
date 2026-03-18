import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
import * as Contract from './utils/Contract';

// @ts-expect-error Symbol.metadata is not yet a standard.
Symbol.metadata ??= Symbol.for('Symbol.metadata');
const stateMetadata = Symbol();
const stateSimpleMetadata = Symbol();
const stateArrayMetadata = Symbol();
const stateMapMetadata = Symbol();
const stateSetMetadata = Symbol();
const stateRecordMetadata = Symbol();
const stateObjectMetadata = Symbol();
const stateHydrationMetadata = Symbol();
const bulkCopyMetadata = Symbol();

const stateClassesStr: Record<string, string> = {};

export const registerStateClassMarker = Symbol('registerStateClassMarker');
export const registerStateAutoInitializeMarker = Symbol('registerStateAutoInitializeMarker');

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
    UseMetaDataOnly = 0,

    /** Copies from the state using a bulk copy method, and then re-applies any of the map/array/record Metadata fields to recreate the cached values. Inefficient, but safe. */
    UseBulkCopy = 1
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
 * Decorator to capture the names of any accessors flagged as &#64;statePrimitive, &#64;stateRef, or &#64;stateRefArray for copyState, and then clear the array for the next derived class to use.
 * This is meant for classes that are meant to be directly instantiated, they must be non-abstract and leafs.
 * @param copyModeOrOptions If CopyModeEnum.UseFullCopy, makes the class use the bulk copy method as backup to the meta data. This is going to be slower, but helps if we have state not easily capturable by the state decorators.
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
        if (options.copyMode === CopyMode.UseBulkCopy) {
            // this *should* work for derived classes: the context.metadata uses a prototype inheritance of it's own for each derived class, so when a class branches, so should the metadata object.
            // That means that we're ok with marking the meta data object at *this* prototype as true; other branches off of GameObjectBase won't share it.
            // NEEDS VERIFICATION.
            context.metadata[bulkCopyMetadata] = true;
        }
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
        const name = context.name;

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this: T) {
                return this.state[name];
            },
            set(this: T, newValue: TValue) {
                this.game.deltaTracker?.recordFieldChange(this, name);
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
 * @param readonly If false, returns the array wrapped in a Proxy object, which allows the safe use of push, pop, unshift, and splice, but cause heavy allocations on the setup. If true, returns the array as-is and requires it be marked as readonly.
 */
export function stateRefArray<T extends GameObjectBase, TValue extends GameObjectBase, const TReadonly extends boolean>(readonly: ConstantBoolean<TReadonly> = (true as ConstantBoolean<TReadonly>)) {
    return function (
        target: ClassAccessorDecoratorTarget<T, typeof readonly extends true ? readonly TValue[] : TValue[]>,
        context: ClassAccessorDecoratorContext<T, typeof readonly extends true ? readonly TValue[] : TValue[]>
    ): ClassAccessorDecoratorResult<T, typeof readonly extends true ? readonly TValue[] : TValue[]> {
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
                target.set.call(instance as T, CreateUndoArrayInternalFromIds<TValue>(instance, name, rawValue) as TValue[]);
            });
        }

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                get(this: T) {
                    return target.get.call(this);
                },
                set(this: T, newValue: TValue[]) {
                    this.game.deltaTracker?.recordFieldChange(this, name);
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
                this.game.deltaTracker?.recordFieldChange(this, name);
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
                this.game.deltaTracker?.recordFieldChange(this, name);
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
                this.game.deltaTracker?.recordFieldChange(this, name);
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
                this.game.deltaTracker?.recordFieldChange(this, name);
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
                const gameObject = this as unknown as GameObjectBase;
                gameObject.game.deltaTracker?.recordFieldChange(gameObject, context.name as string);
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
        const name = context.name;

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this: T) {
                return this.state[name];
            },
            set(this: T, newValue: TValue) {
                this.game.deltaTracker?.recordFieldChange(this, name);
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

/** Experimental: Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
function UndoSafeRecord<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, record: Record<string, TValue>, name: string) {
    // @ts-expect-error these functions can bypass the accessibility safeties.
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go.state, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedRecord = new Proxy(record, {
        set(target, prop, newValue, receiver) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            const result = Reflect.set(target, prop, newValue, receiver);
            // @ts-expect-error Override accessibility and set the same property on the internal state.
            Reflect.set(go.state[name], prop, newValue?.getObjectId(), go.state[name]);
            return result;
        },
        deleteProperty(target, prop: string) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            // @ts-expect-error Override accessibility and set the same property on the internal state.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete go.state[name][prop];
            return true;
        },
    });

    return proxiedRecord;
}

/** Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
export function UndoSafeArray<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, arr: readonly TValue[], name: string) {
    // @ts-expect-error these functions can bypass the accessibility safeties.
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go.state, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedArray = new Proxy(arr, {
        get(target, prop, receiver) {
            if (prop === 'pop' || prop === 'splice') {
                return function (...args) {
                    Contract.assertTrue(args.length <= 2, 'State Array Splice does not support adding elements to the array.');
                    const result = Reflect.apply(target[prop], target, args);
                    // @ts-expect-error Override accessibility and call the same method on the internal state.
                    Reflect.apply(go.state[name][prop], go.state[name], args);

                    return result;
                };
            } else if (prop === 'push' || prop === 'unshift') {
                return function (...args) {
                    const result = Reflect.apply(target[prop], target, args);
                    if (prop === 'push') {
                        pushIdsOntoStateArray(getStateIdArray(go, name), args);
                    } else {
                        unshiftIdsOntoStateArray(getStateIdArray(go, name), args);
                    }

                    return result;
                };
            } else if (prop === 'reverse') {
                return function (...args) {
                    const result = Reflect.apply(target[prop], target, args);
                    // @ts-expect-error Override accessibility and call the same method on the internal state.
                    Reflect.apply(go.state[name][prop], go.state[name], args);

                    return result;
                };
            } else if (prop === 'sort' || prop === 'fill') {
                throw new Error('function ' + prop + ' is not supported.');
            }

            // For other properties, return the original property
            return Reflect.get(target, prop, receiver);
        }
    });

    return proxiedArray as TValue[];
}

/** A proxy wrapper for UndoArray to prevent directly setting elements via the indexes of an array. */
export function UndoArrayInternal<T extends GameObjectBase, TValue extends GameObjectBase>(arr: UndoArray<TValue>) {
    const proxiedArray = new Proxy(arr, {
        set(target, prop, newValue, receiver): boolean {
            // @ts-expect-error overriding accessibility.
            // setting the "accessing" prop needs to be allowed.
            // target.accessing is only flagged as true when the mutation functions are called.
            //      If it's not true then that means this is being modified via an index.
            if (prop !== 'accessing' && !target.accessing) {
                throw new Error('Set disallowed for mutating UndoArray');
            }
            return Reflect.set(target, prop, newValue, receiver);
        },
    });

    return proxiedArray as TValue[];
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

    return CreateUndoArrayProxy(undoArr) as TValue[];
}

function CreateUndoArrayInternalFromIds<TValue extends GameObjectBase>(go: GameObjectBase, prop: string, ids?: readonly GameObjectId<TValue>[] | GameObjectId<TValue>[] | null) {
    if (ids == null) {
        return ids as unknown as TValue[] | null | undefined;
    }

    const undoArr = CreateUndoArrayBase<TValue>(go, prop);
    undoArr.length = ids.length;
    for (let i = 0; i < ids.length; i++) {
        undoArr[i] = go.game.getFromUuidUnsafe(ids[i]);
    }

    return CreateUndoArrayProxy(undoArr) as TValue[];
}

function CreateUndoArrayBase<TValue extends GameObjectBase>(go: GameObjectBase, prop: string) {
    const undoArr = new UndoArray<TValue>();
    // Keep internal UndoArray bookkeeping properties off enumerable object shape so test equality checks on
    // arrays only see card entries, not proxy internals.
    Object.defineProperty(undoArr, 'go', {
        value: go,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(undoArr, 'prop', {
        value: prop,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(undoArr, 'accessing', {
        value: false,
        writable: true,
        enumerable: false,
        configurable: true
    });

    return undoArr;
}

function CreateUndoArrayProxy<TValue extends GameObjectBase>(undoArr: UndoArray<TValue>) {
    const proxiedArray = new Proxy(undoArr, {
        set(target, prop, newValue, receiver): boolean {
            // @ts-expect-error overriding accessibility.
            // setting the "accessing" prop needs to be allowed.
            // target.accessing is only flagged as true when the mutation functions are called.
            //      If it's not true then that means this is being modified via an index.
            if (prop !== 'accessing' && !target.accessing) {
                throw new Error('Set disallowed for mutating UndoArray');
            }
            return Reflect.set(target, prop, newValue, receiver);
        },
    });

    return proxiedArray;
}

export function copyState<T extends GameObjectBase>(instance: T, newState: Record<any, any>) {
    let baseClass = Object.getPrototypeOf(instance);
    let isFullCopy = false;
    if (baseClass.constructor[Symbol.metadata][bulkCopyMetadata]) {
        isFullCopy = true;
    }
    while (baseClass) {
        const metadata = baseClass.constructor[Symbol.metadata];
        // Pull out any data provided by @registerState for this class.
        const metaState = metadata?.[baseClass.constructor.name] as Record<symbol, any>;

        // If there is any state, go through each of the types and do the copy process.
        if (metaState) {
            const hydrationMetadata = metaState[stateHydrationMetadata] as Record<string, StateHydrationHandler> | undefined;

            // STATE NOTE: We only need to copy this if we aren't using structuredClone.
            if (!isFullCopy && metaState[stateSimpleMetadata]) {
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

// A custom class to pass through any values to the underlying state Map.
class UndoMap<TValue extends GameObjectBase> extends Map<string, TValue> {
    private go: GameObjectBase;
    private prop: string;
    private init = false;
    public constructor(go: GameObjectBase, prop: string, entries?: Iterable<readonly [string, TValue]> | null) {
        super(entries);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.go = go;
        this.prop = prop;
        this.init = true;
    }

    public override set(key: string, value: TValue): this {
        // Set is called during instantiation, but "this.go" hasn't (and can't) be defined yet.
        if (this.init) {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            const stateValue = this.go.state[this.prop] as Map<string, GameObjectId<TValue>>;
            stateValue.set(key, value.getObjectId());
        }
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.go.state[this.prop] as Map<string, GameObjectId<TValue>>;
        stateValue.delete(key);
        return super.delete(key);
    }

    public override clear(): void {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.go.state[this.prop] as Map<string, GameObjectId<TValue>>;
        stateValue.clear();
        super.clear();
    }
}

// A custom class to pass through any values to the underlying state Set.
class UndoSet<TValue extends GameObjectBase> extends Set<TValue> {
    private go: GameObjectBase;
    private prop: string;
    private init = false;
    public constructor(go: GameObjectBase, prop: string, values?: Iterable<TValue> | null) {
        super(values);
        Contract.assertNotNullLike(go, 'Game Object cannot be null');
        this.go = go;
        this.prop = prop;
        this.init = true;
    }

    public override add(value: TValue): this {
        // Add is called during instantiation, but "this.go" hasn't (and can't) be defined yet.
        if (this.init) {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            const stateValue = this.go.state[this.prop] as Set<GameObjectId<TValue>>;
            stateValue.add(value.getObjectId());
        }
        return super.add(value);
    }

    public override delete(value: TValue): boolean {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.go.state[this.prop] as Set<GameObjectId<TValue>>;
        stateValue.delete(value.getObjectId());
        return super.delete(value);
    }

    public override clear(): void {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        // @ts-expect-error Overriding state accessibility
        const stateValue = this.go.state[this.prop] as Set<GameObjectId<TValue>>;
        stateValue.clear();
        super.clear();
    }
}

class UndoArray<TValue extends GameObjectBase> extends Array<TValue> {
    public go: GameObjectBase;
    public prop: string;
    private accessing = false;

    public static override get [Symbol.species]() {
        return Array; // Return the native Array constructor
    }

    public override push(...items: TValue[]): number {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            pushIdsOntoStateArray(this.go.state[this.prop], items);
            return super.push(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override unshift(...items: TValue[]): number {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            unshiftIdsOntoStateArray(this.go.state[this.prop], items);
            return super.unshift(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override pop(): TValue {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectId[]).pop();
            return super.pop();
        } finally {
            this.accessing = false;
        }
    }

    public override shift(): TValue {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectId[]).shift();
            return super.shift();
        } finally {
            this.accessing = false;
        }
    }

    public override reverse(): TValue[] {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectId[]).reverse();
            return super.reverse();
        } finally {
            this.accessing = false;
        }
    }

    public override sort(): this {
        throw new Error('Sort is not supported in UndoArray.');
    }

    public override splice(start: number, deleteCount?: number): TValue[] {
        if (arguments.length > 2) {
            throw new Error('UndoArray.splice only supports up to two arguments.');
        }
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectId[]).splice(start, deleteCount);
            return super.splice(start, deleteCount);
        } finally {
            this.accessing = false;
        }
    }

    public override fill(value: TValue, start?: number, end?: number): this {
        throw new Error('Fill is not supported in UndoArray.');
    }
}


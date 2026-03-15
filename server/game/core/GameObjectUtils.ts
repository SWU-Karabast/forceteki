import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
import * as Contract from './utils/Contract';

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

    /** Uses generated serializer and deserializer code for snapshot state. */
    CompileTime = 0,

    /** Uses structuredClone-compatible runtime snapshot payloads. */
    Runtime = 1,

    /** @deprecated Use CopyMode.CompileTime instead. */
    UseMetaDataOnly = 0,

    /** @deprecated Use CopyMode.Runtime instead. */
    UseBulkCopy = 1
}

export interface RegisterStateOptions {
    copyMode?: CopyMode;
    autoInitialize?: boolean;
}

export function createIdArray<TValue extends IGameObjectBase>(values: readonly TValue[] | TValue[] | null | undefined): GameObjectId<TValue>[] | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Array<GameObjectId<TValue>>(values.length);
    for (let i = 0; i < values.length; i++) {
        ids[i] = values[i].getObjectId();
    }

    return ids;
}

export function createIdMap<TValue extends IGameObjectBase>(values: Map<string, TValue> | null | undefined): Map<string, GameObjectId<TValue>> | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Map<string, GameObjectId<TValue>>();
    for (const [key, value] of values) {
        ids.set(key, value.getObjectId());
    }

    return ids;
}

export function createIdSet<TValue extends IGameObjectBase>(values: Set<TValue> | null | undefined): Set<GameObjectId<TValue>> | null | undefined {
    if (values == null) {
        return null;
    }

    const ids = new Set<GameObjectId<TValue>>();
    for (const value of values) {
        ids.add(value.getObjectId());
    }

    return ids;
}

export function createIdRecord<TValue extends IGameObjectBase>(values: Record<string, TValue> | null | undefined): Record<string, GameObjectId<TValue>> | null | undefined {
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

function normalizeRegisterStateOptions(copyModeOrOptions: CopyMode | RegisterStateOptions | undefined): Required<RegisterStateOptions> {
    if (copyModeOrOptions == null || typeof copyModeOrOptions === 'number') {
        const copyMode = typeof copyModeOrOptions === 'number' ? copyModeOrOptions : CopyMode.CompileTime;
        return {
            copyMode,
            autoInitialize: true
        };
    }

    return {
        copyMode: copyModeOrOptions.copyMode ?? CopyMode.CompileTime,
        autoInitialize: copyModeOrOptions.autoInitialize ?? true
    };
}

/**
 * Decorator to register a stateful class and optionally wrap construction so initialize() is called automatically.
 * This is meant for classes that are meant to be directly instantiated, they must be non-abstract and leafs.
 * @param copyModeOrOptions Controls whether the generated serializer path or runtime structuredClone path is used.
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
        // Preserve the original class name for diagnostics and generated serializer lookup.
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

        return wrappedClass;
    };
}

/**
 * Decorator to register a stateful abstract base class without wrapping its constructor.
 *
 * This is meant for base classes that need to be extended by &#64;registerState classes, but should not be directly instantiated themselves, and thus don't need the constructor wrapper that guarantees initialize() is called.
 */
export function registerStateBase<T extends GameObjectBase>(copyModeOrOptions?: CopyMode | Omit<RegisterStateOptions, 'autoInitialize'>) {
    const copyMode = typeof copyModeOrOptions === 'number' ? copyModeOrOptions : copyModeOrOptions?.copyMode;
    return registerState<T>({ copyMode, autoInitialize: false });
}

/**
 * Mirrors the wrapper pattern used in registerState() in GameObjectUtils.ts.
 * Used with the dynamically imported Cards to automatically wrap them with a constructor that calls initialize.
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
 * @param readonly If false, returns a mutable array. If true, returns the array as-is and requires it be marked as readonly.
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
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                get(this: T) {
                    return target.get.call(this);
                },
                set(this: T, newValue: TValue[]) {
                    target.set.call(this, newValue);
                },
                init(this: T, value: TValue[]) {
                    return value;
                }
            };
        }

        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: TValue[]) {
                target.set.call(this, newValue);
            },
            init(this: T, value: TValue[]) {
                return value;
            }
        };
    };
}

/** Creates a tracked Map reference. */
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
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                target.set.call(this, newValue);
            },
            init(this: T, value) {
                return value;
            },
        };
    };
}

/** Creates a tracked Set reference. */
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
        const name = context.name as string;

        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                target.set.call(this, newValue);
            },
            init(this: T, value) {
                return value;
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
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                target.set.call(this, newValue);
            },
            init(this: T, value) {
                return value;
            },
        };
    };
}

/** Creates a tracked GameObject reference. */
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
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                target.set.call(this, newValue);
            },
            init(value) {
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



import type { GameObjectBase, GameObjectRef } from './GameObjectBase';
import * as Contract from './utils/Contract';

// @ts-expect-error Symbol.metadata is not yet a standard.
Symbol.metadata ??= Symbol.for('Symbol.metadata');
const stateMetadata = Symbol();
const stateSimpleMetadata = Symbol();
const stateArrayMetadata = Symbol();
const stateMapMetadata = Symbol();
const stateObjectMetadata = Symbol();
const fullCopyMetadata = Symbol();

const stateClassesStr: Record<string, string> = {};

/**
 * Decorator to capture the names of any accessors flagged as @undoState, @undoObject, or @undoArray for copyState, and then clear the array for the next derived class to use.
 * @param useFullCopy If true, simply uses the bulk copy method rather than using any meta data. This is going to be slower, but helps if we have state not easily capturable by the undo decorators.
 */
export function registerState<T extends GameObjectBase>(useFullCopy = false) {
    return function (targetClass: any, context: ClassDecoratorContext) {
        const parentClass = Object.getPrototypeOf(targetClass);

        const metaState = context.metadata[stateMetadata] as Record<string | symbol, any>;
        if (useFullCopy) {
            // this *should* work for derived classes: the context.metadata uses a prototype inheritance of it's own for each derived class, so when a class branches, so should the metadata object.
            // That means that we're ok with marking the meta data object at *this* prototype as true; other branches off of GameObjectBase won't share it.
            // NEEDS VERIFICATION.
            context.metadata[fullCopyMetadata] = true;
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
        // Do check to see if parent is missing @registerState. This will happen in order of lowest class to highest class, so we can rely on it checking if it's parent class was registered.
        if (parentClass.name && parentClass !== Object && stateClassesStr[parentClass.name] == null) {
            throw new Error(`class "${parentClass.name}" is missing @registerState`);
        }

        return targetClass;
    };
}

export function undoState<T extends GameObjectBase, TValue extends string | number | boolean>() {
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

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                return this.state[context.name as string];
            },
            set(this, newValue) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[context.name as string] = newValue;
            },
        };
    };
}

// Forces the incoming value to be either a boolean literal, or a constant boolean.
type ConstantBoolean<T extends boolean> = boolean extends T ? never : T;

/**
 *
 * @param readonly If false, returns the array wrapped in a Proxy, which allows the safe use of push, pop, unshift, and splice. If true, returns the array as-is and requires it be marked as readonly.
 * @returns
 */
export function undoArray<T extends GameObjectBase, TValue extends GameObjectBase, const TReadonly extends boolean>(readonly: ConstantBoolean<TReadonly> = (true as ConstantBoolean<TReadonly>)) {
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

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                get(this) {
                    return target.get.call(this);
                },
                set(this, newValue) {
                    // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                    this.state[context.name as string] = newValue?.map((x) => x.getRef());
                    target.set.call(this, newValue);
                },
                init(value) {
                    // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                    this.state[context.name as string] = (value && value.length > 0) ? value.map((x) => x.getRef()) : [];
                    return value;
                }
            };
        }

        return {
            get(this) {
                return UndoSafeArray(this, target.get.call(this), context.name as string);
            },
            set(this, newValue) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[context.name as string] = newValue?.map((x) => x.getRef());
                target.set.call(this, newValue);
            },
            init(value) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[context.name as string] = (value && value.length > 0) ? value.map((x) => x.getRef()) : [];
                return value;
            }
        };
    };
}

export function undoMap<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, ReadonlyMap<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, ReadonlyMap<string, TValue>>
    ): ClassAccessorDecoratorResult<T, ReadonlyMap<string, TValue>> {
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

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                this.state[context.name as string] = new Map(Array.from(newValue, ([key, value]) => [key, value.getRef()]));
                target.set.call(this, newValue);
            }
        };
    };
}

export function undoObject<T extends GameObjectBase, TValue extends GameObjectBase>() {
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

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[context.name as string] = newValue?.getRef();
                target.set.call(this, newValue);
            },
            init(value) {
                // @ts-expect-error we should technically have access to 'state' since this is internal to the class, but for now this is a workaround.
                this.state[context.name] = value != null ? value.getRef() : value;
                return value;
            }
        };
    };
}

/** Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
export function UndoSafeArray<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, arr: readonly TValue[], name: string) {
    // @ts-expect-error these functions can bypass the accessibility safeties.
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go.state, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedArray = new Proxy(arr, {
        get(target, prop, receiver) {
            if (prop === 'pop' || prop === 'splice') {
                return function(...args) {
                    Contract.assertTrue(args.length <= 2, 'State Array Splice does not support adding elements to the array.');
                    const result = Reflect.apply(target[prop], target, args);
                    // @ts-expect-error Override accessibility and call the same method on the internal state.
                    Reflect.apply(go.state[name][prop], go.state[name], args);

                    return result;
                };
            } else if (prop === 'push' || prop === 'unshift') {
                return function(...args) {
                    const result = Reflect.apply(target[prop], target, args);
                    // @ts-expect-error Override accessibility and call the same method on the internal state.
                    Reflect.apply(go.state[name][prop], go.state[name], args.map((x) => x.getRef()));

                    return result;
                };
            }

            // For other properties, return the original property
            return Reflect.get(target, prop, receiver);
        }
    });

    return proxiedArray as TValue[];
}

export function copyState<T extends GameObjectBase>(instance: T, newState: Record<any, any>) {
    let baseClass = Object.getPrototypeOf(instance);
    let isFullCopy = false;
    if (baseClass.constructor[Symbol.metadata][fullCopyMetadata]) {
        isFullCopy = true;
    }
    while (baseClass) {
        const metadata = baseClass.constructor[Symbol.metadata];
        // Pull out any data provided by @registerState for this class.
        const metaState = metadata?.[baseClass.constructor.name] as Record<symbol, any>;

        // If there is any state, go through each of the types and do the copy process.
        if (metaState) {
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
                    // It's a little extra work but that's far less than when we did it every time it did a get call to the accessor.
                    instance[field] = (newState[field] as GameObjectRef[])?.map((x) => instance.game.getFromRef(x));
                }
            }
            if (metaState[stateMapMetadata]) {
                const metaMaps = metaState[stateMapMetadata] as string[];
                for (const field of metaMaps) {
                    const mappedEntries: [string, GameObjectBase][] = Array.from((newState[field] as Map<string, GameObjectRef>), ([key, value]) => [key, instance.game.getFromRef(value)]);
                    instance[field] = new Map(mappedEntries);
                }
            }
            if (metaState[stateObjectMetadata]) {
                const metaObjects = metaState[stateObjectMetadata] as string[];
                for (const field of metaObjects) {
                    // It's a little extra work but that's far less than when we did it every time it did a get call to the accessor.
                    instance[field] = instance.game.getFromRef((newState[field] as GameObjectRef));
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
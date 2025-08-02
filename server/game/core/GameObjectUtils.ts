import type { GameObjectBase, GameObjectRef } from './GameObjectBase';

// @ts-expect-error Metadata is not yet a standard.
Symbol.metadata ??= Symbol.for('Symbol.metadata');
const stateMetadata = Symbol();
const stateSimpleMetadata = Symbol();
const stateArrayMetadata = Symbol();
const stateObjectMetadata = Symbol();

const stateClassesStr: Record<string, string> = {};

// This will happen in order of lowest class to highest class, so we can rely on it checking if it's parent class was registered.
export function registerState<T extends GameObjectBase>() {
    return function (targetClass: any, context: ClassDecoratorContext) {
        const parentClass = Object.getPrototypeOf(targetClass);

        // Pull out any accessors flagged as @stateArray, and then clear the array for the next derived class to use.
        const metaState = context.metadata[stateMetadata] as Record<string | symbol, any>;
        if (metaState) {
            // Transfer metadat from object to the name of the class.
            context.metadata[targetClass.name] = metaState;
            // Delete field to clear for the next derived class, if any.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete context.metadata[stateMetadata];
        }

        stateClassesStr[targetClass.name] = parentClass.name;
        if (parentClass.name && parentClass !== Object && stateClassesStr[parentClass.name] == null) {
            // Do check to see if child is missing.
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

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateSimpleMetadata] ??= [];
        (metaState[stateSimpleMetadata] as string[]).push(context.name);

        // No need to use the backing fields, read and write directly to state.
        return {
            get(this) {
                return this.state[context.name as string];
            },
            set(this, newValue) {
                this.state[context.name as string] = newValue;
            },
        };
    };
}

export function undoArray<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, readonly TValue[]>,
        context: ClassAccessorDecoratorContext<T, readonly TValue[]>
    ): ClassAccessorDecoratorResult<T, readonly TValue[]> {
        if (context.static || context.private) {
            throw new Error('Can only serialize public instance members.');
        }
        if (typeof context.name === 'symbol') {
            throw new Error('Cannot serialize symbol-named properties.');
        }

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateArrayMetadata] ??= [];
        (metaState[stateArrayMetadata] as string[]).push(context.name);

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                this.state[context.name as string] = newValue?.map((x) => x.getRef());
                target.set.call(this, newValue);
            },
            init(value) {
                this.state[context.name] = (value && value.length > 0) ? value.map((x) => x.getRef()) : [];
                return value;
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

        const metaState = (context.metadata[stateMetadata] ??= {}) as Record<string | symbol, any>;
        metaState[stateObjectMetadata] ??= [];
        (metaState[stateObjectMetadata] as string[]).push(context.name);

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this, newValue) {
                this.state[context.name as string] = newValue?.getRef();
                target.set.call(this, newValue);
            },
            init(value) {
                this.state[context.name] = value != null ? value.getRef() : value;
                return value;
            }
        };
    };
}

export function copyState<T extends GameObjectBase>(instance: T, newState: Record<any, any>) {
    let baseClass = Object.getPrototypeOf(instance);
    while (baseClass) {
        const newBaseClass = Object.getPrototypeOf(baseClass);
        const metadata = baseClass.constructor[Symbol.metadata];
        const metaState = metadata?.[baseClass.constructor.name] as Record<symbol, any>;
        if (metaState) {
            if (metaState[stateSimpleMetadata]) {
                const metaSimples = metaState[stateSimpleMetadata] as string[];
                for (const field of metaSimples) {
                    instance[field] = newState[field];
                }
            }
            if (metaState[stateArrayMetadata]) {
                const metaArrays = metaState[stateArrayMetadata] as string[];
                for (const field of metaArrays) {
                    // It's a little extra work but that's far less than when we did it every time it did a get call to the accessor.
                    instance[field] = (newState[field] as GameObjectRef[])?.map((x) => instance.game.getFromRef(x));
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
        if (!newBaseClass || !newBaseClass.constructor.name || newBaseClass === Object.prototype) {
            break;
        }
        baseClass = newBaseClass;
    }
}
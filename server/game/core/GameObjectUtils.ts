import type { GameObjectBase, GameObjectRef } from './GameObjectBase';
import { to } from './utils/TypeHelpers';
import * as Contract from './utils/Contract';

// @ts-expect-error Symbol.metadata is not yet a standard.
Symbol.metadata ??= Symbol.for('Symbol.metadata');
const stateMetadata = Symbol();
const stateSimpleMetadata = Symbol();
const stateArrayMetadata = Symbol();
const stateMapMetadata = Symbol();
const stateRecordMetadata = Symbol();
const stateObjectMetadata = Symbol();
const bulkCopyMetadata = Symbol();

const stateClassesStr: Record<string, string> = {};

export enum CopyMode {

    /** Copies from the state using only the Metadata fields. */
    UseMetaDataOnly = 0,

    /** Copies from the state using a bulk copy method, and then re-applies any of the map/array/record Metadata fields to recreate the cached values. Inefficient, but safe. */
    UseBulkCopy = 1
}

/**
 * Decorator to capture the names of any accessors flagged as &#64;undoState, &#64;undoObject, or &#64;undoArray for copyState, and then clear the array for the next derived class to use.
 * @param copyMode If CopyModeEnum.UseFullCopy, makes the class use the bulk copy method as backup to the meta data. This is going to be slower, but helps if we have state not easily capturable by the undo decorators.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export function registerState<T extends GameObjectBase>(copyMode = CopyMode.UseMetaDataOnly) {
    return function (targetClass: any, context: ClassDecoratorContext) {
        const parentClass = Object.getPrototypeOf(targetClass);

        const metaState = context.metadata[stateMetadata] as Record<string | symbol, any>;
        if (copyMode === CopyMode.UseBulkCopy) {
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

// Forces the incoming value to be either a boolean literal, or a constant boolean. This is meant to be used with const generic arguments.
type ConstantBoolean<T extends boolean> = boolean extends T ? never : T;

/**
 * @param readonly If false, returns the array wrapped in a Proxy object, which allows the safe use of push, pop, unshift, and splice. If true, returns the array as-is and requires it be marked as readonly.
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
        const name = context.name;

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                get(this: T) {
                    return target.get.call(this);
                },
                set(this: T, newValue: TValue[]) {
                    this.state[name] = newValue?.map((x) => x.getRef());
                    target.set.call(this, newValue);
                },
                init(this: T, value: TValue[]) {
                    this.state[name] = (value && value.length > 0) ? value.map((x) => x.getRef()) : [];
                    return value;
                }
            };
        }

        return {
            get(this: T) {
                return target.get.call(this);
            },
            set(this: T, newValue: TValue[]) {
                this.state[name] = newValue?.map((x) => x.getRef());
                target.set.call(this, newValue ? CreateUndoArrayInternal(this, name, newValue) : newValue);
            },
            init(this: T, value: TValue[]) {
                this.state[name] = (value && value.length > 0) ? value.map((x) => x.getRef()) : [];
                return value ? CreateUndoArrayInternal(this, name) : value;
            }
        };
    };
}

/** Creates a undo safe Map object that can be mutated in-place. */
export function undoMap<T extends GameObjectBase, TValue extends GameObjectBase>() {
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
        const name = context.name;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                // The below UndoMap instantiation will also load the state map with all of it's values.
                this.state[name] = newValue ? new Map(Array.from(newValue, ([key, value]) => [key, value.getRef()])) : newValue;
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

/** A simpler alternative to Map. Unless there is a specific reason, prefer undoMap over this. */
export function undoRecord<T extends GameObjectBase, TValue extends GameObjectBase>() {
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
        const name = context.name;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            get(this) {
                return target.get.call(this);
            },
            set(this: GameObjectBase, newValue) {
                this.state[name] = to.record(Object.keys(newValue), (key) => key, (key) => newValue[key]?.getRef());
                target.set.call(this, UndoSafeRecord(this, newValue, name));
            },
            init(this: GameObjectBase, value) {
                this.state[name] = value ? {} : value;
                return value ? UndoSafeRecord(this, value, name) : value;
            },
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

/** Experimental: Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
function UndoSafeRecord<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, record: Record<string, TValue>, name: string) {
    // @ts-expect-error these functions can bypass the accessibility safeties.
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go.state, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedRecord = new Proxy(record, {
        set(target, prop, newValue, receiver) {
            const result = Reflect.set(target, prop, newValue, receiver);
            // @ts-expect-error Override accessibility and set the same property on the internal state.
            Reflect.set(go.state[name], prop, newValue?.getRef(), go.state[name]);
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
            } else if (prop === 'reverse') {
                return function(...args) {
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
function CreateUndoArrayInternal<T extends GameObjectBase, TValue extends GameObjectBase>(go: GameObjectBase, prop: string, arr?: TValue[]) {
    let undoArr: UndoArray<TValue>;
    if (arr) {
        undoArr = new UndoArray(...arr);
    } else {
        undoArr = new UndoArray();
    }
    undoArr.go = go;
    undoArr.prop = prop;

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

    return proxiedArray as TValue[];
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
            if (metaState[stateRecordMetadata]) {
                const metaRecords = metaState[stateRecordMetadata] as string[];
                for (const field of metaRecords) {
                    const newValue = (newState[field] as Record<string, GameObjectRef>);
                    instance[field] = to.record(Object.keys(newValue), (key) => key, (key) => instance.game.getFromRef(newValue[key]));
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
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as Map<string, GameObjectRef<TValue>>).set(key, value?.getRef());
        }
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        // @ts-expect-error Overriding state accessibility
        (this.go.state[this.prop] as Map<string, GameObjectRef<TValue>>).delete(key);
        return super.delete(key);
    }

    public override clear(): void {
        // @ts-expect-error Overriding state accessibility
        (this.go.state[this.prop] as Map<string, GameObjectRef<TValue>>).clear(key);
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
        // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).push(...items.map((x) => x.getRef()));
            return super.push(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override unshift(...items: TValue[]): number {
        this.accessing = true;
        try {
        // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).unshift(...items.map((x) => x.getRef()));
            return super.unshift(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override pop(): TValue {
        this.accessing = true;
        try {
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).pop();
            return super.pop();
        } finally {
            this.accessing = false;
        }
    }

    public override shift(): TValue {
        this.accessing = true;
        try {
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).shift();
            return super.shift();
        } finally {
            this.accessing = false;
        }
    }

    public override reverse(): TValue[] {
        this.accessing = true;
        try {
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).reverse();
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
            // @ts-expect-error Overriding state accessibility
            (this.go.state[this.prop] as GameObjectRef<TValue>[]).splice(start, deleteCount);
            return super.splice(start, deleteCount);
        } finally {
            this.accessing = false;
        }
    }

    public override fill(value: TValue, start?: number, end?: number): this {
        throw new Error('Fill is not supported in UndoArray.');
    }
}
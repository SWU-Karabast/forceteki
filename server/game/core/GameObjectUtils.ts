import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
import * as Contract from './utils/Contract.js';

const stateClassesStr: Record<string, string> = {};

export const registerStateClassMarker = Symbol('registerStateClassMarker');
export const registerStateAutoInitializeMarker = Symbol('registerStateAutoInitializeMarker');

declare const __brand: unique symbol;
declare const __gameObjectTypeBrand: unique symbol;

interface Brand<B> {
    [__brand]: B;
}
type Branded<T, B> = T & Brand<B>;

export type GameObjectId<T extends IGameObjectBase = IGameObjectBase> = Branded<string, 'GameObjectId'> & { readonly [__gameObjectTypeBrand]?: T };

export enum CopyMode {

    /** All serialization logic is resolved at generation time and copied field-by-field. */
    CompileTime = 0,

    /** Reserved fallback for runtime structured cloning of opaque state shapes. */
    RuntimeClone = 1
}

export interface RegisterStateOptions {
    copyMode?: CopyMode;
    autoInitialize?: boolean;
}

function normalizeRegisterStateOptions(copyModeOrOptions: CopyMode | RegisterStateOptions | undefined): Required<Pick<RegisterStateOptions, 'autoInitialize'>> {
    if (copyModeOrOptions == null || typeof copyModeOrOptions === 'number') {
        return {
            autoInitialize: true
        };
    }

    return {
        autoInitialize: copyModeOrOptions.autoInitialize ?? true
    };
}

function assertStateAccessorContext<T extends GameObjectBase, TValue>(context: ClassAccessorDecoratorContext<T, TValue>) {
    if (context.static || context.private) {
        throw new Error('Can only serialize public instance members.');
    }
    if (typeof context.name === 'symbol') {
        throw new Error('Cannot serialize symbol-named properties.');
    }
}

function markStateRef(value: GameObjectBase | null | undefined) {
    value?.getObjectId();
}

function markStateRefArray(values: readonly (GameObjectBase | null | undefined)[] | null | undefined) {
    values?.forEach((value) => markStateRef(value));
}

function markStateRefMap(values: Map<string, GameObjectBase> | null | undefined) {
    values?.forEach((value) => markStateRef(value));
}

function markStateRefSet(values: Set<GameObjectBase> | null | undefined) {
    values?.forEach((value) => markStateRef(value));
}

function markStateRefRecord(values: Record<string, GameObjectBase> | null | undefined) {
    if (values) {
        Object.values(values).forEach((value) => markStateRef(value));
    }
}

export function registerState<T extends GameObjectBase>(copyModeOrOptions?: CopyMode | RegisterStateOptions) {
    return function (targetClass: any, context: ClassDecoratorContext) {
        void context;

        const options = normalizeRegisterStateOptions(copyModeOrOptions);
        const parentClass = Object.getPrototypeOf(targetClass);

        if (parentClass?.[registerStateAutoInitializeMarker] === true) {
            throw new Error(`class "${targetClass.name}" cannot extend @registerState class "${parentClass.name}". If a class needs to be both, split the class into a abstract base class and a concrete version (see ExploitCostAdjusterBase and ExploitCostAdjuster).`);
        }

        stateClassesStr[targetClass.name] = parentClass.name;
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

        Object.defineProperty(targetClass, registerStateAutoInitializeMarker, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        const wrappedClass: any = class extends targetClass {
            public constructor(...args: any[]) {
                super(...args);

                this.initialize();
            }
        };

        Object.defineProperty(wrappedClass, 'name', { value: targetClass.name });

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

export function registerStateBase<T extends GameObjectBase>(copyModeOrOptions?: CopyMode | Omit<RegisterStateOptions, 'autoInitialize'>) {
    return registerState<T>({
        autoInitialize: false,
        copyMode: typeof copyModeOrOptions === 'number' ? copyModeOrOptions : copyModeOrOptions?.copyMode
    });
}

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

    Object.defineProperty(wrappedClass, 'name', { value: targetCardClass.name });

    Object.defineProperty(wrappedClass, registerStateClassMarker, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return wrappedClass;
}

export function statePrimitive<T extends GameObjectBase, TValue extends string | number | boolean | null | undefined>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // No need to use the backing fields, read and write directly to state.
        return {
            set(this: T, newValue: TValue) {
                this.game.deltaTracker?.recordFieldChange(this, name);
                target.set.call(this, newValue);
            }
        };
    };
}

type ConstantBoolean<T extends boolean> = boolean extends T ? never : T;

export function stateRefArray<T extends GameObjectBase, TValue extends GameObjectBase, const TReadonly extends boolean>(readonly: ConstantBoolean<TReadonly> = (true as ConstantBoolean<TReadonly>)) {
    return function (
        target: ClassAccessorDecoratorTarget<T, typeof readonly extends true ? readonly TValue[] : TValue[]>,
        context: ClassAccessorDecoratorContext<T, typeof readonly extends true ? readonly TValue[] : TValue[]>
    ): ClassAccessorDecoratorResult<T, typeof readonly extends true ? readonly TValue[] : TValue[]> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        if (readonly) {
            return {
                set(this: T, newValue: TValue[]) {
                    markStateRefArray(newValue);
                    this.game.deltaTracker?.recordFieldChange(this, name);
                    target.set.call(this, newValue);
                },
                init(this: T, value: TValue[]) {
                    markStateRefArray(value);
                    return value;
                }
            };
        }

        return {
            set(this: T, newValue: TValue[]) {
                markStateRefArray(newValue);
                this.game.deltaTracker?.recordFieldChange(this, name);
                target.set.call(this, newValue ? CreateUndoArrayInternal(this, name, newValue) : newValue);
            },
            init(this: T, value: TValue[]) {
                markStateRefArray(value);
                return value ? CreateUndoArrayInternal(this, name) : value;
            }
        };
    };
}

export function stateRefMap<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Map<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, Map<string, TValue>>
    ): ClassAccessorDecoratorResult<T, Map<string, TValue>> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            set(this: GameObjectBase, newValue) {
                markStateRefMap(newValue);
                this.game.deltaTracker?.recordFieldChange(this, name);
                // The below UndoMap instantiation will also load the state map with all of it's values.
                target.set.call(this, newValue ? new UndoMap(this, name, newValue.entries()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoMap cannot be init with entries');
                // If this is not-null, create a equivalent map in the state. Otherwise, leave it as-is.
                return value ? new UndoMap(this, name) : value;
            },
        };
    };
}

export function stateRefSet<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Set<TValue>>,
        context: ClassAccessorDecoratorContext<T, Set<TValue>>
    ): ClassAccessorDecoratorResult<T, Set<TValue>> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        // State stores a Set<string> keyed by UUID so that delete can look up by key.
        return {
            set(this: GameObjectBase, newValue) {
                markStateRefSet(newValue);
                this.game.deltaTracker?.recordFieldChange(this, name);
                // The below UndoSet instantiation will also load the state map with all of its values.
                target.set.call(this, newValue ? new UndoSet(this, name, newValue.values()) : newValue);
            },
            init(this: GameObjectBase, value) {
                Contract.assertTrue(value.size === 0, 'UndoSet cannot be init with entries');
                // If this is not-null, create an equivalent set in the state. Otherwise, leave it as-is.
                return value ? new UndoSet(this, name) : value;
            },
        };
    };
}

export function stateRefRecord<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, Record<string, TValue>>,
        context: ClassAccessorDecoratorContext<T, Record<string, TValue>>
    ): ClassAccessorDecoratorResult<T, Record<string, TValue>> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            set(this: GameObjectBase, newValue) {
                markStateRefRecord(newValue);
                this.game.deltaTracker?.recordFieldChange(this, name);
                target.set.call(this, newValue);
            },
            init(this: GameObjectBase, value) {
                markStateRefRecord(value);
                return value;
            }
        };
    };
}

export function stateRef<T extends GameObjectBase, TValue extends GameObjectBase>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // Use the backing fields as the cache, and write refs to the state.
        return {
            set(this, newValue) {
                markStateRef(newValue);
                this.game.deltaTracker?.recordFieldChange(this, name);
                target.set.call(this, newValue);
            },
            init(this, value) {
                markStateRef(value);
                return value;
            }
        };
    };
}

// STATE TODO: We need to split this out into stateMap, stateSet, and stateArray. Right now this only detects on set, but we need a similar pattern to detect in-place mutations as well.
export function stateValue<T extends GameObjectBase, TValue>() {
    return function (
        target: ClassAccessorDecoratorTarget<T, TValue>,
        context: ClassAccessorDecoratorContext<T, TValue>
    ): ClassAccessorDecoratorResult<T, TValue> {
        assertStateAccessorContext(context);
        const name = context.name as string;

        // No need to use the backing fields, read and write directly to state.
        return {
            set(this: T, newValue: TValue) {
                this.game.deltaTracker?.recordFieldChange(this, name);
                target.set.call(this, newValue);
            },
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
            return result;
        },
        deleteProperty(target, prop: string) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            return true;
        },
    });

    return proxiedRecord;
}

/** @deprecated Uses proxies to cause any in-place mutation functions to also affect the underlying state. */
export function UndoSafeArray<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, arr: readonly TValue[], name: string) {
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedArray = new Proxy(arr, {
        get(target, prop, receiver) {
            if (prop === 'push' || prop === 'unshift' || prop === 'pop' || prop === 'shift' || prop === 'reverse' || prop === 'splice') {
                go.game.deltaTracker?.recordFieldChange(go, name);
            }

            // For other properties, return the original property
            return Reflect.get(target, prop, receiver);
        }
    });

    return proxiedArray as TValue[];
}

export type SafePrimitives = string | number | boolean | GameObjectId | null | undefined;

export function trackArray<T extends GameObjectBase, TValue extends GameObjectBase>(go: T, arr: TValue[], name: string) {
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go, name), 'Property ' + name + ' not found on the state of the GameObject');
    const proxiedArray = new Proxy(arr, {
        // Unsure if only set would suffice, depends on on things that remove elements work.
        set(target, prop, newValue, receiver): boolean {
            go.game.deltaTracker?.recordFieldChange(go, name);
            return Reflect.set(target, prop, newValue, receiver);
        },
        get(target, prop, receiver) {
            if (prop === 'push' || prop === 'unshift' || prop === 'pop' || prop === 'shift' || prop === 'reverse' || prop === 'splice') {
                go.game.deltaTracker?.recordFieldChange(go, name);
            }

            // For other properties, return the original property
            return Reflect.get(target, prop, receiver);
        }
    });

    return proxiedArray;
}

export function trackRecord<T extends GameObjectBase>(go: T, record: Record<string, unknown>, name: string) {
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedRecord = new Proxy(record, {
        set(target, prop, newValue, receiver) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            const result = Reflect.set(target, prop, newValue, receiver);
            return result;
        },
        deleteProperty(target, prop: string) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            return true;
        },
    });

    return proxiedRecord;
}

// ... Does this actually work?
export function trackMap<T extends GameObjectBase>(go: T, map: Map<string, unknown>, name: string) {
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedMap = new Proxy(map, {
        set(target, prop, newValue, receiver) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            return Reflect.set(target, prop, newValue, receiver);
        },
        deleteProperty(target, prop: string) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            return true;
        },
    });

    return proxiedMap;
}

// ... Does this actually work?
export function trackSet<T extends GameObjectBase>(go: T, set: Set<unknown>, name: string) {
    Contract.assertTrue(Object.prototype.hasOwnProperty.call(go, name), 'Property ' + name + ' not found on the state of the GameObject');

    const proxiedSet = new Proxy(set, {
        set(target, prop, newValue, receiver) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            return Reflect.set(target, prop, newValue, receiver);
        },
        deleteProperty(target, prop: string) {
            go.game.deltaTracker?.recordFieldChange(go, name);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[prop];
            return true;
        },
    });

    return proxiedSet;
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

// STATE TODO: These Undo classes no longer need to be GameObjectBase only, instead the decorator can enforce a GameObjectBase version or a primitive only version depending on the needs of the property.
//              The generator can create the GO specific or generic serializer mapping based on the decorator used.


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
            markStateRef(value);
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        }
        return super.set(key, value);
    }

    public override delete(key: string): boolean {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        return super.delete(key);
    }

    public override clear(): void {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
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
            markStateRef(value);
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        }
        return super.add(value);
    }

    public override delete(value: TValue): boolean {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
        return super.delete(value);
    }

    public override clear(): void {
        this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
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
            markStateRefArray(items);
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            return super.push(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override unshift(...items: TValue[]): number {
        this.accessing = true;
        try {
            markStateRefArray(items);
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            return super.unshift(...items);
        } finally {
            this.accessing = false;
        }
    }

    public override pop(): TValue {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            return super.pop();
        } finally {
            this.accessing = false;
        }
    }

    public override shift(): TValue {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
            return super.shift();
        } finally {
            this.accessing = false;
        }
    }

    public override reverse(): TValue[] {
        this.accessing = true;
        try {
            this.go.game.deltaTracker?.recordFieldChange(this.go, this.prop);
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
            return super.splice(start, deleteCount);
        } finally {
            this.accessing = false;
        }
    }

    public override fill(value: TValue, start?: number, end?: number): this {
        throw new Error('Fill is not supported in UndoArray.');
    }
}


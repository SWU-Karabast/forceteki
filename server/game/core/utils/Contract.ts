import assert from 'assert';

export enum AssertMode {
    Assert,
    Log,
}

interface IContractCheckImpl {
    fail(message: string): never;
}

class AssertContractCheckImpl implements IContractCheckImpl {
    public constructor(private readonly breakpoint: boolean) {
    }

    public fail(message: string): never {
        if (this.breakpoint) {
            debugger;
        }

        assert.fail(`Contract assertion failure: ${message}`);
    }
}

// TODO: this is configured like this so we can potentially have configurable settings once we understand the FE needs better
const contractCheckImpl: IContractCheckImpl = new AssertContractCheckImpl(false);

export function assertTrue(cond: boolean, message?: string): asserts cond {
    if (!cond) {
        contractCheckImpl.fail(message ?? 'False condition');
    }
}

export function assertFalse(cond: boolean, message?: string): asserts cond is false {
    if (cond) {
        contractCheckImpl.fail(message ?? 'True condition');
    }
}

export function assertEqual<T>(val1: T, val2: T, message?: string) {
    if (val1 !== val2) {
        contractCheckImpl.fail(message ?? `Value ${val1} is not equal to ${val2}`);
    }
}

export function assertNotEqual<T>(val1: T, val2: T, message?: string) {
    if (val1 === val2) {
        contractCheckImpl.fail(message ?? `Value ${val1} is equal to ${val2}`);
    }
}

export function assertNotNullLike<T>(val: T, message?: string): asserts val is NonNullable<T> {
    if (val == null) {
        contractCheckImpl.fail(message ?? `Null-like object value: ${val}`);
    }
}

export function assertIsNullLike<T>(val: T, message?: string): asserts val is null | undefined {
    if (val != null) {
        contractCheckImpl.fail(message ?? `Expected null-like object value but found: ${val}`);
    }
}

export function assertNotNullLikeOrNan(val?: number, message?: string): asserts val is NonNullable<number> {
    assertNotNullLike(val);
    if (isNaN(val)) {
        contractCheckImpl.fail(message ?? 'NaN value');
    }
}

export function assertHasProperty<T extends object, PropertyName extends string>(obj: T, propertyName: PropertyName, message?: string): asserts obj is NonNullable<T> & Record<PropertyName, any> {
    assertNotNullLike(obj);
    if (!(propertyName in obj)) {
        contractCheckImpl.fail(message ?? `Object does not have property '${propertyName}'`);
    }
}

export function assertArraySize<T>(ara: ReadonlyArray<T>, expectedSize: number, message?: string): asserts ara is NonNullable<T[]> {
    assertNotNullLike(ara);
    if (ara.length !== expectedSize) {
        contractCheckImpl.fail(message ?? `Array size ${ara.length} does not match expected size ${expectedSize}`);
    }
}

export function assertArrayIncludes<T>(ara: ReadonlyArray<T>, element: T, message?: string): asserts ara is NonNullable<T[]> {
    assertNotNullLike(ara);
    if (!ara.includes(element)) {
        contractCheckImpl.fail(message ?? `Array does not contain element ${element}`);
    }
}

export function assertNonEmpty<T>(ara: ReadonlyArray<T>, message?: string): asserts ara is NonNullable<T[]> {
    assertNotNullLike(ara);
    if (ara.length === 0) {
        contractCheckImpl.fail(message ?? 'Array is empty');
    }
}

export function assertStringValue(val: string, message?: string): asserts val is NonNullable<string> {
    assertNotNullLike(val);
    if (val === '') {
        contractCheckImpl.fail(message ?? 'String is empty');
    }
}

export function assertHasKey<TKey>(map: Map<TKey, any>, key: TKey, message?: string): asserts map is NonNullable<Map<TKey, any>> {
    assertNotNullLike(map);
    if (!map.has(key)) {
        contractCheckImpl.fail(message ?? `Map does not contain key ${key}`);
    }
}

export function assertDoesNotHaveKey<TKey>(map: Map<TKey, any>, key: TKey, message?: string): asserts map is NonNullable<Map<TKey, any>> {
    assertNotNullLike(map);
    if (map.has(key)) {
        contractCheckImpl.fail(message ?? `Map should not contain key ${key} but it does`);
    }
}

export function assertPositiveNonZero(val: number, message?: string): asserts val is NonNullable<number> {
    assertNotNullLikeOrNan(val);
    if (val <= 0) {
        contractCheckImpl.fail(message ?? `Expected ${val} to be > 0`);
    }
}

export function assertNonNegative(val: number, message?: string): asserts val is NonNullable<number> {
    assertNotNullLikeOrNan(val);
    if (val < 0) {
        contractCheckImpl.fail(message ?? `Expected ${val} to be >= 0`);
    }
}

export function fail(message: string): never {
    contractCheckImpl.fail(message);
}

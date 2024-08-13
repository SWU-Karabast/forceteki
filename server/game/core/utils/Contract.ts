import assert from 'assert';
import process from 'process';

export enum AssertMode {
    Assert,
    Log,
}

interface IContractCheckImpl {
    fail(message: string): void;
}

class LoggingContractCheckImpl implements IContractCheckImpl {
    constructor(private readonly breakpoint: boolean) {
    }

    fail(message: string): void {
        if (this.breakpoint) {
            debugger;
        }

        console.trace(`Contract assertion failure: ${message}`);
    }
}

class AssertContractCheckImpl implements IContractCheckImpl {
    constructor(private readonly breakpoint: boolean) {
    }

    fail(message: string): void {
        if (this.breakpoint) {
            debugger;
        }

        assert.fail(`Contract assertion failure: ${message}`);
    }
}

let contractCheckImpl: IContractCheckImpl;

// we check env var first and default to logging mode if not set
const debugEnvSetting = process.env.FORCETEKI_DEBUG?.toLowerCase();
if (['true', '1'].includes(debugEnvSetting)) {
    contractCheckImpl = new AssertContractCheckImpl(false);
} else {
    contractCheckImpl = new LoggingContractCheckImpl(false);
}

/**
 * Configure the behavior of the Contract.assert* functions.
 *
 * `AssertMode.Assert` - will trigger an assertion error when a contract check fails
 * `AssertMode.Log` - will log a message with stack trace when a contract check fails
 *
 * @param mode assertion mode
 * @param breakpoint if true, will trigger a debugger breakpoint when a contract check fails
 */
export function configureAssertMode(mode: AssertMode, breakpoint = false): void {
    switch (mode) {
        case AssertMode.Assert:
            contractCheckImpl = new AssertContractCheckImpl(breakpoint);
            break;
        case AssertMode.Log:
            contractCheckImpl = new LoggingContractCheckImpl(breakpoint);
            break;
        default:
            throw new Error(`Unknown contract check mode: ${mode}`);
    }
}

export function assertTrue(cond: boolean, message?: string): boolean {
    if (!cond) {
        contractCheckImpl.fail(message ?? 'False condition');
        return false;
    }
    return true;
}

export function assertFalse(cond: boolean, message?: string): boolean {
    if (cond) {
        contractCheckImpl.fail(message ?? 'True condition');
        return false;
    }
    return true;
}

export function assertEqual(val1: object, val2: object, message?: string): boolean {
    if (!(val1 === val2)) {
        contractCheckImpl.fail(message ?? `Value ${val1} is not equal to ${val2}`);
        return false;
    }
    return true;
}

export function assertNotNull(val: object, message?: string): boolean {
    if (val === null) {
        contractCheckImpl.fail(message ?? 'Null object value');
        return false;
    }
    return true;
}

export function assertNotNullLike(val: any, message?: string): boolean {
    if (val == null) {
        contractCheckImpl.fail(message ?? `Null-like object value: ${val}`);
        return false;
    }
    return true;
}

export function assertNotNullLikeOrNan(val?: number, message?: string): boolean {
    assertNotNullLike(val);
    if (isNaN(val)) {
        contractCheckImpl.fail(message ?? 'NaN value');
        return false;
    }
    return true;
}

export function assertHasProperty(obj: object, propertyName: string, message?: string): boolean {
    assertNotNullLike(obj);
    if (!(propertyName in obj)) {
        contractCheckImpl.fail(message ?? `Object does not have property '${propertyName}'`);
        return false;
    }
    return true;
}

export function assertArraySize(ara: any[], expectedSize: number, message?: string): boolean {
    assertNotNullLike(ara);
    if (ara.length !== expectedSize) {
        contractCheckImpl.fail(message ?? `Array size ${ara.length} does not match expected size ${expectedSize}`);
        return false;
    }
    return true;
}

export function assertNonEmpty(ara: any[], message?: string): boolean {
    assertNotNullLike(ara);
    if (ara.length === 0) {
        contractCheckImpl.fail(message ?? 'Array is empty');
        return false;
    }
    return true;
}

export function assertHasKey<TKey>(map: Map<TKey, any>, key: TKey, message?: string): boolean {
    assertNotNullLike(map);
    if (!map.has(key)) {
        contractCheckImpl.fail(message ?? `Map does not contain key ${key}`);
        return false;
    }
    return true;
}

export function assertPositiveNonZero(val: number, message?: string) {
    if (val <= 0) {
        contractCheckImpl.fail(message ?? `Expected ${val} to be > 0`);
        return false;
    }
    return true;
}

export function assertNonNegative(val: number, message?: string) {
    if (val < 0) {
        contractCheckImpl.fail(message ?? `Expected ${val} to be >= 0`);
        return false;
    }
    return true;
}

export function fail(message: string): void {
    contractCheckImpl.fail(message);
}

const Contract = {
    AssertMode,
    configureAssertMode,
    assertTrue,
    assertFalse,
    assertEqual,
    assertNotNull,
    assertNotNullLike,
    assertNotNullLikeOrNan,
    assertHasProperty,
    assertArraySize,
    assertNonEmpty,
    assertHasKey,
    assertPositiveNonZero,
    assertNonNegative,
    fail
};

export default Contract;

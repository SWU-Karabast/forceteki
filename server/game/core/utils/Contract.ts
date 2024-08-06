import assert from "assert";
import process from "process";

export enum AssertMode {
    Assert,
    Log,
};

interface IContractCheckImpl {
    fail(message: string): void;
};

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
let debugEnvSetting = process.env.FORCETEKI_DEBUG?.toLowerCase();
if (['true', '1'].includes(debugEnvSetting)) {
    contractCheckImpl = new AssertContractCheckImpl(false);
} else {
    contractCheckImpl = new LoggingContractCheckImpl(false);
}

/**
 * Configure the behavior of the Contract.assert* functions.
 * 
 * `AssertMode.Assert` - will throw an error when a contract check fails
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

export function assertTrue(cond: boolean): void {
    if (!cond) {
        contractCheckImpl.fail("False condition");
    }
}

export function assertEqual(val1: object, val2: object): void {
    if (!(val1 === val2)) {
        contractCheckImpl.fail(`Value ${val1} is not equal to ${val2}`);
    }
}

export function assertNotNull(val: object): void {
    if (val === null) {
        contractCheckImpl.fail("Null object value");
    }
}

export function assertNotNullLike(val: object): void {
    if (val == null) {
        contractCheckImpl.fail(`Null-like object value: ${val}`);
    }
}

export function fail(message: string): void {
    contractCheckImpl.fail(message);
}

const Contract = {
    AssertMode,
    configureAssertMode,
    assertTrue,
    assertEqual,
    assertNotNull,
    assertNotNullLike,
    fail
};

export default Contract;
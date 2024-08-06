import assert from "assert";
import process from "process";

interface IContractCheckImpl {
    fail(message: string): void;
};



class ContractChecker {
    constructor(private contractCheckImpl: IContractCheckImpl) {
    }

    assertTrue(cond: boolean): void {
        if (!cond) {
            this.contractCheckImpl.fail("False condition");
        }
    }

    assertEqual(val1: object, val2: object): void {
        if (!(val1 === val2)) {
            this.contractCheckImpl.fail(`Value ${val1} is not equal to ${val2}`);
        }
    }

    assertNotNull(val: object): void {
        if (val === null) {
            this.contractCheckImpl.fail("Null object value");
        }
    }

    assertNotNullLike(val: object): void {
        if (val == null) {
            this.contractCheckImpl.fail(`Null-like object value: ${val}`);
        }
    }
}


let debugEnvSetting = process.env.FORCETEKI_DEBUG?.toLowerCase();
if (['true', '0'].includes(debugEnvSetting)) {
    
}
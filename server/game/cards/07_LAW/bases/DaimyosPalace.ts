import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common SEC bases share the same text
export default class DaimyosPalace extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'daimyos-palace-id',
            internalName: 'daimyos-palace',
        };
    }
}

// TODO: Move these to their own files when we know their real names

export class RedCommonLAWBase extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'red-common-law-base-id',
            internalName: 'red-common-law-base',
        };
    }
}

export class YellowCommonLAWBase extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'yellow-common-law-base-id',
            internalName: 'yellow-common-law-base',
        };
    }
}

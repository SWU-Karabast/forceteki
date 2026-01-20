import { LAWCommonBase } from '../common/LAWCommonBase';

export default class RedCommonLAWBase extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'red-common-law-base-id',
            internalName: 'red-common-law-base',
        };
    }
}

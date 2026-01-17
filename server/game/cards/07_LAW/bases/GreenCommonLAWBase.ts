import { LAWCommonBase } from '../common/LAWCommonBase';

export default class GreenCommonLAWBase extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'green-common-law-base-id',
            internalName: 'green-common-law-base',
        };
    }
}

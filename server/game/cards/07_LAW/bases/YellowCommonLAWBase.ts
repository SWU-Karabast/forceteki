import { LAWCommonBase } from '../common/LAWCommonBase';

export default class YellowCommonLAWBase extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'yellow-common-law-base-id',
            internalName: 'yellow-common-law-base',
        };
    }
}

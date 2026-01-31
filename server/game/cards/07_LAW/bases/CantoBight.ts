import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common SEC bases share the same text
export default class CantoBight extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: 'canto-bight-id',
            internalName: 'canto-bight',
        };
    }
}

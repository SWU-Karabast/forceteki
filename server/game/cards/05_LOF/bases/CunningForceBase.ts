import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class CunningForceBase extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: 'cunning-force-base-id',
            internalName: 'cunning-force-base',
        };
    }
}

import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class AggressionForceBase extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: 'aggression-force-base-id',
            internalName: 'aggression-force-base',
        };
    }
}

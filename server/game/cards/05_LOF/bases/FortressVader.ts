import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class FortressVader extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: 'fortress-vader-id',
            internalName: 'fortress-vader',
        };
    }
}

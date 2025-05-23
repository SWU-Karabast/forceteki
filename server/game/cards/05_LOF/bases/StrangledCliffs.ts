import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class StrangledCliffs extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: '8710346686',
            internalName: 'strangled-cliffs',
        };
    }
}

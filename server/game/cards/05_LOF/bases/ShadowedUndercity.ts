import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class ShadowedUndercity extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: '0119018087',
            internalName: 'shadowed-undercity',
        };
    }
}

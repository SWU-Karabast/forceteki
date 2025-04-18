import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class JediTemple extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: 'temp-jedi-temple-id',
            internalName: 'jedi-temple',
        };
    }
}

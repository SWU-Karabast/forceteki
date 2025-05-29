import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class CrystalCaves extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: '4352576521',
            internalName: 'crystal-caves',
        };
    }
}

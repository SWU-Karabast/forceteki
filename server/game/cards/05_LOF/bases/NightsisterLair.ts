import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class NightsisterLair extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: '2098652813',
            internalName: 'nightsister-lair',
        };
    }
}

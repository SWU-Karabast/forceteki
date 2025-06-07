import { LofCommonForceBase } from '../common/LofCommonForceBase';

// Note: Implementation and test are under the super class since all common LOF bases share the same text
export default class TheHolyCity extends LofCommonForceBase {
    protected override getImplementationId() {
        return {
            id: '3380203065',
            internalName: 'the-holy-city',
        };
    }
}

import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class PartisanHideout extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '1156889063',
            internalName: 'partisan-hideout',
        };
    }
}

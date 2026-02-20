import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class ImperialCommandComplex extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '7297371836',
            internalName: 'imperial-command-complex',
        };
    }
}

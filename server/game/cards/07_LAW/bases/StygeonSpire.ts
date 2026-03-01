import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class StygeonSpire extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '5020919647',
            internalName: 'stygeon-spire',
        };
    }
}

import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class CoaxiumMine extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '6862472986',
            internalName: 'coaxium-mine',
        };
    }
}

import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class ContestedCaverns extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '0121172430',
            internalName: 'contested-caverns',
        };
    }
}

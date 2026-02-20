import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common LAW bases share the same text
export default class AldhaniGarrison extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '2248996839',
            internalName: 'aldhani-garrison',
        };
    }
}

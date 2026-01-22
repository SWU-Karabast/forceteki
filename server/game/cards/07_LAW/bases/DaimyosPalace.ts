import { LAWCommonBase } from '../common/LAWCommonBase';

// Note: Implementation and test are under the superclass since all common SEC bases share the same text
export default class DaimyosPalace extends LAWCommonBase {
    protected override getImplementationId() {
        return {
            id: '5043366366',
            internalName: 'daimyos-palace',
        };
    }
}

import { LOFCommonBase } from '../../../core/card/LOFCommonBase';

export default class ShadowedUndercity extends LOFCommonBase {
    protected override getImplementationId() {
        return {
            id: 'temp-shadowed-undercity-id',
            internalName: 'shadowed-undercity',
        };
    }
}

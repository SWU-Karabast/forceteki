import { LOFCommonBase } from '../../../core/card/LOFCommonBase';

export default class JediTemple extends LOFCommonBase {
    protected override getImplementationId() {
        return {
            id: 'temp-jedi-temple-id',
            internalName: 'jedi-temple',
        };
    }
}

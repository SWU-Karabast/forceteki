import { TokenCard } from '../../../core/card/TokenCards';

export default class ForceToken extends TokenCard {
    protected override getImplementationId() {
        return {
            id: 'temp-force-id',
            internalName: 'force',
        };
    }

    public override isForceToken(): this is ForceToken {
        return true;
    }
}
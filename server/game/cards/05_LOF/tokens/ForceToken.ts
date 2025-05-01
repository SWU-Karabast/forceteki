import { TokenCard } from '../../../core/card/TokenCards';

export default class ForceToken extends TokenCard {
    protected override getImplementationId() {
        return {
            id: '4571900905',
            internalName: 'the-force',
        };
    }

    public override isForceToken(): this is ForceToken {
        return true;
    }
}
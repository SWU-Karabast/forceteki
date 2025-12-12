import { TokenCard } from '../../../core/card/TokenCards';

export default class CreditToken extends TokenCard {
    protected override getImplementationId() {
        return {
            id: 'credit-id',
            internalName: 'credit',
        };
    }

    public override isCreditToken(): this is CreditToken {
        return true;
    }
}

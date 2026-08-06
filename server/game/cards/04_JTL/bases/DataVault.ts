import { BaseCard } from '../../../core/card/BaseCard';

// @no-test-required: base card with no card-level abilities; behavior lives in DeckValidator
export default class DataVault extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '4028826022',
            internalName: 'data-vault',
        };
    }

    // no implementation here, the "implementation" is in DeckValidator
}


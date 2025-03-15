import { BaseCard } from '../../../core/card/BaseCard';

// TODO: tests for this once we have deck validation test framework in place
export default class DataVault extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '4028826022',
            internalName: 'data-vault',
        };
    }

    // no implementation here, the "implementation" is in DeckValidator
}


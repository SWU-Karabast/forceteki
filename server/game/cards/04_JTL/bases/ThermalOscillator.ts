import { BaseCard } from '../../../core/card/BaseCard';

// @no-test-required: base card with no card-level abilities; behavior lives in DeckValidator
export default class ThermalOscillator extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '4301437393',
            internalName: 'thermal-oscillator',
        };
    }

    // no implementation here, the "implementation" is in DeckValidator
}


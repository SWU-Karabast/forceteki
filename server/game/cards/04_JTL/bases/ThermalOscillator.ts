import { BaseCard } from '../../../core/card/BaseCard';

// TODO: tests for this once we have deck validation test framework in place
export default class ThermalOscillator extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '4301437393',
            internalName: 'thermal-oscillator',
        };
    }

    // no implementation here, the "implementation" is in DeckValidator
}


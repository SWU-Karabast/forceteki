import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';

export default class SalaciousCrumbObnoxiousPet extends Card {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }
}

SalaciousCrumbObnoxiousPet.implemented = false;
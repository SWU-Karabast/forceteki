import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';

export default class SalaciousCrumbObnoxiousPet extends Card {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }

    override setupCardAbilities() {
        this.triggeredAbility({
            // UP NEXT: helper fn on Card to get all friendly units in play
            condition: () => countUniqueAspects(this.controller.getUnitsInPlay((card) => card !== this)) >= 3,

            // UP NEXT: convert this to a named effect
            effect: AbilityDsl.ongoingEffects.cardCannot('beAttacked')
        });
    }
}

SalaciousCrumbObnoxiousPet.implemented = false;
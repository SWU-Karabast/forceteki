import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';
import { countUniqueAspects } from '../../core/utils/Helpers';

export default class SabineWrenExplosivesArtist extends Card {
    protected override getImplementationId() {
        return {
            id: '3646264648',
            internalName: 'sabine-wren#explosives-artist',
        };
    }

    override setupCardAbilities() {
        this.constantAbility({
            // UP NEXT: helper fn on Card to get all friendly units in play
            condition: () => countUniqueAspects(this.controller.getUnitsInPlay((card) => card !== this)) >= 3,

            // UP NEXT: convert this to a named effect
            effect: AbilityDsl.ongoingEffects.cardCannot('beAttacked')
        });
    }
}

// sabine is only partially implemented, still need to handle:
// - the effect override if she gains sentinel
// - her active ability
SabineWrenExplosivesArtist.implemented = false;
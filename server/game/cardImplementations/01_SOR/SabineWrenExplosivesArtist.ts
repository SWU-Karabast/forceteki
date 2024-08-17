import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';
import { AbilityRestriction } from '../../core/Constants';
import { countUniqueAspects } from '../../core/utils/Helpers';

export default class SabineWrenExplosivesArtist extends Card {
    protected override getImplementationId() {
        return {
            id: '3646264648',
            internalName: 'sabine-wren#explosives-artist',
        };
    }

    protected override setupCardAbilities() {
        this.constantAbility({
            title: 'Sabine passive',
            condition: () => countUniqueAspects(this.controller.getOtherUnitsInPlay(this, null)) >= 3,

            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });
    }
}

// sabine is only partially implemented, still need to handle:
// - the effect override if she gains sentinel
// - her active ability
SabineWrenExplosivesArtist.implemented = false;
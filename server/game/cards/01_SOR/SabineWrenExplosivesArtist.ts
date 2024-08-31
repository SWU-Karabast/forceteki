import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../core/Constants';
import { countUniqueAspects } from '../../core/utils/Helpers';

export default class SabineWrenExplosivesArtist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3646264648',
            internalName: 'sabine-wren#explosives-artist',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Sabine passive',
            condition: (context) => countUniqueAspects(this.controller.getOtherUnitsInPlay(context.source)) >= 3,

            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });
    }
}

// sabine is only partially implemented, still need to handle:
// - the effect override if she gains sentinel
// - her active ability
SabineWrenExplosivesArtist.implemented = false;
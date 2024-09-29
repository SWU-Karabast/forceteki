import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, CardType, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class SabineWrenExplosivesArtist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3646264648',
            internalName: 'sabine-wren#explosives-artist',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Cannot be attacked if friendly units have at least 3 unique aspects',
            condition: (context) => Helpers.countUniqueAspects(this.controller.getOtherUnitsInPlay(context.source)) >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });

        this.addOnAttackAbility({
            title: 'Deal 1 damage to the defender or a base',
            targetResolver: {
                cardCondition: (card, context) => card.isBase() || card === context.event.attack.target,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

// sabine is only partially implemented, still need to handle:
// - the effect override if she gains sentinel
SabineWrenExplosivesArtist.implemented = false;

import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class EnfysNestChampionOfJustice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8414572243',
            internalName: 'enfys-nest#champion-of-justice',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return an enemy non-leader unit with less power than this unit to its owner\'s hand',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isNonLeaderUnit() && card.getPower() < context.source.getPower(),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

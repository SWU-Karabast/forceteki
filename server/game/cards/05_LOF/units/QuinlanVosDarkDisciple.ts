import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class QuinlanVosDarkDisciple extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'quinlan-vos#dark-disciple-id',
            internalName: 'quinlan-vos#dark-disciple',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to an enemy base',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.getPower() >= 6,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            },
        });
    }
}
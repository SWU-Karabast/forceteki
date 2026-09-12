import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HunterEveryoneGetToCover extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'hunter#everyone-get-to-cover-id',
            internalName: 'hunter#everyone-get-to-cover'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose two. You may choose the same option more than once',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                canChooseSameOptionMoreThanOnce: true,
                choices: {
                    ['Give a Shield token to a unit.']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveShield()
                    }),
                    ['Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.attack({
                            targetCondition: (card) => !card.isBase(),
                            allowExhaustedAttacker: true,
                        })
                    }),
                }
            })
        });
    }
}

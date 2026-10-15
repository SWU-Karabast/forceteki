import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class WattoNoMoneyNoPartsNoDeal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8426772148',
            internalName: 'watto#no-money-no-parts-no-deal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Your opponent chooses an effect',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                choosingPlayer: RelativePlayer.Opponent,
                choices: {
                    ['Opponent gives an Experience token to a friendly unit']:
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: 'Give an Experience token to a friendly unit',
                            cardTypeFilter: WildcardCardType.Unit,
                            controller: RelativePlayer.Self,
                            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                        }),
                    ['Opponent draws a card']:
                        AbilityHelper.immediateEffects.draw({ amount: 1 }),
                }
            })
        });
    }
}
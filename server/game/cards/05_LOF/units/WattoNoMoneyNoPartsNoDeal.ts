import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class WattoNoMoneyNoPartsNoDeal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8426772148',
            internalName: 'watto#no-money-no-parts-no-deal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'An opponent chooses if you give an experience token to a friendly or draw a card',
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Opponent,
                choices: () => ({
                    ['Opponent give an Experience token to a friendly unit']:
                        AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.Unit,
                            controller: RelativePlayer.Self,
                            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                        }),
                    ['Opponent draws a card']:
                        AbilityHelper.immediateEffects.draw({ amount: 1 }),
                })
            }
        });
    }
}
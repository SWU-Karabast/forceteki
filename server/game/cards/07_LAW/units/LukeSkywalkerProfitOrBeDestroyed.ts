import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class LukeSkywalkerProfitOrBeDestroyed extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'luke-skywalker#profit-or-be-destroyed-id',
            internalName: 'luke-skywalker#profit-or-be-destroyed',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent chooses if you create a Credit token and ready this unit or if may deal 5 damage to a unit',
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Opponent,
                choices: (context) => ({
                    [`${context.player.name} create a Credit token and ready this unit`]:
                        abilityHelper.immediateEffects.simultaneous([
                            abilityHelper.immediateEffects.createCreditToken(),
                            abilityHelper.immediateEffects.ready()
                        ]),
                    [`${context.player.name} may deal 5 damage to a unit`]:
                        abilityHelper.immediateEffects.selectCard({
                            optional: true,
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: abilityHelper.immediateEffects.damage({ amount: 5 })
                        })
                })
            }
        });
    }
}

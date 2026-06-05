import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class BarrissOffeeRedeemingHerself extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1853815084',
            internalName: 'barriss-offee#redeeming-herself',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal up to 2 damage from a unit. Give an Advantage token to it for each damage healed this way',
            immediateEffect: abilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 2,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Advantage token to that unit for each damage healed this way',
                ifYouDoCondition: () => ifYouDoContext.events[0].totalDistributed > 0,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage({
                    amount: ifYouDoContext.events[0].totalDistributed,
                    target: ifYouDoContext.events[0].card
                })
            })
        });
    }
}

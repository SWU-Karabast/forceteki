import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EmperorPalpatineConsolidatingPower extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'emperor-palpatine#consolidating-power-id',
            internalName: 'emperor-palpatine#consolidating-power',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Take control of an enemy non-leader unit that costs 3 or less',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    newController: context.player
                }))

            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give 2 Weakness tokens to it',
                immediateEffect: abilityHelper.immediateEffects.giveWeakness({
                    amount: 2,
                    target: ifYouDoContext.target
                })
            })
        });
    }
}
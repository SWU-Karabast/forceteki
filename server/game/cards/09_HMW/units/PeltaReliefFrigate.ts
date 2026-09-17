import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PeltaReliefFrigate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3340474751',
            internalName: 'pelta-relief-frigate'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 2 damage from a friendly base and 2 damage from an friendly unit',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
                }),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            ])
        });
    }
}

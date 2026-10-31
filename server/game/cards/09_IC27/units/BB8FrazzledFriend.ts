import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BB8FrazzledFriend extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bb8#frazzled-friend-id',
            internalName: 'bb8#frazzled-friend',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Heal 1 damage from a friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to an enemy unit',
                ifYouDoCondition: () => ifYouDoContext.events[0].damageHealed > 0,
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }
}
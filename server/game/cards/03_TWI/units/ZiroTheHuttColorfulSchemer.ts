import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ZiroTheHuttColorfulSchemer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4489623180',
            internalName: 'ziro-the-hutt#colorful-schemer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust an enemy unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });

        registrar.addOnAttackAbility({
            title: 'Exhaust an enemy resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaustResources({ amount: 1 }),
        });
    }
}

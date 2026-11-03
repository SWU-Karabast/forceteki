import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AhsokaTanoNotOnMyDeathWatch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ahsoka-tano#not-on-my-death-watch-id',
            internalName: 'ahsoka-tano#not-on-my-death-watch',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a unit that costs 3 or less',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasCost() && card.cost <= 3,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
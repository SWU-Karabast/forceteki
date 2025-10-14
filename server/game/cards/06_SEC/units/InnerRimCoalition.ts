import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class InnerRimCoalition extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'inner-rim-coalition-id',
            internalName: 'inner-rim-coalition'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Ready a unit that costs 5 or less',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasCost() && card.cost <= 5,
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}

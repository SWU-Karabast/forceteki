import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeonosisPatrolFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3348783048',
            internalName: 'geonosis-patrol-fighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a non-leader unit that costs 3 or less to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}

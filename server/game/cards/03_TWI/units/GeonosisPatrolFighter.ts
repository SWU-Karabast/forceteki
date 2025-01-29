import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeonosisPatrolFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3348783048',
            internalName: 'geonosis-patrol-fighter',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return a non-leader unit that costs 3 or less to its owner\'s hand',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}

GeonosisPatrolFighter.implemented = true;
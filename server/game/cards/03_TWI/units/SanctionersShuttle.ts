import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer } from '../../../core/Constants';

export default class SanctionersShuttle extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4512764429',
            internalName: 'sanctioners-shuttle',
        };
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'This unit captures an enemy non-leader unit that costs 3 or less. ',
            when: {
                whenPlayed: true,
            },
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });
    }
}

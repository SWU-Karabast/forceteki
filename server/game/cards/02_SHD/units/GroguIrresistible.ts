import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class GroguIrresistible extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6536128825',
            internalName: 'grogu#irresistible'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Exhaust an enemy unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

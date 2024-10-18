import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer } from '../../../core/Constants';

export default class Crosshair extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1885628519',
            internalName: 'crosshair#following-orders'
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Get +1/+0 for this phase',
            cost: AbilityHelper.costs.abilityResourceCost(2),
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
            })
        });

        this.addActionAbility({
            title: 'Deal damage equal to his power to an enemy ground unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Opponent,
                locationFilter: Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: context.source.getPower() }))
            }
        });
    }
}

Crosshair.implemented = true;

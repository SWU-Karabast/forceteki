import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CompassionateSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5157630261',
            internalName: 'compassionate-senator'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Heal 2 damage from a unit or base',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityResourceCost(2)],
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}

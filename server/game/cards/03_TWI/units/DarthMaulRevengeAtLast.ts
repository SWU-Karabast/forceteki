import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DarthMaulRevengeAtLast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8613680163',
            internalName: 'darth-maul#revenge-at-last'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit can attack 2 units instead of 1',
            ongoingEffect: AbilityHelper.ongoingEffects.canAttackMultipleUnitsSimultaneously({
                amount: 2
            })
        });
    }
}

import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class IndependentSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9262288850',
            internalName: 'independent-senator'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Exhaust a unit with 4 or less power.',
            cost: [AbilityHelper.costs.abilityResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.getPower() <= 4,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

IndependentSenator.implemented = true;

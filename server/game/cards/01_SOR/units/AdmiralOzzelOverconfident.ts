import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardLocation } from '../../../core/Constants';

export default class AdmiralOzzelOverconfident extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8117080217',
            internalName: 'admiral-ozzel#overconfident'
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Play an Imperial unit from your hand. It enters play ready',
            cost: AbilityHelper.costs.exhaustSelf()
        });
    }
}

AdmiralOzzelOverconfident.implemented = true;
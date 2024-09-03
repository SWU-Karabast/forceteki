import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { WildcardLocation } from '../../core/Constants';

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
                locationFilter: WildcardLocation.AnyArena,
                cardCondition: (card) => card.controller !== this.controller,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

GroguIrresistible.implemented = true;
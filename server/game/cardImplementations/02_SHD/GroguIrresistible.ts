import AbilityHelper from '../../AbilityHelper';
import { UnitCard } from '../../core/card/UnitCard';

export default class GroguIrresistible extends UnitCard {
    protected override getImplementationId() {
        return {
            id: '6536128825',
            internalName: 'grogu#irresistible'
        };
    }

    public override setupCardAbilities() {
        this.actionAbility({
            title: 'Exhaust an enemy unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardCondition: (card) => card.controller !== this.controller,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

GroguIrresistible.implemented = true;
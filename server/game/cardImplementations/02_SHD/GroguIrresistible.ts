import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';

export default class GroguIrresistible extends Card {
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
                gameSystem: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

GroguIrresistible.implemented = true;
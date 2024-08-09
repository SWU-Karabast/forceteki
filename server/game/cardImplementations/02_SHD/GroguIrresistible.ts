import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';
import { CardType } from '../../core/Constants';

export default class GroguIrresistible extends Card {
    protected override getImplementationId() {
        return {
            id: '6536128825',
            internalName: 'grogu#irresistible'
        };
    }

    override setupCardAbilities() {
        this.actionAbility({
            title: 'Exhaust an enemy unit',
            cost: AbilityDsl.costs.exhaustSelf(),
            target: {
                cardCondition: (card) => card.controller !== this.controller,
                gameSystem: AbilityDsl.immediateEffects.exhaust()
            }
        });
    }
}
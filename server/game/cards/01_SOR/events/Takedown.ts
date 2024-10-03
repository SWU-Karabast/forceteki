import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Takedown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2587711125',
            internalName: 'make-an-opening',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat an unit with 5 or less remaining HP',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, _) => card.isUnit() && card.getHp() <= 5,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}

Takedown.implemented = true;

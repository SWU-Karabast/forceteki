import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CrushingBlow extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'crushing-blow-id',
            internalName: 'crushing-blow',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Defeat a non-leader unit that costs 2 or less',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}

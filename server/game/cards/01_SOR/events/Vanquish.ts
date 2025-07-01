import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Vanquish extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6472095064',
            internalName: 'vanquish',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Defeat a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

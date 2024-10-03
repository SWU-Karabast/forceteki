import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Takedown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4849184191',
            internalName: 'takedown',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat a unit with 5 or less remaining HP',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, _) => card.isUnit() && card.remainingHp <= 5,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}

Takedown.implemented = true;

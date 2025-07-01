import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CoveringTheWing extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2579248092',
            internalName: 'covering-the-wing',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Create an X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.createXWing(),
            then: (thenContext) => ({
                title: 'Give a Shield token to another unit',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== thenContext.events[0]?.generatedTokens[0],
                    immediateEffect: AbilityHelper.immediateEffects.giveShield(),
                })
            })
        });
    }
}


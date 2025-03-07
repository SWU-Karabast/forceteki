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

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Create an X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.createXWing(),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give a Shield token to another unit',
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.events[0]?.generatedTokens[0],
                    innerSystem: AbilityHelper.immediateEffects.giveShield()
                })
            ])
        });
    }
}


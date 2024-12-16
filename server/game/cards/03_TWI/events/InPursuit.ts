import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class InPursuit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6401761275',
            internalName: 'in-pursuit'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, exhaust an enemy unit.',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && !card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'Choose an enemy unit',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            }
        });
    }
}

InPursuit.implemented = true;

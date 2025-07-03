import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { ZoneName } from '../../../core/Constants';

export default class CommencePatrol extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8323555870',
            internalName: 'commence-patrol',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Put another card in a discard pile on the bottom of its owner\'s deck. If you do, create an X-Wing token',
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
            },
            ifYouDo: {
                title: 'Create an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing()
            }
        });
    }
}


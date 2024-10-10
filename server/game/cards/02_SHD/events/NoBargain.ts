import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Location, RelativePlayer } from '../../../core/Constants';

export default class NoBargain extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7354795397',
            internalName: 'no-bargain',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Each opponent discards a card from their hand. Draw a card',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                choosingPlayer: RelativePlayer.Opponent,
                locationFilter: Location.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.discardCard(),
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller, amount: 1 }))
                ])
            },
        });
    }
}

NoBargain.implemented = true;

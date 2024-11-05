import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Location, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class Pillage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4772866341',
            internalName: 'pillage',
        };
    }

    public override setupCardAbilities() {
        // this.setEventAbility({
        //     title: 'Choose a player. They discard 2 cards from their hand.',
        //     targetResolver: {
        //         mode: TargetMode.Player,
        //     },
        //     then: (thenContext) => {
        //         const targetPlayer = thenContext.target === this.controller ? RelativePlayer.Self : RelativePlayer.Opponent;
        //         return {
        //             title: 'Discard 2 cards from your hand',
        //             immediateEffect: AbilityHelper.immediateEffects.discardCardsFromHand({ target: thenContext.target, amount: 2 }),
        //         };
        //     }
        // });
        this.setEventAbility({
            title: 'Choose a player. They discard 2 cards from their hand.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromHand({ amount: 2 }),
        });
    }
}

Pillage.implemented = true;

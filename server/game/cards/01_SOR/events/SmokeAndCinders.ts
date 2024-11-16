import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class SmokeAndCinders extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6702266551',
            internalName: 'smoke-and-cinders',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Each player discards all but 2 cards from their hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                (context) => context.game.getPlayers().map((player) =>
                    AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                        target: player,
                        amount: (player) => Math.max(0, player.hand.length - 2)
                    })
                )
            )
        });
    }
}

SmokeAndCinders.implemented = true;

import { CardTypes, Durations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import BaseCard from '../../../basecard';

export default class FortunesField extends ProvinceCard {
    static id = 'fortune-s-field';

    public setupCardAbilities() {
        this.reaction({
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player && event.card.type === CardTypes.Character
            },
            title: 'Reduce cost of next character or follower by 1',
            effect: 'reduce the cost of their next character or follower this round by 1',
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                targetController: context.player,
                duration: Durations.UntilEndOfRound,
                effect: AbilityDsl.effects.reduceNextPlayedCardCost(
                    1,
                    (card: BaseCard) => card.type === CardTypes.Character || card.hasTrait('follower')
                )
            }))
        });
    }
}

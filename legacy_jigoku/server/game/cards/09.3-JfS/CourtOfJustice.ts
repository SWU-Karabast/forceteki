import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class CourtOfJustice extends DrawCard {
    static id = 'court-of-justice';

    public setupCardAbilities() {
        this.reaction({
            title: "Look at 3 random cards of the opponent's hand",
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.player &&
                    event.conflict.conflictType === 'political' &&
                    context.player.opponent !== undefined
            },
            gameAction: AbilityDsl.actions.lookAt((context) => ({
                target: context.player.opponent.hand.shuffle().slice(0, 3),
                message: "reveals {0} from {1}'s hand.",
                messageArgs: (cards) => [cards, context.player.opponent]
            })),
            effect: "look at 3 random cards from {1}'s hand.",
            effectArgs: (context) => context.player.opponent
        });
    }
}

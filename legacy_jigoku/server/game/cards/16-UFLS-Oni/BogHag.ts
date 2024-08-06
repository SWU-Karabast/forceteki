import AbilityDsl = require('../../abilitydsl');
import { BaseOni } from './_BaseOni';

export default class BogHag extends BaseOni {
    static id = 'bog-hag';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Discard from the conflict deck',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    context.player.opponent &&
                    context.player.opponent.conflictDeck.size() > 0
            },
            gameAction: AbilityDsl.actions.discardCard((context) => ({
                target: context.player.opponent.conflictDeck.first(8)
            })),
            effect: "discard the top 8 cards of {1}'s conflict deck",
            effectArgs: (context) => [context.player.opponent]
        });
    }
}

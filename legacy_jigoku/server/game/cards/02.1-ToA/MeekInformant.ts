import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class MeekInformant extends DrawCard {
    static id = 'meek-informant';

    public setupCardAbilities() {
        this.reaction({
            title: "Look at opponent's hand",
            when: {
                onCardPlayed: (event, context) => event.card === context.source && context.player.opponent !== undefined
            },
            effect: "look at {1}'s hand",
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.lookAt((context) => ({
                target: context.player.opponent.hand.sortBy((card: DrawCard) => card.name),
                chatMessage: true
            }))
        });
    }
}

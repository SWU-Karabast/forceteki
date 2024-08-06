import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class PerceptiveKitsuki extends DrawCard {
    static id = 'perceptive-kitsuki';

    public setupCardAbilities() {
        this.action({
            title: "Look at your opponent's hand",
            condition: (context) => context.source.isParticipating() && context.player.opponent !== undefined,
            cost: AbilityDsl.costs.returnRings(1),
            effect: "look at {1}'s hand",
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.lookAt((context) => ({
                target: context.player.opponent.hand.sortBy((card: DrawCard) => card.name),
                chatMessage: true
            }))
        });
    }
}

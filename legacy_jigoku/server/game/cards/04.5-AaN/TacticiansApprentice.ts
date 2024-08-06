import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class TacticiansApprentice extends DrawCard {
    static id = 'tactician-s-apprentice';

    public setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            when: {
                onHonorDialsRevealed: (event, context) =>
                    event.isHonorBid &&
                    // lower bid than opponent
                    context.player.opponent &&
                    context.player.showBid < context.player.opponent.showBid
            },
            effect: 'draw a card',
            gameAction: AbilityDsl.actions.draw(),
            limit: AbilityDsl.limit.perPhase(1)
        });
    }
}

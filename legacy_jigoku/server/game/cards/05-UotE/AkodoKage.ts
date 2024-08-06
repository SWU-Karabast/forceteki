import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class AkodoKage extends DrawCard {
    static id = 'akodo-kage';

    setupCardAbilities() {
        this.reaction({
            title: "Set your opponent's dial to equal yours",
            when: {
                onHonorDialsRevealed: (event, context) =>
                    event.isHonorBid &&
                    context.player.opponent &&
                    context.player.honorBid < context.player.opponent.honorBid &&
                    context.player.isMoreHonorable()
            },
            gameAction: AbilityDsl.actions.setHonorDial((context) => ({ value: context.player.showBid }))
        });
    }
}

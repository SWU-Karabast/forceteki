import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class ShrewdInvestigator extends DrawCard {
    static id = 'shrewd-investigator';

    setupCardAbilities() {
        this.action({
            title: "Look at random cards from your opponent's hand",
            condition: (context) => context.source.isParticipating() && context.player.opponent !== undefined,
            gameAction: AbilityDsl.actions.lookAt((context) => ({
                target: context.player.opponent.hand
                    .shuffle()
                    .slice(0, context.player.getNumberOfFacedownProvinces())
                    .sort((a: DrawCard, b: DrawCard) => a.name.localeCompare(b.name))
            })),
            effect: "look at {1} random card{3} in {2}'s hand",
            effectArgs: (context) => [
                context.player.getNumberOfFacedownProvinces(),
                context.player.opponent,
                context.player.getNumberOfFacedownProvinces() === 1 ? '' : 's'
            ]
        });
    }
}

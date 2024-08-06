import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class GoblinSneak extends DrawCard {
    static id = 'goblin-sneak';

    public setupCardAbilities() {
        this.reaction({
            title: 'Steal a fate',
            when: {
                onCharacterEntersPlay: (event, context) =>
                    event.card === context.source && context.player.opponent !== undefined
            },
            effect: 'take a fate from {1} and place it on {0}',
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.placeFate((context) => ({
                origin: context.player.opponent
            }))
        });
    }
}

import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class GregariousWard extends DrawCard {
    static id = 'gregarious-ward';

    public setupCardAbilities() {
        this.reaction({
            title: 'Gain fate',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    context.game.currentConflict.hasMoreParticipants(context.player)
            },
            gameAction: AbilityDsl.actions.placeFate(),
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}

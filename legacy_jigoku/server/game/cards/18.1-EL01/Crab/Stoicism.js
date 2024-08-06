const DrawCard = require('../../../drawcard.js');
const { Durations } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl.js');

class Stoicism extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Ignore the effects of status tokens',
            condition: context => context.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.conflictLastingEffect({
                duration: Durations.UntilEndOfConflict,
                effect: AbilityDsl.effects.conflictIgnoreStatusTokens()
            }),
            effect: 'ignore the effects of status tokens until the end of the conflict'
        });
    }
}

Stoicism.id = 'stoicism';

module.exports = Stoicism;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations } = require('../../Constants');

class ExemplaryEtiquette extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Stop characters from triggering abilities',
            condition: () => this.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.conflictLastingEffect({
                duration: Durations.UntilEndOfConflict,
                effect: AbilityDsl.effects.charactersCannot({
                    cannot: 'triggerAbilities'
                })
            }),
            effect: 'make it so that characters cannot trigger abilities this conflict'
        });
    }
}

ExemplaryEtiquette.id = 'exemplary-etiquette';

module.exports = ExemplaryEtiquette;

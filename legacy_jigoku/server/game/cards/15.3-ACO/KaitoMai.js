const DrawCard = require('../../drawcard.js');
const { CardTypes, Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class KaitoMai extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.modifyGlory(3)
        });

        this.reaction({
            title: 'Remove a fate',
            when: {
                onMoveFate: (event, context) =>
                    event.origin === context.source && event.fate > 0 && context.game.currentPhase !== Phases.Fate
            },
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.removeFate({amount: 1})
            }
        });
    }
}

KaitoMai.id = 'kaito-mai';

module.exports = KaitoMai;

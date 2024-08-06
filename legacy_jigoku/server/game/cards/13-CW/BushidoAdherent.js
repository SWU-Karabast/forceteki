const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class BushidoAdherent extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor a character',
            condition: context => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.honor()
            },
            gameAction: AbilityDsl.actions.draw(context => ({ target: context.player.opponent })),
            effect: 'honor {0} and have {1} draw 1 card',
            effectArgs: context => context.player.opponent
        });
    }
}

BushidoAdherent.id = 'bushido-adherent';

module.exports = BushidoAdherent;

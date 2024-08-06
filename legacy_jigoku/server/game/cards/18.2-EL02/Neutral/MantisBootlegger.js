const DrawCard = require('../../../drawcard.js');
const { CardTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class MantisBootlegger extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Gain 1 fate',
            condition: (context) => this.numCharactersWithAttachments(context) >= 3,
            gameAction: AbilityDsl.actions.gainFate()
        });
    }

    numCharactersWithAttachments(context) {
        return context.player.cardsInPlay.filter(
            (card) => card.getType() === CardTypes.Character && card.attachments.length > 0
        ).length;
    }
}

MantisBootlegger.id = 'mantis-bootlegger';
module.exports = MantisBootlegger;

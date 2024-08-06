const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ExposedSecrets extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow attacking character',
            condition: context => context.game.isDuringConflict('political'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating() && card.getPoliticalSkill() <= card.controller.showBid,
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}

ExposedSecrets.id = 'exposed-secrets';

module.exports = ExposedSecrets;

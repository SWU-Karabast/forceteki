const DrawCard = require('../../drawcard.js');
const { CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class HidaBackbreaker extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Dishonor a character',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller &&
                                                   context.source.isParticipating() && context.game.isDuringConflict('military')
            },
            target: {
                activePromptTitle: 'Choose a character to dishonor',
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }

    allowAttachment(attachment) {
        if(attachment.controller === this.controller.opponent) {
            return false;
        }

        return super.allowAttachment(attachment);
    }
}

HidaBackbreaker.id = 'hida-backbreaker';

module.exports = HidaBackbreaker;

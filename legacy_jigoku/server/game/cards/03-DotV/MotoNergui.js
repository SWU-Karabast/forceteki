const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class MotoNergui extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move highest glory character home',
            condition: context => this.game.isDuringConflict('military') && context.source.isParticipating(),
            target: {
                cardCondition: (card, context) => {
                    let participants = context.game.currentConflict.getParticipants();
                    return participants.includes(card) && card.getGlory() === Math.max(...participants.map(c => c.getGlory()));
                },
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}

MotoNergui.id = 'moto-nergui';

module.exports = MotoNergui;

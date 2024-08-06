const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class BetrayalOfTruth extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow honored and dishonored characters',
            condition: context => context.game.isDuringConflict() && context.game.findAnyCardsInPlay(card => card.isParticipating() && !card.isOrdinary()).length > 0,
            gameAction: AbilityDsl.actions.bow(context => ({
                target: context.game.findAnyCardsInPlay(card => card.isParticipating() && !card.isOrdinary())
            }))
        });
    }
}

BetrayalOfTruth.id = 'betrayal-of-truth';

module.exports = BetrayalOfTruth;

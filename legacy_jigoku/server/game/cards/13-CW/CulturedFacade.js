const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class CulturedFacade extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Prevent targetting',
            condition: () => this.game.isDuringConflict(),
            effect: 'prevent characters from being targetted by events played by players with a higher bid value than that of the character\'s controller',
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                target: context.game.currentConflict.getParticipants(),
                effect: ability.effects.cardCannot({
                    cannot: 'target',
                    restricts: 'eventPlayedByHigherBidPlayer'
                })
            }))
        });
    }
}

CulturedFacade.id = 'cultured-facade';

module.exports = CulturedFacade;

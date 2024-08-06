const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class ScholarOfOldRempet extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Make character immune to events',
            condition: () => this.game.isDuringConflict(),
            cost: AbilityDsl.costs.payHonor(1),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => !card.isUnique(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.immunity({ restricts: 'events' })
                })
            },
            effect: 'make {0} immune to events'
        });
    }
}

ScholarOfOldRempet.id = 'scholar-of-old-rempet';

module.exports = ScholarOfOldRempet;

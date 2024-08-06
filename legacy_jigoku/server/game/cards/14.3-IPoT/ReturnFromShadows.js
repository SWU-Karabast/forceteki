const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ReturnFromShadows extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Blank and reveal a province',
            max: AbilityDsl.limit.perConflict(1),
            when: {
                afterConflict: (event, context) => event.conflict && event.conflict.winner === context.player && event.conflict.conflictUnopposed
            },
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                cardCondition: (card, context) => context.game.currentConflict && context.game.currentConflict.loser && card.controller === context.game.currentConflict.loser,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.dishonorProvince(),
                    AbilityDsl.actions.reveal({ chatMessage: true })
                ])
            }
        });
    }
}

ReturnFromShadows.id = 'return-from-shadows';

module.exports = ReturnFromShadows;

const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class AkodoReserveCompany extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow an attacking character',
            condition: context => context.game.isDuringConflict() && context.game.isTraitInPlay('battlefield'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && card.controller === context.player,
                gameAction: AbilityDsl.actions.joint([
                    AbilityDsl.actions.moveToConflict(context => ({ target: context.source })),
                    AbilityDsl.actions.sendHome()
                ])
            }
        });
    }
}

AkodoReserveCompany.id = 'akodo-reserve-company';

module.exports = AkodoReserveCompany;

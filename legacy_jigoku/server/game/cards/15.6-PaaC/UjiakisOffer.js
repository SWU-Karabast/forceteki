const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class UjiakisOffer extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Place a fate on a participating character, bow it, move it home, and dishonor it',
            condition: context => context.game.isDuringConflict('political'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && context.player.cardsInPlay.some(myCard => (
                    myCard.isParticipating() && myCard.printedCost >= card.printedCost)),
                gameAction: AbilityDsl.actions.placeFate()
            },
            then: context => ({
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.bow({target: context.target}),
                    AbilityDsl.actions.dishonor({target: context.target}),
                    AbilityDsl.actions.sendHome({target: context.target})
                ])
            }),
            effect: 'place a fate on {0} then bow, dishonor, and move them home.'
        });
    }
}

UjiakisOffer.id = 'ujiaki-s-offer';
module.exports = UjiakisOffer;

const DrawCard = require('../../drawcard.js');
const { CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class WayOfTheOpenHand extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Send home opponent\'s character',
            condition: context => context.game.isDuringConflict() && !context.game.currentConflict.getConflictProvinces().some(a => a.location === Locations.StrongholdProvince),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && card.controller !== context.player,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.sendHome(),
                    AbilityDsl.actions.placeFate()
                ])
            },
            effect: 'send home and place a fate on {0}'
        });
    }
}

WayOfTheOpenHand.id = 'way-of-the-open-hand';

module.exports = WayOfTheOpenHand;

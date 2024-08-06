const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations } = require('../../Constants');

class ShosuroHyobu extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Dishonor a character',
            when: {
                onCardsDiscardedFromHand: (event, context) =>
                    event.cards && event.cards.some(a => a.owner === context.player.opponent) && event.context.ability.isCardAbility(),
                onCardsDiscarded: (event, context) =>
                    event.cards && event.originalCardStateInfo && event.originalCardStateInfo.some(a => a.location === Locations.Hand && a.owner === context.player.opponent) && event.context.ability.isCardAbility()
            },
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}

ShosuroHyobu.id = 'shosuro-hyobu';

module.exports = ShosuroHyobu;

const DrawCard = require('../../../drawcard.js');
const { CardTypes, Locations } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class RestorativeHotSpring extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent a character from leaving play',
            cost: AbilityDsl.costs.payFate(1),
            when: {
                onCardLeavesPlay: (event, context) => event.card.controller === context.player && event.card.type === CardTypes.Character && event.card.location === Locations.PlayArea
            },
            effect: 'prevent {1} from leaving play, removing itself from the game instead',
            effectArgs: context => context.event.card,
            gameAction: AbilityDsl.actions.cancel({
                replacementGameAction: AbilityDsl.actions.removeFromGame(context => ({ target: context.source }))
            })
        });
    }
}

RestorativeHotSpring.id = 'restorative-hot-spring';

module.exports = RestorativeHotSpring;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants.js');

class EarthBecomesSky extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Bow a character that just readied',
            when: {
                onCardReadied: (event, context) =>
                    event.card.type === CardTypes.Character && event.card.controller === context.player.opponent
            },
            // @ts-ignore
            gameAction: AbilityDsl.actions.bow((context) => ({ target: context.event.card }))
        });
    }
}

EarthBecomesSky.id = 'earth-becomes-sky';

module.exports = EarthBecomesSky;

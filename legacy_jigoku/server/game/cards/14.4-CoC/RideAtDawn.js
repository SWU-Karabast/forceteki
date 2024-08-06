const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class RideAtDawn extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Make opponent discard a card',
            when: {
                onPassDuringDynasty: (event, context) => event.player === context.player && context.player.opponent && !context.player.opponent.passedDynasty
            },
            gameAction: AbilityDsl.actions.discardAtRandom(context => ({ target: context.player.opponent }))
        });
    }
}

RideAtDawn.id = 'ride-at-dawn';

module.exports = RideAtDawn;

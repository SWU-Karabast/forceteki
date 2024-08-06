const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKey = 'kudaka-air';

class Kudaka extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Gain 1 fate and draw 1 card',
            limit: AbilityDsl.limit.perRound(2),
            effect: 'gain 1 fate and draw 1 card',
            when: {
                onClaimRing: (event, context) => ((event.conflict && event.conflict.hasElement(this.getCurrentElementSymbol(elementKey))) || event.ring.hasElement(this.getCurrentElementSymbol('kudaka-air'))) && event.player === context.player
            },
            gameAction: [AbilityDsl.actions.gainFate(), AbilityDsl.actions.draw()]
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Air
        });
        return symbols;
    }
}

Kudaka.id = 'kudaka';

module.exports = Kudaka;

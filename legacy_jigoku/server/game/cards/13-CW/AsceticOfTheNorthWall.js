const DrawCard = require('../../drawcard.js');
const { Phases, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

const elementKey = 'ascetic-of-the-north-wall-earth';

class AsceticOfTheNorthWall extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player) && context.game.currentPhase !== Phases.Fate,
            effect: [
                AbilityDsl.effects.cardCannot('removeFate'),
                AbilityDsl.effects.cardCannot('discardFromPlay')
            ]
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Earth
        });
        return symbols;
    }
}

AsceticOfTheNorthWall.id = 'ascetic-of-the-north-wall';

module.exports = AsceticOfTheNorthWall;

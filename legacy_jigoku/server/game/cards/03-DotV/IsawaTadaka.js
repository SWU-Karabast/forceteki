const DrawCard = require('../../drawcard.js');
const { Players, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKey = 'isawa-tadaka-earth';

class IsawaTadaka extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Opponent,
            condition: context => !context.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player.opponent),
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'play',
                restricts: 'copiesOfDiscardEvents'
            })
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

IsawaTadaka.id = 'isawa-tadaka';

module.exports = IsawaTadaka;

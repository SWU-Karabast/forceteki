const DrawCard = require('../../drawcard.js');
const { Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

const elementKey = 'prodigy-of-the-waves-water';

class ProdigyOfTheWaves extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Ready this character',
            condition: () => this.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(),
            gameAction: AbilityDsl.actions.ready()
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Water
        });
        return symbols;
    }
}

ProdigyOfTheWaves.id = 'prodigy-of-the-waves';

module.exports = ProdigyOfTheWaves;

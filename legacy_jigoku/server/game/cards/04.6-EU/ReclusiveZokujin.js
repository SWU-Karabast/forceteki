const DrawCard = require('../../drawcard.js');
const { Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKey = 'reclusive-zokujin-earth';

class ReclusiveZokujin extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: () => this.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            effect: [
                AbilityDsl.effects.addKeyword('covert'),
                AbilityDsl.effects.immunity({
                    restricts: 'opponentsCardEffects'
                })
            ]
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Conflict Type',
            element: Elements.Earth
        });
        return symbols;
    }
}

ReclusiveZokujin.id = 'reclusive-zokujin';

module.exports = ReclusiveZokujin;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants.js');

const elementKey = 'isawa-tsuke-2-fire';
class VolcanicTroll extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: () => this.game.rings[this.getCurrentElementSymbol(elementKey)].isUnclaimed(),
            effect: AbilityDsl.effects.modifyBothSkills(2)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Unclaimed Ring',
            element: Elements.Fire
        });
        return symbols;
    }
}

VolcanicTroll.id = 'volcanic-troll';

module.exports = VolcanicTroll;

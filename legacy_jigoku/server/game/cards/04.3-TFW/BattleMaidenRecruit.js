const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKeys = {
    water: 'battle-maiden-recruit-water',
    void: 'battle-maiden-recruit-void'
};

class BattleMaidenRecruit extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                context.game.rings[this.getCurrentElementSymbol(elementKeys.water)].isConsideredClaimed(context.player) ||
                context.game.rings[this.getCurrentElementSymbol(elementKeys.void)].isConsideredClaimed(context.player)
            ),
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.water,
            prettyName: 'Claimed Ring',
            element: Elements.Water
        });
        symbols.push({
            key: elementKeys.void,
            prettyName: 'Claimed Ring',
            element: Elements.Void
        });
        return symbols;
    }
}

BattleMaidenRecruit.id = 'battle-maiden-recruit';

module.exports = BattleMaidenRecruit;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Elements } = require('../../Constants');

const elementKeys = {
    earth: 'third-tower-guard-earth',
    water: 'third-tower-guard-water'
};

class ThirdTowerGuard extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                context.game.rings[this.getCurrentElementSymbol(elementKeys.earth)].isConsideredClaimed(context.player) ||
                context.game.rings[this.getCurrentElementSymbol(elementKeys.water)].isConsideredClaimed(context.player)
            ),
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.earth,
            prettyName: 'Claimed Ring',
            element: Elements.Earth
        });
        symbols.push({
            key: elementKeys.water,
            prettyName: 'Claimed Ring',
            element: Elements.Water
        });
        return symbols;
    }
}

ThirdTowerGuard.id = 'third-tower-guard';

module.exports = ThirdTowerGuard;

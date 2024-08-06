const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKeys = {
    fire: 'impulsive-novice-fire',
    void: 'impulsive-novice-water'
};

class ImpulsiveNovice extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                context.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player) ||
                context.game.rings[this.getCurrentElementSymbol(elementKeys.void)].isConsideredClaimed(context.player)
            ),
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.fire,
            prettyName: 'Claimed Ring',
            element: Elements.Fire
        });
        symbols.push({
            key: elementKeys.void,
            prettyName: 'Claimed Ring',
            element: Elements.Void
        });
        return symbols;
    }
}

ImpulsiveNovice.id = 'impulsive-novice';

module.exports = ImpulsiveNovice;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKeys = {
    air: 'sadane-student-air',
    water: 'sadane-student-fire'
};

class SadaneStudent extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                context.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player) ||
                context.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player)
            ),
            effect: AbilityDsl.effects.modifyPoliticalSkill(2)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.air,
            prettyName: 'Claimed Ring',
            element: Elements.Air
        });
        symbols.push({
            key: elementKeys.fire,
            prettyName: 'Claimed Ring',
            element: Elements.Fire
        });
        return symbols;
    }
}

SadaneStudent.id = 'sadane-student';

module.exports = SadaneStudent;

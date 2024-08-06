const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKeys = {
    air: 'reader-of-omens-air',
    void: 'reader-of-omens-void'
};

class ReaderOfOmens extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                context.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player) ||
                context.game.rings[this.getCurrentElementSymbol(elementKeys.void)].isConsideredClaimed(context.player)
            ),
            effect: AbilityDsl.effects.modifyPoliticalSkill(3)
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
            key: elementKeys.void,
            prettyName: 'Claimed Ring',
            element: Elements.Void
        });
        return symbols;
    }
}

ReaderOfOmens.id = 'reader-of-omens';

module.exports = ReaderOfOmens;

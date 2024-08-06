const DrawCard = require('../../drawcard.js');
const { Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

const elementKey = 'isawa-kaede-void';

class IsawaKaede extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.immunity({
                restricts: 'opponentsRingEffects'
            })
        });
        this.persistentEffect({
            effect: AbilityDsl.effects.addElementAsAttacker(() => this.getCurrentElementSymbol(elementKey))
        });
        this.persistentEffect({
            condition: context => context.source.isAttacking() && this.game.currentConflict.winner === context.player,
            effect: AbilityDsl.effects.modifyConflictElementsToResolve(5)
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Element to Add',
            element: Elements.Void
        });
        return symbols;
    }
}

IsawaKaede.id = 'isawa-kaede';

module.exports = IsawaKaede;

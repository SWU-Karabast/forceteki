const DrawCard = require('../../drawcard.js');
const { Players, CardTypes, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

const elementKey = 'alchemical-laboratory-fire';

class AlchemicalLaboratory extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => (
                this.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player)
            ),
            match: (card, context) => card.getType() === CardTypes.Attachment && card.parent && card.parent.controller !== context.player,
            effect: AbilityDsl.effects.addKeyword('ancestral'),
            targetController: Players.Self
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Fire
        });
        return symbols;
    }
}

AlchemicalLaboratory.id = 'alchemical-laboratory';

module.exports = AlchemicalLaboratory;

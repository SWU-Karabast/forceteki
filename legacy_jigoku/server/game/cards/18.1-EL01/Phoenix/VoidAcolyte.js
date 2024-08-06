const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { Elements } = require('../../../Constants.js');

const elementKey = 'void-acolyte-void';

class VoidAcolyte extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Gain fate',
            when: {
                onClaimRing: (event, context) => event.player === context.player &&
                (event.conflict && event.conflict.elements.some(element => element === this.getCurrentElementSymbol(elementKey)) || event.ring.element === this.getCurrentElementSymbol(elementKey))
            },
            gameAction: AbilityDsl.actions.placeFate()
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Ring',
            element: Elements.Void
        });
        return symbols;
    }

}

VoidAcolyte.id = 'void-acolyte';
module.exports = VoidAcolyte;

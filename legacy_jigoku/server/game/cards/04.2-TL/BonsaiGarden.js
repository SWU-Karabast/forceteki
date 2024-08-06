const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKey = 'bonsai-garden-air';

class BonsaiGarden extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Gain 1 honor',
            condition: context => context.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Conflict Ring',
            element: Elements.Air
        });
        return symbols;
    }
}

BonsaiGarden.id = 'bonsai-garden';

module.exports = BonsaiGarden;

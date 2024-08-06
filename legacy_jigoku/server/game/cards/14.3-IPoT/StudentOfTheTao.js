const DrawCard = require('../../drawcard.js');
const { Elements, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKey = 'student-of-the-tao-void';

class StudentOfTheTao extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move in/out the conflict',
            condition: context => context.game.isDuringConflict() && context.game.currentConflict.getConflictProvinces().some(a => a.isElement(this.getCurrentElementSymbol(elementKey))),
            target: {
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Province Element',
            element: Elements.Void
        });
        return symbols;
    }
}

StudentOfTheTao.id = 'student-of-the-tao';

module.exports = StudentOfTheTao;

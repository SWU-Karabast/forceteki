const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Elements } = require('../../Constants');

const elementKey = 'isawa-masahiro-fire';

class IsawaMasahiro extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow to discard an enemy character' ,
            condition: () => this.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.costLessThan(3) && card.isParticipating(),
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Conflict Type',
            element: Elements.Fire
        });
        return symbols;
    }
}

IsawaMasahiro.id = 'isawa-masahiro';

module.exports = IsawaMasahiro;

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKey = 'stride-the-waves-water';

class StrideTheWaves extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.action({
            title: 'Move attached character in or out of the conflict',
            limit: AbilityDsl.limit.perRound(2),
            condition: context => context.game.isDuringConflict() &&
                context.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player),
            gameAction: AbilityDsl.actions.conditional({
                condition: context => context.source.parent && context.source.parent.inConflict,
                trueGameAction: AbilityDsl.actions.sendHome(context => ({
                    target: context.source.parent
                })),
                falseGameAction: AbilityDsl.actions.moveToConflict(context => ({
                    target: context.source.parent
                }))
            }),
            effect: '{3} {1} {2}',
            effectArgs: context => [
                context.source.parent,
                context.source.parent.inConflict ? 'home' : 'into the conflict',
                context.source.parent.inConflict ? 'send' : 'move'
            ]
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Water
        });
        return symbols;
    }
}

StrideTheWaves.id = 'stride-the-waves';

module.exports = StrideTheWaves;

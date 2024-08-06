const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class MagistratesIntervention extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Dishonor a character',
            condition: context => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isAttacking(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.dishonor(),
                    AbilityDsl.actions.conditional({
                        condition: context =>
                            context.player.opponent && context.target.controller === context.player.opponent &&
                            context.game.getConflicts(context.player.opponent).filter(conflict => !conflict.passed).length > 1,
                        trueGameAction: AbilityDsl.actions.dishonor(),
                        falseGameAction: AbilityDsl.actions.draw({ amount: 0 }) //do nothing
                    })

                ])
            },
            effect: 'dishonor {0}{1}',
            effectArgs: context => [context.player.opponent && context.game.getConflicts(context.player.opponent).filter(conflict => !conflict.passed).length > 1 ? ', then dishonor it again' : '']
        });
    }

    canPlay(context, playType) {
        if(!context.player.cardsInPlay.any(card => card.getType() === CardTypes.Character && (card.hasTrait('courtier') || card.hasTrait('magistrate')))) {
            return false;
        }

        return super.canPlay(context, playType);
    }
}

MagistratesIntervention.id = 'magistrate-s-intervention';
module.exports = MagistratesIntervention;

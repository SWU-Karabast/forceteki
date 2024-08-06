const _ = require('underscore');
const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, CardTypes } = require('../../Constants.js');

class ImbuedWithShadows extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Lose honor to discard status tokens',
            effect: 'lose {1} honor to discard status tokens from {2}',
            effectArgs: (context) => [context.costs.variableHonorCost, context.target],
            cost: AbilityDsl.costs.variableHonorCost((context) => this.getNumberOfLegalTargets(context)),
            target: {
                mode: TargetModes.ExactlyVariable,
                numCardsFunc: (context) => {
                    if(context && context.costs && context.costs.variableHonorCost) {
                        return context.costs.variableHonorCost;
                    }

                    return this.getNumberOfLegalTargets(context);
                },
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.multipleContext((context) => {
                    let targets = [];
                    targets = _.flatten(_.values(context.targets));
                    targets = targets.concat(_.flatten(_.values(context.selects)));
                    return {
                        gameActions: this.getStatusTokenPrompts(targets)
                    };
                })
            },
            cannotTargetFirst: true
        });
    }

    getStatusTokenPrompts(targets) {
        let actions = [];
        targets.forEach((target) => {
            actions.push(
                AbilityDsl.actions.selectToken(() => ({
                    card: target,
                    activePromptTitle: `Which token do you wish to discard from ${target.name}?`,
                    message: '{0} discards {1} from {2}',
                    messageArgs: (token, player) => [player, token, target],
                    gameAction: AbilityDsl.actions.discardStatusToken()
                }))
            );
        });

        return actions;
    }

    getNumberOfLegalTargets(context) {
        let cards = context.game.findAnyCardsInPlay((card) => card.isHonored || card.isDishonored);
        let selectedCards = [];
        cards.forEach((card) => {
            if(card.canBeTargeted(context, selectedCards)) {
                selectedCards.push(card);
            }
        });

        return selectedCards.length;
    }
}

ImbuedWithShadows.id = 'imbued-with-shadows';

module.exports = ImbuedWithShadows;

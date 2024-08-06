const DrawCard = require('../../drawcard.js');
const { Locations, TargetModes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const merchantOfCuriositiesCost = function () {
    return {
        canPay: function () {
            return true;
        },
        resolve: function (context, result) {
            let honorAvailable = true;
            let cardAvailable = true;
            if(!context.player.opponent || !context.game.actions.loseHonor().canAffect(context.player.opponent, context) || !context.game.actions.gainHonor().canAffect(context.player, context)) {
                honorAvailable = false;
            }

            if(!context.player.opponent || !context.game.actions.chosenDiscard().canAffect(context.player.opponent, context)) {
                cardAvailable = false;
            }

            context.costs.merchantOfCuriositiesCostPaid = false;
            if(honorAvailable && cardAvailable) {
                context.game.promptWithHandlerMenu(context.player.opponent, {
                    activePromptTitle: 'Give an honor and discard a card?',
                    source: context.source,
                    choices: ['Yes', 'No'],
                    handlers: [
                        () => {
                            context.costs.merchantOfCuriositiesCostPaid = true;
                            context.game.promptForSelect(context.player.opponent, {
                                activePromptTitle: 'Choose a card to discard',
                                context: context,
                                mode: TargetModes.Single,
                                numCards: 1,
                                location: Locations.Hand,
                                controller: Players.Opponent,
                                onSelect: (player, card) => {
                                    context.costs.merchantOfCuriositiesCostDiscardedCard = card;
                                    return true;
                                },
                                onCancel: () => {
                                    result.cancelled = true;
                                    return true;
                                }
                            });
                        },
                        () => context.costs.merchantOfCuriositiesCostPaid = false
                    ]
                });
            }
        },
        payEvent: function (context) {
            if(context.costs.merchantOfCuriositiesCostPaid) {
                let events = [];

                let discardAction = context.game.actions.discardCard({ target: context.costs.merchantOfCuriositiesCostDiscardedCard });
                events.push(discardAction.getEvent(context.costs.merchantOfCuriositiesCostDiscardedCard, context));

                let honorAction = context.game.actions.takeHonor({ target: context.player.opponent });
                events.push(honorAction.getEvent(context.player.opponent, context));
                context.game.addMessage('{0} chooses to discard a card and give {1} 1 honor', context.player.opponent, context.player);

                return events;
            }

            let action = context.game.actions.handler(); //this is a do-nothing event to allow you to opt out and not scuttle the event
            return action.getEvent(context.player, context);

        },
        promptsPlayer: true
    };
};


class MerchantOfCuriosities extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a card to draw a card',
            cost: [
                AbilityDsl.costs.discardCard(),
                merchantOfCuriositiesCost()
            ],
            gameAction: AbilityDsl.actions.draw(context => ({
                target: context.costs.merchantOfCuriositiesCostPaid ? context.game.getPlayers() : context.player
            })),
            effect: 'draw a card{2}',
            effectArgs: context => [context.costs.discardCard, this.buildString(context)]
        });
    }

    buildString(context) {
        if(context.costs.merchantOfCuriositiesCostPaid) {
            return '.  ' + context.player.opponent.name + ' gives ' + context.player.name + ' 1 honor to discard ' +
                context.costs.merchantOfCuriositiesCostDiscardedCard.name + ' and draw a card';
        }
        return '';
    }
}

MerchantOfCuriosities.id = 'merchant-of-curiosities';
module.exports = MerchantOfCuriosities;


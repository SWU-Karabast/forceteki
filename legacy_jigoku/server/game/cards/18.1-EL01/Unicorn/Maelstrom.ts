import { TargetModes, Locations, Players, CardTypes, Durations, Elements } from '../../../Constants';
import type { Cost } from '../../../Costs';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

const maelstromCost = function (): Cost {
    return {
        getActionName(context) {
            return 'maelstromCost';
        },
        getCostMessage: function (context) {
            if (context.costs.maelstromCostPaid) {
                return ['discarding {0}'];
            }
            return undefined;
        },
        canPay: function () {
            return true;
        },
        resolve: function (context, result) {
            let cardAvailable = true;
            if (!context.game.actions.chosenDiscard().canAffect(context.player, context)) {
                cardAvailable = false;
            }

            context.costs.maelstromCostPaid = false;
            if (cardAvailable) {
                context.game.promptWithHandlerMenu(context.player, {
                    activePromptTitle: 'Discard a card?',
                    source: context.source,
                    choices: ['Yes', 'No'],
                    handlers: [
                        () => {
                            context.costs.maelstromCostPaid = true;
                            context.game.promptForSelect(context.player, {
                                activePromptTitle: 'Choose a card to discard',
                                context: context,
                                mode: TargetModes.Single,
                                numCards: 1,
                                location: Locations.Hand,
                                controller: Players.Self,
                                onSelect: (player, card) => {
                                    context.costs.maelstromCost = card;
                                    return true;
                                },
                                onCancel: () => {
                                    result.cancelled = true;
                                    return true;
                                }
                            });
                        },
                        () => (context.costs.maelstromCostPaid = false)
                    ]
                });
            }
        },
        payEvent: function (context) {
            if (context.costs.maelstromCostPaid) {
                let events = [];

                let discardAction = context.game.actions.discardCard({ target: context.costs.maelstromCost });
                events.push(discardAction.getEvent(context.costs.maelstromCost, context));
                context.game.addMessage('{0} chooses to discard a card', context.player);

                return events;
            }

            //this is a do-nothing event to allow you to opt out and not scuttle the event
            let noop = context.game.actions.handler({ handler: () => {} });
            return noop.getEvent(context.player, context);
        },
        promptsPlayer: true
    };
};

const elementKey = 'maelstrom-water';

export default class Maelstrom extends ProvinceCard {
    static id = 'maelstrom';
    setupCardAbilities() {
        this.action({
            title: 'Move a character into the conflict',
            cost: maelstromCost(),
            conflictProvinceCondition: (province) => province.isElement(this.getCurrentElementSymbol(elementKey)),
            cannotTargetFirst: true,
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card, context) =>
                    context.costs.maelstromCostPaid ? true : card.controller === context.player,
                gameAction: AbilityDsl.actions.multipleContext((context) => {
                    const target = context.target;
                    return {
                        gameActions: [
                            AbilityDsl.actions.moveToConflict(),
                            AbilityDsl.actions.cardLastingEffect({
                                target: target,
                                duration: Durations.UntilEndOfPhase,
                                effect: AbilityDsl.effects.delayedEffect({
                                    when: {
                                        afterConflict: (event, context) =>
                                            event.conflict.winner === target.controller &&
                                            target.isParticipating() &&
                                            target.controller === context.player
                                    },
                                    message: "{0} is honored due to {1}'s effect",
                                    messageArgs: [target, context.source],
                                    gameAction: AbilityDsl.actions.honor()
                                })
                            })
                        ]
                    };
                })
            },
            effect: 'move {0} into the conflict{1}',
            effectArgs: (context) =>
                context.target.controller === context.player ? ['. It will be honored if it wins the conflict'] : ['']
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Ability - Province Element',
            element: Elements.Water
        });
        return symbols;
    }
}

const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations, Players, Durations } = require('../../Constants');

const exposedCourtyardCost = () => ({
    action: { name: 'exposedCourtyardCost' },
    getActionName(context) { // eslint-disable-line no-unused-vars
        return 'exposedCourtyardCost';
    },
    getCostMessage: function (context) { // eslint-disable-line no-unused-vars
        return ['discarding {0}'];
    },
    canPay: function (context) {
        return context.player.conflictDeck.size() >= 2;
    },
    resolve: function(context) {
        context.costs.exposedCourtyardCost = context.player.conflictDeck.first(2);
    },
    pay: function(context) {
        const discardedCards = context.costs.exposedCourtyardCost;
        discardedCards.slice(0, 2).forEach(card => {
            card.controller.moveCard(card, Locations.ConflictDiscardPile);
        });
    }
});

class ExposedCourtyard extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Make an event in your conflict discard playable',
            effect: 'pick an event to make playable this conflict',
            cannotTargetFirst: true,
            condition: context => context.game.isDuringConflict('military'),
            cost: [exposedCourtyardCost()],
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.handler({
                    handler: () => true
                }),
                AbilityDsl.actions.selectCard(context => ({
                    location: Locations.ConflictDiscardPile,
                    cardType: CardTypes.Event,
                    activePromptTitle: 'Choose an event',
                    controller: Players.Self,
                    targets: true,
                    subActionProperties: card => {
                        context.target = card;
                        return ({ target: card });
                    },
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.playerLastingEffect(context => {
                            return {
                                targetController: context.player,
                                duration: Durations.Custom,
                                until: {
                                    onCardMoved: event => {
                                        return event.card === context.target && event.originalLocation === Locations.ConflictDiscardPile;
                                    },
                                    onConflictFinished: () => true
                                },
                                effect: AbilityDsl.effects.canPlayFromOwn(Locations.ConflictDiscardPile, [context.target], this)
                            };
                        }),
                        AbilityDsl.actions.cardLastingEffect(context => ({
                            duration: Durations.UntilEndOfConflict,
                            targetLocation: Locations.Any,
                            canChangeZoneNTimes: 2,
                            effect: AbilityDsl.effects.delayedEffect({
                                when: {
                                    onCardPlayed: (event) => {
                                        return event.card === context.target && event.player === context.target.controller;
                                    }
                                },
                                multipleTrigger: true,
                                message: '{0} returns to the bottom of the deck due to {1}\'s effect',
                                messageArgs: [context.target, context.source],
                                gameAction: AbilityDsl.actions.returnToDeck({
                                    location: Locations.Any,
                                    bottom: true
                                })
                            })
                        }))
                    ]),
                    message: '{0} can play {1} this conflict. It will be put on the bottom of the deck if it\'s played this conflict',
                    messageArgs: card => [context.player, card, context.source]
                }))
            ])
        });
    }
}

ExposedCourtyard.id = 'exposed-courtyard';

module.exports = ExposedCourtyard;

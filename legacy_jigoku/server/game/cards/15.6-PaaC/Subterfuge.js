const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Phases } = require('../../Constants');

class Subterfuge extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent draw',
            when: {
                onCardsDrawn: (event, context) => {
                    return (
                        context.player.opponent &&
                        context.player.isLessHonorable() &&
                        context.game.currentPhase !== Phases.Draw &&
                        event.player === context.player.opponent
                    );
                }
            },
            gameAction: AbilityDsl.actions.cancel((context) => ({
                replacementGameAction: AbilityDsl.actions.sequentialContext(() => {
                    // @ts-ignore
                    const discardAmount = Math.min(context.event.amount, 3);
                    const cardsToDiscard = context.player.opponent.conflictDeck.first(discardAmount);
                    // @ts-ignore
                    const drawAmount = context.event.amount - discardAmount;
                    this.messageShown = false;
                    return {
                        gameActions: [
                            AbilityDsl.actions.discardCard({
                                target: cardsToDiscard
                            }),
                            AbilityDsl.actions.handler({
                                handler: (context) => {
                                    if (!this.messageShown) {
                                        // for some reason, it shows the message twice
                                        context.game.addMessage(
                                            '{0} discards {1}',
                                            context.player.opponent,
                                            cardsToDiscard
                                        );
                                        if (drawAmount > 0) {
                                            context.game.addMessage(
                                                '{0} draws {1} card{2}',
                                                context.player.opponent,
                                                drawAmount,
                                                drawAmount > 1 ? 's' : ''
                                            );
                                        }
                                        this.messageShown = true;
                                    }
                                }
                            }),
                            AbilityDsl.actions.draw({
                                target: context.player.opponent,
                                amount: drawAmount
                            })
                        ]
                    };
                })
            })),
            effect: 'prevent {1} card{2} from being drawn, discarding {3} instead',
            effectArgs: (context) => [
                Math.min(context.event.amount, 3),
                context.event.amount > 1 ? 's' : '',
                context.event.amount > 1 ? 'them' : 'it'
            ]
        });
    }
}

Subterfuge.id = 'subterfuge';

module.exports = Subterfuge;

const DrawCard = require('../../drawcard.js');
const { Locations, Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class UnderSiege extends DrawCard {
    setupCardAbilities() {
        this.setAsideCards = [];
        this.targetPlayer = null;

        this.reaction({
            title: 'Place defender under siege',
            when: {
                onConflictDeclared: (event, context) => context.game.currentConflict && context.game.currentConflict.defendingPlayer
            },
            max: AbilityDsl.limit.perConflict(1),
            effect: 'place {1} under siege!',
            effectArgs: context => [context.game.currentConflict.defendingPlayer],
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.playerLastingEffect(context => ({
                    duration: Durations.UntilEndOfRound,
                    targetController: context.game.currentConflict.defendingPlayer,
                    effect: AbilityDsl.effects.playerDelayedEffect({
                        when: {
                            onConflictFinished: () => true
                        },
                        gameAction: AbilityDsl.actions.sequential([
                            AbilityDsl.actions.chosenDiscard(() => ({
                                amount: 1000 //discard the entire hand
                            })),
                            AbilityDsl.actions.handler({
                                handler: context => {
                                    if(this.targetPlayer && this.setAsideCards && this.setAsideCards.length > 0) {
                                        context.game.addMessage('{0} picks up their original hand', this.targetPlayer);

                                        this.setAsideCards.forEach(card => {
                                            this.targetPlayer.moveCard(card, Locations.Hand);
                                        });
                                    }
                                }
                            })
                        ])
                    })
                })),
                AbilityDsl.actions.conditional(({
                    condition: context => context.game.currentConflict.defendingPlayer.hand.size() > 0,
                    trueGameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.handler({
                            handler: context => {
                                const player = context.game.currentConflict.defendingPlayer;
                                const setAsideCards = [...player.hand.value()];
                                this.targetPlayer = player;
                                this.setAsideCards = setAsideCards;
                                this.game.addMessage('{0} sets their hand aside and draws 5 cards', player);
                                if(setAsideCards.length > 0) {
                                    setAsideCards.forEach(card => {
                                        player.moveCard(card, Locations.RemovedFromGame);
                                        card.lastingEffect(() => ({
                                            until: {
                                                onCardMoved: event => event.card === card && event.originalLocation === Locations.RemovedFromGame
                                            },
                                            match: card,
                                            effect: AbilityDsl.effects.hideWhenFaceUp()
                                        }));
                                    });
                                }
                            }
                        }),
                        AbilityDsl.actions.draw(context => ({
                            target: context.game.currentConflict.defendingPlayer,
                            amount: 5
                        }))
                    ]),
                    falseGameAction: AbilityDsl.actions.handler({
                        handler: () => {}
                    })
                }))
            ])
        });
    }
}

UnderSiege.id = 'under-siege';

module.exports = UnderSiege;

import { Durations, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class SneakAttack extends DrawCard {
    static id = 'sneak-attack';

    public setupCardAbilities() {
        this.reaction({
            title: 'The attacker gets the first action opportunity',
            cost: AbilityDsl.costs.payHonor(1),
            when: {
                onConflictStarted: (event, context) => event.conflict.attackingPlayer === context.player
            },
            effect: 'give {1} the first action in this conflict{2}',
            effectArgs: (context) => [
                context.player,
                context.player.opponent.hand.size() > 0 ? " and sets aside opponent's cards" : ''
            ],
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.conditional({
                    condition: (context) => context.player.opponent?.hand.size() > 0,
                    falseGameAction: AbilityDsl.actions.noAction(),
                    trueGameAction: AbilityDsl.actions.sequentialContext((context) => {
                        const opponent = context.player.opponent;
                        const setAsideCards: DrawCard[] = opponent?.hand.shuffle().slice(0, 2);
                        if (setAsideCards.length === 0) {
                            return { gameActions: [AbilityDsl.actions.noAction()] };
                        }

                        return {
                            gameActions: [
                                AbilityDsl.actions.handler({
                                    handler: () => {
                                        this.game.addMessage('{0} sets aside {1}', opponent, setAsideCards);
                                        for (const card of setAsideCards) {
                                            opponent.moveCard(card, Locations.RemovedFromGame);
                                        }
                                    }
                                }),

                                AbilityDsl.actions.playerLastingEffect({
                                    duration: Durations.UntilEndOfRound,
                                    targetController: opponent,
                                    effect: AbilityDsl.effects.playerDelayedEffect({
                                        when: { onConflictFinished: () => true },
                                        gameAction: AbilityDsl.actions.handler({
                                            handler: (context) => {
                                                context.game.addMessage('{0} picks back their cards', opponent);
                                                for (const card of setAsideCards) {
                                                    opponent.moveCard(card, Locations.Hand);
                                                }
                                            }
                                        })
                                    })
                                })
                            ]
                        };
                    })
                }),
                AbilityDsl.actions.playerLastingEffect((context) => ({
                    targetController: context.player,
                    effect: AbilityDsl.effects.gainActionPhasePriority()
                }))
            ])
        });
    }
}

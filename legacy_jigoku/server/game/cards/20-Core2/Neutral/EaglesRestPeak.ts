import { CardTypes, Durations, Locations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class EaglesRestPeak extends ProvinceCard {
    static id = 'eagle-s-rest-peak';

    public setupCardAbilities() {
        this.action({
            title: "Look at random cards from opponent's hand",
            condition: (context) => context.player.opponent?.hand.size() > 0,
            target: {
                activePromptTitle: 'Choose a character to lead the investigation',
                cardType: CardTypes.Character,
                cardCondition: (card: DrawCard) => card.isDefending() && card.getCost() > 0
            },
            effect: 'use the insight of {0}, revealing and setting aside {1} cards from {2}\'s hand',
            effectArgs: context => [context.target.getCost(), context.player.opponent],
            gameAction: AbilityDsl.actions.sequentialContext((context) => {
                const opponent = context.player.opponent;
                const setAsideCards: DrawCard[] = opponent?.hand
                    .shuffle()
                    .slice(0, (context.target as DrawCard).getCost());

                return {
                    gameActions: [
                        AbilityDsl.actions.lookAt({ target: setAsideCards }),

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
        });
    }
}

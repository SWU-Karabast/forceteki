import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { GameAction } from '../../../GameActions/GameAction';

export default class ChroniclerOfCalamities extends DrawCard {
    static id = 'chronicler-of-calamities';

    setupCardAbilities() {
        this.action({
            title: 'Dishonor or move home a character',
            condition: (context) => context.source.isParticipating(),
            effect: 'dishonor or send home {0}',
            effectArgs: (context) => [
                context.target.isFacedown() ? 'a facedown card' : context.target,
                context.target.location
            ],
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card: DrawCard, context) => card !== context.source &&
                    card.isParticipating() &&
                    context.game.currentConflict.getCharacters(context.player).some(myCard => myCard.printedCost >= card.printedCost),
                gameAction: AbilityDsl.actions.chooseAction((context) => ({
                    activePromptTitle: 'Select one',
                    options: {
                        'Dishonor it': {
                            action: AbilityDsl.actions.dishonor({ target: context.target }),
                            message: '{0} chooses to dishonor {1}'
                        },
                        'Move it home': {
                            action: AbilityDsl.actions.sendHome({ target: context.target }),
                            message: '{0} chooses to send {1} home'
                        },
                        'Sacrifice a character to perform both': {
                            action: AbilityDsl.actions.sequentialContext(context => {
                                const gameActions: GameAction[] = [AbilityDsl.actions.sendHome()];
                                gameActions.push(
                                    AbilityDsl.actions.selectCard({
                                        activePromptTitle: 'Select a character to sacrifice',
                                        cardType: CardTypes.Character,
                                        controller: Players.Self,
                                        message: '{0} chooses to sacrifice {1}',
                                        messageArgs: (card) => [
                                            context.player,
                                            card
                                        ],
                                        subActionProperties: (card) => ({ target: card, cannotBeCancelled: true }),
                                        gameAction: AbilityDsl.actions.sacrifice()
                                    })
                                );
                                gameActions.push(AbilityDsl.actions.dishonor({ target: context.target }));
                                gameActions.push(AbilityDsl.actions.sendHome({ target: context.target }))

                                return { gameActions }
                            }),
                            message: '{0} chooses to sacrifice a character to both dishonor and send {1} home'
                        }
                    }
                }))
            }
        });
    }
}

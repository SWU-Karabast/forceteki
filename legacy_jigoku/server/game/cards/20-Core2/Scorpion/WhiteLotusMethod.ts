import { CardTypes, CharacterStatus, Players, TargetModes } from '../../../Constants';
import type { StatusToken } from '../../../StatusToken';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { AbilityContext } from '../../../AbilityContext';

const TOKEN = 'token';
const RECIPIENT = 'recipient';

function doesCardDraw(context: AbilityContext) {
    return context.targets[RECIPIENT].controller !== context.source.controller;
}

export default class WhiteLotusMethod extends DrawCard {
    static id = 'white-lotus-method';

    setupCardAbilities() {
        this.action({
            title: 'Move a status token',
            condition: (context) => context.player.cardsInPlay.some((card: DrawCard) => card.hasTrait('courtier')),
            targets: {
                [TOKEN]: {
                    activePromptTitle: 'Choose the status token to move',
                    mode: TargetModes.Token,
                    cardType: CardTypes.Character,
                    tokenCondition: (token: StatusToken) => token.grantedStatus === CharacterStatus.Dishonored
                },
                [RECIPIENT]: {
                    activePromptTitle: 'Choose a Character to receive the token',
                    dependsOn: TOKEN,
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card) => card.isOrdinary(),
                    gameAction: AbilityDsl.actions.sequentialContext((context) => ({
                        gameActions: [
                            AbilityDsl.actions.moveStatusToken({
                                target: context.tokens[TOKEN],
                                recipient: context.targets[RECIPIENT]
                            }),
                            AbilityDsl.actions.conditional({
                                condition: doesCardDraw,
                                trueGameAction: AbilityDsl.actions.draw((context) => ({
                                    amount: 1,
                                    target: context.targets[RECIPIENT].controller
                                })),
                                falseGameAction: AbilityDsl.actions.noAction()
                            })
                        ]
                    }))
                }
            },
            effect: 'move a status token to {1}{2}',
            effectArgs: (context) => [
                context.targets[RECIPIENT],
                doesCardDraw(context) ? ', their controller draws a card' : ''
            ]
        });
    }
}

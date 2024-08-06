const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { CardTypes, Players, Durations } = require('../../../Constants.js');

class SurgingWave extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Prevent bowing after conflict',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => card.isParticipating() && card.hasTrait('monk'),
                gameAction: AbilityDsl.actions.sequentialContext((context) => {
                    let kihoPlayed = context.player.isKihoPlayedThisConflict(context, this);
                    let gameActions = [];
                    gameActions.push(
                        AbilityDsl.actions.cardLastingEffect((context) => ({
                            duration: Durations.UntilEndOfPhase,
                            effect: AbilityDsl.effects.delayedEffect({
                                when: {
                                    onConflictFinished: () => true
                                },
                                message: '{0} {3} removed from {1} due to the delayed effect of {2}',
                                messageArgs: [
                                    context.target.statusTokens,
                                    context.target,
                                    context.source,
                                    context.target.statusTokens.length > 1 ? 'are' : 'is'
                                ],
                                gameAction: AbilityDsl.actions.discardStatusToken(() => ({
                                    target: context.target.statusTokens
                                }))
                            })
                        }))
                    );
                    if(kihoPlayed) {
                        gameActions.push(
                            AbilityDsl.actions.menuPrompt((context) => ({
                                activePromptTitle:
                                    'Spend 1 fate to prevent ' +
                                    context.target.name +
                                    ' from bowing at the end of the conflict?',
                                choices: ['Yes', 'No'],
                                choiceHandler: (choice, displayMessage) => {
                                    if(displayMessage) {
                                        context.game.addMessage(
                                            '{0} chooses {1}to spend a fate to prevent {2} from bowing during conflict resolution',
                                            context.player,
                                            choice === 'No' ? 'not ' : '',
                                            context.target
                                        );
                                    }
                                    return { amount: choice === 'Yes' ? 1 : 0 };
                                },
                                gameAction: AbilityDsl.actions.joint([
                                    AbilityDsl.actions.loseFate({ target: context.player }),
                                    AbilityDsl.actions.cardLastingEffect((context) => ({
                                        effect: AbilityDsl.effects.doesNotBow(),
                                        target: context.target
                                    }))
                                ])
                            }))
                        );
                    }

                    return {
                        gameActions: gameActions
                    };
                })
            },
            effect: 'discard all status tokens from {0} at the end of the conflict'
        });
    }
}

SurgingWave.id = 'surging-wave';

module.exports = SurgingWave;

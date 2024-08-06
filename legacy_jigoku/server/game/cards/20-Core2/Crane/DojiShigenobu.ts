import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DojiShigenobu extends DrawCard {
    static id = 'doji-shigenobu';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: (context) => context.source.isParticipating(),
            cost: AbilityDsl.costs.bow({
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating()
            }),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.bow()
            },
            then: {
                gameAction: AbilityDsl.actions.menuPrompt((context) => ({
                    activePromptTitle: 'Do you want to move home?',
                    choices: ['Yes', 'No'],
                    choiceHandler: (choice, displayMessage) => {
                        if (displayMessage && choice === 'Yes') {
                            context.game.addMessage('{0} chooses to move {1} home', context.player, context.source);
                        }
                        return { target: choice === 'Yes' ? context.source : [] };
                    },
                    gameAction: AbilityDsl.actions.sendHome()
                }))
            }
        });
    }
}

import { CardTypes, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

const DONOR = 'donor';
const RECIPIENT = 'recipient';

export default class LastJudgementPlains extends ProvinceCard {
    static id = 'last-judgment-plains';

    public setupCardAbilities() {
        this.action({
            title: 'Move fate between two of your characters',
            targets: {
                [DONOR]: {
                    activePromptTitle: 'Choose a donor character',
                    cardType: CardTypes.Character,
                    controller: Players.Self
                },
                [RECIPIENT]: {
                    dependsOn: DONOR,
                    activePromptTitle: 'Choose a recipient character',
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    gameAction: AbilityDsl.actions.menuPrompt(({ targets }) => ({
                        activePromptTitle: 'How much fate do you want to move?',
                        optional: false,
                        choices: this.#createChoiceArray(targets[DONOR].getFate()),
                        choiceHandler: (choice) => ({
                            amount: parseInt(choice, 10),
                            origin: targets[DONOR],
                            target: targets[RECIPIENT]
                        }),
                        gameAction: AbilityDsl.actions.placeFate()
                    }))
                }
            },
            effect: 'move fate from {1} to {2}',
            effectArgs: ({ targets }) => [targets[DONOR], targets[RECIPIENT]]
        });
    }

    #createChoiceArray(fate: number): string[] {
        const choices: string[] = [];
        for (let i = 1; i <= fate; i++) {
            choices.push(i.toString());
        }
        return choices;
    }
}
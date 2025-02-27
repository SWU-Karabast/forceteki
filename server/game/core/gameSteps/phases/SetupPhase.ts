import { randomItem } from '../../utils/Helpers';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ResourcePrompt } from '../prompts/ResourcePrompt';
import { MulliganPrompt } from '../prompts/MulliganPrompt';
import { PromptType } from '../../Constants';

export class SetupPhase extends Phase {
    public constructor(game: Game) {
        const name = 'setup';
        super(game, name);
        this.game.currentPhase = name;
        this.pipeline.initialise([
            new SimpleStep(game, () => this.chooseFirstPlayer(), 'chooseFirstPlayer'),
            new SimpleStep(game, () => this.drawStartingHands(), 'drawStartingHands'),
            new MulliganPrompt(game),
            new ResourcePrompt(game, 2),

            // there aren't clear game rules yet for resolving events that trigger during the setup step, so we skip the event window here
            new SimpleStep(game, () => this.endPhase(true), 'endPhase')
        ]);
    }

    private chooseFirstPlayer() {
        const firstPlayer = randomItem(this.game.getPlayers(), this.game.randomGenerator);

        this.game.promptWithHandlerMenu(firstPlayer, {
            promptType: PromptType.Initiative,
            activePromptTitle: 'You won the flip. Do you want to start with initiative:',
            source: 'Choose Initiative Player',
            choices: ['Yes', 'No'],
            handlers: [
                () => {
                    this.game.initiativePlayer = firstPlayer;
                },
                () => {
                    this.game.initiativePlayer = firstPlayer.opponent;
                }
            ]
        });
    }

    private drawStartingHands() {
        // TODO: convert these to use systems
        for (const player of this.game.getPlayers()) {
            player.shuffleDeck();
            player.drawCardsToHand(6);
        }
    }
}

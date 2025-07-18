import { randomItem } from '../../utils/Helpers';
import type Game from '../../Game';
import { Phase, PhaseInitializeMode } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ResourcePrompt } from '../prompts/ResourcePrompt';
import { MulliganPrompt } from '../prompts/MulliganPrompt';
import { PhaseName } from '../../Constants';
import { PromptType } from '../PromptInterfaces';
import * as Contract from '../../utils/Contract';

export class SetupPhase extends Phase {
    public constructor(game: Game, initializeMode: PhaseInitializeMode = PhaseInitializeMode.Normal) {
        Contract.assertFalse(initializeMode === PhaseInitializeMode.RollbackToWithinPhase, 'SetupPhase does not support rolling back to the middle of the phase');

        super(game, PhaseName.Setup);

        this.initialise(
            [
                new SimpleStep(game, () => this.chooseFirstPlayer(), 'chooseFirstPlayer'),
                new SimpleStep(game, () => this.drawStartingHands(), 'drawStartingHands'),
                new MulliganPrompt(game),
                new ResourcePrompt(game, 2),

                // there aren't clear game rules yet for resolving events that trigger during the setup step, so we skip the event window here
                new SimpleStep(game, () => this.endPhase(true), 'endPhase')
            ],
            initializeMode
        );
    }

    private chooseFirstPlayer() {
        const firstPlayer = randomItem(this.game.getPlayers(), this.game.randomGenerator);

        this.game.promptWithHandlerMenu(firstPlayer, {
            promptType: PromptType.Initiative,
            activePromptTitle: 'You won the flip. Choose the player to start with initiative:',
            source: 'Choose Initiative Player',
            choices: ['Yourself', 'Opponent'],
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
            player.drawCardsToHand(player.getStartingHandSize());
        }
    }
}

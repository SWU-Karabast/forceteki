import { randomItem } from '../../utils/Helpers';
import type Game from '../../Game';
import { Phase, PhaseInitializeMode } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ResourcePrompt } from '../prompts/ResourcePrompt';
import { MulliganPrompt } from '../prompts/MulliganPrompt';
import { PhaseName, SnapshotType } from '../../Constants';
import { PromptType } from '../PromptInterfaces';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';
import { SnapshotTimepoint } from '../../snapshot/SnapshotInterfaces';
import type { IStep } from '../IStep';

export class SetupPhase extends Phase {
    public constructor(game: Game, snapshotManager: SnapshotManager, initializeMode: PhaseInitializeMode = PhaseInitializeMode.Normal) {
        super(game, PhaseName.Setup, snapshotManager);

        const setupStep: IStep[] = [];
        if (initializeMode !== PhaseInitializeMode.RollbackToWithinPhase) {
            setupStep.push(
                new SimpleStep(game, () => this.chooseFirstPlayer(), 'chooseFirstPlayer'),
                new SimpleStep(game, () => this.drawStartingHands(), 'drawStartingHands'),
                new SimpleStep(game, () => this.takeSnapshot(SnapshotTimepoint.Mulligan), 'takeSnapshotBeforeMulligan'),
            );
        }

        const mulliganStep: IStep[] = [];
        if (initializeMode !== PhaseInitializeMode.RollbackToWithinPhase || snapshotManager.currentSnapshottedTimepoint === SnapshotTimepoint.Mulligan) {
            mulliganStep.push(
                new MulliganPrompt(game),
                new SimpleStep(game, () => this.takeSnapshot(SnapshotTimepoint.SetupResource), 'takeSnapshotBeforeResource'),
            );
        }

        this.initialise(
            [
                ...setupStep,
                ...mulliganStep,
                new ResourcePrompt(game, 2)
            ],
            initializeMode
        );
    }

    private takeSnapshot(timepoint: SnapshotTimepoint.Mulligan | SnapshotTimepoint.SetupResource) {
        this.snapshotManager.moveToNextTimepoint(timepoint);
        this.game.getPlayers().forEach((player) => {
            this.snapshotManager.takeSnapshot({
                type: SnapshotType.Action,
                playerId: player.id
            });
        });
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

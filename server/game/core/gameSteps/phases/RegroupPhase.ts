import { AbilityRestriction, EventName, PhaseName, ZoneName } from '../../Constants';
import type Game from '../../Game';
import { Phase, PhaseInitializeMode } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { VariableResourcePrompt } from '../prompts/VariableResourcePrompt';
import { GameEvent } from '../../event/GameEvent';
import * as GameSystemLibrary from '../../../gameSystems/GameSystemLibrary';
import { DrawSystem } from '../../../gameSystems/DrawSystem';
import { TriggerHandlingMode } from '../../event/EventWindow';
import type { ICardWithExhaustProperty } from '../../card/baseClasses/PlayableOrDeployableCard';
import * as Contract from '../../utils/Contract';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';
import { SnapshotTimepoint } from '../../snapshot/SnapshotInterfaces';

export class RegroupPhase extends Phase {
    public constructor(game: Game, snapshotManager: SnapshotManager, initializeMode: PhaseInitializeMode = PhaseInitializeMode.Normal) {
        Contract.assertFalse(initializeMode === PhaseInitializeMode.RollbackToEndOfPhase, 'RegroupPhase does not support rolling back to the end of the phase');

        const resourceSteps = [];
        if (
            initializeMode !== PhaseInitializeMode.RollbackToEndOfPhase &&
            snapshotManager.currentSnapshottedTimepoint !== SnapshotTimepoint.RegroupReadyCards
        ) {
            resourceSteps.push(new SimpleStep(game, () => this.drawTwo(initializeMode), 'drawTwo'));
            resourceSteps.push(new SimpleStep(game, () => this.resourcePrompt(), 'resourcePrompt'));
        }

        super(game, PhaseName.Regroup, snapshotManager);
        this.initialise(
            [
                ...resourceSteps,
                new SimpleStep(game, () => this.readyAllCards(initializeMode), 'readyAllCards')
            ],
            initializeMode
        );
    }

    private drawTwo(initializeMode: PhaseInitializeMode) {
        this.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.RegroupResource);

        if (initializeMode === PhaseInitializeMode.Normal || initializeMode === PhaseInitializeMode.RollbackToStartOfPhase) {
            this.takeActionSnapshotsForPromptedPlayers();
        }

        for (const player of this.game.getPlayers()) {
            // create a single event for drawing cards step
            new DrawSystem({ amount: 2 }).resolve(
                player,
                this.game.getFrameworkContext(),
                TriggerHandlingMode.ResolvesTriggers
            );
        }
    }

    private resourcePrompt() {
        this.game.queueStep(new VariableResourcePrompt(this.game, 0, 1));
    }

    private readyAllCards(initializeMode: PhaseInitializeMode) {
        const checkTakeSnapshot = initializeMode === PhaseInitializeMode.Normal || this.snapshotManager.currentSnapshottedTimepoint !== SnapshotTimepoint.RegroupReadyCards;
        if (checkTakeSnapshot) {
            // reset trackers indicating if a player has been prompted
            this.game.resetPromptedPlayersTracking();
            this.game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.RegroupReadyCards);
        }

        const cardsToReady: ICardWithExhaustProperty[] = [];

        for (const player of this.game.getPlayers()) {
            cardsToReady.push(...player.getArenaUnits({ condition: (card) => !card.hasRestriction(AbilityRestriction.DoesNotReadyDuringRegroup) }));
            cardsToReady.push(...player.resources);

            if (player.leader.zoneName === ZoneName.Base) {
                cardsToReady.push(player.leader);
            }
        }

        // create a single event for the ready cards step as well as individual events for readying each card
        const events = [new GameEvent(EventName.OnRegroupPhaseReadyCards, this.game.getFrameworkContext(), {})];
        GameSystemLibrary.ready({ isRegroupPhaseReadyStep: true, target: cardsToReady })
            .queueGenerateEventGameSteps(events, this.game.getFrameworkContext());

        this.game.queueSimpleStep(() => this.game.openEventWindow(events, TriggerHandlingMode.ResolvesTriggers), 'open event window for card readying effects');

        if (checkTakeSnapshot) {
            // checks if a player was prompted during the end step and if so, takes a snapshot so they can unwind to the prompt
            this.game.queueSimpleStep(() => this.takeActionSnapshotsForPromptedPlayers(), 'takeActionSnapshotsForPromptedPlayers');
        }
    }
}

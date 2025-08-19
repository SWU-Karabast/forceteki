import { PhaseName, RollbackSetupEntryPoint } from '../Constants';
import { RollbackRoundEntryPoint as RollbackRoundEntryPoint } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import type { IGameObjectRegistrar } from './GameStateManager';
import { GameStateManager } from './GameStateManager';
import type { IRollbackRoundEntryPoint, IRollbackSetupEntryPoint } from './SnapshotInterfaces';
import { SnapshotTimepoint } from './SnapshotInterfaces';
import { RollbackEntryPointType, type IGetManualSnapshotSettings, type IGetSnapshotSettings, type IManualSnapshotSettings, type IRollbackResult, type ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { SnapshotMap } from './container/SnapshotMap';
import { PromptType } from '../gameSteps/PromptInterfaces';

export enum UndoMode {
    Disabled = 'disabled',
    Full = 'full',
    CurrentSnapshotOnly = 'currentSnapshotOnly',
}

interface IQuickRollbackResult {
    snapshotId: number;
    roundEntryPoint: IRollbackRoundEntryPoint;
}

enum QuickRollbackPoint {
    Regroup = 'regroup',
    CurrentAction = 'currentAction',
    PreviousAction = 'previousAction',
}

export enum QuickSnapshotType {
    Action = 'action',
    Regroup = 'regroup',
}

/**
 * The "interface" class for managing snapshots in the game.
 * Instantiates all of the snapshot mechanisms and manages them internally.
 *
 * Called by the Game for generating snapshots at key points and storing them for later rollback.
 * Also manages the GameStateManager which is used to manage GameObjects and overall game state.
 */
export class SnapshotManager {
    private static readonly FullSnapshotLimits = new Map<SnapshotType, number>([
        [SnapshotType.Action, 3],
        [SnapshotType.Phase, 2],
    ]);

    private static readonly TestSnapshotLimits = new Map<SnapshotType, number>([
        [SnapshotType.Action, 3],
        [SnapshotType.Phase, 2],
    ]);

    public readonly undoMode: UndoMode;

    private readonly game: Game;
    private readonly _gameStateManager: GameStateManager;
    protected readonly snapshotFactory: SnapshotFactory;

    protected readonly actionSnapshots: SnapshotHistoryMap<string>;
    protected readonly phaseSnapshots: SnapshotHistoryMap<PhaseName>;

    /** Maps each player id to a map of snapshots by snapshot id */
    protected readonly manualSnapshots: Map<string, SnapshotMap<number>>;

    public get currentSnapshotId(): number | null {
        return this.snapshotFactory.currentSnapshotId;
    }

    public get currentSnapshottedAction(): number | null {
        return this.snapshotFactory.currentSnapshottedAction;
    }

    public get currentSnapshottedPhase(): PhaseName | null {
        return this.snapshotFactory.currentSnapshottedPhase;
    }

    public get currentSnapshottedRound(): number | null {
        return this.snapshotFactory.currentSnapshottedRound;
    }

    public get currentSnapshottedTimepoint(): SnapshotTimepoint | null {
        return this.snapshotFactory.currentSnapshottedTimepoint;
    }

    /** Exposes a version of GameStateManager that doesn't have access to rollback functionality */
    public get gameObjectManager(): IGameObjectRegistrar {
        return this._gameStateManager;
    }

    public constructor(game: Game, undoMode: UndoMode = UndoMode.Disabled) {
        this.game = game;
        this._gameStateManager = new GameStateManager(game);
        this.snapshotFactory = new SnapshotFactory(game, this._gameStateManager);

        this.undoMode = undoMode;

        const limits = undoMode === UndoMode.Full ? SnapshotManager.FullSnapshotLimits : SnapshotManager.TestSnapshotLimits;

        this.actionSnapshots = this.snapshotFactory.createSnapshotHistoryMap<string>(limits.get(SnapshotType.Action));
        this.phaseSnapshots = this.snapshotFactory.createSnapshotHistoryMap<PhaseName>(limits.get(SnapshotType.Phase));
        this.manualSnapshots = new Map<string, SnapshotMap<number>>();
    }

    /** Indicates that we're on a new action and that a new action snapshot can be taken */
    public moveToNextTimepoint(timepoint: SnapshotTimepoint, actingPlayerId?: string) {
        if (this.undoMode === UndoMode.Disabled) {
            // if undo is not enabled, still do explicit GO cleanup to avoid heavy memory usage
            this._gameStateManager.removeUnusedGameObjects();
            return;
        }

        const previousQuickSnapshotForPlayer = this.buildNextQuickSnapshotsMap(actingPlayerId);

        this.snapshotFactory.createSnapshotForCurrentTimepoint(timepoint, previousQuickSnapshotForPlayer);
    }

    /**
     * Builds a map indicating what type of quick rollback to do in order to get _to_ the current snapshot from the next snapshot in the "quick snapshot" sequence
     * @param actingPlayerId the player who is considered active for the current snapshot. null if both players are (e.g. for resourcing)
     */
    private buildNextQuickSnapshotsMap(actingPlayerId?: string): Map<string, QuickSnapshotType> | null {
        const timepoint = this.currentSnapshottedTimepoint;
        if (timepoint == null) {
            return null;
        }

        // start-of-action-phase snapshots are not included in the quick undo history so we just propagate the values forward to preserve them
        if (
            timepoint === SnapshotTimepoint.StartOfPhase
        ) {
            if (this.currentSnapshottedPhase === PhaseName.Action) {
                return new Map<string, QuickSnapshotType>(this.game.getPlayers().map((player) => [player.id, this.snapshotFactory.getCurrentSnapshotQuickRollbackPoint(player.id)]));
            }

            // TODO: we currently filter out setup phase snapshots from quick undo history, we'll adjust once those are fully implemented
            if (this.currentSnapshottedPhase === PhaseName.Setup) {
                return null;
            }
        }

        const quickSnapshots = new Map<string, QuickSnapshotType>();

        for (const player of this.game.getPlayers()) {
            // if the player was not active for this snapshot, just reuse the previous value
            if (actingPlayerId != null && player.id !== actingPlayerId) {
                quickSnapshots.set(player.id, this.snapshotFactory.getCurrentSnapshotQuickRollbackPoint(player.id));
                continue;
            }

            switch (timepoint) {
                case SnapshotTimepoint.Action:
                    quickSnapshots.set(player.id, QuickSnapshotType.Action);
                    break;
                case SnapshotTimepoint.StartOfPhase:
                    Contract.assertTrue(this.currentSnapshottedPhase === PhaseName.Regroup, `Attempting to save quick snapshot for start of unknown phase type: ${this.currentSnapshottedPhase}`);
                    quickSnapshots.set(player.id, QuickSnapshotType.Regroup);
                    break;
                case null:
                case undefined:
                    break;
                default:
                    throw new Error(`Unrecognized timepoint: ${this.snapshotFactory.currentSnapshottedTimepoint}`);
            }
        }

        return quickSnapshots;
    }

    public takeSnapshot(settings: ISnapshotSettings): number {
        if (this.undoMode !== UndoMode.Full) {
            return -1;
        }

        switch (settings.type) {
            case SnapshotType.Action:
                return this.actionSnapshots.takeSnapshot(settings.playerId);
            case SnapshotType.Manual:
                return this.takeManualSnapshot(settings);
            case SnapshotType.Phase:
                return this.phaseSnapshots.takeSnapshot(settings.phaseName);
            default:
                throw new Error(`Unimplemented snapshot type in takeSnapshot: ${JSON.stringify(settings)}`);
        }
    }

    private takeManualSnapshot(settings: IManualSnapshotSettings): number {
        let playerSnapshots = this.manualSnapshots.get(settings.playerId);
        if (!playerSnapshots) {
            playerSnapshots = this.snapshotFactory.createSnapshotMap<number>();
            this.manualSnapshots.set(settings.playerId, playerSnapshots);
        }

        const snapshotId = this.snapshotFactory.currentSnapshotId;

        playerSnapshots.takeSnapshot(snapshotId);

        return snapshotId;
    }

    public rollbackTo(settings: IGetSnapshotSettings): IRollbackResult {
        if (this.undoMode !== UndoMode.Full) {
            return { success: false };
        }

        // Handle Quick snapshots with specialized logic
        if (settings.type === SnapshotType.Quick) {
            return this.quickRollback(settings.playerId);
        }

        // Handle all other snapshot types
        let rolledBackSnapshotIdx: number = null;
        switch (settings.type) {
            case SnapshotType.Action:
                rolledBackSnapshotIdx = this.actionSnapshots.rollbackToSnapshot(settings.playerId, this.checkGetOffset(settings.actionOffset));
                break;
            case SnapshotType.Manual:
                rolledBackSnapshotIdx = this.rollbackManualSnapshot(settings);
                break;
            case SnapshotType.Phase:
                rolledBackSnapshotIdx = this.phaseSnapshots.rollbackToSnapshot(settings.phaseName, this.checkGetOffset(settings.phaseOffset));
                break;
            default:
                throw new Error(`Unimplemented snapshot type in rollbackTo: ${JSON.stringify(settings)}`);
        }

        if (rolledBackSnapshotIdx != null) {
            // Throw out all snapshots after the rollback snapshot.
            this.snapshotFactory.clearNewerSnapshots(rolledBackSnapshotIdx);
            return { success: true, entryPoint: this.getEntryPointAfterRollback(settings) };
        }

        return { success: false };
    }

    private quickRollback(playerId: string): IRollbackResult {
        const quickResult = this.getQuickRollbackPoint(playerId);

        let result: IQuickRollbackResult;
        switch (quickResult) {
            case QuickRollbackPoint.Regroup:
                result = this.quickRollbackToLastRegroupSnapshot();
                break;
            case QuickRollbackPoint.CurrentAction:
            case QuickRollbackPoint.PreviousAction:
                result = this.quickRollbackToActionSnapshot(playerId, quickResult);
                break;
            case null:
            case undefined:
                return { success: false };
            default:
                Contract.fail(`Unrecognized quick rollback point: ${quickResult}`);
        }

        this.snapshotFactory.clearNewerSnapshots(result.snapshotId);
        return { success: true, entryPoint: result.roundEntryPoint };
    }

    /**
     * Returns the snapshot type to do a quick rollback to, if available
     */
    private getQuickRollbackPoint(playerId: string): QuickRollbackPoint | null {
        const player = this.game.getPlayerById(playerId);
        const playerPromptType = player.promptState.promptType;

        // if we're currently in resource selection and the player has already clicked "done", we'll roll back to start of resource selection
        if (
            this.game.currentPhase === PhaseName.Regroup &&
            playerPromptType === PromptType.Resource &&
            this.game.currentOpenPrompt.isAllPlayerPrompt() &&
            this.game.currentOpenPrompt.completionCondition(player)
        ) {
            return this.getCurrentQuickRollbackPoint();
        }

        // TODO THIS PR: update the chunk below to account for phase boundary prompts (e.g Sneak Attack or Thrawn1 trigger)

        // if we're in the middle of an action, revert to start of action
        if (this.currentSnapshottedTimepoint === SnapshotTimepoint.Action && playerPromptType !== PromptType.ActionWindow) {
            return QuickRollbackPoint.CurrentAction;
        }

        // otherwise, just default to whatever prior quick rollback point is stored on the snapshot (if available)
        const quickRollbackSnapshotType = this.snapshotFactory.getCurrentSnapshotQuickRollbackPoint(playerId);
        switch (quickRollbackSnapshotType) {
            case QuickSnapshotType.Action:
                let minActionSnapshots: number;
                let rollbackPoint: QuickRollbackPoint;

                if (this.currentSnapshottedTimepoint === SnapshotTimepoint.Action) {
                    minActionSnapshots = 2;
                    rollbackPoint = QuickRollbackPoint.PreviousAction;
                } else {
                    minActionSnapshots = 1;
                    rollbackPoint = QuickRollbackPoint.CurrentAction;
                }

                return this.countAvailableActionSnapshots(playerId) >= minActionSnapshots ? rollbackPoint : null;

            case QuickSnapshotType.Regroup:
                const minRegroupSnapshots = this.currentSnapshottedTimepoint === SnapshotTimepoint.StartOfPhase ? 2 : 1;
                return this.countAvailablePhaseSnapshots(PhaseName.Regroup) >= minRegroupSnapshots ? QuickRollbackPoint.Regroup : null;

            case null:
            case undefined:
                return null;

            default:
                Contract.fail(`Unrecognized quick rollback point: ${quickRollbackSnapshotType}`);
        }
    }

    private getCurrentQuickRollbackPoint(): QuickRollbackPoint {
        switch (this.currentSnapshottedTimepoint) {
            case SnapshotTimepoint.Action:
                return QuickRollbackPoint.CurrentAction;
            case SnapshotTimepoint.StartOfPhase:
                return QuickRollbackPoint.Regroup;
            default:
                Contract.fail(`Unrecognized snapshot timepoint type: ${this.currentSnapshottedTimepoint}`);
        }
    }

    private quickRollbackToLastRegroupSnapshot(): IQuickRollbackResult {
        const snapshotId = this.phaseSnapshots.rollbackToSnapshot(PhaseName.Regroup, 0);

        Contract.assertNotNullLike(snapshotId, 'Attempted to roll back to regroup phase snapshot for quick rollback, but no such snapshot exists.');

        return { snapshotId, roundEntryPoint: { type: RollbackEntryPointType.Round, entryPoint: RollbackRoundEntryPoint.StartOfRegroupPhase } };
    }

    /**
     * Rolls back to the action snapshot for the specified player.
     */
    private quickRollbackToActionSnapshot(playerId: string, quickRollbackPoint: QuickRollbackPoint.CurrentAction | QuickRollbackPoint.PreviousAction): IQuickRollbackResult {
        const snapshotId = this.actionSnapshots.rollbackToSnapshot(playerId, quickRollbackPoint === QuickRollbackPoint.CurrentAction ? 0 : -1);

        Contract.assertNotNullLike(snapshotId, 'Attempted to roll back to action snapshot for quick rollback, but no such snapshot exists.');

        return { snapshotId, roundEntryPoint: { type: RollbackEntryPointType.Round, entryPoint: RollbackRoundEntryPoint.WithinActionPhase } };
    }

    private rollbackManualSnapshot(settings: IGetManualSnapshotSettings): number {
        const rolledBackSnapshotIdx = this.manualSnapshots.get(settings.playerId)?.rollbackToSnapshot(settings.snapshotId);

        Contract.assertNotNullLike(rolledBackSnapshotIdx, `Manual snapshot with ID ${settings.snapshotId} does not exist for player ${settings.playerId}.`);

        return rolledBackSnapshotIdx;
    }

    private checkGetOffset(offsetValue: number) {
        const offset = offsetValue ?? 0;
        Contract.assertTrue(offset < 1, `Snapshot offset must be less than 1, got ${offset}.`);
        return offset;
    }

    private getEntryPointAfterRollback(settings: IGetSnapshotSettings): IRollbackSetupEntryPoint | IRollbackRoundEntryPoint {
        switch (settings.type) {
            case SnapshotType.Action:
                return {
                    type: RollbackEntryPointType.Round,
                    entryPoint: RollbackRoundEntryPoint.WithinActionPhase,
                };
            case SnapshotType.Phase:
                switch (settings.phaseName) {
                    case PhaseName.Setup:
                        return {
                            type: RollbackEntryPointType.Setup,
                            entryPoint: RollbackSetupEntryPoint.StartOfSetupPhase,
                        };
                    case PhaseName.Action:
                        return {
                            type: RollbackEntryPointType.Round,
                            entryPoint: RollbackRoundEntryPoint.StartOfRound,
                        };
                    case PhaseName.Regroup:
                        return {
                            type: RollbackEntryPointType.Round,
                            entryPoint: RollbackRoundEntryPoint.StartOfRegroupPhase,
                        };
                }
            case SnapshotType.Manual:
                return {
                    type: RollbackEntryPointType.Round,
                    entryPoint: this.snapshotFactory.currentSnapshottedPhase === PhaseName.Action ? RollbackRoundEntryPoint.WithinActionPhase : RollbackRoundEntryPoint.StartOfRegroupPhase
                };
            default:
                Contract.fail(`Unimplemented snapshot type: ${JSON.stringify(settings)}`);
        }
    }

    public countAvailableActionSnapshots(playerId: string): number {
        return this.actionSnapshots.getSnapshotCount(playerId);
    }

    public countAvailableManualSnapshots(playerId: string): number {
        return this.manualSnapshots.get(playerId)?.getSnapshotCount() ?? 0;
    }

    public countAvailablePhaseSnapshots(phaseName: PhaseName.Action | PhaseName.Regroup): number {
        return this.phaseSnapshots.getSnapshotCount(phaseName);
    }

    public hasAvailableQuickSnapshot(playerId: string): boolean {
        return this.getQuickRollbackPoint(playerId) !== null;
    }

    public clearAllSnapshots(): void {
        this.actionSnapshots.clearAllSnapshots();
        this.phaseSnapshots.clearAllSnapshots();
        this.snapshotFactory.clearCurrentSnapshot();

        for (const playerSnapshots of this.manualSnapshots.values()) {
            playerSnapshots.clearAllSnapshots();
        }
    }
}

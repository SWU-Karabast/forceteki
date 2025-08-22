import { PhaseName, RollbackSetupEntryPoint } from '../Constants';
import { RollbackRoundEntryPoint as RollbackRoundEntryPoint } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import type { IGameObjectRegistrar } from './GameStateManager';
import { GameStateManager } from './GameStateManager';
import type { IRollbackRoundEntryPoint, IRollbackSetupEntryPoint, ISnapshotProperties, SnapshotTimepoint } from './SnapshotInterfaces';
import { RollbackEntryPointType, type IGetManualSnapshotSettings, type IGetSnapshotSettings, type IManualSnapshotSettings, type IRollbackResult, type ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { SnapshotMap } from './container/SnapshotMap';
import { ActionWindow } from '../gameSteps/ActionWindow';
import { VariableResourcePrompt } from '../gameSteps/prompts/VariableResourcePrompt';

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
    Action = 'action',
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
        [SnapshotType.Action, 2],
        [SnapshotType.Phase, 1],
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
    public moveToNextTimepoint(timepoint: SnapshotTimepoint) {
        if (this.undoMode === UndoMode.Disabled) {
            // if undo is not enabled, still do explicit GO cleanup to avoid heavy memory usage
            this._gameStateManager.removeUnusedGameObjects();
            return;
        }

        this.snapshotFactory.createSnapshotForCurrentTimepoint(timepoint);
    }

    public takeSnapshot(settings: ISnapshotSettings): number {
        if (this.undoMode === UndoMode.Disabled) {
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
            case QuickRollbackPoint.Action:
                result = this.quickRollbackToLastActionSnapshot(playerId);
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
        const playerPrompt = this.game.getPlayerById(playerId).promptState;
        const playerPromptTitle = playerPrompt.promptTitle;

        // If we're currently in regroup phase and the player has at least selected cards, we'll roll back to start of regroup phase
        if (
            this.game.currentPhase === PhaseName.Regroup &&
            (playerPromptTitle !== VariableResourcePrompt.title || playerPrompt.selectedCards.length > 0)
        ) {
            return QuickRollbackPoint.Regroup;
        }

        // if we're at the beginning of the action window (nothing clicked), we'll revert back to the action before this one
        const actionOffset = playerPromptTitle === ActionWindow.title ? -1 : 0;

        // Otherwise, see if we can roll back to the most recent action phase snapshot
        const actionProps = this.actionSnapshots.getSnapshotProperties(playerId, actionOffset);
        if (!actionProps) {
            // If there are no remaining action snapshots, check if there were any actions between us and the most recent regroup phase snapshot.
            // If not, we can roll back to the regroup phase snapshot since it was the most recent timepoint anyway
            if (this.phaseSnapshots.getSnapshotProperties(PhaseName.Regroup, 0)?.actionNumber === this.currentSnapshottedAction) {
                return QuickRollbackPoint.Regroup;
            }

            return null;
        }

        if (actionProps.roundNumber < this.game.roundNumber) {
            return this.getQuickRollbackPreviousRound(actionProps, playerId);
        }

        return QuickRollbackPoint.Action;
    }

    private getQuickRollbackPreviousRound(actionSnapshotProps: ISnapshotProperties, playerId: string): QuickRollbackPoint {
        // Validate action is not from too far back
        Contract.assertFalse(
            actionSnapshotProps.roundNumber < this.game.roundNumber - 1,
            `Attempting to do quick undo and found that most recent available action is from ${this.game.roundNumber - actionSnapshotProps.roundNumber} rounds ago, which is too far back.`
        );

        // Try to find the regroup snapshot from the previous round
        const regroupProps = this.phaseSnapshots.getSnapshotProperties(PhaseName.Regroup, 0);
        if (regroupProps) {
            Contract.assertFalse(
                regroupProps.roundNumber < actionSnapshotProps.roundNumber,
                `Attempting to do quick undo and found that most recent available regroup snapshot is from ${this.game.roundNumber - regroupProps.roundNumber} rounds ago, which is too far back.`
            );

            // Roll back to regroup snapshot
            return QuickRollbackPoint.Regroup;
        }

        // No regroup snapshot available, fall back to action snapshot
        // Note: This uses the action snapshot even though it's from previous round
        return QuickRollbackPoint.Action;
    }

    private quickRollbackToLastRegroupSnapshot(): IQuickRollbackResult {
        const snapshotId = this.phaseSnapshots.rollbackToSnapshot(PhaseName.Regroup, 0);

        Contract.assertNotNullLike(snapshotId, 'Attempted to roll back to regroup phase snapshot for quick rollback, but no such snapshot exists.');

        return { snapshotId, roundEntryPoint: { type: RollbackEntryPointType.Round, entryPoint: RollbackRoundEntryPoint.StartOfRegroupPhase } };
    }

    /**
     * Rolls back to the action snapshot for the specified player.
     */
    private quickRollbackToLastActionSnapshot(playerId: string): IQuickRollbackResult {
        const snapshotId = this.actionSnapshots.rollbackToSnapshot(playerId, 0);

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

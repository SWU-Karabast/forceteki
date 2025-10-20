import { PhaseName, RollbackSetupEntryPoint } from '../Constants';
import { RollbackRoundEntryPoint as RollbackRoundEntryPoint } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import type { IGameObjectRegistrar } from './GameStateManager';
import { GameStateManager } from './GameStateManager';
import type { ICanRollBackResult, IRollbackRoundEntryPoint, IRollbackSetupEntryPoint, ISnapshotProperties } from './SnapshotInterfaces';
import { SnapshotTimepoint } from './SnapshotInterfaces';
import { RollbackEntryPointType, type IGetManualSnapshotSettings, type IGetSnapshotSettings, type IManualSnapshotSettings, type IRollbackResult, type ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { SnapshotMap } from './container/SnapshotMap';
import type { MetaSnapshotArray } from './container/MetaSnapshotArray';
import { QuickRollbackPoint } from './container/MetaSnapshotArray';
import { PromptType } from '../gameSteps/PromptInterfaces';

export enum UndoMode {
    Disabled = 'disabled',
    Request = 'full',
    Free = 'free',
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
    private static readonly SnapshotLimits = new Map<SnapshotType, number>([
        [SnapshotType.Action, 3],
        [SnapshotType.Phase, 2],
    ]);

    private readonly game: Game;
    private readonly _gameStateManager: GameStateManager;
    protected readonly snapshotFactory: SnapshotFactory;

    protected readonly actionSnapshots: SnapshotHistoryMap<string>;
    protected readonly phaseSnapshots: SnapshotHistoryMap<PhaseName>;
    protected readonly quickSnapshots: Map<string, MetaSnapshotArray>;

    /** Maps each player id to a map of snapshots by snapshot id */
    protected readonly manualSnapshots: Map<string, SnapshotMap<number>>;

    private _gameStepsSinceLastUndo?: number;
    private _undoMode: UndoMode;

    public get currentSnapshotId(): number | null {
        return this.snapshotFactory.currentSnapshotId;
    }

    public get currentSnapshottedAction(): number | null {
        return this.snapshotFactory.currentSnapshottedAction;
    }

    public get currentSnapshottedActivePlayer(): string | null {
        return this.snapshotFactory.currentSnapshottedActivePlayer;
    }

    public get currentSnapshottedPhase(): PhaseName | null {
        return this.snapshotFactory.currentSnapshottedPhase;
    }

    public get currentSnapshottedRound(): number | null {
        return this.snapshotFactory.currentSnapshottedRound;
    }

    public get currentSnapshottedTimepointNumber(): number | null {
        return this.snapshotFactory.currentSnapshottedTimepointNumber;
    }

    public get currentSnapshottedTimepointType(): SnapshotTimepoint | null {
        return this.snapshotFactory.currentSnapshottedTimepointType;
    }

    public get gameStepsSinceLastUndo(): number {
        return this._gameStepsSinceLastUndo;
    }

    /** Exposes a version of GameStateManager that doesn't have access to rollback functionality */
    public get gameObjectManager(): IGameObjectRegistrar {
        return this._gameStateManager;
    }

    public get undoMode(): UndoMode {
        return this._undoMode;
    }

    public constructor(game: Game, undoMode: UndoMode = UndoMode.Disabled) {
        this.game = game;
        this._gameStateManager = new GameStateManager(game);
        this.snapshotFactory = new SnapshotFactory(game, this._gameStateManager);

        this._undoMode = undoMode;

        const limits = SnapshotManager.SnapshotLimits;
        this.actionSnapshots = this.snapshotFactory.createSnapshotHistoryMap<string>(limits.get(SnapshotType.Action));
        this.phaseSnapshots = this.snapshotFactory.createSnapshotHistoryMap<PhaseName>(limits.get(SnapshotType.Phase));
        this.manualSnapshots = new Map<string, SnapshotMap<number>>();

        this.quickSnapshots = new Map<string, MetaSnapshotArray>();
    }

    /** Indicates that we're on a new action and that a new action snapshot can be taken */
    public moveToNextTimepoint(timepoint: SnapshotTimepoint) {
        this.game.resetForNewTimepoint();

        if (this._undoMode === UndoMode.Disabled) {
            // if undo is not enabled, still do explicit GO cleanup to avoid heavy memory usage
            this._gameStateManager.removeUnusedGameObjects();
            return;
        }

        if (timepoint === SnapshotTimepoint.Action) {
            this.snapshotFactory.setNextSnapshotIsSamePlayer(this.game.actionPhaseActivePlayer.id === this.currentSnapshottedActivePlayer);
        }

        this.snapshotFactory.createSnapshotForCurrentTimepoint(timepoint);

        if (this._gameStepsSinceLastUndo != null) {
            this._gameStepsSinceLastUndo++;
        }
    }

    public takeSnapshot(settings: ISnapshotSettings): number {
        if (this._undoMode === UndoMode.Disabled) {
            return -1;
        }

        switch (settings.type) {
            case SnapshotType.Action:
                const actionSnapshotNumber = this.actionSnapshots.takeSnapshot(settings.playerId);
                this.addQuickActionSnapshot(settings.playerId);
                return actionSnapshotNumber;
            case SnapshotType.Manual:
                return this.takeManualSnapshot(settings);
            case SnapshotType.Phase:
                const phaseSnapshotNumber = this.phaseSnapshots.takeSnapshot(settings.phaseName);

                if (this.game.currentPhase === PhaseName.Regroup || this.game.currentPhase === PhaseName.Setup) {
                    this.addQuickStartOfPhaseSnapshots(this.game.currentPhase);
                }

                return phaseSnapshotNumber;
            default:
                throw new Error(`Unimplemented snapshot type in takeSnapshot: ${JSON.stringify(settings)}`);
        }
    }

    public setUndoConfirmationRequired(enabled: boolean) {
        this._undoMode = enabled ? UndoMode.Request : UndoMode.Free;
    }

    private addQuickActionSnapshot(playerId: string) {
        Contract.assertNotNullLike(playerId);

        let quickSnapshots = this.quickSnapshots.get(playerId);
        if (!quickSnapshots) {
            quickSnapshots = this.snapshotFactory.createMetaSnapshotArray();
            this.quickSnapshots.set(playerId, quickSnapshots);
        }

        // sanity check
        const actionSnapshotId = this.actionSnapshots.getSnapshotProperties(playerId)?.snapshotId;
        Contract.assertTrue(actionSnapshotId === this.currentSnapshotId, `Attempting to make a quick snapshot from an action snapshot, but the latest action snapshot for ${playerId} (${actionSnapshotId}) does not match the active snapshot id (${this.currentSnapshotId}). Make sure that an action snapshot is taken before creating a quick snapshot from it.`);

        quickSnapshots.addSnapshotFromMap(this.actionSnapshots, playerId);
    }

    private addQuickStartOfPhaseSnapshots(phase: PhaseName.Regroup | PhaseName.Setup) {
        // sanity check
        const phaseSnapshotId = this.phaseSnapshots.getSnapshotProperties(phase)?.snapshotId;
        Contract.assertTrue(phaseSnapshotId === this.currentSnapshotId, `Attempting to make a quick snapshot from a ${phase} snapshot, but the latest ${phase} phase start snapshot (${phaseSnapshotId}) does not match the active snapshot id (${this.currentSnapshotId}). Make sure that a ${phase} phase start snapshot is taken before creating a quick snapshot from it.`);

        for (const player of this.game.getPlayers()) {
            let quickSnapshots = this.quickSnapshots.get(player.id);
            if (!quickSnapshots) {
                quickSnapshots = this.snapshotFactory.createMetaSnapshotArray();
                this.quickSnapshots.set(player.id, quickSnapshots);
            }

            quickSnapshots.addSnapshotFromMap(this.phaseSnapshots, phase);
        }
    }

    public addQuickStartOfActionSnapshot(playerId: string) {
        if (this._undoMode === UndoMode.Disabled) {
            return;
        }

        Contract.assertNotNullLike(playerId);

        // sanity check
        const actionSnapshotId = this.phaseSnapshots.getSnapshotProperties(PhaseName.Action)?.snapshotId;
        Contract.assertTrue(actionSnapshotId === this.currentSnapshotId, `Attempting to make a quick snapshot from an action snapshot, but the latest action phase start snapshot (${actionSnapshotId}) does not match the active snapshot id (${this.currentSnapshotId}). Make sure that an action phase start snapshot is taken before creating a quick snapshot from it.`);

        let quickSnapshots = this.quickSnapshots.get(playerId);
        if (!quickSnapshots) {
            quickSnapshots = this.snapshotFactory.createMetaSnapshotArray();
            this.quickSnapshots.set(playerId, quickSnapshots);
        }

        quickSnapshots.addSnapshotFromMap(this.phaseSnapshots, PhaseName.Action);
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
        if (this._undoMode === UndoMode.Disabled) {
            return { success: false };
        }

        return this.rollbackToInternal(settings);
    }

    public buildRollbackHandler(settings: IGetSnapshotSettings): () => IRollbackResult {
        const quickRollbackPoint = settings.type === SnapshotType.Quick ? this.getQuickRollbackPoint(settings.playerId) : null;
        return () => this.rollbackToInternal(settings, quickRollbackPoint);
    }

    private rollbackToInternal(settings: IGetSnapshotSettings, overrideQuickRollbackPoint?: QuickRollbackPoint): IRollbackResult {
        Contract.assertFalse(settings.type !== SnapshotType.Quick && overrideQuickRollbackPoint != null, 'overrideQuickRollbackPoint can only be set when rolling back a Quick snapshot');

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
            case SnapshotType.Quick:
                const rollbackPoint = overrideQuickRollbackPoint ?? this.getQuickRollbackPoint(settings.playerId);
                rolledBackSnapshotIdx = this.quickRollback(settings.playerId, rollbackPoint);
                break;
            default:
                throw new Error(`Unimplemented snapshot type in rollbackTo: ${JSON.stringify(settings)}`);
        }

        if (rolledBackSnapshotIdx != null) {
            // Throw out all snapshots after the rollback snapshot.
            this.snapshotFactory.clearNewerSnapshots(rolledBackSnapshotIdx);
            this._gameStepsSinceLastUndo = 0;
            return { success: true, entryPoint: this.getEntryPointAfterRollback(settings) };
        }

        return { success: false };
    }

    public getRollbackInformation(settings: IGetSnapshotSettings): ICanRollBackResult {
        switch (settings.type) {
            case SnapshotType.Action:
                return { requiresConfirmation: this.actionSnapshots.getSnapshotProperties(settings.playerId, this.checkGetOffset(settings.actionOffset))?.requiresConfirmationToRollback ?? true };
            case SnapshotType.Manual:
                return { requiresConfirmation: this.manualSnapshots.get(settings.playerId)?.getSnapshotProperties(settings.snapshotId)?.requiresConfirmationToRollback ?? true };
            case SnapshotType.Phase:
                return { requiresConfirmation: this.phaseSnapshots.getSnapshotProperties(settings.phaseName, this.checkGetOffset(settings.phaseOffset))?.requiresConfirmationToRollback ?? true };
            case SnapshotType.Quick:
                return this.getQuickRollbackInformation(settings.playerId);
            default:
                throw new Error(`Unimplemented snapshot type in requiresConfirmationToRollbackTo: ${JSON.stringify(settings)}`);
        }
    }

    private quickRollback(playerId: string, rollbackPoint: QuickRollbackPoint): number | null {
        const snapshotId = this.quickSnapshots.get(playerId).rollbackToSnapshot(rollbackPoint);

        if (snapshotId == null) {
            return null;
        }

        return snapshotId;
    }

    /**
     * Returns the snapshot type to do a quick rollback to, if available
     */
    private getQuickRollbackPoint(playerId: string): QuickRollbackPoint | null {
        const player = this.game.getPlayerById(playerId);
        const playerPromptType = player.promptState.promptType;

        const currentOpenPrompt = this.game.getCurrentOpenPrompt();

        // if we're currently in resource selection and the player has already clicked "done", we'll roll back to start of resource selection
        if (
            this.game.currentPhase === PhaseName.Regroup &&
            playerPromptType === PromptType.Resource &&
            currentOpenPrompt?.isAllPlayerPrompt() &&
            currentOpenPrompt?.completionCondition(player)
        ) {
            return QuickRollbackPoint.Current;
        }

        // TODO THIS PR: update the chunk below to account for phase boundary prompts (e.g Sneak Attack or Thrawn1 trigger)

        // if we're in the middle of an action, revert to start of action
        if (this.currentSnapshottedTimepointType === SnapshotTimepoint.Action && playerPromptType !== PromptType.ActionWindow) {
            return QuickRollbackPoint.Current;
        }

        // if we're at a step that doesn't normally have a snapshot and we haven't already taken a snapshot for this timepoint, the previous one will still be "Current"
        // TODO: this issue makes bookkeeping confusing, is there a better way we could handle the Current / Previous distinction
        if (
            [SnapshotTimepoint.RegroupReadyCards, SnapshotTimepoint.StartOfPhase, SnapshotTimepoint.EndOfPhase].includes(this.currentSnapshottedTimepointType) &&
            this.quickSnapshots.get(playerId)?.getMostRecentSnapshotId() < this.currentSnapshotId
        ) {
            return QuickRollbackPoint.Current;
        }

        return QuickRollbackPoint.Previous;
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
        switch (this.currentSnapshottedTimepointType) {
            case SnapshotTimepoint.Mulligan:
            case SnapshotTimepoint.SetupResource:
                return {
                    type: RollbackEntryPointType.Setup,
                    entryPoint: RollbackSetupEntryPoint.WithinSetupPhase,
                };
            case SnapshotTimepoint.Action:
                return {
                    type: RollbackEntryPointType.Round,
                    entryPoint: RollbackRoundEntryPoint.WithinActionPhase,
                };
            case SnapshotTimepoint.RegroupResource:
            case SnapshotTimepoint.RegroupReadyCards:
                return {
                    type: RollbackEntryPointType.Round,
                    entryPoint: RollbackRoundEntryPoint.WithinRegroupPhase,
                };
            case SnapshotTimepoint.StartOfPhase:
                switch (this.currentSnapshottedPhase) {
                    case PhaseName.Setup:
                        return {
                            type: RollbackEntryPointType.Setup,
                            entryPoint: RollbackSetupEntryPoint.StartOfSetupPhase,
                        };
                    case PhaseName.Action:
                        return {
                            type: RollbackEntryPointType.Round,
                            entryPoint: RollbackRoundEntryPoint.StartOfActionPhase,
                        };
                    case PhaseName.Regroup:
                        return {
                            type: RollbackEntryPointType.Round,
                            entryPoint: RollbackRoundEntryPoint.StartOfRegroupPhase,
                        };
                }
            case SnapshotTimepoint.EndOfPhase:
                switch (this.currentSnapshottedPhase) {
                    case PhaseName.Setup:
                        throw new Error('Rolling back to end of setup phase is not supported (no currently implemented card has end-of-setup-phase effects)');
                    case PhaseName.Action:
                        return {
                            type: RollbackEntryPointType.Round,
                            entryPoint: RollbackRoundEntryPoint.EndOfActionPhase,
                        };
                    case PhaseName.Regroup:
                        throw new Error('Rolling back to end of regroup phase is not supported');
                }
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
        const rollbackPoint = this.getQuickRollbackPoint(playerId);

        return this.quickSnapshots.get(playerId)?.hasQuickSnapshot(rollbackPoint) ?? false;
    }

    private getQuickRollbackInformation(playerId: string): ICanRollBackResult {
        const rollbackPoint = this.getQuickRollbackPoint(playerId);
        const quickSnapshotProperties = this.quickSnapshots.get(playerId)?.getSnapshotProperties(rollbackPoint);
        const isSameTimepoint = quickSnapshotProperties?.snapshotId === this.currentSnapshotId;

        if (!quickSnapshotProperties) {
            return { requiresConfirmation: true, isSameTimepoint };
        }

        if (this.opponentActedSinceLastSnapshot(rollbackPoint, quickSnapshotProperties)) {
            return { requiresConfirmation: true, isSameTimepoint };
        }

        return { requiresConfirmation: quickSnapshotProperties.requiresConfirmationToRollback, isSameTimepoint };
    }

    private opponentActedSinceLastSnapshot(rollbackPoint: QuickRollbackPoint, snapshotProperties: ISnapshotProperties) {
        if (this.currentSnapshottedTimepointNumber == null) {
            return true;
        }

        const timepointsSinceSnapshot = this.currentSnapshottedTimepointNumber - snapshotProperties.timepointNumber;

        switch (true) {
            case timepointsSinceSnapshot === 0 || timepointsSinceSnapshot === 1:
                return false;
            case timepointsSinceSnapshot === 2:
                return !snapshotProperties.nextSnapshotIsSamePlayer;
            case timepointsSinceSnapshot > 2:
                return true;
            default:
                Contract.fail(`Negative timepoints since snapshot: ${timepointsSinceSnapshot}, between current timepoint ${this.currentSnapshottedTimepointNumber} and snapshot timepoint ${snapshotProperties.timepointNumber}`);
        }
    }

    public setRequiresConfirmationToRollbackCurrentSnapshot(playerId: string) {
        this.actionSnapshots.setRequiresConfirmationToRollbackCurrentSnapshot(playerId);
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

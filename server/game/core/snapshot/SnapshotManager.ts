import type { PhaseName } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import type { IGameObjectRegistrar } from '../GameStateManager';
import { GameStateManager } from '../GameStateManager';
import type { IGetManualSnapshotSettings, IGetSnapshotSettings, IManualSnapshotSettings, ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { SnapshotMap } from './container/SnapshotMap';

const maxManualSnapshots = 5; // Number of manual player snapshots
const maxActionSnapshots = 3; // Number of actions saved for undo in a turn (per player)
const maxPhaseSnapshots = 2; // Current and previous of a specific phase

/**
 * The "interface" class for managing snapshots in the game.
 * Instantiates all of the snapshot mechanisms and manages them internally.
 *
 * Called by the Game for generating snapshots at key points and storing them for later rollback.
 * Also manages the GameStateManager which is used to manage GameObjects and overall game state.
 */
export class SnapshotManager {
    public readonly undoEnabled: boolean;

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

    /** Exposes a version of GameStateManager that doesn't have access to rollback functionality */
    public get gameStateManager(): IGameObjectRegistrar {
        return this._gameStateManager;
    }

    public constructor(game: Game, enableUndo: boolean) {
        this._gameStateManager = new GameStateManager(game);
        this.snapshotFactory = new SnapshotFactory(game, this._gameStateManager);

        this.undoEnabled = enableUndo;

        this.actionSnapshots = this.snapshotFactory.createSnapshotHistoryMap<string>(maxActionSnapshots);
        this.phaseSnapshots = this.snapshotFactory.createSnapshotHistoryMap<PhaseName>(maxPhaseSnapshots);
        this.manualSnapshots = new Map<string, SnapshotMap<number>>();
    }

    /** Indicates that we're on a new action and that new snapshots can be taken */
    public moveToNextAction() {
        if (!this.undoEnabled) {
            return;
        }

        this.snapshotFactory.createSnapshotForCurrentAction();
    }

    public takeSnapshot(settings: ISnapshotSettings): number {
        if (!this.undoEnabled) {
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
                throw new Error(`Unimplemented snapshot type: ${(settings as any).type}`);
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

    public rollbackTo(settings: IGetSnapshotSettings) {
        if (!this.undoEnabled) {
            return false;
        }

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
                throw new Error(`Unimplemented snapshot type: ${(settings as any).type}`);
        }

        if (rolledBackSnapshotIdx != null) {
            // Throw out all snapshots after the rollback snapshot.
            this.snapshotFactory.clearNewerSnapshots(rolledBackSnapshotIdx);
            return true;
        }

        return false;
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

    public countAvailableActionSnapshots(playerId: string): number {
        return this.actionSnapshots.getSnapshotCount(playerId);
    }

    public countAvailableManualSnapshots(playerId: string): number {
        return this.manualSnapshots.get(playerId)?.getSnapshotCount() ?? 0;
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

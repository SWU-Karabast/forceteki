import type { PhaseName } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import type { IGameObjectRegistrar } from '../GameStateManager';
import { GameStateManager } from '../GameStateManager';
import type { IGetSnapshotSettings, ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotArray } from './container/SnapshotArray';
import type { SnapshotHistoryMap } from './container/SnapshotHistoryMap';

const maxManualSnapshots = 5; // Number of manual player snapshots
const maxActionSnapshots = 2; // Number of actions saved for undo in a turn (per player)
const maxPhaseSnapshots = 2; // Current and previous of a specific phase
const maxRoundSnapshots = 2; // Current and previous start of round

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
    private readonly snapshotFactory: SnapshotFactory;

    private readonly actionSnapshots: SnapshotHistoryMap<string>;
    private readonly manualSnapshots: SnapshotHistoryMap<string>;
    private readonly phaseSnapshots: SnapshotHistoryMap<PhaseName>;
    private readonly roundStartSnapshots: SnapshotArray;

    public get currentSnapshotId(): number | null {
        return this.snapshotFactory.currentSnapshotId;
    }

    public get currentSnapshottedAction(): number | null {
        return this.snapshotFactory.currentSnapshottedAction;
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
        this.manualSnapshots = this.snapshotFactory.createSnapshotHistoryMap<string>(maxManualSnapshots);
        this.phaseSnapshots = this.snapshotFactory.createSnapshotHistoryMap<PhaseName>(maxPhaseSnapshots);
        this.roundStartSnapshots = this.snapshotFactory.createSnapshotArray(maxRoundSnapshots);
    }

    /** Indicates that we're on a new action and that new snapshots can be taken */
    public moveToNextAction() {
        if (!this.undoEnabled) {
            return;
        }

        this.snapshotFactory.createSnapshotForCurrentAction();
    }

    public takeSnapshot(settings: ISnapshotSettings): void {
        if (!this.undoEnabled) {
            return;
        }

        switch (settings.type) {
            case SnapshotType.Action:
                this.actionSnapshots.takeSnapshot(settings.playerId);
                break;
            case SnapshotType.Manual:
                this.manualSnapshots.takeSnapshot(settings.playerId);
                break;
            case SnapshotType.Round:
                this.roundStartSnapshots.takeSnapshot();
                break;
            case SnapshotType.Phase:
                this.phaseSnapshots.takeSnapshot(settings.phaseName);
                break;
            default:
                throw new Error(`Unimplemented snapshot type: ${(settings as any).type}`);
        }
    }

    public rollbackTo(settings: IGetSnapshotSettings) {
        if (!this.undoEnabled) {
            return;
        }

        const offset = settings.offset ?? -1;
        Contract.assertTrue(offset < 0, `Snapshot offset must be negative, got ${offset}.`);

        let rolledBackSnapshotIdx: number = null;
        switch (settings.type) {
            case SnapshotType.Action:
                rolledBackSnapshotIdx = this.actionSnapshots.rollbackToSnapshot(settings.playerId, offset);
                break;
            case SnapshotType.Manual:
                rolledBackSnapshotIdx = this.manualSnapshots.rollbackToSnapshot(settings.playerId, offset);
                break;
            case SnapshotType.Round:
                rolledBackSnapshotIdx = this.roundStartSnapshots.rollbackToSnapshot(offset);
                break;
            case SnapshotType.Phase:
                rolledBackSnapshotIdx = this.phaseSnapshots.rollbackToSnapshot(settings.phaseName, offset);
                break;
            default:
                throw new Error(`Unimplemented snapshot type: ${(settings as any).type}`);
        }

        if (rolledBackSnapshotIdx != null) {
            // Throw out all snapshots after the rollback snapshot.
            this.snapshotFactory.clearNewerSnapshots(rolledBackSnapshotIdx);
        }
    }

    // public canUndo(player: Player) {
    //     return !!this.getSnapshotForPlayer(player.getRef());
    // }
}

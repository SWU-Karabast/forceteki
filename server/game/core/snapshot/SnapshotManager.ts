import { SnapshotType } from '../Constants';
import type Game from '../Game';
import { GameStateManager } from '../GameStateManager';
import type { IGameSnapshot, IGetSnapshotSettings, ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotArray } from './container/SnapshotArray';
import { Player } from '../Player';

const maxPlayerSnapshots = 5; // Number of manual player snapshots
const maxActionSnapshots = 2; // Number of actions saved for undo in a turn (per player)
const maxPhaseSnapshots = 2; // Current and previous of a specific phase
const maxRoundSnapshots = 2; // Current and previous start of round


export class SnapshotManager {
    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;
    private readonly snapshotFactory: SnapshotFactory;

    private readonly roundStartSnapshots: SnapshotArray;

    public constructor(game: Game) {
        this.game = game;
        this.gameStateManager = new GameStateManager(game);
        this.snapshotFactory = new SnapshotFactory(game, this.gameStateManager);

        this.roundStartSnapshots = this.snapshotFactory.createSnapshotArray(maxRoundSnapshots);
    }

    public moveToNextAction() {
        this.snapshotFactory.createSnapshotForCurrentAction();
    }

    public takeSnapshot(settings: ISnapshotSettings): void {
        switch (settings.type) {
            case SnapshotType.Round:
                this.roundStartSnapshots.takeSnapshot();
                break;
            default:
                throw new Error(`Unimplemented snapshot type: ${settings.type}`);
        }
    }

    public rollbackTo(settings: IGetSnapshotSettings) {
        const offset = settings.offset ?? -1;
        Contract.assertTrue(offset < 0, `Snapshot offset must be negative, got ${offset}.`);

        let rolledBackSnapshotIdx: number = null;
        switch (settings.type) {
            case SnapshotType.Round:
                rolledBackSnapshotIdx = this.roundStartSnapshots.rollbackToSnapshot(offset);
                break;
            default:
                throw new Error(`Unimplemented snapshot type: ${settings.type}`);
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
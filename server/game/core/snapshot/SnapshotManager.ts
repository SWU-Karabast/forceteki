import type { PhaseName } from '../Constants';
import { SnapshotType } from '../Constants';
import type Game from '../Game';
import { GameStateManager } from '../GameStateManager';
import type { IGetSnapshotSettings, ISnapshotSettings } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotFactory } from './SnapshotFactory';
import type { SnapshotArray } from './container/SnapshotArray';
import type { SnapshotMap } from './container/SnapshotMap';

// const maxPlayerSnapshots = 5; // Number of manual player snapshots
// const maxActionSnapshots = 2; // Number of actions saved for undo in a turn (per player)
// const maxPhaseSnapshots = 2; // Current and previous of a specific phase
const maxRoundSnapshots = 2; // Current and previous start of round

/**
 * The "interface" class for managing snapshots in the game.
 * Instantiates all of the snapshot mechanisms and manages them internally.
 *
 * Called by the Game for generating snapshots at key points and storing them for later rollback.
 * Also manages the GameStateManager which is used to manage GameObjects and overall game state.
 */
export class SnapshotManager {
    private readonly gameStateManager: GameStateManager;
    private readonly snapshotFactory: SnapshotFactory;

    private readonly phaseSnapshots: SnapshotMap<PhaseName>;
    private readonly roundStartSnapshots: SnapshotArray;

    public constructor(game: Game) {
        this.gameStateManager = new GameStateManager(game);
        this.snapshotFactory = new SnapshotFactory(game, this.gameStateManager);

        // TODO: extend the phase snapshots data structure to allow for more than one snapshot of a given phase type (e.g. last two action phases)
        this.phaseSnapshots = this.snapshotFactory.createSnapshotMap<PhaseName>();
        this.roundStartSnapshots = this.snapshotFactory.createSnapshotArray(maxRoundSnapshots);
    }

    /** Indicates that we're on a new action and that new snapshots can be taken */
    public moveToNextAction() {
        this.snapshotFactory.createSnapshotForCurrentAction();
    }

    public takeSnapshot(settings: ISnapshotSettings): void {
        switch (settings.type) {
            case SnapshotType.Round:
                this.roundStartSnapshots.takeSnapshot();
                break;
            case SnapshotType.Phase:
                this.phaseSnapshots.takeSnapshot(settings.phaseName);
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
            case SnapshotType.Phase:
                rolledBackSnapshotIdx = this.phaseSnapshots.rollbackToSnapshot(settings.phaseName);
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

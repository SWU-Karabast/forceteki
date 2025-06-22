import type { Card } from './card/Card';
import type { PhaseName } from './Constants';
import { SnapshotType } from './Constants';
import type Game from './Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from './GameObjectBase';
import type { Player } from './Player';
import * as Contract from './utils/Contract.js';
import * as Helpers from './utils/Helpers.js';

export interface IGameSnapshot {
    id: number;
    lastId: number;

    gameState: IGameState;
    states: IGameObjectBaseState[];
    settings: ISnapshotSettings;
}

export interface IGameState {
    roundNumber: number;
    initialFirstPlayer: GameObjectRef<Player> | null;
    initiativePlayer: GameObjectRef<Player> | null;
    actionPhaseActivePlayer: GameObjectRef<Player> | null;
    isInitiativeClaimed: boolean;
    allCards: GameObjectRef<Card>[];
}

const maxPlayerSnapshots = 5; // Number of manual player snapshots
const maxActionSnapshots = 2; // Number of actions saved for undo in a turn (per player)
const maxPhaseSnapshots = 2; // Current and previous of a specific phase
const maxRoundSnapshots = 2; // Current and previous start of round

export interface ISnapshotSettingsBase {
    type: SnapshotType;
}

export interface IActionSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Action;
    playerRef: GameObjectRef<Player>;
}

export interface IPhaseSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Phase;
    phaseName: PhaseName;
}

export interface IPlayerSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Player;
    playerRef: GameObjectRef<Player>;
}

export interface IRoundSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Round;
}

export type ISnapshotSettings = IActionSnapshotSettings | IPhaseSnapshotSettings | IPlayerSnapshotSettings | IRoundSnapshotSettings;

export type IGetSnapshotSettings = ISnapshotSettings & {

    /**
     * Optional offset to indicate how far back in the list to go. Most recent is -1, second most recent is -2, etc.
     *
     * Defaults to -1 (most recent).
     */
    offset?: number;
};

export class GameStateManager {
    private readonly game: Game;
    private readonly snapshots: IGameSnapshot[];
    private readonly allGameObjects: GameObjectBase[];
    private readonly gameObjectMapping: Map<string, GameObjectBase>;

    // These contain snapshot indexes, not the ID, to cut down on a loop. This is safe as long as we maintain a flat list of snapshots.
    private allActionSnapshots: Map<string, number[]>;
    private allPlayerSnapshots: Map<string, number[]>;
    private allPhaseSnapshots: Map<PhaseName, number[]>;
    private roundSnapshots: number[];
    private lastId = 0;
    private lastSnapshotId = 0;

    public constructor(game: Game) {
        this.game = game;
        this.allGameObjects = [];
        this.snapshots = [];
        this.gameObjectMapping = new Map();
        this.allPlayerSnapshots = new Map();
        this.allPhaseSnapshots = new Map();
        this.roundSnapshots = [];
    }

    public get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null {
        if (!gameObjectRef?.uuid) {
            return null;
        }

        const ref = this.gameObjectMapping.get(gameObjectRef.uuid);
        Contract.assertNotNullLike(ref, `Tried to get a Game Object but the UUID is not registered ${gameObjectRef.uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`);
        return ref as T;
    }

    public register(gameObject: GameObjectBase | GameObjectBase[]) {
        gameObject = Helpers.asArray(gameObject);

        for (const go of gameObject) {
            Contract.assertIsNullLike(go.uuid,
                `Tried to register a Game Object that was already registered ${go.uuid}`
            );

            const nextId = this.lastId + 1;
            go.uuid = 'GameObject_' + nextId;
            this.lastId = nextId;
            this.allGameObjects.push(go);
            this.gameObjectMapping.set(go.uuid, go);
        }
    }

    public clearSnapshots() {
        this.snapshots.length = 0;
        this.allPlayerSnapshots.clear();
    }

    public takeSnapshot(options: ISnapshotSettings): number {
        const nextSnapshotId = this.lastSnapshotId + 1;
        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,

            lastId: this.lastId,
            gameState: structuredClone(this.game.state),
            states: this.allGameObjects.map((x) => x.getState()),

            settings: structuredClone(options)
        };
        this.lastSnapshotId = nextSnapshotId;

        switch (options.type) {
            case SnapshotType.Action:
                let actionSnapshots = this.allActionSnapshots.get(this.game.state.actionPhaseActivePlayer.uuid);
                if (!actionSnapshots) {
                    actionSnapshots = [];
                    this.allActionSnapshots.set(this.game.state.actionPhaseActivePlayer.uuid, actionSnapshots);
                }
                actionSnapshots.push(this.snapshots.length - 1);
                if (actionSnapshots.length > maxActionSnapshots) {
                    actionSnapshots.splice(0, 1);
                }
                break;
            case SnapshotType.Phase:
                let phaseSnapshots = this.allPhaseSnapshots.get(options.phaseName);
                if (!phaseSnapshots) {
                    phaseSnapshots = [];
                    this.allPhaseSnapshots.set(options.phaseName, phaseSnapshots);
                }
                phaseSnapshots.push(this.snapshots.length - 1);
                if (phaseSnapshots.length > maxPhaseSnapshots) {
                    phaseSnapshots.splice(0, 1);
                }
                break;
            case SnapshotType.Player:
                let playerSnapshots = this.allPlayerSnapshots.get(this.game.state.actionPhaseActivePlayer.uuid);
                if (!playerSnapshots) {
                    playerSnapshots = [];
                    this.allPlayerSnapshots.set(this.game.state.actionPhaseActivePlayer.uuid, playerSnapshots);
                }
                playerSnapshots.push(this.snapshots.length - 1);
                if (playerSnapshots.length > maxPlayerSnapshots) {
                    playerSnapshots.splice(0, 1);
                }
                break;
            case SnapshotType.Round:
                this.roundSnapshots.push(this.snapshots.length - 1);
                if (this.roundSnapshots.length > maxRoundSnapshots) {
                    this.roundSnapshots.splice(0, 1);
                }
                break;
            default:
                Contract.fail(`Invalid snapshot type provided: ${(options as any).type}`);
        }

        this.snapshots.push(snapshot);

        return snapshot.id;
    }

    public rollbackTo(settings: IGetSnapshotSettings) {
        let snapshot: IGameSnapshot;

        const offset = settings.offset ?? -1;
        Contract.assertTrue(offset < 0, `Snapshot offset must be negative, got ${offset}.`);

        if (settings.type === SnapshotType.Player) {
            snapshot = this.getSnapshotForPlayer(settings.playerRef);
            Contract.assertNotNullLike(snapshot, () => `Unable to find last snapshot for player ${this.get(settings.playerRef).name}`);
        } else if (settings.type === SnapshotType.Phase) {
            snapshot = this.getSnapshotForPhase(settings.phaseName, offset);
            Contract.assertNotNullLike(snapshot, () => `Unable to find last snapshot for ${settings.phaseName} Phase`);
        } else if (settings.type === SnapshotType.Round) {
            snapshot = this.getSnapshotForRound(offset);
            Contract.assertNotNullLike(snapshot, () => `Unable to find last snapshot for Round ${this.game.roundNumber + offset} (current round is Round ${this.game.roundNumber})`);
        } else {
            Contract.fail('Invalid rollback settings provided.');
        }

        return this.rollbackToSnapshot(snapshot.id);
    }

    private getSnapshotForPlayer(playerRef: GameObjectRef<Player>): IGameSnapshot | undefined {
        const playerSnapshots = this.allPlayerSnapshots.get(playerRef.uuid);
        if (!playerSnapshots) {
            return undefined;
        }

        const isActiveTurnPlayer = this.game.state.actionPhaseActivePlayer.uuid === playerRef.uuid;
        let snapshotIdx: number = undefined;
        if (!isActiveTurnPlayer) {
            snapshotIdx = playerSnapshots[this.snapshots.length - 1];
        } else {
            // Latest snapshot is the current turn, go back to the next one.
            snapshotIdx = playerSnapshots[this.snapshots.length - 2];
        }

        if (!snapshotIdx) {
            return undefined;
        }

        return this.snapshots[snapshotIdx];
    }

    private getSnapshotForPhase(phaseName: PhaseName, offset: number = -1): IGameSnapshot | undefined {
        const phaseSnapshots = this.allPhaseSnapshots.get(phaseName);
        if (!phaseSnapshots) {
            return undefined;
        }

        const snapshotIdx = phaseSnapshots[this.snapshots.length + offset];

        if (!snapshotIdx) {
            return undefined;
        }

        return this.snapshots[snapshotIdx];
    }

    private getSnapshotForRound(round: number): IGameSnapshot | undefined {
        const roundDiff = this.game.roundNumber - round;

        const snapshotIdx = this.roundSnapshots[this.snapshots.length - 1 - roundDiff];

        return this.snapshots[snapshotIdx];
    }

    /**
     *
     * @param snapshotId The specific snapshotId to return to.
     */
    public rollbackToSnapshot(snapshotId: number) {
        Contract.assertPositiveNonZero(snapshotId, 'Tried to rollback but snapshot ID is invalid ' + snapshotId);

        const snapshotIdx = this.snapshots.findIndex((x) => x.id === snapshotId);
        Contract.assertNonNegative(snapshotIdx, `Tried to rollback to snapshot ID ${snapshotId} but the snapshot was not found.`);

        const snapshot = this.snapshots[snapshotIdx];

        this.game.state = structuredClone(snapshot.gameState);

        const removals: { index: number; uuid: string }[] = [];
        // Indexes in last to first for the purpose of removal.
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];
            const updatedState = snapshot.states.find((x) => x.uuid === go.uuid);
            if (!updatedState) {
                removals.push({ index: i, uuid: go.uuid });
                continue;
            }

            go.setState(updatedState);
        }

        // Because it's reversed we don't have to worry about deleted indexes shifting the array.
        for (const removed of removals) {
            this.allGameObjects.splice(removed.index, 1);
            this.gameObjectMapping.delete(removed.uuid);
        }

        this.lastId = snapshot.lastId;

        // Inform GOs that all states have been updated.
        this.allGameObjects.forEach((x) => x.afterSetAllState());

        // Throw out all snapshots after the rollback snapshot.
        this.snapshots.splice(snapshotIdx + 1);
        this.clearMappedSnapshots(snapshot.settings.type, snapshotIdx);
    }

    private clearMappedSnapshots(type: SnapshotType, snapshotIdx: number) {
        // Clear out any of the snapshot mappings that were later than this snapshot.
        if (type === SnapshotType.Player) {
            for (const [playerUuid, playerSnapshots] of this.allPlayerSnapshots) {
                const length = playerSnapshots.length;
                for (let i = length - 1; i >= 0; i--) {
                    const index = playerSnapshots[i];
                    if (index > snapshotIdx) {
                        playerSnapshots.splice(i, 1);
                    }
                }
            }
        } else {
            this.allPlayerSnapshots.clear();
        }

        for (const [phaseName, phaseSnapshots] of this.allPhaseSnapshots) {
            const length = phaseSnapshots.length;
            for (let i = length - 1; i >= 0; i--) {
                const index = phaseSnapshots[i];
                if (index > snapshotIdx) {
                    phaseSnapshots.splice(i, 1);
                }
            }
        }

        const length = this.roundSnapshots.length;
        for (let i = length - 1; i >= 0; i--) {
            const index = this.roundSnapshots[i];
            if (index > snapshotIdx) {
                this.roundSnapshots.splice(i, 1);
            }
        }
    }

    private getLatestSnapshot(offset = 0) {
        Contract.assertNonNegative(offset, `Tried to get snapshot from end but argument was negative ${offset}.`);
        return this.snapshots[this.snapshots.length - 1 - offset];
    }

    public getLatestSnapshotId() {
        return this.getLatestSnapshot()?.id ?? 0;
    }

    public canUndo(player: Player) {
        return !!this.getSnapshotForPlayer(player.getRef());
    }
}
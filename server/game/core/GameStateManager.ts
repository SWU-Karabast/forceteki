import type { Card } from './card/Card';
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
}

export interface IGameState {
    roundNumber: number;
    initialFirstPlayer: GameObjectRef<Player> | null;
    initiativePlayer: GameObjectRef<Player> | null;
    actionPhaseActivePlayer: GameObjectRef<Player> | null;
    isInitiativeClaimed: boolean;
    allCards: GameObjectRef<Card>[];
}

export class GameStateManager {
    private readonly game: Game;
    private readonly snapshots: IGameSnapshot[];
    private readonly allGameObjects: GameObjectBase[];
    private readonly gameObjectMapping: Map<string, GameObjectBase>;
    private lastId = 0;
    private lastSnapshotId = 0;

    public constructor(game: Game) {
        this.game = game;
        this.allGameObjects = [];
        this.snapshots = [];
        this.gameObjectMapping = new Map<string, GameObjectBase>();
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
    }

    public takeSnapshot(): number {
        const nextSnapshotId = this.lastSnapshotId + 1;
        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,
            lastId: this.lastId,
            gameState: structuredClone(this.game.state),
            states: this.allGameObjects.map((x) => x.getState())
        };
        this.lastSnapshotId = nextSnapshotId;

        this.snapshots.push(snapshot);

        return snapshot.id;
    }

    public rollbackToPlayerSnapshot(player: Player) {
        Contract.assertPositiveNonZero(this.snapshots.length, `Tried to to rollback to ${player.name}'s snapshot but there are none.`);

        // This assumes snapshots are taken at the start of a player's turn.
        let snapshot: IGameSnapshot;
        if (snapshot && this.game.state.actionPhaseActivePlayer.uuid !== player.uuid) {
            snapshot = this.getLatestSnapshot(1);
        } else {
            snapshot = this.getLatestSnapshot(2);
        }

        Contract.assertNotNullLike(snapshot, `Tried to get ${player.name}'s previous snapshot, but no snapshot was found.`);
        Contract.assertNotNullLike(snapshot.gameState.actionPhaseActivePlayer.uuid === player.uuid, () => `Expected player ${player.name} to have been the active player for the rollback snapshot, but a snapshot for ${this.get(snapshot.gameState.actionPhaseActivePlayer).name} was found at the expected index.`);

        return this.rollbackToSnapshot(snapshot.id);
    }

    /**
     *
     * @param snapshotId The specific snapshotId to return to. If not provided, will return to the last snapshot.
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
    }

    private getLatestSnapshot(offset = 0) {
        Contract.assertNonNegative(offset, `Tried to get snapshot from end but argument was negative ${offset}.`);
        return this.snapshots[this.snapshots.length - 1 - offset];
    }

    public getLatestSnapshotId() {
        return this.getLatestSnapshot()?.id ?? 0;
    }

    public canUndo(player: Player) {
        let snapshot: IGameSnapshot;

        if (this.game.state.actionPhaseActivePlayer.uuid === player.uuid) {
            snapshot = this.getLatestSnapshot(1);
        } else {
            snapshot = this.getLatestSnapshot(2);
        }

        return !!snapshot;
    }
}
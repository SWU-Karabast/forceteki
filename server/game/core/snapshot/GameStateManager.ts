import type Game from '../Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import * as Helpers from '../utils/Helpers.js';

export interface IGameObjectRegistrar {
    register(gameObject: GameObjectBase | GameObjectBase[]): void;
    get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null;
}

export class GameStateManager implements IGameObjectRegistrar {
    private readonly allGameObjects: GameObjectBase[] = [];
    private readonly game: Game;
    private readonly gameObjectMapping = new Map<string, GameObjectBase>();

    private _lastGameObjectId = -1;

    public get lastGameObjectId(): number {
        return this._lastGameObjectId;
    }

    public constructor(game: Game) {
        this.game = game;
    }

    public get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null {
        if (!gameObjectRef?.uuid) {
            return null;
        }

        const ref = this.gameObjectMapping.get(gameObjectRef.uuid);
        Contract.assertNotNullLike(ref, `Tried to get a Game Object but the UUID is not registered: ${gameObjectRef.uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`);
        return ref as T;
    }

    public register(gameObject: GameObjectBase | GameObjectBase[]) {
        gameObject = Helpers.asArray(gameObject);

        for (const go of gameObject) {
            Contract.assertIsNullLike(go.uuid,
                `Tried to register a Game Object that was already registered ${go.uuid}`
            );

            const nextId = this._lastGameObjectId + 1;
            go.uuid = go.getGameObjectName() + '_' + nextId;
            this._lastGameObjectId = nextId;
            this.allGameObjects.push(go);
            this.gameObjectMapping.set(go.uuid, go);
        }
    }

    public getAllGameStates(): IGameObjectBaseState[] {
        return this.allGameObjects.map((go) => go.getState());
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot) {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');

        this.game.state = structuredClone(snapshot.gameState);

        const removals: { index: number; go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
        const updates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];

        // Indexes in last to first for the purpose of removal.
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];

            // NOTE: We aren't removing GameObjects, but this makes room for it.
            const updatedState = snapshot.states.find((x) => x.uuid === go.uuid);
            if (!updatedState) {
                removals.push({ index: i, go, oldState: go.getState() });
                continue;
            }

            updates.push({ go, oldState: go.getState() });
            go.setState(updatedState);
        }

        // Inform GOs that all states have been updated.
        for (const update of updates) {
            update.go.afterSetAllState(update.oldState);
        }
        for (const removed of removals) {
            removed.go.cleanupOnRemove(removed.oldState);
        }

        // Remove GOs that hadn't yet been created by this point.
        // Because the for loop to determine removals is done from end to beginning, we don't have to worry about deleted indexes causing a problem when the array shifts.
        for (const removed of removals) {
            this.allGameObjects.splice(removed.index, 1);
            this.gameObjectMapping.delete(removed.go.uuid);
        }

        this._lastGameObjectId = snapshot.lastGameObjectId;
    }

    private afterTakeSnapshot() {
        // TODO: We want this to be able to go through
        //          and remove any unused OngoingEffects from the list once they are no longer needed by any snapshots.
    }
}
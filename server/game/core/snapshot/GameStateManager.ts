import type { Game } from '../Game';
import type { GameObjectBase, IGameObjectBaseState } from '../GameObjectBase';
import type { IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import * as Helpers from '../utils/Helpers.js';
import { to } from '../utils/TypeHelpers';
import v8 from 'node:v8';
import { logger } from '../../../logger';
import { AlertType, GameErrorSeverity } from '../Constants';
import type { GameObjectId } from '../GameObjectUtils';
import { serializeGameObjectStateForSnapshot } from '../stateSerialization/StateSerialization';

export interface IGameObjectRegistrar {
    register(gameObject: GameObjectBase | GameObjectBase[]): void;
    get<T extends GameObjectBase>(gameObjectId: GameObjectId<T>): T | null;

    /** @deprecated Avoid using this outside of advanced scenarios. This cannot enforce type safety unlike `get` and may result in runtime errors if used incorrectly. */
    getUnsafe<T extends GameObjectBase>(uuid: GameObjectId): T;

    /**
     * Creates a {@link GameObjectBase} object that is not allowed to have references.
     * This is useful for reducing GC overhead if it is known in advance that a GameObject is transient and will not be saved.
     *
     * @deprecated This method has potentially game-breaking side effects so **do not use** unless you know what you're doing
     */
    createWithoutRefsUnsafe<T extends GameObjectBase>(handler: () => T): T;
}

export class GameStateManager implements IGameObjectRegistrar {
    readonly #game: Game;
    private readonly gameObjectMapping = new Map<string, GameObjectBase>();
    private readonly snapshotReachableGameObjectUuids = new Set<string>();
    private static readonly nonStateReachabilityIgnoreProps = new Set([
        'game',
        'state',
        '_uuid',
        '_initialized',
        '_cannotHaveRefs'
    ]);

    private allGameObjects: GameObjectBase[] = [];

    private _lastGameObjectId = -1;
    // unused for now but will be used to detect GO creation during the rollback process later on.
    private _isRollingBack = false;

    private _disableRegistration = false;

    public get lastGameObjectId(): number {
        return this._lastGameObjectId;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    public get<T extends GameObjectBase>(gameObjectId: GameObjectId<T>): T | null {
        if (!gameObjectId) {
            return null;
        }

        const ref = this.gameObjectMapping.get(gameObjectId);
        const errorMessage = `Tried to get a Game Object but the UUID is not registered: ${gameObjectId}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`;
        try {
            Contract.assertNotNullLike(ref, errorMessage);
        } catch (error) {
            this.#game.reportError(error, GameErrorSeverity.SevereHaltGame);

            throw error;
        }
        return ref as T;
    }

    /** Avoid using this outside of advanced scenarios. This cannot enforce type safety unlike `get` and may result in runtime errors if used incorrectly. */
    public getUnsafe<T extends GameObjectBase>(uuid: GameObjectId): T {
        const ref = this.gameObjectMapping.get(uuid);
        const errorMessage = `Tried to get a Game Object but the UUID is not registered: ${uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`;
        try {
            Contract.assertNotNullLike(ref, errorMessage);
        } catch (error) {
            this.#game.reportError(error, GameErrorSeverity.SevereHaltGame);

            throw error;
        }
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

            if (!this._disableRegistration) {
                this.allGameObjects.push(go);
                this.gameObjectMapping.set(go.uuid, go);
            }
        }
    }

    public removeUnusedGameObjects() {
        const reachableGameObjectUuids = this.getReachableGameObjectUuids();
        for (const reachableGameObjectUuid of reachableGameObjectUuids) {
            this.snapshotReachableGameObjectUuids.add(reachableGameObjectUuid);
        }

        const removalUuids = new Set<string>();
        const removalIndexes = new Set<number>();

        // Indexes in last to first for the purpose of removal.
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];

            if (!this.snapshotReachableGameObjectUuids.has(go.uuid)) {
                removalIndexes.add(i);
                removalUuids.add(go.uuid);
            }
        }

        this.allGameObjects = this.allGameObjects.filter((_, index) => !removalIndexes.has(index));

        for (const removeUuid of removalUuids) {
            this.gameObjectMapping.delete(removeUuid);
        }
    }

    /**
     * Creates a {@link GameObjectBase} object that is not allowed to have references.
     * This is useful for reducing GC overhead if it is known in advance that a GameObject is transient and will not be saved.
     */
    public createWithoutRefsUnsafe<T extends GameObjectBase>(handler: () => T): T {
        this._disableRegistration = true;

        try {
            const obj = handler();
            obj.setCannotHaveRefs();
            return obj;
        } finally {
            this._disableRegistration = false;
        }
    }

    public buildGameStateForSnapshot(): Buffer {
        this.removeUnusedGameObjects();

        // Return the state of all game objects that are still in the game.
        return v8.serialize(to.record(this.allGameObjects, (item) => item.uuid, (item) => serializeGameObjectStateForSnapshot(item)));
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');
        this._isRollingBack = true;
        try {
            const removals: { index: number; go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
            const updates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];

            let rollbackError: Error | null = null;
            try {
                this.#game.state = v8.deserialize(snapshot.gameState);

                const snapshotStatesByUuid = v8.deserialize(snapshot.states) as Record<string, IGameObjectBaseState>;

                // Indexes in last to first for the purpose of removal.
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    if (!go.initialized) {
                        throw new Error(`GameObject ${go.getGameObjectName()} (UUID: ${go.uuid}, Type: ${go.constructor.name}) is not initialized during rollback. This should not be possible.`);
                    }

                    // Rollback swaps the entire state object reference, so retaining the previous object here is safe
                    // and avoids a structuredClone for every updated or removed GameObject.
                    const oldState = go.getStateUnsafe();

                    const updatedState = snapshotStatesByUuid[go.uuid];
                    if (!updatedState) {
                        removals.push({ index: i, go, oldState });
                        continue;
                    }

                    updates.push({ go, oldState });
                    go.setState(updatedState);
                }

                for (const removed of removals) {
                    removed.go.cleanupOnRemove(removed.oldState);
                }
            } catch (error) {
                if (!beforeRollbackSnapshot) {
                    logger.error('Error during rollback to snapshot and no beforeRollbackSnapshot provided, game may be in unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    this.#game.reportSevereRollbackFailure(error);
                }

                rollbackError = error;
                logger.error('Error during rollback to snapshot. Attempting to restore existing state before rollback.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
            }

            // if we hit an error during rollback, attempt to restore the original state
            if (rollbackError) {
                try {
                    this.rollbackToSnapshot(beforeRollbackSnapshot);
                    this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.');
                    return false;
                } catch (error) {
                    logger.error('The attempt to restore game state from prior to rollback has failed. Game has reached an unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    this.#game.reportSevereRollbackFailure(error);
                }
            }

            // Remove GOs that hadn't yet been created by this point.
            // Rebuild the list once without allocating an intermediate index list or cloning state objects.
            const removalIndexSet = new Set<number>();
            for (const removed of removals) {
                removalIndexSet.add(removed.index);
            }
            this.allGameObjects = this.allGameObjects.filter((_, index) => !removalIndexSet.has(index));

            for (const removed of removals) {
                this.gameObjectMapping.delete(removed.go.uuid);
            }

            // Inform GOs that all states have been updated.
            for (const update of updates) {
                update.go.afterSetAllState(update.oldState);
            }

            return true;
        } finally {
            this._isRollingBack = false;
        }
    }

    private afterTakeSnapshot() {
        // TODO: We want this to be able to go through
        //          and remove any unused OngoingEffects from the list once they are no longer needed by any snapshots.
    }

    private getReachableGameObjectUuids(): Set<string> {
        const reachableGameObjectUuids = new Set<string>();
        const visitedObjects = new WeakSet<object>();

        const visitValue = (value: unknown): void => {
            if (value == null) {
                return;
            }

            if (typeof value === 'string') {
                this.visitGameObjectId(value, reachableGameObjectUuids, visitedObjects, visitValue);
                return;
            }

            if (typeof value !== 'object') {
                return;
            }

            if (visitedObjects.has(value)) {
                return;
            }

            if (Array.isArray(value)) {
                visitedObjects.add(value);
                for (const entry of value) {
                    visitValue(entry);
                }
                return;
            }

            if (value instanceof Map) {
                visitedObjects.add(value);
                for (const [key, mapValue] of value) {
                    visitValue(key);
                    visitValue(mapValue);
                }
                return;
            }

            if (value instanceof Set) {
                visitedObjects.add(value);
                for (const entry of value) {
                    visitValue(entry);
                }
                return;
            }

            if (value instanceof Date || Buffer.isBuffer(value)) {
                visitedObjects.add(value);
                return;
            }

            if (value instanceof Object && this.isTrackedGameObject(value)) {
                this.visitGameObject(value, reachableGameObjectUuids, visitedObjects, visitValue);
                return;
            }

            visitedObjects.add(value);
            for (const entry of Object.values(value)) {
                visitValue(entry);
            }
        };

        for (const root of this.getReachabilityRoots()) {
            visitValue(root);
        }

        return reachableGameObjectUuids;
    }

    private getReachabilityRoots(): unknown[] {
        return [
            this.#game.state,
            this.#game.currentlyResolving,
            this.#game.getPlayers(),
            this.#game.statsTracker,
            this.#game.ongoingEffectEngine,
            this.#game.stateWatcherRegistrar,
            this.#game.spaceArena,
            this.#game.groundArena,
            this.#game.allArenas
        ];
    }

    private visitGameObjectId(
        gameObjectId: string,
        reachableGameObjectUuids: Set<string>,
        visitedObjects: WeakSet<object>,
        visitValue: (value: unknown) => void
    ): void {
        const gameObject = this.gameObjectMapping.get(gameObjectId);
        if (gameObject) {
            this.visitGameObject(gameObject, reachableGameObjectUuids, visitedObjects, visitValue);
        }
    }

    private visitGameObject(
        gameObject: GameObjectBase,
        reachableGameObjectUuids: Set<string>,
        visitedObjects: WeakSet<object>,
        visitValue: (value: unknown) => void
    ): void {
        if (reachableGameObjectUuids.has(gameObject.uuid)) {
            return;
        }

        reachableGameObjectUuids.add(gameObject.uuid);
        visitedObjects.add(gameObject);
        visitValue(serializeGameObjectStateForSnapshot(gameObject));

        for (const [propertyName, propertyValue] of Object.entries(gameObject as unknown as Record<string, unknown>)) {
            if (GameStateManager.nonStateReachabilityIgnoreProps.has(propertyName)) {
                continue;
            }

            visitValue(propertyValue);
        }
    }

    private isTrackedGameObject(value: object): value is GameObjectBase {
        return 'uuid' in value && typeof (value as { uuid?: unknown }).uuid === 'string' && this.gameObjectMapping.has((value as { uuid: string }).uuid);
    }
}
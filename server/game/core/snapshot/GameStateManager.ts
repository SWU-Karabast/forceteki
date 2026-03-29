import type { Game } from '../Game';
import type { GameObjectBase, IGameObjectBaseState } from '../GameObjectBase';
import { Card } from '../card/Card';
import { ensureStateSerializersRegistered, getStateDeltaSerializer, getStateSerializerForConstructor, type SerializedGameObjectStateMap, type SerializerInstance, type StateSerializer } from '../StateSerializers';
import type { IDeltaSnapshot, IGameSnapshot } from './SnapshotInterfaces';
import { Contract } from '../utils/Contract.js';
import { Helpers } from '../utils/Helpers.js';
import { logger } from '../../../logger';
import { AlertType, GameErrorSeverity } from '../Constants';
import type { GameObjectId } from '../GameObjectUtils';

export interface IGameObjectRegistrar {
    readonly lastGameObjectId: number;
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

interface SerializerConstructor {
    name: string;
}

export class GameStateManager implements IGameObjectRegistrar {
    readonly #game: Game;
    private readonly gameObjectMapping = new Map<string, GameObjectBase>();
    private readonly serializerCache = new Map<SerializerConstructor, StateSerializer>();

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
                this.#game.deltaTracker?.recordObjectCreation(go.uuid);
            }
        }
    }

    public removeUnusedGameObjects() {
        const removalUuids = new Set<string>();
        const removalIndexes = new Set<number>();

        // Indexes in last to first for the purpose of removal.
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];

            if (!go.hasRef) {
                // If the GameObjectBase doesn't have a ref, it means it was never used in the game, so we can skip it.
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

    public buildGameStateForSnapshot(): SerializedGameObjectStateMap {
        const states: SerializedGameObjectStateMap = {};
        for (const gameObject of this.allGameObjects) {
            states[gameObject.uuid] = this.getSerializer(gameObject).serialize(gameObject as unknown as SerializerInstance);
        }

        this.removeUnusedGameObjects();

        for (const uuid of Object.keys(states)) {
            if (!this.gameObjectMapping.has(uuid)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete states[uuid];
            }
        }

        return states;
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');
        this._isRollingBack = true;
        try {
            const removals: { index: number; go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
            const updates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];

            let rollbackError: Error | null = null;
            try {
                const snapshotStatesByUuid = snapshot.states;

                // Indexes in last to first for the purpose of removal.
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    if (!go.initialized) {
                        throw new Error(`GameObject ${go.getGameObjectName()} (UUID: ${go.uuid}, Type: ${go.constructor.name}) is not initialized during rollback. This should not be possible.`);
                    }

                    const serializer = this.getSerializer(go);
                    const oldState = this.getSerializedState(go);

                    const updatedState = snapshotStatesByUuid[go.uuid] as IGameObjectBaseState | undefined;
                    if (!updatedState) {
                        removals.push({ index: i, go, oldState });
                        continue;
                    }

                    updates.push({ go, oldState });
                    go.applySerializedState(this.#game, serializer as StateSerializer<IGameObjectBaseState>, updatedState, oldState);
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

    public rollbackToDeltaChain(deltas: IDeltaSnapshot[], beforeRollbackSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(deltas, 'Empty delta chain provided for rollback');
        this._isRollingBack = true;
        try {
            const allRemovals: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
            const allUpdates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
            const updatedCards: { card: Card; previousZoneUuid: string | null | undefined }[] = [];
            const seenUpdateUuids = new Set<string>();

            let rollbackError: Error | null = null;
            try {
                for (const delta of deltas) {
                    this.#game.randomGenerator.restore(delta.rngState);
                    this._lastGameObjectId = delta.lastGameObjectId;

                    for (const uuid of delta.createdObjectUuids) {
                        const go = this.gameObjectMapping.get(uuid);
                        if (go) {
                            allRemovals.push({ go, oldState: this.getSerializedState(go) });
                        }
                    }

                    const changedUuids = new Set(delta.changedFields.keys());
                    for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                        const go = this.allGameObjects[i];
                        if (!changedUuids.has(go.uuid)) {
                            continue;
                        }

                        const fields = delta.changedFields.get(go.uuid);
                        if (!fields) {
                            continue;
                        }

                        const deltaSerializer = getStateDeltaSerializer(go);

                        if (!seenUpdateUuids.has(go.uuid)) {
                            seenUpdateUuids.add(go.uuid);
                            allUpdates.push({ go, oldState: this.getSerializedState(go) });

                            if (go instanceof Card) {
                                updatedCards.push({
                                    card: go,
                                    previousZoneUuid: (allUpdates[allUpdates.length - 1].oldState as Record<string, unknown>)._zone as string | null | undefined,
                                });
                            }
                        }

                        for (const [fieldName, oldValue] of Object.entries(fields)) {
                            const fieldSerializer = deltaSerializer[fieldName];
                            Contract.assertNotNullLike(fieldSerializer, `No generated delta serializer found for ${go.constructor.name}.${fieldName}`);
                            (go as unknown as SerializerInstance)[fieldName] = fieldSerializer.deserialize(this.#game, oldValue);
                        }
                    }
                }

                for (const removed of allRemovals) {
                    removed.go.cleanupOnRemove(removed.oldState);
                }

                const removalUuids = new Set(allRemovals.map((r) => r.go.uuid));
                this.allGameObjects = this.allGameObjects.filter((go) => !removalUuids.has(go.uuid));
                for (const uuid of removalUuids) {
                    this.gameObjectMapping.delete(uuid);
                }

                this.reconcileUpdatedCardZoneMemberships(updatedCards);

                for (const update of allUpdates) {
                    update.go.notifyAfterSetState(update.oldState);
                }

                const oldStateByUuid = new Map(allUpdates.map((update) => [update.go.uuid, update.oldState]));
                for (const go of this.allGameObjects) {
                    go.afterSetAllState(oldStateByUuid.get(go.uuid) ?? this.getSerializedState(go));
                }
            } catch (error) {
                if (!beforeRollbackSnapshot) {
                    logger.error('Error during delta rollback and no beforeRollbackSnapshot provided, game may be in unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    this.#game.reportSevereRollbackFailure(error);
                }

                rollbackError = error;
                logger.error('Error during delta rollback. Attempting to restore state from full snapshot.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
            }

            if (rollbackError) {
                try {
                    this.rollbackToSnapshot(beforeRollbackSnapshot);
                    this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.');
                    return false;
                } catch (error) {
                    logger.error('Attempt to restore from full snapshot after delta rollback failure has also failed.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    this.#game.reportSevereRollbackFailure(error);
                }
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

    private getSerializer(gameObject: GameObjectBase): StateSerializer {
        ensureStateSerializersRegistered();

        const constructor = gameObject.constructor as unknown as SerializerConstructor;
        const cachedSerializer = this.serializerCache.get(constructor);
        if (cachedSerializer) {
            return cachedSerializer;
        }

        const serializer = getStateSerializerForConstructor(constructor);
        Contract.assertNotNullLike(serializer, `No generated serializer found for ${gameObject.constructor.name}`);

        this.serializerCache.set(constructor, serializer);
        return serializer;
    }

    private getSerializedState(gameObject: GameObjectBase): IGameObjectBaseState {
        return this.getSerializer(gameObject).serialize(gameObject as unknown as SerializerInstance) as IGameObjectBaseState;
    }

    private reconcileUpdatedCardZoneMemberships(updatedCards: { card: Card; previousZoneUuid: string | null | undefined }[]): void {
        for (const { card, previousZoneUuid } of updatedCards) {
            const currentZone = card.zone as { cards?: readonly Card[]; addCard?: (card: Card) => void } | null;
            const previousZone = previousZoneUuid
                ? this.gameObjectMapping.get(previousZoneUuid) as { cards?: readonly Card[]; removeCard?: (card: Card) => void } | undefined
                : null;

            if (previousZone && previousZone !== currentZone && previousZone.cards?.includes(card) && previousZone.removeCard) {
                previousZone.removeCard(card);
            }

            if (currentZone && !currentZone.cards?.includes(card) && currentZone.addCard) {
                currentZone.addCard(card);
            }
        }
    }
}
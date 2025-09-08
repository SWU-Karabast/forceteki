import type Game from '../Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import * as Helpers from '../utils/Helpers.js';
import { to } from '../utils/TypeHelpers';
import v8 from 'node:v8';
import { logger } from '../../../logger';
import { AlertType } from '../Constants';

export interface IGameObjectRegistrar {
    register(gameObject: GameObjectBase | GameObjectBase[]): void;
    get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null;

    /**
     * Creates a {@link GameObjectBase} object that is not allowed to have references.
     * This is useful for reducing GC overhead if it is known in advance that a GameObject is transient and will not be saved.
     *
     * @deprecated This method has potentially game-breaking side effects so **do not use** unless you know what you're doing
     */
    createWithoutRefsUnsafe<T extends GameObjectBase>(handler: () => T): T;
}

export class GameStateManager implements IGameObjectRegistrar {
    private readonly game: Game;
    private readonly gameObjectMapping = new Map<string, GameObjectBase>();

    private allGameObjects: GameObjectBase[] = [];

    private _lastGameObjectId = -1;
    // unused for now but will be used to detect GO creation during the rollback process later on.
    private _isRollingBack = false;

    private _disableRegistration = false;

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
        const errorMessage = `Tried to get a Game Object but the UUID is not registered: ${gameObjectRef.uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`;
        try {
            Contract.assertNotNullLike(ref, errorMessage);
        } catch (error) {
            this.game.discordDispatcher.formatAndSendServerErrorAsync(errorMessage, error, this.game.lobbyId);

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

    public buildGameStateForSnapshot(): Buffer {
        this.removeUnusedGameObjects();

        // Return the state of all game objects that are still in the game.
        return v8.serialize(to.record(this.allGameObjects, (item) => item.uuid, (item) => item.getStateUnsafe()));
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');
        this._isRollingBack = true;
        try {
            const removals: { index: number; go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];
            const updates: { go: GameObjectBase; oldState: IGameObjectBaseState }[] = [];

            let rollbackError: Error | null = null;
            try {
                this.game.state = v8.deserialize(snapshot.gameState);

                const snapshotStatesByUuid = v8.deserialize(snapshot.states) as Record<string, IGameObjectBaseState>;

                // Indexes in last to first for the purpose of removal.
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];

                    const updatedState = snapshotStatesByUuid[go.uuid];
                    if (!updatedState) {
                        removals.push({ index: i, go, oldState: go.getState() });
                        continue;
                    }

                    updates.push({ go, oldState: go.getState() });
                    go.setState(updatedState);
                }

                for (const removed of removals) {
                    removed.go.cleanupOnRemove(removed.oldState);
                }

                if (beforeRollbackSnapshot) {
                    throw new Error('test');
                }
            } catch (error) {
                if (!beforeRollbackSnapshot) {
                    this.game.reportSevereRollbackFailure(error, 'Error during rollback to snapshot and no beforeRollbackSnapshot provided. Game has reached an unrecoverable state.');
                }

                rollbackError = error;
                logger.error('Error during rollback to snapshot. Attempting to restore existing state before rollback.', { error: { message: error.message, stack: error.stack }, lobbyId: this.game.lobbyId });
            }

            // if we hit an error during rollback, attempt to restore the original state
            if (rollbackError) {
                try {
                    this.rollbackToSnapshot(beforeRollbackSnapshot);
                    this.game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.');
                    return false;
                } catch (error) {
                    this.game.reportSevereRollbackFailure(error, 'The attempt to restore game state from prior to rollback has failed. Game has reached an unrecoverable state.');
                }
            }

            // Remove GOs that hadn't yet been created by this point.
            // Because the for loop to determine removals is done from end to beginning, we don't have to worry about deleted indexes causing a problem when the array shifts.
            for (const removed of removals) {
                // TODO THIS PR: stop using repeated splice

                this.allGameObjects.splice(removed.index, 1);
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
}
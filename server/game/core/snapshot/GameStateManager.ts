import type { Game } from '../Game';
import type { GameObjectBase, IGameObjectBaseState } from '../GameObjectBase';
import type { IGameSnapshot } from './SnapshotInterfaces';
import { Contract } from '../utils/Contract.js';
import { Helpers } from '../utils/Helpers.js';
import { to } from '../utils/TypeHelpers';
import v8 from 'node:v8';
import { logger } from '../../../logger';
import { AlertType, GameErrorSeverity } from '../Constants';
import type { GameObjectId } from '../GameObjectUtils';

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

    private allGameObjects: GameObjectBase[] = [];

    private _lastGameObjectId = -1;

    // Depth rather than a boolean: rollbackToSnapshot re-enters itself on the recovery path (see the
    // recursive call below), and a plain boolean would be cleared by the inner frame's `finally` while
    // the outer frame is still mid-rollback.
    private _rollbackDepth = 0;

    private _disableRegistration = false;

    // Thin wrapper over _rollbackDepth for readability at call sites; the depth counter above it remains
    // the source of truth for re-entrancy. Do not read this name as "the boolean is back" and revert
    // _rollbackDepth to a plain flag — see its own comment for why that would be unsafe.
    private get isRollingBack(): boolean {
        return this._rollbackDepth !== 0;
    }

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
            // Suspended: this is one of the engine's primary "this is very bad" reporting sites, and it is
            // reachable mid-rollback (every @stateRef-family hydration calls back into get/getUnsafe), so it
            // must never be masked by the registration guard firing from inside error reporting.
            this.withRegistrationGuardSuspended(() => this.#game.reportError(error, GameErrorSeverity.SevereHaltGame));

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
            // Suspended for the same reason as get()'s catch, above.
            this.withRegistrationGuardSuspended(() => this.#game.reportError(error, GameErrorSeverity.SevereHaltGame));

            throw error;
        }
        return ref as T;
    }

    public register(gameObject: GameObjectBase | GameObjectBase[]) {
        gameObject = Helpers.asArray(gameObject);

        for (const go of gameObject) {
            // Written as a branch, not an assert, so nothing is allocated (closure or message string) on
            // this hot path when the guard does not fire. A GameObject registering while a rollback is in
            // progress means the zero-allocation contract the id restore depends on has been violated.
            if (this.isRollingBack) {
                Contract.fail(`Attempted to register GameObject ${go.getGameObjectName()} (${go.constructor.name}) during a rollback; rollback must not allocate any GameObject.`);
            }

            Contract.assertIsNullLike(go.uuid,
                `Tried to register a Game Object that was already registered ${go.uuid}`
            );

            const nextId = this._lastGameObjectId + 1;
            const uuid = go.getGameObjectName() + '_' + nextId;

            go.uuid = uuid;
            this._lastGameObjectId = nextId;

            if (!this._disableRegistration) {
                // Also a branch for the same allocation reason: `Contract.assertDoesNotHaveKey` only takes
                // an eager `string` message, which would build the message on every registration.
                if (this.gameObjectMapping.has(uuid)) {
                    Contract.fail(`Attempted to register GameObject ${uuid} but the mapping already has a live occupant ${this.gameObjectMapping.get(uuid).getGameObjectName()}; this would silently overwrite it.`);
                }

                this.allGameObjects.push(go);
                this.gameObjectMapping.set(uuid, go);
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
        this._rollbackDepth++;
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
                    // Suspended: reportSevereRollbackFailure re-enters Game/Lobby error reporting, which must
                    // never be masked by the registration guard. Nothing registers on this path today (see
                    // the corrected client-protocol audit), so this is defence in depth, not a required fix.
                    this.withRegistrationGuardSuspended(() => this.#game.reportSevereRollbackFailure(error));
                }

                rollbackError = error;
                logger.error('Error during rollback to snapshot. Attempting to restore existing state before rollback.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
            }

            // if we hit an error during rollback, attempt to restore the original state
            if (rollbackError) {
                try {
                    this.rollbackToSnapshot(beforeRollbackSnapshot);
                    // Suspended for the same reason as above: addAlert re-enters GameChat/Lobby.
                    this.withRegistrationGuardSuspended(() => this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.'));
                    return false;
                } catch (error) {
                    logger.error('The attempt to restore game state from prior to rollback has failed. Game has reached an unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    // Suspended for the same reason as above. reportSevereRollbackFailure always throws, so
                    // control never reaches past this call regardless.
                    this.withRegistrationGuardSuspended(() => this.#game.reportSevereRollbackFailure(error));
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

            // Inform GOs that all states have been updated. `updates` is built in reverse registration
            // order (last to first), so every OngoingEffect.refreshContext() runs before
            // OngoingEffectEngine.resolveEffects(true) — the engine is constructed during game setup and so
            // always has a lower id than any effect it tracks. If that order ever flips, effects would
            // resolve against stale contexts, which can produce different `calculate` results, new targets,
            // and a fresh wrapper allocation — which the registration guard above would then turn into a
            // halted production rollback.
            for (const update of updates) {
                update.go.afterSetAllState(update.oldState);
            }

            // Must run after afterSetAllState: restoring the counter any earlier would let a transient
            // created during that pass consume an id a replayed object is owed.
            this.restoreLastGameObjectId(snapshot);

            return true;
        } finally {
            this._rollbackDepth--;
        }
    }

    /**
     * Suspends the registration guard for the duration of `handler`, so error/alert reporting that
     * re-enters game/router code can never have its own diagnostic masked by the guard firing from
     * inside an error handler. Restores the exact prior depth rather than assuming 0, so a suspension
     * inside the nested recovery rollback (see the recursive call above) leaves the outer frame's guard
     * armed afterward.
     */
    private withRegistrationGuardSuspended<T>(handler: () => T): T {
        const depth = this._rollbackDepth;
        this._rollbackDepth = 0;
        try {
            return handler();
        } finally {
            this._rollbackDepth = depth;
        }
    }

    /**
     * Restores `_lastGameObjectId` to the value recorded in the snapshot being rolled back to. The nested
     * recovery call above restores from `beforeRollbackSnapshot` as part of its own normal completion, and
     * the outer frame returns `false` immediately afterward without reaching here, so there is no double
     * restore.
     */
    private restoreLastGameObjectId(snapshot: IGameSnapshot): void {
        Contract.assertNotNullLike(
            snapshot.lastGameObjectId,
            'Snapshot has no lastGameObjectId; cannot restore the GameObject id counter'
        );
        Contract.assertTrue(
            Number.isInteger(snapshot.lastGameObjectId),
            () => `Snapshot lastGameObjectId ${snapshot.lastGameObjectId} is not an integer; cannot restore the GameObject id counter`
        );
        Contract.assertTrue(
            snapshot.lastGameObjectId <= this._lastGameObjectId,
            () => `Snapshot lastGameObjectId ${snapshot.lastGameObjectId} is ahead of the live counter ${this._lastGameObjectId}; rollback only ever moves backwards`
        );

        this._lastGameObjectId = snapshot.lastGameObjectId;
    }

    private afterTakeSnapshot() {
        // TODO: We want this to be able to go through
        //          and remove any unused OngoingEffects from the list once they are no longer needed by any snapshots.
    }
}
import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IGameSnapshot, IGameState } from './SnapshotInterfaces';
import { Contract } from '../utils/Contract.js';
import { Helpers } from '../utils/Helpers.js';
import { logger } from '../../../logger';
import { AlertType, GameErrorSeverity } from '../Constants';
import type { GameObjectId } from '../GameObjectUtils';
import { getStateSerializerFor } from '../StateSerializers';
import { decodeStateValue } from '../StateEncoding';
import type { SerializedStateRecord } from '../StateEncoding';

export interface IGameObjectRegistrar {
    register(gameObject: GameObjectBase | GameObjectBase[]): void;
    get<T extends GameObjectBase>(gameObjectId: GameObjectId<T>): T | null;

    /**
     * The number of currently tracked game objects. Used by the save-format writer's isolation tests as a
     * falsifiable observable for object-graph leakage: `player.allCards` is decklist-derived and `get()`
     * reports `SevereHaltGame` on an unregistered uuid rather than returning null, so neither can be used
     * to detect a leaked pristine-construction object directly.
     */
    get registeredObjectCount(): number;

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

    public get registeredObjectCount(): number {
        return this.allGameObjects.length;
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

    public buildGameStateForSnapshot(): Record<string, SerializedStateRecord> {
        // MUST stay first: the hasRef latch contract. Serialization reads `.uuid` and never calls
        // `getObjectId()`, so every latch has to be settled by the cull before any record is built.
        this.removeUnusedGameObjects();

        // Return the state of all game objects that are still in the game.
        const states: Record<string, SerializedStateRecord> = {};
        for (const go of this.allGameObjects) {
            states[go.uuid] = getStateSerializerFor(go).serializer.serialize(go);
        }

        return states;
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');
        this._rollbackDepth++;
        try {
            // P3-PB2 pre-pass. `oldState` used to be a free read of the live state bag; it is now a real
            // `serialize(go)` call, which can throw (a non-finite number, an undefined array element, a
            // foreign prototype, ... - see StateEncoding.ts). Such a throw is *deterministic*: its cause is
            // the object's own payload and `serialize` precedes any mutation of that object, so a retry hits
            // the identical condition. That is why the whole pass runs to completion here, before anything
            // is mutated, with its own `try` OUTSIDE the restore `try` below:
            //
            //  - Interleaving it with the update loop would leave objects i+1..n already deserialized when
            //    object i throws (a torn graph), and the recovery leg further down would re-run the same
            //    encode and fail identically - an abort that cannot terminate.
            //  - Being outside the restore `try` is what keeps its failure off `rollbackError`, so no
            //    recovery is attempted for a failure that has nothing to recover from.
            //  - It runs before `this.#game.state` is replaced, so an abort leaves `game.state` untouched too.
            //  - `oldStates` is index-aligned with `allGameObjects`, which is safe because the registration
            //    guard above already forbids creating a GameObject while `_rollbackDepth > 0`, and nothing is
            //    removed from `allGameObjects` until after the update loop.
            //  - Do NOT add a per-object try/catch: swallowing an encoder defect behind a successful-looking
            //    undo is exactly what this structure exists to forbid.
            //
            // A useful consequence: once this completes, every live object is proven encodable, so the
            // recovery leg guarding the restore loop below cannot itself fail for an *encode* reason.
            const oldStates = new Array<SerializedStateRecord>(this.allGameObjects.length);
            try {
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    if (!go.initialized) {
                        throw new Error(`GameObject ${go.getGameObjectName()} (UUID: ${go.uuid}, Type: ${go.constructor.name}) is not initialized during rollback. This should not be possible.`);
                    }

                    oldStates[i] = getStateSerializerFor(go).serializer.serialize(go);
                }
            } catch (error) {
                logger.error('Error building pre-rollback state; rollback aborted before any state was modified.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });

                // A non-fatal severe report: it reaches Discord, so a latent encoder defect is not a
                // console-only signal, and it keeps the alert below truthful. Deliberately NOT
                // reportSevereRollbackFailure, which escalates to SevereHaltGame and throws - halting a game
                // that is completely intact. The weaker severity is not an unconditional promise of that,
                // only the best available one: Lobby.handleError escalates *any* severity to SevereHaltGame
                // and rethrows once gameMessageErrorCount passes MaxGameMessageErrors, which would propagate
                // out of this catch past the alert and the `return false`. That counter resets per client
                // message, so reaching it needs more than MaxGameMessageErrors failures inside one message.
                // Both calls are guard-suspended because the severe branch of
                // Lobby.handleError calls captureGameState, which constructs and registers pristine
                // GameObjects while _rollbackDepth is still nonzero.
                this.withRegistrationGuardSuspended(() => this.#game.reportError(error, GameErrorSeverity.SevereGameMessageOnly));
                this.withRegistrationGuardSuspended(() => this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.'));

                // No recovery rollback and no halt: nothing was mutated, so the game is exactly as it was
                // and the undo simply did not happen. The caller sees the same `false` it already sees for a
                // recovered failure.
                return false;
            }

            const removals: { index: number; go: GameObjectBase; oldState: SerializedStateRecord }[] = [];
            const updates: { go: GameObjectBase; oldState: SerializedStateRecord }[] = [];

            let rollbackError: Error | null = null;
            try {
                // Decoded, never assigned: decodeStateValue builds a fresh object at every level, so later
                // in-place mutations (winnerNames.push, allCards.push, movedCards.push) cannot reach the
                // retained snapshot record and a second rollback to the same snapshot behaves identically.
                this.#game.state = decodeStateValue(snapshot.gameState) as IGameState;

                // Retained as-is and never mutated, for the same repeat-rollback reason.
                const snapshotStatesByUuid = snapshot.states;

                // Indexes in last to first for the purpose of removal.
                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    const oldState = oldStates[i];

                    const updatedState = snapshotStatesByUuid[go.uuid];
                    if (!updatedState) {
                        removals.push({ index: i, go, oldState });
                        continue;
                    }

                    updates.push({ go, oldState });
                    getStateSerializerFor(go).serializer.deserialize(this.#game, go, updatedState);
                    go.afterSetState(oldState);
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
                    // P3-PB2 fix (PB2I1-OPR-01). At HEAD this nested call could only return true or throw,
                    // so discarding its result was safe by construction. The pre-pass above added a third
                    // outcome - `return false` after an abort that mutated nothing *in that frame* - and
                    // this frame has already replaced `this.#game.state` and deserialized part of the graph,
                    // so accepting that false would hand the player the benign "the undo didn't happen"
                    // alert over a torn graph. Reachable without an encoder defect: the pre-pass also throws
                    // for `!go.initialized`, and the outer frame's own error reporting can register pristine
                    // GameObjects through the suspended guard. Convert it to a throw so the catch below
                    // escalates exactly as it did at HEAD.
                    if (!this.rollbackToSnapshot(beforeRollbackSnapshot)) {
                        throw new Error('The recovery rollback aborted in its own pre-rollback state pass, so the game state is only partially restored.');
                    }
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
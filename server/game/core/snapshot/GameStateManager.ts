import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IGameSnapshot } from './SnapshotInterfaces';
import { Contract } from '../utils/Contract.js';
import { Helpers } from '../utils/Helpers.js';
import { logger } from '../../../logger';
import { AlertType, GameErrorSeverity } from '../Constants';
import type { GameObjectId } from '../GameObjectUtils';
import { getStateSerializerFor } from '../StateSerializers';
import type { SerializedStateRecord } from '../StateEncoding';
import type { IDeltaTrackerAnchor, IDeltaTrackerWindow } from './DeltaTracker';
import { DeltaTrackerMode, decodeDeltaFieldValue } from './DeltaTracker';
import type { IRandomness } from '../Randomness';

/** What a full restore reads: the records, and the object-id counter to rewind to. `id` only names the snapshot in errors. */
export interface IRestorableSnapshot {
    readonly id: number | null;
    readonly states: Record<string, SerializedStateRecord>;
    readonly lastGameObjectId: number;
}

/** The recovery snapshot a failed restore returns to: the pre-pass records with the live rng state and counter (G1). */
interface IRecoverySnapshot extends IRestorableSnapshot {
    readonly rngState: IRandomness['rngState'];
}

/** One link of a delta restore: the pending tracker window, or a stored delta mapped to its window anchor. */
export interface IDeltaRestoreLink {
    readonly anchor: IDeltaTrackerAnchor;
    readonly mode: DeltaTrackerMode;
    readonly changedFields: IDeltaTrackerWindow['changedFields'];
    readonly createdObjectUuids: ReadonlySet<string>;
}

/** The snapshot a delta restore ends at; its counter must equal the oldest link's window-start counter. */
export interface IDeltaRestoreTarget {
    readonly id: number;
    readonly lastGameObjectId: number;
}

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

    /** True when `gameObject` is the live registered occupant of its uuid, i.e. it is game state rather than a transient or culled object. */
    isRegistered(gameObject: GameObjectBase): boolean;

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

    public isRegistered(gameObject: GameObjectBase): boolean {
        return this.gameObjectMapping.get(gameObject.uuid) === gameObject;
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
                this.#game.deltaTracker.recordObjectCreation(uuid);
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

    /**
     * Builds the `states` map of a new snapshot: one record for every live object, so snapshots stay full.
     *
     * P4-C memoization: when `previous` is the snapshot the delta tracker's tracking window is anchored at, an
     * object the window shows untouched (see {@link memoizedRecordFor}) gets `previous`'s record object itself
     * instead of a fresh `serialize`. The returned map is always a new object (copy-on-write at the map level), and
     * no record is written after it is placed, so retained snapshots share unchanged records by reference. A call
     * without `previous`, with the tracker stopped, or with a window anchored elsewhere serializes every object.
     */
    public buildGameStateForSnapshot(previous: IGameSnapshot | null = null): Record<string, SerializedStateRecord> {
        // MUST stay first: the hasRef latch contract. Serialization reads `.uuid` and never calls
        // `getObjectId()`, so every latch has to be settled by the cull before any record is built.
        // A culled object is no longer in `allGameObjects`, so no record of it can be reused below.
        this.removeUnusedGameObjects();

        // Reuse needs a live window: a stopped tracker has missed writes, so its window proves nothing.
        const window = previous !== null && this.#game.deltaTracker.isTracking ? this.memoWindowFor(previous) : null;
        const anchorStates = window !== null ? previous.states : null;

        // Return the state of all game objects that are still in the game.
        const states: Record<string, SerializedStateRecord> = {};
        for (const go of this.allGameObjects) {
            const reused = window !== null ? this.memoizedRecordFor(go, anchorStates, window) : undefined;
            states[go.uuid] = reused ?? getStateSerializerFor(go).serializer.serialize(go);
        }

        return states;
    }

    /**
     * The records of `window`'s start state, for materializing a hollow snapshot (`SnapshotFactory.materializeCurrentSnapshot`):
     * a fresh serialize of every live object the window did not create, with each recorded window-start value laid over its
     * (uuid, field). Reads only: no cull, no `getObjectId()`, nothing written. Every record is new, so overlaying never touches a
     * record another snapshot holds; the overlaid values are the window's own encoded values, which nothing writes after capture.
     */
    public buildWindowStartStates(window: IDeltaTrackerWindow): Record<string, SerializedStateRecord> {
        const states: Record<string, SerializedStateRecord> = {};
        for (const go of this.allGameObjects) {
            if (!window.createdObjectUuids.has(go.uuid)) {
                states[go.uuid] = getStateSerializerFor(go).serializer.serialize(go);
            }
        }

        for (const [uuid, fields] of window.changedFields) {
            const record = states[uuid];
            Contract.assertNotNullLike(record, () => `Cannot rebuild the start of the window anchored at ${window.anchor.snapshotId}: it recorded ${uuid}, which is not a live object it did not create`);
            for (const fieldName of Object.keys(fields)) {
                record[fieldName] = fields[fieldName];
            }
        }

        return states;
    }

    /**
     * The one reuse decision shared by the snapshot build and the outermost rollback pre-pass: returns the anchor
     * snapshot's record for `go` when the window shows it untouched since the anchor, otherwise `undefined` (the
     * caller serializes). A uuid in `window.createdObjectUuids` is never reused even when the anchor holds a record
     * under that uuid: after a raw restore to an older snapshot while the tracker runs (tests only) the uuid counter
     * rewinds, so a new object can carry the uuid of an instance the anchor still records.
     *
     * Public so the test-mode verifier (`test/helpers/SnapshotMemoVerifier.ts`) can wrap it; it is not part of
     * {@link IGameObjectRegistrar}.
     */
    public memoizedRecordFor(go: GameObjectBase, anchorStates: Record<string, SerializedStateRecord>, window: IDeltaTrackerWindow): SerializedStateRecord | undefined {
        const uuid = go.uuid;
        if (window.changedFields.has(uuid) || window.createdObjectUuids.has(uuid)) {
            return undefined;
        }

        return anchorStates[uuid];
    }

    /** The held window if it is anchored at `anchor`, else null: any other pairing means the window says nothing about `anchor`. */
    private memoWindowFor(anchor: IGameSnapshot): IDeltaTrackerWindow | null {
        const window = this.#game.deltaTracker.pendingWindow;
        return window !== null && window.anchor.snapshotId === anchor.id ? window : null;
    }

    /**
     * The P3-PB2 pre-pass, shared by both restores: one record per live object, index-aligned with `allGameObjects`, built
     * before anything is written. Throws on an encode failure; each caller reports it and aborts with nothing modified.
     * See the comment in {@link rollbackToSnapshot} for why it runs to completion first and how memoization applies.
     */
    private buildPrePassRecords(memoAnchorSnapshot: IGameSnapshot | null | undefined): SerializedStateRecord[] {
        const memoWindow = this._rollbackDepth === 1 && memoAnchorSnapshot ? this.memoWindowFor(memoAnchorSnapshot) : null;
        const oldStates = new Array<SerializedStateRecord>(this.allGameObjects.length);
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];
            if (!go.initialized) {
                throw new Error(`GameObject ${go.getGameObjectName()} (UUID: ${go.uuid}, Type: ${go.constructor.name}) is not initialized during rollback. This should not be possible.`);
            }

            const reused = memoWindow !== null ? this.memoizedRecordFor(go, memoAnchorSnapshot.states, memoWindow) : undefined;
            oldStates[i] = reused ?? getStateSerializerFor(go).serializer.serialize(go);
        }

        return oldStates;
    }

    /** Reports a pre-pass encode failure. Nothing was modified, so the undo simply did not happen (see the comment at its call in {@link rollbackToSnapshot}). */
    private reportPrePassAbort(error: Error): void {
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
        // Lobby.handleError calls captureGameState, which builds transient objects
        // (createWithoutRefsUnsafe) while _rollbackDepth is still nonzero.
        this.withRegistrationGuardSuspended(() => this.#game.reportError(error, GameErrorSeverity.SevereGameMessageOnly));
        this.withRegistrationGuardSuspended(() => this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.'));
    }

    /**
     * G1 (P4-F): the recovery snapshot is the pre-pass itself, not a second serialize. The pre-pass holds one record per live object,
     * so a full restore to it returns every object to its pre-rollback state and removes nothing. Both restore paths read the rng state
     * and object-id counter right after their pre-pass, before any write, and pass them here, so a write or hook that draws randomness
     * or advances the counter before the throw cannot leak into the recovery. Assembled only once a restore has failed: nothing is
     * registered or removed before the catch that calls this (registration is guarded and removal follows the hooks), so `oldStates`
     * is still index-aligned with `allGameObjects`. `Game.state` is a live object, so its record is present by construction.
     */
    private assembleRecoverySnapshot(oldStates: SerializedStateRecord[], rngState: IRandomness['rngState'], lastGameObjectId: number): IRecoverySnapshot {
        const states: Record<string, SerializedStateRecord> = {};
        for (let i = 0; i < this.allGameObjects.length; i++) {
            states[this.allGameObjects[i].uuid] = oldStates[i];
        }

        return { id: null, states, rngState, lastGameObjectId };
    }

    /**
     * The delta restore (P4-F, `docs/plans/04-delta-snapshots.md` "Rollback protocol"): reverts live state to `target` by writing each
     * link's recorded window-start values back through the accessor setters, newest link first, so the oldest recorded value of every
     * (uuid, field) wins. `links` is the held pending window followed by the stored chain, every one in
     * {@link DeltaTrackerMode.CaptureOldValues}; `target` supplies the counter the chain must end at.
     *
     * Lifecycle order, main's full-restore order with every write first (G3): all field writes and rng restores; `afterSetState` for
     * every surviving live object, last to first; `cleanupOnRemove` for each object created inside the chain that is still registered
     * (one created and culled inside its window is skipped); registry removal of those; `afterSetAllState` for every surviving object,
     * last to first; `lkiRegistry.clearForRollback`; the counter. A throw after the pre-pass recovers to the pre-rollback live state
     * from the pre-pass records (G1) and returns `false`; a registration attempted inside fails the `_rollbackDepth` guard the same way.
     */
    public rollbackToDeltaChain(links: readonly IDeltaRestoreLink[], target: IDeltaRestoreTarget, memoAnchorSnapshot: IGameSnapshot | null): boolean {
        Contract.assertNonEmpty(links, 'A delta restore needs at least the pending window');
        Contract.assertNotNullLike(target, 'Empty target provided for delta rollback');

        this._rollbackDepth++;
        try {
            let oldStates: SerializedStateRecord[];
            try {
                oldStates = this.buildPrePassRecords(memoAnchorSnapshot);
            } catch (error) {
                this.reportPrePassAbort(error);
                return false;
            }
            // Read before the first write: each link restores its own rng state below (`rngState` is a fresh copy per read).
            const recoveryRngState = this.#game.randomGenerator.rngState;
            const recoveryLastGameObjectId = this._lastGameObjectId;

            const createdUuids = new Set<string>();
            const removals: { index: number; go: GameObjectBase; oldState: SerializedStateRecord }[] = [];
            const updates: { go: GameObjectBase; oldState: SerializedStateRecord }[] = [];
            let restoredCounter: number = null;

            try {
                for (const link of links) {
                    Contract.assertTrue(link.mode === DeltaTrackerMode.CaptureOldValues, () => `Delta restore to snapshot ${target.id} reached a ${link.mode} link anchored at ${link.anchor.snapshotId}; only captured old values can be restored`);

                    this.#game.randomGenerator.restore(link.anchor.rngState);
                    restoredCounter = link.anchor.lastGameObjectId;

                    for (const [uuid, fields] of link.changedFields) {
                        // Every recorded object existed at its window start, survived that checkpoint's cull (so it can never be culled
                        // later) and nothing unregisters outside a rollback, so it is still registered.
                        const go = this.gameObjectMapping.get(uuid);
                        Contract.assertNotNullLike(go, () => `Delta restore to snapshot ${target.id}: the link anchored at ${link.anchor.snapshotId} recorded ${uuid}, which is not registered`);

                        const writable = go as unknown as Record<string, unknown>;
                        for (const fieldName of Object.keys(fields)) {
                            writable[fieldName] = decodeDeltaFieldValue(this.#game, go, fieldName, fields[fieldName]);
                        }
                    }

                    for (const uuid of link.createdObjectUuids) {
                        createdUuids.add(uuid);
                    }
                }

                for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
                    const go = this.allGameObjects[i];
                    if (createdUuids.has(go.uuid)) {
                        removals.push({ index: i, go, oldState: oldStates[i] });
                        continue;
                    }

                    updates.push({ go, oldState: oldStates[i] });
                    go.afterSetState(oldStates[i]);
                }

                for (const removed of removals) {
                    removed.go.cleanupOnRemove(removed.oldState);
                }
            } catch (error) {
                logger.error('Error during delta rollback to snapshot. Attempting to restore existing state before rollback.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                this.recoverToPreRollbackState(this.assembleRecoverySnapshot(oldStates, recoveryRngState, recoveryLastGameObjectId));
                return false;
            }

            this.removeRolledBackObjects(removals);

            for (const update of updates) {
                update.go.afterSetAllState(update.oldState);
            }

            this.#game.lkiRegistry.clearForRollback();

            Contract.assertTrue(restoredCounter === target.lastGameObjectId, () => `Delta restore to snapshot ${target.id} ended at object id counter ${restoredCounter}, but the target records ${target.lastGameObjectId}`);
            this.restoreLastGameObjectId(target);

            if (this._rollbackDepth === 1) {
                this.#game.deltaTracker.invalidateWindow();
            }

            return true;
        } finally {
            this._rollbackDepth--;
        }
    }

    /**
     * Restores the pre-rollback live state from the pre-pass records after a restore threw part-way, then reports the failure the way
     * every recovered undo does. A recovery that itself fails leaves a torn game and is reported severe (which halts it).
     */
    private recoverToPreRollbackState(recovery: IRecoverySnapshot): void {
        try {
            // P3-PB2 fix (PB2I1-OPR-01): the nested call can return `false` after a pre-pass abort that mutated nothing in *its*
            // frame, but the calling frame has already written part of the graph, so accepting that false would hand the player the
            // benign "the undo didn't happen" alert over a torn graph. Reachable without an encoder defect: the pre-pass also throws for
            // `!go.initialized`; the outer frame's own error reporting runs through the suspended guard but builds only transient
            // `createWithoutRefsUnsafe` objects, which never enter the registry, so this conversion is defence in depth. Convert it to
            // a throw so the catch below escalates.
            if (!this.rollbackToSnapshot(recovery)) {
                throw new Error('The recovery rollback aborted in its own pre-rollback state pass, so the game state is only partially restored.');
            }
            this.#game.randomGenerator.restore(recovery.rngState);
            this.withRegistrationGuardSuspended(() => this.#game.addAlert(AlertType.Danger, 'An error occurred during undo. This error has been reported to the dev team for investigation. If it happens multiple times, please reach out in the discord.'));
        } catch (error) {
            logger.error('The attempt to restore game state from prior to rollback has failed. Game has reached an unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
            this.withRegistrationGuardSuspended(() => this.#game.reportSevereRollbackFailure(error));
        }
    }

    /** Drops the objects a restore removed from the registry, rebuilding the list once without an intermediate index list. */
    private removeRolledBackObjects(removals: readonly { index: number; go: GameObjectBase }[]): void {
        const removalIndexSet = new Set<number>();
        for (const removed of removals) {
            removalIndexSet.add(removed.index);
        }
        this.allGameObjects = this.allGameObjects.filter((_, index) => !removalIndexSet.has(index));

        for (const removed of removals) {
            this.gameObjectMapping.delete(removed.go.uuid);
        }
    }

    public rollbackToSnapshot(snapshot: IRestorableSnapshot, memoAnchorSnapshot?: IGameSnapshot): boolean {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');
        // Game.state is an ordinary registered object restored by the update loop below. A snapshot without its
        // record would look like an object created after the snapshot and be removed from the game, so refuse it
        // before anything is touched.
        Contract.assertNotNullLike(
            snapshot.states[this.#game.state.uuid],
            () => `Snapshot ${snapshot.id ?? '(recovery)'} has no record for Game.state (uuid ${this.#game.state.uuid}); refusing to roll back to it.`
        );
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
            //  - It covers `game.state` as an ordinary object and runs before any object is deserialized, so an
            //    abort leaves `game.state` untouched too.
            //  - `oldStates` is index-aligned with `allGameObjects`, which is safe because the registration
            //    guard above already forbids creating a GameObject while `_rollbackDepth > 0`, and nothing is
            //    removed from `allGameObjects` until after the update loop.
            //  - Do NOT add a per-object try/catch: swallowing an encoder defect behind a successful-looking
            //    undo is exactly what this structure exists to forbid.
            //
            // A useful consequence: once this completes, every live object is proven encodable (a reused
            // record was produced by the encoder and the object is unchanged since, so only the rest are
            // serialized here), so the recovery leg guarding the restore loop below cannot itself fail for an
            // *encode* reason.
            //
            // P4-C memoization: in the outermost frame, an object the held tracking window shows untouched
            // since `memoAnchorSnapshot` (the current snapshot, the window's anchor) takes that snapshot's
            // record as `oldState` instead of a fresh `serialize`, so the hooks receive a record shared with
            // retained snapshots and must not write into it. The nested recovery frame never reuses: the
            // outer frame has already deserialized part of the graph untracked, so an object "clean since
            // the anchor" may no longer equal the anchor's record, and reuse would hand a restore hook the
            // anchor's `isRegistered` in place of the torn value (a skipped listener transition, a triggered
            // ability left unregistered). Today's recovery call passes no `memoAnchorSnapshot`; the
            // depth test is the guard that keeps it so. Reuse is sound only when the held window was tracking
            // until `SnapshotManager.rollbackToInternal` stopped the tracker on entry; a caller that stops the
            // tracker earlier with a window held must pass no `memoAnchorSnapshot`.
            let oldStates: SerializedStateRecord[];
            try {
                oldStates = this.buildPrePassRecords(memoAnchorSnapshot);
            } catch (error) {
                this.reportPrePassAbort(error);

                // No recovery rollback and no halt: nothing was mutated, so the game is exactly as it was
                // and the undo simply did not happen. The caller sees the same `false` it already sees for a
                // recovered failure.
                return false;
            }
            // G1/G2 recovery reads these, captured before any write (the same point as the delta path).
            const recoveryRngState = this.#game.randomGenerator.rngState;
            const recoveryLastGameObjectId = this._lastGameObjectId;

            const removals: { index: number; go: GameObjectBase; oldState: SerializedStateRecord }[] = [];
            const updates: { go: GameObjectBase; oldState: SerializedStateRecord }[] = [];

            let rollbackError: Error | null = null;
            try {
                // Retained as-is and never mutated, so a second rollback to the same snapshot behaves
                // identically. The generated deserializers copy every collection into a fresh one, so later
                // in-place mutations (winnerNames.push, allCards.push, movedCards.push) cannot reach it.
                const snapshotStatesByUuid = snapshot.states;

                // Indexes in last to first for the purpose of removal. `Game.state` restores here at its own
                // (low) index, after every later-registered object's `afterSetState` has run, so no
                // `afterSetState` override may read a `Game.state` field: it would still hold its pre-rollback value.
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
                if (!memoAnchorSnapshot) {
                    logger.error('Error during rollback to snapshot and no memo anchor provided (a raw restore or the nested recovery frame), game may be in unrecoverable state.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
                    // Suspended: reportSevereRollbackFailure re-enters Game/Lobby error reporting, which must
                    // never be masked by the registration guard. Nothing registers on this path today (see
                    // the corrected client-protocol audit), so this is defence in depth, not a required fix.
                    this.withRegistrationGuardSuspended(() => this.#game.reportSevereRollbackFailure(error));
                }

                rollbackError = error;
                logger.error('Error during rollback to snapshot. Attempting to restore existing state before rollback.', { error: { message: error.message, stack: error.stack }, lobbyId: this.#game.lobbyId });
            }

            if (rollbackError) {
                if (memoAnchorSnapshot) {
                    // G1/G2 (P4-F): recover to the pre-rollback live state from this frame's own pre-pass records, not to the current
                    // snapshot: a hollow current snapshot has no records, and the player keeps the action in progress, as the alert says.
                    this.recoverToPreRollbackState(this.assembleRecoverySnapshot(oldStates, recoveryRngState, recoveryLastGameObjectId));
                    return false;
                }

                // No memo anchor (reported severe above): nothing outside this frame vouches for a recovery, so the game is torn.
                // reportSevereRollbackFailure always throws, so control never reaches past this call.
                this.withRegistrationGuardSuspended(() => this.#game.reportSevereRollbackFailure(rollbackError));
            }

            // Remove GOs that hadn't yet been created by this point.
            this.removeRolledBackObjects(removals);

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

            // The LKI registry is transient, so rollback does not restore it. Clear the parts that
            // are timeline-dependent, otherwise a footprint minted in the abandoned timeline would
            // be served for a re-created card identity.
            this.#game.lkiRegistry.clearForRollback();

            // Must run after afterSetAllState: restoring the counter any earlier would let a transient
            // created during that pass consume an id a replayed object is owed.
            this.restoreLastGameObjectId(snapshot);

            // The writes above bypassed the delta tracker's window, so it no longer describes live state (the consumption rule).
            // Only the outermost frame: a nested recovery frame restores the state the held window already describes.
            if (this._rollbackDepth === 1) {
                this.#game.deltaTracker.invalidateWindow();
            }

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
     * recovery call (recoverToPreRollbackState) restores from the pre-pass records as part of its own normal completion, and
     * the outer frame returns `false` immediately afterward without reaching here, so there is no double
     * restore.
     */
    private restoreLastGameObjectId(snapshot: { readonly lastGameObjectId: number }): void {
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
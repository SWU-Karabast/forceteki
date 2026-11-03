import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IRandomness } from '../Randomness';
import type { FieldKind, IGeneratedSerializerEntry } from '../StateEncoding';
import { encodeRef, encodeRefArray, encodeRefMap, encodeRefRecord, encodeRefSet, encodeStateValue } from '../StateEncoding';
import { getStateSerializerFor } from '../StateSerializers';
import { Contract } from '../utils/Contract.js';

/**
 * How a window records a changed field. The mode is fixed when the window opens: {@link DeltaTracker.setMode}
 * applies from the next window, never to the open one.
 */
export enum DeltaTrackerMode {

    /** Records only that a field changed (a marker, no value). The default since P4-C: memoization re-serializes touched objects itself. */
    DirtyOnly = 'dirtyOnly',

    /** Also records the field's window-start value, encoded the way the snapshot serializers encode it. Not the default; P4-E (delta snapshots) selects it. */
    CaptureOldValues = 'captureOldValues'
}

/** The snapshot a window starts from. */
export interface IDeltaTrackerAnchor {
    snapshotId: number;
    rngState: IRandomness['rngState'];
    lastGameObjectId: number;
}

export interface IDeltaTrackerWindow {
    readonly anchor: IDeltaTrackerAnchor;
    readonly mode: DeltaTrackerMode;

    /** uuid to field name to the window-start value ({@link DeltaTrackerMode.CaptureOldValues}) or a marker ({@link DeltaTrackerMode.DirtyOnly}). */
    readonly changedFields: ReadonlyMap<string, Readonly<Record<string, unknown>>>;

    /** Objects registered while the window was open. They have no window-start state, so their field writes are not recorded. */
    readonly createdObjectUuids: ReadonlySet<string>;
}

interface IMutableWindow extends IDeltaTrackerWindow {
    readonly changedFields: Map<string, Record<string, unknown>>;
    readonly createdObjectUuids: Set<string>;
}

/** What a {@link DeltaTrackerMode.DirtyOnly} window stores for a changed field. */
export const dirtyFieldMarker = true;

// A registry entry's field kinds never change, so the name-to-kind lookup is built once per entry.
const kindsByEntry = new WeakMap<IGeneratedSerializerEntry, Map<string, FieldKind>>();

function getFieldKinds(entry: IGeneratedSerializerEntry): Map<string, FieldKind> {
    let kinds = kindsByEntry.get(entry);
    if (kinds === undefined) {
        kinds = new Map<string, FieldKind>();
        for (const field of entry.fields) {
            kinds.set(field.name, field.kind);
        }
        kindsByEntry.set(entry, kinds);
    }
    return kinds;
}

/**
 * Records, between two consecutive full snapshots (one "window"), which (object, field) pairs were written and
 * which objects were registered, so memoization (P4-C) and delta snapshots (P4-E/P4-F) can consume it
 * (`docs/plans/04-delta-snapshots.md`, "Mechanism"). Memoization consumes it: `GameStateManager.buildGameStateForSnapshot`
 * and the outermost rollback pre-pass reuse the anchor snapshot's record for every object the window shows untouched, so a
 * write that no hook sees (listed below) leaves a stale record in the next snapshot. Every snapshot still holds a record for every object.
 *
 * One tracker per {@link Game}. It is plain bookkeeping, not a `GameObjectBase`, and is not snapshotted.
 *
 * Invariants:
 * - Every state setter and wrapper mutator calls {@link recordFieldChange} strictly before its write, so the
 *   field still holds its window-start value; the first write to a (uuid, field) in a window wins.
 * - A window opens at each `SnapshotFactory.createSnapshotForCurrentTimepoint` ({@link startTracking} the first
 *   time, {@link checkpoint} afterwards). A successful rollback opens a fresh window at the restored snapshot.
 *   A rollback that restores nothing, or that fails and recovers to the window's own anchor, resumes the
 *   existing window: an empty one would claim that objects changed earlier in the same action are untouched.
 * - Restore writes every field through the same setters, so tracking is stopped for the whole restore, which
 *   includes the post-restore hooks (`afterSetState`, `afterSetAllState`). Their writes are expected to leave every
 *   field equal to the restored snapshot (non-state fields, or the value the restore just wrote), so the fresh window
 *   claims untouched objects equal the anchor; `DeltaTracker.spec.ts` asserts this after a manual rollback on a board
 *   with ongoing effects, and memoization trusts it (the test-mode verifier checks it at the first build after every rollback).
 * - A registration while stopped is not recorded (`recordObjectCreation`). Nothing registers during a rollback today:
 *   the registration guard forbids it, and the guard-suspended error-reporting paths only read state or build
 *   `createWithoutRefsUnsafe` objects, which never enter the registry.
 * - Writes to objects registered during the window, to objects built with registration disabled
 *   (`createWithoutRefsUnsafe`) and to objects not in the registry are not recorded.
 *
 * Writes no hook can see, so they are never recorded (since P4-C each is a correctness hazard, guarded only by the
 * test-mode verifier): index assignment and `length =` on a `ValueArray`; a
 * write cast past `readonly` into a `@stateRefArray()` array; in-place mutation inside a `@stateValue` payload
 * or inside a value held by a `ValueMap`/`ValueArray`; `Object.defineProperty` on a `@stateRefRecord` proxy.
 * (`Game.state` is the registered `GameState` object since P4-B, so its writes are recorded like any other's.)
 */
export class DeltaTracker {
    private readonly game: Game;
    private _mode: DeltaTrackerMode = DeltaTrackerMode.DirtyOnly;
    private _tracking = false;
    private _window: IMutableWindow | null = null;

    public get isTracking(): boolean {
        return this._tracking;
    }

    public get mode(): DeltaTrackerMode {
        return this._mode;
    }

    /** The open window, still accumulating (null before the first snapshot and after {@link discardWindow}). Kept while stopped. */
    public get pendingWindow(): IDeltaTrackerWindow | null {
        return this._window;
    }

    public constructor(game: Game) {
        this.game = game;
    }

    /** Applies to the next window that opens; the open window keeps the mode it opened with. */
    public setMode(mode: DeltaTrackerMode): void {
        this._mode = mode;
    }

    /** Opens an empty window at `anchor`, dropping any window already held. */
    public startTracking(anchor: IDeltaTrackerAnchor): void {
        Contract.assertNotNullLike(anchor, 'DeltaTracker.startTracking requires the anchor snapshot of the window it opens');
        Contract.assertNotNullLike(anchor.snapshotId, 'DeltaTracker.startTracking requires an anchor with a snapshot id');

        this._window = {
            anchor,
            mode: this._mode,
            changedFields: new Map<string, Record<string, unknown>>(),
            createdObjectUuids: new Set<string>()
        };
        this._tracking = true;
    }

    /** Closes the open window, returning it, and opens an empty one at `nextAnchor`. */
    public checkpoint(nextAnchor: IDeltaTrackerAnchor): IDeltaTrackerWindow {
        Contract.assertTrue(this._tracking, 'DeltaTracker.checkpoint requires a tracking window; use startTracking for the first one');

        const closed = this._window;
        this.startTracking(nextAnchor);
        return closed;
    }

    /** Stops recording but keeps the window (see {@link resumeTracking}). */
    public stopTracking(): void {
        this._tracking = false;
    }

    public resumeTracking(): void {
        Contract.assertNotNullLike(this._window, 'DeltaTracker.resumeTracking requires a window; use startTracking after a discard');

        this._tracking = true;
    }

    /** Stops recording and drops the window; the next snapshot starts a new one. */
    public discardWindow(): void {
        this._tracking = false;
        this._window = null;
    }

    /** Must be called before `go`'s field `fieldName` is written. */
    public recordFieldChange(go: GameObjectBase, fieldName: string): void {
        if (!this._tracking) {
            return;
        }

        const window = this._window;
        const uuid = go.uuid;
        const entry = window.changedFields.get(uuid);

        // Already-recorded fields return before any serializer lookup: this is the steady-state hot path.
        if (entry !== undefined) {
            if (fieldName in entry) {
                return;
            }

            entry[fieldName] = window.mode === DeltaTrackerMode.DirtyOnly ? dirtyFieldMarker : this.encodeCurrentValue(go, fieldName);
            return;
        }

        // `register` writes `_uuid` before the object has one.
        if (uuid == null || window.createdObjectUuids.has(uuid) || !this.game.gameObjectManager.isRegistered(go)) {
            return;
        }

        // Null prototype, so a field named like an Object.prototype member cannot false-hit the `in` test above.
        const record: Record<string, unknown> = Object.create(null);
        record[fieldName] = window.mode === DeltaTrackerMode.DirtyOnly ? dirtyFieldMarker : this.encodeCurrentValue(go, fieldName);
        window.changedFields.set(uuid, record);
    }

    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }

        this._window.createdObjectUuids.add(uuid);
    }

    /** Encodes the field's current value with the encoder its registry kind selects. Never calls `getObjectId()`, which would latch `_hasRef`. */
    private encodeCurrentValue(go: GameObjectBase, fieldName: string): unknown {
        const registryEntry = getStateSerializerFor(go);
        const kind = getFieldKinds(registryEntry).get(fieldName);
        Contract.assertNotNullLike(kind, () => `DeltaTracker cannot capture ${go.constructor.name}.${fieldName}: the field is not in the state serializer registry entry for ${registryEntry.className}`);

        const value = (go as unknown as Record<string, unknown>)[fieldName];
        switch (kind) {
            case 'primitive':
                return value;
            case 'value':
                return encodeStateValue(`${registryEntry.className}.${fieldName}`, value);
            case 'ref':
                return encodeRef(value as GameObjectBase);
            case 'refArray':
                return encodeRefArray(value as GameObjectBase[]);
            case 'refMap':
                return encodeRefMap(value as Map<string, GameObjectBase>);
            case 'refSet':
                return encodeRefSet(value as Set<GameObjectBase>);
            case 'refRecord':
                return encodeRefRecord(value as Record<string, GameObjectBase>);
            default:
                return Contract.fail(`DeltaTracker cannot capture ${registryEntry.className}.${fieldName}: unknown field kind "${String(kind)}"`);
        }
    }
}

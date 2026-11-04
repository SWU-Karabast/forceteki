import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IRandomness } from '../Randomness';
import type { FieldKind, IGeneratedSerializerEntry } from '../StateEncoding';
import { decodeRef, decodeRefArray, decodeRefMap, decodeRefRecord, decodeRefSet, decodeStateValue, encodeRef, encodeRefArray, encodeRefMap, encodeRefRecord, encodeRefSet, encodeStateValue } from '../StateEncoding';
import { getStateSerializerFor } from '../StateSerializers';
import { Contract } from '../utils/Contract.js';

/**
 * How a window records a changed field. The mode is fixed when the window opens: {@link DeltaTracker.setMode}
 * applies from the next window, never to the open one.
 */
export enum DeltaTrackerMode {

    /** Records only that a field changed (a marker, no value). Not the default since P4-E: memoization reads only window keys and works in this mode, but a delta recorded in it is not restorable. */
    DirtyOnly = 'dirtyOnly',

    /** Also records the field's window-start value, encoded the way the snapshot serializers encode it. The default since P4-E: the delta snapshot payload needs the values. */
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
 * Records, between two consecutive snapshots (one "window"), which (object, field) pairs were written and
 * which objects were registered, so memoization (P4-C) and delta snapshots (P4-E/P4-F) can consume it
 * (`docs/plans/04-delta-snapshots.md`, "Mechanism"). Memoization consumes it: `GameStateManager.buildGameStateForSnapshot`
 * and the outermost rollback pre-pass reuse the anchor snapshot's record for every object the window shows untouched, so a
 * write that no hook sees (listed below) leaves a stale record in the next snapshot. Since P4-F the closed window is also the only
 * record of a hollow action snapshot's state: the delta restore writes its values back, and a write no hook sees is not reverted.
 *
 * One tracker per {@link Game}. It is plain bookkeeping, not a `GameObjectBase`, and is not snapshotted.
 * It defaults to {@link DeltaTrackerMode.CaptureOldValues} (since P4-E), so each closed window is a delta payload; memoization reads only the window's keys and behaves the same in either mode.
 *
 * Invariants:
 * - Every state setter and wrapper mutator calls {@link recordFieldChange} strictly before its write, so the
 *   field still holds its window-start value; the first write to a (uuid, field) in a window wins.
 * - A window opens at each `SnapshotFactory.createSnapshotForCurrentTimepoint` ({@link startTracking} the first
 *   time, {@link checkpoint} afterwards). A successful rollback opens a fresh window at the restored snapshot.
 *   A rollback that restores nothing, or that fails and recovers to the pre-rollback live state, resumes the
 *   existing window: an empty one would claim that objects changed earlier in the same action are untouched.
 * - Validity (P4-F): a held window is always valid. Every successful restore, full or delta, managed or raw, drops it
 *   ({@link invalidateWindow}) because its writes bypassed the window, so a consumed window can never be resumed or applied;
 *   the delta restore applies only the window {@link liveWindowAnchoredAt} returns for the index head.
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
 * Writes no hook can see, so they are never recorded (since P4-C each is a correctness hazard; guarded by the
 * test-mode memo verifier at full-snapshot builds and, under `ENABLE_UNDO_ALL_TESTS`, by the delta-parity gate's
 * compare after every replayed rollback): index assignment and `length =` on a `ValueArray`; a
 * write cast past `readonly` into a `@stateRefArray()` array; in-place mutation inside a `@stateValue` payload
 * or inside a value held by a `ValueMap`/`ValueArray`; `Object.defineProperty` on a `@stateRefRecord` proxy.
 * (`Game.state` is the registered `GameState` object since P4-B, so its writes are recorded like any other's.)
 */
export class DeltaTracker {
    private readonly game: Game;
    private _mode: DeltaTrackerMode = DeltaTrackerMode.CaptureOldValues;
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

    /**
     * The consumption rule: called by every restore that changed live state without the window seeing it (every successful full or
     * delta restore, managed or raw). The window's recorded values no longer describe live state, so it is dropped and can never be
     * resumed or applied; a managed rollback opens a fresh one at the restored snapshot, and anything else starts a new tracking run.
     */
    public invalidateWindow(): void {
        this._tracking = false;
        this._window = null;
    }

    /**
     * The held window when it is anchored at `snapshotId`, else null. Held means tracking, or stopped by `SnapshotManager.rollbackToInternal`;
     * every stale window has been dropped ({@link invalidateWindow}), so a held window is always valid.
     */
    public liveWindowAnchoredAt(snapshotId: number | null): IDeltaTrackerWindow | null {
        const window = this._window;
        return window !== null && snapshotId != null && window.anchor.snapshotId === snapshotId ? window : null;
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

/**
 * The inverse of the tracker's capture encoding: decodes a recorded window-start value of `go`'s field `fieldName` with the decoder
 * its registry kind selects, the same one the generated deserializer uses, so the delta restore can write it back through the
 * field's accessor setter. Ref kinds resolve through the live registry, so a referenced object must be registered.
 */
export function decodeDeltaFieldValue(game: Game, go: GameObjectBase, fieldName: string, encoded: unknown): unknown {
    const registryEntry = getStateSerializerFor(go);
    const kind = getFieldKinds(registryEntry).get(fieldName);
    Contract.assertNotNullLike(kind, () => `Delta restore cannot decode ${go.constructor.name}.${fieldName}: the field is not in the state serializer registry entry for ${registryEntry.className}`);

    switch (kind) {
        case 'primitive':
            return encoded;
        case 'value':
            return decodeStateValue(encoded);
        case 'ref':
            return decodeRef(game, encoded as string | null);
        case 'refArray':
            return decodeRefArray(game, encoded as string[] | null);
        case 'refMap':
            return decodeRefMap(game, encoded as Parameters<typeof decodeRefMap>[1]);
        case 'refSet':
            return decodeRefSet(game, encoded as Parameters<typeof decodeRefSet>[1]);
        case 'refRecord':
            return decodeRefRecord(game, encoded as Record<string, string> | null);
        default:
            return Contract.fail(`Delta restore cannot decode ${registryEntry.className}.${fieldName}: unknown field kind "${String(kind)}"`);
    }
}

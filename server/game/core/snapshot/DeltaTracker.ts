import * as v8 from 'v8';
import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { IDeltaSnapshot } from './SnapshotInterfaces';

/**
 * Tracks field-level state changes on GameObjects during a delta window.
 * Used to build reverse deltas for lightweight undo instead of full v8.serialize snapshots.
 *
 * Recording hooks are called by state decorator setters and Undo* mutation methods
 * BEFORE they mutate `go.state[fieldName]`, capturing the old value on first change only.
 */
export class DeltaTracker {
    readonly #game: Game;

    private _tracking = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private changedFields = new Map<string, Record<string, any>>();
    private createdObjectUuids: string[] = [];

    /** State captured at the START of the tracking window (for reverse delta) */
    private windowStartGameState: Buffer | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private windowStartRngState: any = null;
    private windowStartLastGameObjectId = 0;

    public get isTracking(): boolean {
        return this._tracking;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    public startTracking(): void {
        this._tracking = true;
        this.changedFields.clear();
        this.createdObjectUuids = [];

        // Capture "before" state at the start of the tracking window
        this.windowStartGameState = v8.serialize(this.#game.state);
        this.windowStartRngState = this.#game.randomGenerator.rngState;
        this.windowStartLastGameObjectId = this.#game.gameObjectManager.lastGameObjectId;
    }

    public stopTracking(): void {
        this._tracking = false;
    }

    /**
     * Called by state decorator setters and Undo* mutation methods BEFORE mutating `go.state[fieldName]`.
     * Records the old value on first change; no-ops on subsequent changes to the same field.
     */
    public recordFieldChange(go: GameObjectBase, fieldName: string): void {
        if (!this._tracking) {
            return;
        }

        let goEntry = this.changedFields.get(go.uuid);
        if (!goEntry) {
            goEntry = {};
            this.changedFields.set(go.uuid, goEntry);
        }

        // Only record the FIRST old value — subsequent changes are no-ops
        if (!(fieldName in goEntry)) {
            // @ts-expect-error accessing protected state
            const currentValue = go.state[fieldName];
            goEntry[fieldName] = this.snapshotValue(currentValue);
        }
    }

    /**
     * Called by GameStateManager.register() when a new GO is created during tracking.
     */
    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }
        this.createdObjectUuids.push(uuid);
    }

    /**
     * Freezes the current delta and resets tracking for the next window.
     * The caller (SnapshotManager) provides the metadata (IDs, timepoint, etc.).
     * gameState, rngState, and lastGameObjectId are taken from the start of the
     * tracking window (captured in startTracking) to form a correct reverse delta.
     */
    public checkpoint(metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'gameState' | 'rngState' | 'lastGameObjectId'>): IDeltaSnapshot {
        const delta: IDeltaSnapshot = {
            ...metadata,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            gameState: this.windowStartGameState!,
            rngState: this.windowStartRngState,
            lastGameObjectId: this.windowStartLastGameObjectId,
        };

        // Reset for next window
        this.changedFields = new Map();
        this.createdObjectUuids = [];

        return delta;
    }

    /**
     * Creates a delta from the current in-flight tracking window WITHOUT resetting the tracker.
     * Used during rollback to capture the live (un-checkpointed) changes from the current action.
     * Call stopTracking() before this to prevent new mutations from being recorded.
     */
    public createLiveDelta(): IDeltaSnapshot {
        return {
            id: -1, // placeholder — not used for identification
            actionNumber: 0,
            roundNumber: 0,
            phase: '' as IDeltaSnapshot['phase'],
            timepoint: '' as IDeltaSnapshot['timepoint'],
            timepointNumber: -1,
            requiresConfirmationToRollback: false,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            gameState: this.windowStartGameState!,
            rngState: this.windowStartRngState,
            lastGameObjectId: this.windowStartLastGameObjectId,
        };
    }

    /**
     * Shallow-copy collections; return primitives and refs directly.
     * Collections at the state level are:
     *   - Array (of GameObjectRef) for @stateRefArray
     *   - Map (string → GameObjectRef) for @stateRefMap
     *   - Set (of string UUIDs) for @stateRefSet
     *   - Plain object (Record<string, GameObjectRef>) for @stateRefRecord
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private snapshotValue(value: any): any {
        if (value == null || typeof value !== 'object') {
            return value; // primitives, null, undefined
        }
        if (Array.isArray(value)) {
            return value.concat();
        }
        if (value instanceof Map) {
            return new Map(value);
        }
        if (value instanceof Set) {
            return new Set(value);
        }
        // GameObjectRef ({isRef: true, uuid: string}) — refs are effectively immutable
        if (value.isRef) {
            return value;
        }
        // For @stateValue (arbitrary objects), use structuredClone for safety
        return structuredClone(value);
    }
}

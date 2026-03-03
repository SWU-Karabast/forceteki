import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';

type IChangedFieldsByUuid = Map<string, Record<string, unknown>>;

export class DeltaTracker {
    private _tracking = false;
    private changedFields: IChangedFieldsByUuid = new Map();
    private createdObjectUuids: string[] = [];

    public constructor(game: Game) {
        void game;
    }

    public get isTracking(): boolean {
        return this._tracking;
    }

    public startTracking(): void {
        this._tracking = true;
        this.changedFields = new Map();
        this.createdObjectUuids = [];
    }

    public stopTracking(): void {
        this._tracking = false;
    }

    public getTrackedChangedFields(): IChangedFieldsByUuid {
        return this.changedFields;
    }

    public getTrackedCreatedObjectUuids(): string[] {
        return this.createdObjectUuids;
    }

    public recordFieldChange(go: GameObjectBase, fieldName: string): void {
        if (!this._tracking) {
            return;
        }

        let goEntry = this.changedFields.get(go.uuid);
        if (!goEntry) {
            goEntry = {};
            this.changedFields.set(go.uuid, goEntry);
        }

        if (Object.prototype.hasOwnProperty.call(goEntry, fieldName)) {
            return;
        }

        goEntry[fieldName] = this.snapshotValue(go.getStateUnsafe()[fieldName]);
    }

    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }

        this.createdObjectUuids.push(uuid);
    }

    private snapshotValue(value: unknown): unknown {
        if (value == null || typeof value !== 'object') {
            return value;
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

        if ((value as { isRef?: boolean }).isRef) {
            return value;
        }

        return structuredClone(value);
    }
}

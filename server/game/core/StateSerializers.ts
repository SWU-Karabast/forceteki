import { createRequire } from 'node:module';
import type { Game } from './Game';
import type { GameObjectBase } from './GameObjectBase';
import type { GameObjectId } from './GameObjectUtils';

const GENERATED_STATE_SERIALIZERS_MODULE_PATH = './generated/GeneratedStateSerializers';
const requireGeneratedStateSerializers = createRequire(__filename);

let generatedStateSerializersLoaded = false;

export type SerializerInstance = Record<string, unknown>;

interface IGameObjectRefLike {
    getObjectId(): string;
}

export type SerializedGameObjectState = Record<string, unknown>;

export type SerializedGameObjectStateMap = Record<string, SerializedGameObjectState>;

export interface StateSerializer<TState extends SerializedGameObjectState = SerializedGameObjectState> {
    serialize(instance: SerializerInstance): TState;
    deserialize(game: Game, instance: SerializerInstance, state: TState): void;
}

export interface StateDeltaFieldSerializer {
    serialize(value: unknown): unknown;
    deserialize(game: Game, value: unknown): unknown;
}

export type StateDeltaSerializer = Record<string, StateDeltaFieldSerializer>;

interface SerializerConstructor {
    name: string;
}

export const stateSerializerRegistry = new Map<string, StateSerializer>();
export const stateDeltaSerializerRegistry = new Map<string, StateDeltaSerializer>();

const stateDeltaSerializerCache = new Map<SerializerConstructor, StateDeltaSerializer>();

export function registerStateSerializers(entries: Iterable<readonly [string, StateSerializer]>): void {
    for (const [name, serializer] of entries) {
        stateSerializerRegistry.set(name, serializer);
    }
}

export function registerStateDeltaSerializers(entries: Iterable<readonly [string, StateDeltaSerializer]>): void {
    for (const [name, serializer] of entries) {
        stateDeltaSerializerRegistry.set(name, serializer);
    }
}

export function ensureStateSerializersRegistered(): void {
    if (generatedStateSerializersLoaded) {
        return;
    }

    try {
        requireGeneratedStateSerializers(GENERATED_STATE_SERIALIZERS_MODULE_PATH);
        generatedStateSerializersLoaded = true;
    } catch (error) {
        if (isMissingGeneratedStateSerializersModule(error)) {
            return;
        }

        throw error;
    }
}

export function getStateDeltaSerializer(gameObject: GameObjectBase): StateDeltaSerializer {
    ensureStateSerializersRegistered();

    const constructor = gameObject.constructor as unknown as SerializerConstructor;
    const cachedSerializer = stateDeltaSerializerCache.get(constructor);
    if (cachedSerializer) {
        return cachedSerializer;
    }

    const serializer = stateDeltaSerializerRegistry.get(constructor.name);
    if (!serializer) {
        throw new Error(`No generated delta serializer found for ${gameObject.constructor.name}`);
    }

    stateDeltaSerializerCache.set(constructor, serializer);
    return serializer;
}

export function serializeStateValue<T>(value: T): T {
    return structuredClone(value);
}

export function deserializeStateValue<T>(value: T): T {
    return structuredClone(value);
}

export function serializeStateRef(value: unknown): string | null | undefined {
    return (value as IGameObjectRefLike | null | undefined)?.getObjectId() ?? null;
}

export function deserializeStateRef<T>(game: Game, value: string | null | undefined): T | null | undefined {
    return value == null ? value as T | null | undefined : game.getFromUuidUnsafe(value as GameObjectId) as T;
}

export function serializeStateRefArray(values: unknown): string[] | null | undefined {
    return (values as readonly IGameObjectRefLike[] | IGameObjectRefLike[] | null | undefined)?.map((value) => value.getObjectId()) ?? null;
}

export function deserializeStateRefArray<T>(game: Game, values: readonly string[] | string[] | null | undefined): T[] | null | undefined {
    return values?.map((value) => game.getFromUuidUnsafe(value as GameObjectId) as T) ?? null;
}

export function serializeStateRefMap(values: unknown): Map<string, string> | null | undefined {
    const refMap = values as Map<string, IGameObjectRefLike> | null | undefined;
    if (refMap == null) {
        return refMap as unknown as Map<string, string> | null | undefined;
    }

    const serializedValues = new Map<string, string>();
    for (const [key, value] of refMap) {
        serializedValues.set(key, value.getObjectId());
    }

    return serializedValues;
}

export function deserializeStateRefMap<T>(game: Game, values: Map<string, string> | null | undefined): Map<string, T> | null | undefined {
    if (values == null) {
        return values as Map<string, T> | null | undefined;
    }

    const hydratedValues = new Map<string, T>();
    for (const [key, value] of values) {
        hydratedValues.set(key, game.getFromUuidUnsafe(value as GameObjectId) as T);
    }

    return hydratedValues;
}

export function serializeStateRefSet(values: unknown): Set<string> | null | undefined {
    const refSet = values as Set<IGameObjectRefLike> | null | undefined;
    if (refSet == null) {
        return refSet as unknown as Set<string> | null | undefined;
    }

    const serializedValues = new Set<string>();
    for (const value of refSet) {
        serializedValues.add(value.getObjectId());
    }

    return serializedValues;
}

export function deserializeStateRefSet<T>(game: Game, values: Set<string> | null | undefined): Set<T> | null | undefined {
    if (values == null) {
        return values as Set<T> | null | undefined;
    }

    const hydratedValues = new Set<T>();
    for (const value of values) {
        hydratedValues.add(game.getFromUuidUnsafe(value as GameObjectId) as T);
    }

    return hydratedValues;
}

export function serializeStateRefRecord(values: unknown): Record<string, string> | null | undefined {
    const refRecord = values as Record<string, IGameObjectRefLike> | null | undefined;
    if (refRecord == null) {
        return refRecord as unknown as Record<string, string> | null | undefined;
    }

    const serializedValues: Record<string, string> = {};
    for (const key of Object.keys(refRecord)) {
        serializedValues[key] = refRecord[key].getObjectId();
    }

    return serializedValues;
}

export function deserializeStateRefRecord<T>(game: Game, values: Record<string, string> | null | undefined): Record<string, T> | null | undefined {
    if (values == null) {
        return values as Record<string, T> | null | undefined;
    }

    const hydratedValues: Record<string, T> = {};
    for (const key of Object.keys(values)) {
        hydratedValues[key] = game.getFromUuidUnsafe(values[key] as GameObjectId) as T;
    }

    return hydratedValues;
}

function isMissingGeneratedStateSerializersModule(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const nodeError = error as Error & { code?: string };
    return nodeError.code === 'MODULE_NOT_FOUND' && nodeError.message.includes(GENERATED_STATE_SERIALIZERS_MODULE_PATH);
}

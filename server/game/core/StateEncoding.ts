import type { Game } from './Game';
import type { GameObjectBase, IGameObjectBase } from './GameObjectBase';
import type { GameObjectId } from './GameObjectUtils';

/**
 * Encode/decode primitives for the codegen state serializers (Plan 3, `docs/plans/03-codegen-serializers.md`).
 *
 * This is a distinct, engine-tier module from `server/game/core/stateSerialization/` (the save-file tier).
 * Both use the `$set` tag spelling for a tagged array, but this tier deliberately never sorts members -
 * `P3-PA2`'s restore-leg parity comparison needs iteration order preserved, while the save-file tier's
 * `encodeTaggedSet` sorts for document diff-stability. Do not "fix" one to match the other.
 *
 * Nothing in the live engine imports this module yet; it exists so `P3-PA1`'s generated serializers have
 * somewhere to import from without creating the CommonJS load-order cycle described in the plan's §3.1.
 *
 * `STATE_RECORD_FORMAT_VERSION` must be bumped in the same commit as any change to encoder/decoder
 * *behavior* - a new tag, a changed tagged shape, or a widened/narrowed accepted domain - because Plan 6
 * gates save compatibility on the schema-surface hash, which is the only other thing that would move.
 *
 * Two encoded values are deliberately not JSON-safe in memory and are Plan 6 (file-tier) deferrals rather
 * than defects here: a `primitive` field may hold a non-finite number (`@statePrimitive` has no assert
 * anywhere, so this is representable today), and an object property inside a `value` payload may hold
 * `undefined` (it survives unchanged; only an `undefined` *array element* throws, since
 * `JSON.stringify` would otherwise silently turn it into `null`). `$num` is reserved in the tag
 * vocabulary for Plan 6's file writer to apply to the former; both are called out at their throw sites
 * below.
 */
export const STATE_RECORD_FORMAT_VERSION = 1;

export const STATE_ENCODING_TAGS = ['$map', '$set', '$num'] as const;

const RESERVED_TAG_SET = new Set<string>(STATE_ENCODING_TAGS);

export type SerializedStateRecord = Record<string, unknown>;

/** Field type used for every generated `ISerialized<Class>`'s `primitive`-kind members. */
export type SerializedPrimitive = string | number | boolean | null | undefined;

export interface IStateSerializer<T extends IGameObjectBase = IGameObjectBase> {
    serialize(instance: T): SerializedStateRecord;
    deserialize(game: Game, instance: T, record: SerializedStateRecord): void;
}

/**
 * One registry entry as emitted by the generated artifact and consumed by `StateSerializers.ts`.
 * `decorator` and `isAbstract` let a later plan (Plan 5) recover concreteness (e.g. filter to the
 * non-abstract or `@registerState`-only subsets) without re-running ts-morph or importing the target
 * class. Neither field is a schema-surface-hash input - flipping a class abstract or changing its
 * decorator changes nothing about how its values encode.
 */
export interface IGeneratedSerializerEntry<T extends IGameObjectBase = IGameObjectBase> {
    className: string;
    decorator: 'registerState' | 'registerStateBase';
    isAbstract: boolean;
    serializer: IStateSerializer<T>;
}

interface ITaggedMap {
    $map: [string, unknown][];
}

interface ITaggedSet {
    $set: unknown[];
}

function isGameObjectBaseInstance(value: object): value is GameObjectBase {
    return typeof (value as { getObjectId?: unknown }).getObjectId === 'function';
}

function describeInvalidValue(value: unknown): string {
    if (typeof value === 'function') {
        return 'a function';
    }
    if (typeof value === 'symbol') {
        return 'a symbol';
    }
    if (typeof value === 'bigint') {
        return 'a bigint';
    }
    if (typeof value === 'number') {
        return `a non-finite number (${String(value)})`;
    }
    const prototypeName = (Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null)?.constructor?.name;
    return `an instance of ${prototypeName ?? 'an unknown, non-plain type'}`;
}

/**
 * Encodes a `@stateValue` payload into a JSON-safe form. Domain is `assertJsonSafeStateValue`'s domain
 * (see `GameObjectUtils.ts`) minus four deliberate narrowings, three of which throw rather than silently
 * degrading: a plain object carrying a reserved tag (`$map`/`$set`/`$num`) as an own key, an `undefined`
 * array element, and a non-finite number. The non-finite rule exists because `deserializeStateValue`
 * assigns through the field's public accessor, which re-runs the dev-mode assert in `Helpers.isDevelopment()`
 * - an encoder that let a non-finite number through would emit a record whose own deserializer throws.
 *
 * The fourth narrowing does not throw and is easy to miss: shared substructure is not preserved. Unlike
 * `v8.serialize`/`v8.deserialize` (AC4's reference semantics), this encoder walks each value with a
 * path-scoped `ancestors` set (added before recursing into a container, deleted after), which only
 * detects a cycle - it does not deduplicate a DAG. Two properties that reference the *same* object today
 * (`{ a: x, b: x }`) decode into two independent copies (`decoded.a !== decoded.b`), and the same is true
 * across two different `@stateValue` fields (each field is encoded with its own fresh `ancestors` set, so
 * even `v8.serialize`'s whole-state-bag identity preservation across objects is not reproduced once the
 * codegen path is wired in). This is a deliberate scope decision, not an oversight: adding a `$ref`
 * back-reference would be a record-format change (new tag, `STATE_RECORD_FORMAT_VERSION` bump), which
 * this unit's scope fence does not authorize. Audited against the twelve live `@stateValue` payloads as
 * of P3-PA1 (see ANVIL-LOG.md's `P3-PA1` entry) - none rely on shared-substructure identity being
 * preserved across a round trip. Re-audit before Plan 6 ships if the live `@stateValue` set has grown.
 */
export function encodeStateValue(propertyName: string, value: unknown, ancestors: Set<object> = new Set<object>()): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    const valueType = typeof value;
    if (valueType === 'string' || valueType === 'boolean') {
        return value;
    }

    if (valueType === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error(`State value "${propertyName}" cannot be encoded: contains ${describeInvalidValue(value)}. The value encoder requires finite numbers.`);
        }
        return value;
    }

    if (valueType !== 'object') {
        throw new Error(`State value "${propertyName}" cannot be encoded: contains ${describeInvalidValue(value)}.`);
    }

    if (isGameObjectBaseInstance(value as object)) {
        const constructorName = (value as { constructor?: { name?: string } }).constructor?.name ?? 'unknown';
        throw new Error(`State value "${propertyName}" cannot be encoded: contains a GameObjectBase instance (${constructorName}). Use a ref-kind field instead.`);
    }

    if (ancestors.has(value as object)) {
        throw new Error(`State value "${propertyName}" cannot be encoded: contains a circular reference.`);
    }

    if (Array.isArray(value)) {
        ancestors.add(value as object);
        const out = new Array<unknown>(value.length);
        for (let i = 0; i < value.length; i++) {
            if (value[i] === undefined) {
                throw new Error(`State value "${propertyName}[${i}]" cannot be encoded: array elements may not be undefined (JSON.stringify would silently turn it into null).`);
            }
            out[i] = encodeStateValue(`${propertyName}[${i}]`, value[i], ancestors);
        }
        ancestors.delete(value as object);
        return out;
    }

    if (value instanceof Map) {
        ancestors.add(value as object);
        const entries: [string, unknown][] = [];
        for (const [key, entryValue] of value) {
            if (typeof key !== 'string') {
                throw new Error(`State value "${propertyName}" cannot be encoded: contains a Map with a non-string key (typeof "${typeof key}").`);
            }
            if (entryValue === undefined) {
                throw new Error(`State value "${propertyName}" (Map value for key "${key}") cannot be encoded: Map values may not be undefined (JSON.stringify would silently turn it into null).`);
            }
            entries.push([key, encodeStateValue(`${propertyName} (Map value for key "${key}")`, entryValue, ancestors)]);
        }
        ancestors.delete(value as object);
        return { $map: entries } satisfies ITaggedMap;
    }

    if (value instanceof Set) {
        ancestors.add(value as object);
        const members: unknown[] = [];
        for (const entryValue of value) {
            if (entryValue === undefined) {
                throw new Error(`State value "${propertyName}" (Set member) cannot be encoded: Set members may not be undefined (JSON.stringify would silently turn it into null).`);
            }
            members.push(encodeStateValue(`${propertyName} (Set member)`, entryValue, ancestors));
        }
        ancestors.delete(value as object);
        return { $set: members } satisfies ITaggedSet;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        throw new Error(`State value "${propertyName}" cannot be encoded: contains ${describeInvalidValue(value)}.`);
    }

    for (const reservedKey of RESERVED_TAG_SET) {
        if (Object.prototype.hasOwnProperty.call(value, reservedKey)) {
            throw new Error(`State value "${propertyName}" cannot be encoded: plain object carries reserved key "${reservedKey}" as its own property, which would be indistinguishable from a tagged value on decode.`);
        }
    }

    ancestors.add(value as object);
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
        out[key] = encodeStateValue(`${propertyName}.${key}`, (value as Record<string, unknown>)[key], ancestors);
    }
    ancestors.delete(value as object);
    return out;
}

/** Inverse of {@link encodeStateValue}. Always produces fresh containers; never aliases part of `record`. */
export function decodeStateValue(record: unknown): unknown {
    if (record === null || record === undefined) {
        return record;
    }

    const recordType = typeof record;
    if (recordType !== 'object') {
        return record;
    }

    if (Array.isArray(record)) {
        return record.map((entry) => decodeStateValue(entry));
    }

    const ownKeys = Object.keys(record as Record<string, unknown>);
    const reservedKeysPresent = ownKeys.filter((key) => RESERVED_TAG_SET.has(key));

    if (reservedKeysPresent.length > 0) {
        if (ownKeys.length !== 1) {
            throw new Error(`Cannot decode state record: a tagged object must have exactly one own key, found [${ownKeys.join(', ')}].`);
        }
        const tag = reservedKeysPresent[0];

        if (tag === '$map') {
            const entries = (record as ITaggedMap).$map;
            if (!Array.isArray(entries)) {
                throw new Error(`Cannot decode state record: "$map" must be an array of [string, unknown] pairs, got ${typeof entries}.`);
            }
            const out = new Map<string, unknown>();
            for (const entry of entries) {
                if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string') {
                    throw new Error(`Cannot decode state record: "$map" entry is not a two-element [string, unknown] pair: ${JSON.stringify(entry)}.`);
                }
                const [key, entryValue] = entry;
                out.set(key, decodeStateValue(entryValue));
            }
            return out;
        }

        if (tag === '$set') {
            const members = (record as ITaggedSet).$set;
            if (!Array.isArray(members)) {
                throw new Error(`Cannot decode state record: "$set" must be an array, got ${typeof members}.`);
            }
            const out = new Set<unknown>();
            for (const member of members) {
                out.add(decodeStateValue(member));
            }
            return out;
        }

        // Every other reserved tag (e.g. "$num") is reserved-but-undecodable today: it must throw rather
        // than silently falling through to the plain-object branch below, which would make a reserved,
        // possibly-tampered tag indistinguishable from an ordinary field named "$num".
        throw new Error(`Cannot decode state record: reserved tag "${tag}" has no decode branch.`);
    }

    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record as Record<string, unknown>)) {
        out[key] = decodeStateValue((record as Record<string, unknown>)[key]);
    }
    return out;
}

/**
 * `ref`-kind encode/decode. Reads `value.uuid` directly and never calls `getObjectId()` - this is what
 * keeps generated serialization side-effect-free (AC2): `getObjectId()` latches `_hasRef`, and
 * `GameStateManager.buildGameStateForSnapshot` relies on that latch already being settled by
 * `removeUnusedGameObjects()` *before* serialization runs.
 */
export function encodeRef(value: IGameObjectBase | null | undefined): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    return (value as unknown as { uuid: string }).uuid;
}

export function decodeRef<T extends IGameObjectBase>(game: Game, id: string | null | undefined): T | null {
    if (id === null || id === undefined) {
        return null;
    }
    return game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId) as unknown as T;
}

export function encodeRefArray(values: readonly IGameObjectBase[] | null | undefined): string[] | null {
    if (values === null || values === undefined) {
        return null;
    }
    const out = new Array<string>(values.length);
    for (let i = 0; i < values.length; i++) {
        out[i] = (values[i] as unknown as { uuid: string }).uuid;
    }
    return out;
}

export function decodeRefArray<T extends IGameObjectBase>(game: Game, ids: readonly string[] | null | undefined): T[] | null {
    if (ids === null || ids === undefined) {
        return null;
    }
    return ids.map((id) => decodeRef<T>(game, id)) as T[];
}

export function encodeRefMap(values: ReadonlyMap<string, IGameObjectBase> | null | undefined): ITaggedMap | null {
    if (values === null || values === undefined) {
        return null;
    }
    const entries: [string, unknown][] = [];
    for (const [key, value] of values) {
        entries.push([key, (value as unknown as { uuid: string }).uuid]);
    }
    return { $map: entries };
}

export function decodeRefMap<T extends IGameObjectBase>(game: Game, record: ITaggedMap | null | undefined): Map<string, T> | null {
    if (record === null || record === undefined) {
        return null;
    }
    const out = new Map<string, T>();
    for (const [key, id] of record.$map) {
        out.set(key, decodeRef<T>(game, id as string));
    }
    return out;
}

export function encodeRefSet(values: ReadonlySet<IGameObjectBase> | null | undefined): ITaggedSet | null {
    if (values === null || values === undefined) {
        return null;
    }
    const members: unknown[] = [];
    for (const value of values) {
        members.push((value as unknown as { uuid: string }).uuid);
    }
    return { $set: members };
}

export function decodeRefSet<T extends IGameObjectBase>(game: Game, record: ITaggedSet | null | undefined): Set<T> | null {
    if (record === null || record === undefined) {
        return null;
    }
    const out = new Set<T>();
    for (const id of record.$set) {
        out.add(decodeRef<T>(game, id as string));
    }
    return out;
}

export function encodeRefRecord(values: Readonly<Record<string, IGameObjectBase>> | null | undefined): Record<string, string> | null {
    if (values === null || values === undefined) {
        return null;
    }
    const out: Record<string, string> = {};
    for (const key of Object.keys(values)) {
        out[key] = (values[key] as unknown as { uuid: string }).uuid;
    }
    return out;
}

export function decodeRefRecord<T extends IGameObjectBase>(game: Game, record: Record<string, string> | null | undefined): Record<string, T> | null {
    if (record === null || record === undefined) {
        return null;
    }
    const out: Record<string, T> = {};
    for (const key of Object.keys(record)) {
        out[key] = decodeRef<T>(game, record[key]);
    }
    return out;
}

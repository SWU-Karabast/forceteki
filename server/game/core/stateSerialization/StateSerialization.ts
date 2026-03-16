import type { GameObjectBase, IGameObjectBaseState } from '../GameObjectBase';
import type { GameObjectId } from '../GameObjectUtils';
import * as Contract from '../utils/Contract';
import { createIdArray, createIdMap, createIdRecord, createIdSet, registerStateClassMarker } from '../GameObjectUtils';
import { generatedStateClassEntries } from './GeneratedStateSerializers';
import type { GeneratedCopyMode, GeneratedStateClassEntry, GeneratedStateFieldDescriptor } from './StateSerializationTypes';

const generatedStateClassEntryMap = new Map<string, GeneratedStateClassEntry>(
    generatedStateClassEntries.map((entry) => [entry.className, entry])
);

interface ResolvedClassEntryChain {
    copyMode: GeneratedCopyMode;
    entries: GeneratedStateClassEntry[];
}

export function getCurrentGameObjectState(instance: GameObjectBase): IGameObjectBaseState {
    const resolvedEntries = resolveStateClassEntryChain(instance);
    return getCurrentGameObjectStateWithResolvedEntries(instance, resolvedEntries);
}

export function serializeGameObjectStateForSnapshot(instance: GameObjectBase): IGameObjectBaseState {
    const resolvedEntries = resolveStateClassEntryChain(instance);

    if (resolvedEntries.copyMode === 'Runtime') {
        return structuredClone(getCurrentGameObjectStateWithResolvedEntries(instance, resolvedEntries));
    }

    return getCurrentGameObjectStateWithResolvedEntries(instance, resolvedEntries);
}

function getCurrentGameObjectStateWithResolvedEntries(instance: GameObjectBase, resolvedEntries: ResolvedClassEntryChain): IGameObjectBaseState {
    if (resolvedEntries.copyMode === 'Runtime') {
        return (instance as unknown as { state: IGameObjectBaseState }).state;
    }

    return serializeResolvedFieldState(instance, resolvedEntries);
}

function serializeResolvedFieldState(instance: GameObjectBase, resolvedEntries: ResolvedClassEntryChain): IGameObjectBaseState {
    const snapshotState: Record<string, unknown> = {};

    for (const entry of resolvedEntries.entries) {
        for (const field of entry.fields) {
            snapshotState[field.name] = serializeFieldValue(instance, field);
        }
    }

    return snapshotState as unknown as IGameObjectBaseState;
}

export function hydrateGameObjectStateFromSnapshot(instance: GameObjectBase, snapshotState: IGameObjectBaseState): void {
    const resolvedEntries = resolveStateClassEntryChain(instance);

    if (resolvedEntries.copyMode === 'Runtime') {
        return;
    }

    for (const entry of resolvedEntries.entries) {
        for (const field of entry.fields) {
            (instance as unknown as Record<string, unknown>)[field.name] = deserializeFieldValue(instance, field, snapshotState[field.name]);
        }
    }
}

function resolveStateClassEntryChain(instance: GameObjectBase): ResolvedClassEntryChain {
    const entries: GeneratedStateClassEntry[] = [];
    const seenNames = new Set<string>();
    let copyMode: GeneratedCopyMode = 'CompileTime';

    let currentPrototype = Object.getPrototypeOf(instance);
    while (currentPrototype && currentPrototype !== Object.prototype) {
        const ctor = currentPrototype.constructor as { name?: string };
        const className = ctor?.name;

        if (className) {
            const entry = generatedStateClassEntryMap.get(className);
            if (entry && !seenNames.has(className)) {
                entries.unshift(entry);
                seenNames.add(className);
                if (entry.copyMode === 'Runtime') {
                    copyMode = 'Runtime';
                }
            }
        }

        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    if (entries.length === 0) {
        const ctor = instance.constructor as { name: string; [registerStateClassMarker]?: boolean };
        Contract.assertFalse(
            ctor[registerStateClassMarker] === true,
            `Class "${ctor.name}" is registered for state tracking but missing generated serializer coverage. Run npm run generate-state-serializers.`
        );
    }

    return { copyMode, entries };
}

function serializeFieldValue(instance: GameObjectBase, field: GeneratedStateFieldDescriptor): unknown {
    const value = (instance as unknown as Record<string, unknown>)[field.name];

    switch (field.kind) {
        case 'primitive':
        case 'value':
            return value;
        case 'ref':
            return (value as { getObjectId?: () => GameObjectId<GameObjectBase> } | null | undefined)?.getObjectId?.() ?? value;
        case 'refArray':
            return createIdArray(value as GameObjectBase[] | readonly GameObjectBase[] | null | undefined);
        case 'refMap':
            return createIdMap(value as Map<string, GameObjectBase> | null | undefined);
        case 'refSet':
            return createIdSet(value as Set<GameObjectBase> | null | undefined);
        case 'refRecord':
            return createIdRecord(value as Record<string, GameObjectBase> | null | undefined);
        default:
            Contract.fail(`Unsupported generated state field kind: ${(field as { kind: string }).kind}`);
    }
}

function deserializeFieldValue(instance: GameObjectBase, field: GeneratedStateFieldDescriptor, rawValue: unknown): unknown {
    switch (field.kind) {
        case 'primitive':
        case 'value':
            return rawValue;
        case 'ref':
            return rawValue == null ? rawValue : instance.game.getFromUuidUnsafe(rawValue as GameObjectId<GameObjectBase>);
        case 'refArray':
            return rawValue == null ? rawValue : Array.from(rawValue as readonly GameObjectId<GameObjectBase>[], (id) => instance.game.getFromUuidUnsafe(id));
        case 'refMap':
            return rawValue == null ? rawValue : new Map(Array.from(rawValue as Map<string, GameObjectId<GameObjectBase>>, ([key, id]) => [key, instance.game.getFromUuidUnsafe(id)]));
        case 'refSet':
            return rawValue == null ? rawValue : new Set(Array.from(rawValue as Set<GameObjectId<GameObjectBase>>, (id) => instance.game.getFromUuidUnsafe(id)));
        case 'refRecord': {
            if (rawValue == null) {
                return rawValue;
            }

            const hydratedRecord: Record<string, GameObjectBase> = {};
            for (const [key, id] of Object.entries(rawValue as Record<string, GameObjectId<GameObjectBase>>)) {
                hydratedRecord[key] = instance.game.getFromUuidUnsafe(id);
            }

            return hydratedRecord;
        }
        default:
            Contract.fail(`Unsupported generated state field kind: ${(field as { kind: string }).kind}`);
    }
}
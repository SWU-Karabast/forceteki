import v8 from 'node:v8';

import type { GameObjectBase, IGameObjectBase } from '../../server/game/core/GameObjectBase';
import type { GameObjectId } from '../../server/game/core/GameObjectUtils';
import { GameStateManager } from '../../server/game/core/snapshot/GameStateManager';
import { getStateSerializerFor } from '../../server/game/core/StateSerializers';
import { STATE_ENCODING_TAGS } from '../../server/game/core/StateEncoding';
import type { SerializedStateRecord } from '../../server/game/core/StateEncoding';

/**
 * Parity harness (Plan 3 Phase A step 3, `P3-PA2`) — the serialize-leg gate that proves the generated
 * per-class serializers (`P3-PA1`) agree, field-for-field, with the state-bag + v8 snapshot path that
 * remains the sole runtime authority throughout this unit. See `docs/plans/03-codegen-serializers.md`
 * and `.anvil/p3-pa2/plan.md` §4 for the full design and its bounded dispositions.
 *
 * Opt-in, zero footprint when the flag is off: `installParityHarness()` only ever runs from the
 * `ENABLE_PARITY_HARNESS === 'true'` guard below. This file must never construct a `Game`/`GameObjectBase`
 * or otherwise trigger `Helpers.isDevelopment()`'s first call at module-load time — doing so would make
 * this file's own load-order independence depend on load order relative to
 * `IntegrationHelper.js:33`'s `ENVIRONMENT ??=` line rather than being structurally independent of it.
 */

const RESERVED_TAGS: readonly string[] = STATE_ENCODING_TAGS;

let installed = false;
let snapshotsCompared = 0;
let recordsCompared = 0;
let originalMethod: typeof GameStateManager.prototype.buildGameStateForSnapshot | null = null;
let priorTimeout: number | null = null;

export function getParityHarnessStats(): { installed: boolean; snapshotsCompared: number; recordsCompared: number } {
    return { installed, snapshotsCompared, recordsCompared };
}

function describeForError(value: unknown): string {
    try {
        const stringified = JSON.stringify(value);
        return stringified === undefined ? String(value) : stringified;
    } catch {
        return String(value);
    }
}

function fail(className: string, serializerClassName: string, uuid: string, fieldPath: string, oldValue: unknown, newValue: unknown, detail?: string): never {
    // Per plan.md §4 G3's ancestor-resolution triage procedure: a mismatch is only cleanly triageable if the
    // failure text itself carries both `instance.constructor.name` (className) and
    // `getStateSerializerFor(instance).className` (serializerClassName) — surface both whenever they diverge
    // so P3-PA3/P3-PA4 (which reuse this harness) can run that triage straight off the thrown message.
    const classLabel = className === serializerClassName ? `class=${className}` : `class=${className} serializerClass=${serializerClassName}`;
    throw new Error(
        `[ParityHarness] serialize-leg mismatch: ${classLabel} uuid=${uuid} field="${fieldPath}"` +
        `${detail ? ` (${detail})` : ''} old=${describeForError(oldValue)} new=${describeForError(newValue)}`
    );
}

/** Returns the single reserved tag key (`$map`/`$set`/`$num`) on a plain-object payload, or `null` if the
 * value is not a tagged payload at all. Mirrors `decodeStateValue`'s own discriminant logic
 * (`StateEncoding.ts`) rather than inventing a parallel one. */
function getReservedTag(value: unknown): string | null {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const ownKeys = Object.keys(value as object);
    const reservedKeysPresent = ownKeys.filter((key) => RESERVED_TAGS.includes(key));
    if (reservedKeysPresent.length === 0) {
        return null;
    }
    if (ownKeys.length !== 1) {
        return null;
    }
    return reservedKeysPresent[0];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    if (value instanceof Map || value instanceof Set) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

/** Compares an old-side native `Map`/`Set` (never tagged — only the generated side tags containers)
 * against the new side's tagged payload, walking both in iteration order. Never sorts either side (AC4). */
function compareTaggedContainer(className: string, serializerClassName: string, uuid: string, fieldPath: string, oldValue: unknown, newValue: Record<string, unknown>, tag: string): void {
    if (tag === '$map') {
        if (!(oldValue instanceof Map)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'new side is $map-tagged but old side is not a Map');
        }
        const newEntries = (newValue as { $map: [string, unknown][] }).$map;
        if (!Array.isArray(newEntries)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `$map-tagged payload's "$map" property is not an array (got ${typeof newEntries})`);
        }
        const oldEntries = [...(oldValue as Map<unknown, unknown>).entries()];
        if (oldEntries.length !== newEntries.length) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `Map size differs (old=${oldEntries.length}, new=${newEntries.length})`);
        }
        for (let i = 0; i < oldEntries.length; i++) {
            const [oldKey, oldVal] = oldEntries[i];
            const [newKey, newVal] = newEntries[i];
            if (oldKey !== newKey) {
                fail(className, serializerClassName, uuid, `${fieldPath} (Map entry ${i} key, iteration order)`, oldKey, newKey, 'Map key differs at this iteration-order position; keys are never sorted before comparison');
            }
            compareValue(className, serializerClassName, uuid, `${fieldPath} (Map value for key "${String(oldKey)}")`, oldVal, newVal, false);
        }
        return;
    }

    // tag === '$set'
    if (!(oldValue instanceof Set)) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'new side is $set-tagged but old side is not a Set');
    }
    const newMembers = (newValue as { $set: unknown[] }).$set;
    if (!Array.isArray(newMembers)) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `$set-tagged payload's "$set" property is not an array (got ${typeof newMembers})`);
    }
    const oldMembers = [...(oldValue as Set<unknown>)];
    if (oldMembers.length !== newMembers.length) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `Set size differs (old=${oldMembers.length}, new=${newMembers.length})`);
    }
    for (let i = 0; i < oldMembers.length; i++) {
        compareValue(className, serializerClassName, uuid, `${fieldPath} (Set member, iteration order index ${i})`, oldMembers[i], newMembers[i], false);
    }
}

/**
 * Structural comparison of one field's old-bag value against its generated-side counterpart.
 *
 * `isTopLevel` gates the single pinned asymmetry exception (AC3): `oldValue === undefined && newValue ===
 * null` is forgiven only when comparing `oldRecord`/`newRecord`'s own top-level keys directly — never when
 * recursing into an array, plain object, Map, or Set below that level, where the same pattern is a real
 * divergence (`encodeStateValue` passes a nested `undefined` through unchanged, so old and new already
 * agree there without help; forgiving it again would only ever risk masking a genuine mismatch).
 */
function compareValue(className: string, serializerClassName: string, uuid: string, fieldPath: string, oldValue: unknown, newValue: unknown, isTopLevel: boolean): void {
    if (isTopLevel && oldValue === undefined && newValue === null) {
        return;
    }

    const tag = getReservedTag(newValue);
    if (tag) {
        if (tag === '$map' || tag === '$set') {
            compareTaggedContainer(className, serializerClassName, uuid, fieldPath, oldValue, newValue as Record<string, unknown>, tag);
            return;
        }
        // Any other reserved tag (e.g. "$num") has no comparator branch — throw naming it rather than
        // silently falling through to plain-object recursion (AC9), mirroring decodeStateValue's own
        // refusal of an undecodable reserved tag.
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `new side carries reserved tag "${tag}" with no comparator branch`);
    }

    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
        if (!Array.isArray(oldValue) || !Array.isArray(newValue)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'one side is an array and the other is not');
        }
        if (oldValue.length !== newValue.length) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `array length differs (old=${oldValue.length}, new=${newValue.length})`);
        }
        for (let i = 0; i < oldValue.length; i++) {
            compareValue(className, serializerClassName, uuid, `${fieldPath}[${i}]`, oldValue[i], newValue[i], false);
        }
        return;
    }

    if (isPlainObject(oldValue) || isPlainObject(newValue)) {
        if (!isPlainObject(oldValue) || !isPlainObject(newValue)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'one side is a plain object and the other is not');
        }
        const keys = new Set<string>([...Object.keys(oldValue), ...Object.keys(newValue)]);
        for (const key of keys) {
            compareValue(className, serializerClassName, uuid, `${fieldPath}.${key}`, oldValue[key], newValue[key], false);
        }
        return;
    }

    if (!Object.is(oldValue, newValue)) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'primitive values differ');
    }
}

/**
 * Pure: takes the manager (for `.get(uuid)`) and an already-produced snapshot buffer; performs zero
 * prototype patching and touches no module-level counters. Reads stored refs via `.uuid` only (through the
 * generated serializers' own encoders — never `getObjectId()`), which is what keeps this side-effect-free
 * (AC2). Returns the number of records compared; throws on the first mismatch it finds.
 */
export function compareSnapshotRecords(manager: GameStateManager, buffer: Buffer): number {
    const oldRecordsByUuid = v8.deserialize(buffer) as Record<string, SerializedStateRecord>;
    let compared = 0;

    for (const uuid of Object.keys(oldRecordsByUuid)) {
        const oldRecord = oldRecordsByUuid[uuid];
        const instance = manager.get<GameObjectBase>(uuid as GameObjectId<GameObjectBase>) as unknown as IGameObjectBase;
        const className = (instance as unknown as { constructor: { name: string } }).constructor.name;

        let newRecord: SerializedStateRecord;
        let serializerClassName: string;
        try {
            const entry = getStateSerializerFor(instance);
            serializerClassName = entry.className;
            newRecord = entry.serializer.serialize(instance);
        } catch (error) {
            throw new Error(`[ParityHarness] uuid=${uuid} class=${className}: failed to resolve or run the generated serializer: ${(error as Error).message}`);
        }

        const keys = new Set<string>([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
        for (const key of keys) {
            compareValue(className, serializerClassName, uuid, key, oldRecord[key], newRecord[key], true);
        }

        compared++;
    }

    return compared;
}

export function installParityHarness(): void {
    if (installed) {
        return; // idempotent — defense in depth; no committed spec is expected to need this
    }
    originalMethod = GameStateManager.prototype.buildGameStateForSnapshot;
    GameStateManager.prototype.buildGameStateForSnapshot = function(this: GameStateManager) {
        const buffer = originalMethod.call(this);
        snapshotsCompared++;
        recordsCompared += compareSnapshotRecords(this, buffer);
        return buffer;
    };
    installed = true;

    // A heavy comparison pass (every live object, every field, every snapshot) is slower than the
    // unmodified path; raise the per-spec timeout so a legitimately slow comparison is never
    // misattributed to a parity failure (confirmed no override exists in test/jasmine.json today).
    priorTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Math.max(jasmine.DEFAULT_TIMEOUT_INTERVAL, 20000);
}

export function uninstallParityHarness(): void {
    if (!installed) {
        return;
    }
    GameStateManager.prototype.buildGameStateForSnapshot = originalMethod;
    installed = false;

    // Restore the timeout too, so uninstall is a full reversion — this harness is meant to be reused by
    // P3-PA3/P3-PA4, and a half-reverting uninstall would be a trap for whoever calls it expecting a clean
    // teardown.
    if (priorTimeout !== null) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = priorTimeout;
        priorTimeout = null;
    }
}

/**
 * Evidence for AC7/§8's coverage-asymmetry record — printed unconditionally so it appears in captured
 * stdout for both `test-parity` (small; `UndoMode.Disabled` reaches the seam rarely) and `test-parity-undo`
 * (large) runs. The `pid=` tag is load-bearing.
 *
 * Uses `process.on('exit', ...)` rather than a `jasmine.getEnv().addReporter(...)` `jasmineDone` hook (the
 * shape this file originally shipped with, per the plan's §4 code sketch): jasmine-core refuses
 * `Env#addReporter` outright once `--parallel` is active ("Reporters cannot be added via Env in parallel
 * mode", `node_modules/jasmine-core/lib/jasmine-core/jasmine.js`'s `addReporter`), and both required checks
 * (`npm run test-parity`/`test-parity-undo`) run with `--parallel=4`. Verified live: the reporter form threw
 * a fatal worker error the instant this module loaded under `jasmine-parity`. `afterAll`/`beforeAll` are
 * equally out - jasmine-core restricts them to inside a `describe` block under parallel mode, even from a
 * helper file. `process.on('exit', ...)` sidesteps jasmine's parallel-mode restrictions entirely (it is
 * plain Node, not a jasmine API) and prints exactly once per worker process, with that worker's final
 * cumulative totals - a strictly simpler, equally sufficient replacement for the "sum of each pid's
 * maximum line" evidence shape: with one line per pid there is nothing to take a maximum of.
 */
if (process.env.ENABLE_PARITY_HARNESS === 'true') {
    installParityHarness();
    process.on('exit', () => {
        const stats = getParityHarnessStats();
        console.log(`[ParityHarness] pid=${process.pid} snapshotsCompared=${stats.snapshotsCompared} recordsCompared=${stats.recordsCompared}`);
    });
}

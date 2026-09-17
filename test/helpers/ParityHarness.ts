import v8 from 'node:v8';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { GameObjectBase } from '../../server/game/core/GameObjectBase';
import type { IGameObjectBase, IGameObjectBaseState } from '../../server/game/core/GameObjectBase';
import type { GameObjectId } from '../../server/game/core/GameObjectUtils';
import { copyState } from '../../server/game/core/GameObjectUtils';
import { GameStateManager } from '../../server/game/core/snapshot/GameStateManager';
import type { IGameSnapshot } from '../../server/game/core/snapshot/SnapshotInterfaces';
import { getStateSerializerFor } from '../../server/game/core/StateSerializers';
import { STATE_ENCODING_TAGS } from '../../server/game/core/StateEncoding';
import type { SerializedStateRecord } from '../../server/game/core/StateEncoding';
import { Card } from '../../server/game/core/card/Card';
import { ZoneAbstract } from '../../server/game/core/zone/ZoneAbstract';
import { SimpleZone } from '../../server/game/core/zone/SimpleZone';
import { DeckZone } from '../../server/game/core/zone/DeckZone';
import { BaseZone } from '../../server/game/core/zone/BaseZone';
import { AllArenasZone } from '../../server/game/core/zone/AllArenasZone';

/**
 * Parity harness (Plan 3 Phase A). The serialize leg (`P3-PA2`) proves the generated per-class
 * serializers (`P3-PA1`) agree, field-for-field, with the state-bag + v8 snapshot path that remains the
 * sole runtime authority throughout this unit. The restore leg (`P3-PA3`) extends this with the
 * complementary half: it proves the generated `deserialize<Class>` functions reconstruct identical live
 * state to `copyState`'s hydrator walk (compare mode), and separately drives the whole undo suite through
 * the generated path as the live restore mechanism (generated mode), before the Phase B cutover makes it
 * authoritative for real. See `docs/plans/03-codegen-serializers.md` and `.anvil/p3-pa3/plan.md` §4 for
 * the full design and its bounded dispositions.
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
let originalBuildGameStateForSnapshot: typeof GameStateManager.prototype.buildGameStateForSnapshot | null = null;
let priorTimeout: number | null = null;

// ---------------------------------------------------------------------------------------------
// Restore-leg module state (P3-PA3 §4)
// ---------------------------------------------------------------------------------------------

let originalSetState: ((this: GameObjectBase, state: IGameObjectBaseState) => void) | null = null;
let originalRollbackToSnapshot: typeof GameStateManager.prototype.rollbackToSnapshot | null = null;

/** Buffer identity -> the generated records captured for that snapshot at the moment it was taken
 * (§4.1). Released with the snapshot buffer itself since this is a WeakMap. */
const retainedGeneratedRecords = new WeakMap<Buffer, Map<string, SerializedStateRecord>>();

/** The current rollback's retained record set, saved/restored (never set/cleared) around the original
 * call so the self-re-entrant recovery path (§2, §4.4) leaves the outer frame's set intact. */
let currentRestoreRecords: Map<string, SerializedStateRecord> | null = null;

/** Depth counter for the harness's own wrapper, distinct from `GameStateManager`'s private
 * `_rollbackDepth` — the harness needs its own because it re-enters through the very same patched
 * prototype method on the nested recovery call. */
let harnessRollbackDepth = 0;

/** First error the harness itself raised during the current outermost rollback attempt, stashed before
 * it is thrown into production so the diagnostic survives production's recovery swallowing the
 * exception (§4.4). Re-thrown at harness depth 0 unless rethrow is scoped-suppressed (AC7). */
let firstHarnessError: Error | null = null;
let rethrowSuppressed = false;

/** Set by `withExpectedHarnessMismatch` (fix for `P3PA3-I1-01`/`P3PA3-I2-002`/`P3PA3-I3-1`): a second
 * suppression scope, alongside `rethrowSuppressed`, for a spec (AC2) whose own deliberately-induced
 * mismatch would otherwise (a) absorb the one-shot injection hook (§4.8) if it happens to land on that
 * spec's rollback, defeating the escape proof (AC14) by pure spec-order luck, and (b) count as a real
 * `harnessRestoreErrors`/`rollbacksFailed` against the absolute gate (`P3PA3-I1-03`'s structural fix).
 * `checkInjection` skips while this is active (mirroring `rethrowSuppressed`), and `stashFirstHarnessError`
 * / the rollback-result accounting route into the `deliberate*` counters instead of the absolute ones. */
let harnessErrorExpected = false;

let restoreModeOverride: 'compare' | 'generated' | null = null;

let moduleLoadArmed = false;
let uninstallsWhileModuleLoadArmed = 0;

let rollbacksObserved = 0;
let objectsCompared = 0;
let fieldsCompared = 0;
let rollbacksFailed = 0;
let harnessRestoreErrors = 0;

/** `P3PA3-I1-03` structural fix: errors/failures raised inside a deliberate-suppression scope
 * (`rethrowSuppressed` for AC7, `harnessErrorExpected` for AC2) are this unit's own negative-testing
 * traffic, counted here instead of in `harnessRestoreErrors`/`rollbacksFailed` so those two stay true
 * absolutes (§4.7: "`harnessRestoreErrors === 0` stays absolute in every case") for every other run. */
let deliberateHarnessErrors = 0;
let deliberateRollbackFailures = 0;
let skippedPreInstall = 0;
let zoneChecks = 0;
let zoneViolationsForward = 0;
let zoneViolationsReverse = 0;
let preRollbackViolationsForward = 0;
let preRollbackViolationsReverse = 0;
let zonesNotCovered = 0;

let injectionFired = false;

/** `P3PA3-I1-06`/`P3PA3-I3-4` fix: the forward-pass identity set from the pre-rollback calibration read
 * (§4.6), set once per outermost rollback attempt (`harnessRollbackDepth === 1`) and read — never
 * recomputed — by every post-rollback pass within that same attempt, including a nested recovery replay.
 * Replaces the former blanket `DeckZone` forward-pass exclusion: every post-rollback violation is now
 * diffed against this baseline, so only a *new* (card, zone) pair is counted or retained, and `DeckZone`
 * cards stay in the net. Cleared back to `null` when the outermost attempt finishes. */
let currentPreForwardViolationIds: Set<string> | null = null;

interface IRetainedZoneViolation {
    // `P3PA3-D-05` fix: `phase` distinguishes a pre-rollback calibration reading (a pre-existing engine
    // invariant gap, not attributable to restore) from a post-rollback reading (a genuine restore-attributed
    // finding). The two used to share one 10-slot buffer; once `P3PA3-I1-06` put `DeckZone` cards back in the
    // forward net, that buffer filled entirely with pre-rollback entries, so a real post-rollback violation
    // would be counted (`zoneViolationsForward`/`zoneViolationsReverse`) but its identity would never be
    // retained for triage.
    phase: 'pre' | 'post';
    direction: 'forward' | 'reverse';
    cardUuid: string;
    cardClass: string;
    cardInternalName: string;
    zoneUuid: string;
    zoneClass: string;
}
// Separate small buffers, each capped independently, so pre-rollback calibration noise can never crowd out
// a post-rollback (restore-attributed) violation's identity.
const retainedPreRollbackZoneViolations: IRetainedZoneViolation[] = [];
const retainedPostRollbackZoneViolations: IRetainedZoneViolation[] = [];

export interface IParityHarnessStats {
    installed: boolean;
    snapshotsCompared: number;
    recordsCompared: number;
    restoreMode: 'compare' | 'generated';
    rollbacksObserved: number;
    objectsCompared: number;
    fieldsCompared: number;
    rollbacksFailed: number;
    harnessRestoreErrors: number;
    deliberateHarnessErrors: number;
    deliberateRollbackFailures: number;
    skippedPreInstall: number;
    zoneChecks: number;
    zoneViolationsForward: number;
    zoneViolationsReverse: number;
    preRollbackViolationsForward: number;
    preRollbackViolationsReverse: number;
    zonesNotCovered: number;
    moduleLoadArmed: boolean;
    installedAtExit: boolean;
    uninstallsWhileModuleLoadArmed: number;
}

export function getParityHarnessStats(): IParityHarnessStats {
    return {
        installed,
        snapshotsCompared,
        recordsCompared,
        restoreMode: currentRestoreMode(),
        rollbacksObserved,
        objectsCompared,
        fieldsCompared,
        rollbacksFailed,
        harnessRestoreErrors,
        deliberateHarnessErrors,
        deliberateRollbackFailures,
        skippedPreInstall,
        zoneChecks,
        zoneViolationsForward,
        zoneViolationsReverse,
        preRollbackViolationsForward,
        preRollbackViolationsReverse,
        zonesNotCovered,
        moduleLoadArmed,
        installedAtExit: installed,
        uninstallsWhileModuleLoadArmed,
    };
}

export function getRetainedZoneViolations(): IRetainedZoneViolation[] {
    return [...retainedPreRollbackZoneViolations, ...retainedPostRollbackZoneViolations];
}

/** Reader for the record set retained at snapshot time for a given snapshot's `.states` buffer (§4.1).
 * Exposed so a spec (AC6) can deep-compare it against a copy taken at snapshot time to prove no retained
 * record is later aliased into live state. */
export function getRetainedGeneratedRecords(buffer: Buffer): Map<string, SerializedStateRecord> | undefined {
    return retainedGeneratedRecords.get(buffer);
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
 * prototype patching and touches no module-level counters (other than the optional `collect` out-map).
 * Reads stored refs via `.uuid` only (through the generated serializers' own encoders — never
 * `getObjectId()`), which is what keeps this side-effect-free (AC2). Returns the number of records
 * compared; throws on the first mismatch it finds.
 *
 * `collect`, when supplied (P3-PA3 §4.1), receives each uuid's generated record (the exact object the
 * generated serializer produced) as it is built — the restore leg's own record set is fed from here
 * rather than re-derived or re-serialized later, since it must be the generator's real output captured
 * at snapshot time.
 */
export function compareSnapshotRecords(manager: GameStateManager, buffer: Buffer, collect?: Map<string, SerializedStateRecord>): number {
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

        if (collect) {
            collect.set(uuid, newRecord);
        }

        const keys = new Set<string>([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
        for (const key of keys) {
            compareValue(className, serializerClassName, uuid, key, oldRecord[key], newRecord[key], true);
        }

        compared++;
    }

    return compared;
}

// ---------------------------------------------------------------------------------------------
// Restore-leg observation and comparison (§4.6)
// ---------------------------------------------------------------------------------------------

type NormalizedValue =
  | { ref: string }
  | { ctor: string; items: NormalizedValue[] }
  | { ctor: string; entries: [unknown, NormalizedValue][] }
  | { ctor: string; members: NormalizedValue[] }
  | { ctor: 'Object'; props: Record<string, NormalizedValue> }
  | string | number | boolean | null | undefined;

function normalizeLiveValue(value: unknown, ancestors: Set<unknown>): NormalizedValue {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value as NormalizedValue;
    }
    if (ancestors.has(value)) {
        throw new Error('[ParityHarness] cycle detected while normalizing a restored field for comparison');
    }
    if (typeof (value as { getObjectId?: unknown }).getObjectId === 'function') {
        // Structural GameObjectBase check: read `.uuid` only, never `getObjectId()` (mirrors the
        // serialize leg's own side-effect-free discipline, AC2's sibling concern on the restore leg).
        return { ref: (value as unknown as { uuid: string }).uuid };
    }

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(value);

    if (Array.isArray(value)) {
        return { ctor: (value as object).constructor.name, items: value.map((entry) => normalizeLiveValue(entry, nextAncestors)) };
    }
    if (value instanceof Map) {
        return { ctor: value.constructor.name, entries: [...value.entries()].map(([key, entry]) => [key, normalizeLiveValue(entry, nextAncestors)]) };
    }
    if (value instanceof Set) {
        return { ctor: value.constructor.name, members: [...value.values()].map((entry) => normalizeLiveValue(entry, nextAncestors)) };
    }
    if (isPlainObject(value)) {
        const props: Record<string, NormalizedValue> = {};
        for (const key of Object.keys(value)) {
            props[key] = normalizeLiveValue(value[key], nextAncestors);
        }
        return { ctor: 'Object', props };
    }
    // P3PA3-I1-07: the prior fallback (`{ ctor, items: [] }`) made two *different* instances of the same
    // otherwise-unhandled class compare equal under `normalizedEqual`, which is exactly the comparator hole
    // §4.6 says this gate exists to prevent. Reachability from a real observed field was unproven by
    // inspection; thrown loudly instead, per the reviewer's own falsifier ("make the branch throw and run
    // the suite; if it never fires, convert it to a throw permanently"). This run's suites did not trip it
    // (see verification evidence), so it stands as a tripwire pending a real normalizer if one is ever
    // needed for a future field shape.
    throw new Error(`[ParityHarness] normalizeLiveValue: no normalizer branch for a live value of type "${(value as object).constructor.name}" — add one rather than silently treating distinct instances as equal.`);
}

/** Reads each of `fieldNames` through `instance`'s public accessor and normalizes it, mirroring
 * `encodeStateValue`'s own shape (§4.6). */
export function observeLiveFields(instance: unknown, fieldNames: Iterable<string>): Record<string, NormalizedValue> {
    const result: Record<string, NormalizedValue> = {};
    for (const name of fieldNames) {
        result[name] = normalizeLiveValue((instance as Record<string, unknown>)[name], new Set());
    }
    return result;
}

function normalizedEqual(a: NormalizedValue, b: NormalizedValue): boolean {
    if (a === b) {
        return true;
    }
    if (a === null || a === undefined || b === null || b === undefined || typeof a !== 'object' || typeof b !== 'object') {
        return Object.is(a, b);
    }
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    if ('ref' in aObj || 'ref' in bObj) {
        return 'ref' in aObj && 'ref' in bObj && aObj.ref === bObj.ref;
    }
    if (aObj.ctor !== bObj.ctor) {
        return false;
    }
    if ('items' in aObj) {
        if (!('items' in bObj)) {
            return false;
        }
        const ai = aObj.items as NormalizedValue[];
        const bi = bObj.items as NormalizedValue[];
        return ai.length === bi.length && ai.every((value, i) => normalizedEqual(value, bi[i]));
    }
    if ('entries' in aObj) {
        if (!('entries' in bObj)) {
            return false;
        }
        const ae = aObj.entries as [unknown, NormalizedValue][];
        const be = bObj.entries as [unknown, NormalizedValue][];
        return ae.length === be.length && ae.every(([key, value], i) => Object.is(key, be[i][0]) && normalizedEqual(value, be[i][1]));
    }
    if ('members' in aObj) {
        if (!('members' in bObj)) {
            return false;
        }
        const am = aObj.members as NormalizedValue[];
        const bm = bObj.members as NormalizedValue[];
        return am.length === bm.length && am.every((value, i) => normalizedEqual(value, bm[i]));
    }
    if ('props' in aObj) {
        if (!('props' in bObj)) {
            return false;
        }
        const ap = aObj.props as Record<string, NormalizedValue>;
        const bp = bObj.props as Record<string, NormalizedValue>;
        const keys = new Set<string>([...Object.keys(ap), ...Object.keys(bp)]);
        for (const key of keys) {
            if (!normalizedEqual(ap[key], bp[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function stashFirstHarnessError(error: Error): void {
    if (firstHarnessError === null) {
        firstHarnessError = error;
    }
    // P3PA3-I1-03: route this unit's own deliberate negative-testing traffic (AC7 under
    // `withHarnessRethrowSuppressed`, AC2 under `withExpectedHarnessMismatch`) into the `deliberate*`
    // counters so `harnessRestoreErrors` stays a true absolute for every other run.
    if (rethrowSuppressed || harnessErrorExpected) {
        deliberateHarnessErrors++;
    } else {
        harnessRestoreErrors++;
    }
}

/** Read-only: the first error the harness raised during the rollback currently in flight (or the most
 * recently completed one, if rethrow was suppressed). Cleared when `withHarnessRethrowSuppressed`'s
 * scope exits, or when the depth-0 re-throw consumes it. */
export function getFirstHarnessError(): Error | null {
    return firstHarnessError;
}

function raiseRestoreMismatch(className: string, uuid: string, fieldPath: string, legacyValue: unknown, generatedValue: unknown): never {
    const error = new Error(
        `[ParityHarness] restore-leg mismatch: leg=restore class=${className} uuid=${uuid} field="${fieldPath}" ` +
        `legacy=${describeForError(legacyValue)} generated=${describeForError(generatedValue)}`
    );
    stashFirstHarnessError(error);
    throw error;
}

function compareRestoreObservations(className: string, uuid: string, legacy: Record<string, NormalizedValue>, generated: Record<string, NormalizedValue>, fieldNames: Iterable<string>): void {
    for (const field of fieldNames) {
        if (!normalizedEqual(legacy[field], generated[field])) {
            raiseRestoreMismatch(className, uuid, field, legacy[field], generated[field]);
        }
    }
}

/** `P3PA3-I2-007`: every scoped-override helper below restores its state in a synchronous `finally`, so an
 * `async fn` (or any `fn` returning a thenable) would have its scope reverted before the awaited work
 * inside it actually runs — silently mis-scoping. No current call site does this, but the file is
 * documented for reuse by `P3-PA4`, so this is a loud guard rather than a trap for a future caller. */
function assertNotThenable(result: unknown, helperName: string): void {
    if (result !== null && (typeof result === 'object' || typeof result === 'function') && typeof (result as { then?: unknown }).then === 'function') {
        throw new Error(`[ParityHarness] ${helperName}(fn) requires a synchronous fn; fn() returned a thenable, which would revert the scope before any awaited work runs.`);
    }
}

function currentRestoreMode(): 'compare' | 'generated' {
    if (restoreModeOverride) {
        return restoreModeOverride;
    }
    return process.env.PARITY_RESTORE_MODE === 'generated' ? 'generated' : 'compare';
}

/** Spec-scoped override of the process-level restore mode (§4.3), so a spec can drive real rollbacks
 * through the generated path inside an otherwise-compare-mode run. */
export function withRestoreMode<T>(mode: 'compare' | 'generated', fn: () => T): T {
    const prior = restoreModeOverride;
    restoreModeOverride = mode;
    try {
        const result = fn();
        assertNotThenable(result, 'withRestoreMode');
        return result;
    } finally {
        restoreModeOverride = prior;
    }
}

/** Scoped opt-out of the depth-0 re-throw (§4.4), for AC7's spec, whose entire point is to observe
 * `rollbackToSnapshot` returning `false`. The error is still recorded (`getFirstHarnessError()`) — only
 * the re-throw is suppressed. Clears the stash when the outermost suppression scope exits, so a harness
 * error raised (and suppressed) in one spec never leaks into the next. */
export function withHarnessRethrowSuppressed<T>(fn: () => T): T {
    const prior = rethrowSuppressed;
    rethrowSuppressed = true;
    try {
        const result = fn();
        assertNotThenable(result, 'withHarnessRethrowSuppressed');
        return result;
    } finally {
        rethrowSuppressed = prior;
        if (!prior) {
            firstHarnessError = null;
        }
    }
}

/**
 * Scoped marker (`P3PA3-I1-01`/`P3PA3-I2-002`/`P3PA3-I3-1`) for a spec (AC2) whose own rollback
 * deliberately induces a restore-leg mismatch through a mechanism *other* than the injection hook (§4.8) —
 * a directly patched `deserialize`. Two effects while active:
 *
 * 1. `checkInjection` skips (mirroring `rethrowSuppressed`), so the one-shot `PARITY_INJECT_RESTORE_MISMATCH`
 *    budget is never spent on AC2's own rollback and survives to reach a later, unsuppressed rollback where
 *    its diagnostic can actually escape and fail the run — this is what the escape proof (AC14) requires.
 * 2. `stashFirstHarnessError` and the rollback-result accounting route into `deliberateHarnessErrors` /
 *    `deliberateRollbackFailures` instead of the absolute `harnessRestoreErrors` / `rollbacksFailed`
 *    counters (`P3PA3-I1-03`), since this spec's own induced mismatch is expected traffic, not a real
 *    restore defect.
 *
 * Unlike `withHarnessRethrowSuppressed`, the depth-0 re-throw is *not* suppressed here — AC2 asserts the
 * rollback call itself throws, so the diagnostic must still reach the spec as an exception.
 */
export function withExpectedHarnessMismatch<T>(fn: () => T): T {
    const prior = harnessErrorExpected;
    harnessErrorExpected = true;
    try {
        const result = fn();
        assertNotThenable(result, 'withExpectedHarnessMismatch');
        return result;
    } finally {
        harnessErrorExpected = prior;
    }
}

// ---------------------------------------------------------------------------------------------
// Injected-mismatch hook (§4.8) — the gate's own falsifier (AC14)
// ---------------------------------------------------------------------------------------------

function parseInjectionSpec(): { className: string; field: string } | null {
    const raw = process.env.PARITY_INJECT_RESTORE_MISMATCH;
    if (!raw) {
        return null;
    }
    const dot = raw.indexOf('.');
    if (dot <= 0 || dot === raw.length - 1) {
        throw new Error(`[ParityHarness] PARITY_INJECT_RESTORE_MISMATCH must be "<ClassName>.<field>", got "${raw}"`);
    }
    return { className: raw.slice(0, dot), field: raw.slice(dot + 1) };
}

/** Corrupts a live field's value in a type-preserving way so the corrupted value is guaranteed to
 * disagree with the correct one under `normalizedEqual`. Scoped to primitive fields only — the one class
 * and field the escape-proof check targets (this unit's own `RestoreParityHarness.spec.ts`) is chosen to
 * be a `@statePrimitive`/`@stateValue` numeric/string/boolean field for exactly this reason; anything
 * else throws loudly at setup rather than risk tripping a decorator's own validation (e.g. a `@stateRef`
 * setter's type Contract) with a value that was never a legitimate live value for that field.
 *
 * `P3PA3-D-02` fix: the eligibility gate at the call site reads the *record's* value, which is a plain
 * primitive for a ref-kind field too (`encodeRef` returns a uuid `string`), so a ref-kind target can pass
 * that gate, consume the one-shot, and only then reach this function's `else` branch reading the *live*
 * accessor (an object, not a primitive). That throw is routed through `stashFirstHarnessError` — same as
 * every other harness-raised diagnostic — so an unsupported live type is a loud red failure instead of an
 * un-stashed `Error` that production's recovery swallows silently (the exact `_damage === null` shape
 * `P3PA3-I1-01` fixed, reproduced here for any field whose record-level type doesn't match its live type). */
function corruptLiveField(instance: unknown, field: string): void {
    const target = instance as Record<string, unknown>;
    const current = target[field];
    if (typeof current === 'number') {
        target[field] = current + 1;
    } else if (typeof current === 'string') {
        target[field] = current + '\x01[parity-injected]';
    } else if (typeof current === 'boolean') {
        target[field] = !current;
    } else {
        const error = new Error(`[ParityHarness] PARITY_INJECT_RESTORE_MISMATCH only supports number/string/boolean fields; field "${field}" holds ${typeof current}.`);
        stashFirstHarnessError(error);
        throw error;
    }
}

/**
 * One-shot, documented fault injection (§4.8): when `PARITY_INJECT_RESTORE_MISMATCH=<Class>.<field>` is
 * set and this is the first eligible object encountered (not already fired, not inside
 * `withHarnessRethrowSuppressed`), runs a dedicated one-field dual restore — independent of the active
 * `restoreMode` — corrupts the generated side, and throws the standard restore mismatch diagnostic if
 * they disagree (which, for the primitive fields this hook supports, they always do). Running the check
 * independently of `restoreMode` (rather than only perturbing whichever leg that mode would naturally
 * run) is what lets the same one env var prove the gate can fail in all four AC14 configurations,
 * including the two pure generated-mode runs that do not perform a compare-mode dual restore on their
 * own — a deliberate implementation choice within the plan's descriptive "compare mode: perturb the
 * generated leg's observation; generated mode: skip that field's write" text, disclosed here rather than
 * silently narrowed.
 */
function checkInjection(instance: GameObjectBase, className: string, uuid: string, record: SerializedStateRecord, dirtyBag: IGameObjectBaseState, newState: IGameObjectBaseState): void {
    if (injectionFired || rethrowSuppressed || harnessErrorExpected) {
        return;
    }
    const spec = parseInjectionSpec();
    if (!spec || spec.className !== className || !(spec.field in record)) {
        return;
    }
    // Reliability fix, found by running the escape proof 5x/configuration rather than trusting a single
    // green sample (this is very likely the root cause of the implementer's originally-disclosed "roughly
    // 1 run in 4-5" flakiness, not merely spec-order absorption by AC2): a field can be a supported
    // primitive on *some* instances of `className` and unsupported on others of the very same class - e.g.
    // `NonLeaderUnitCard._damage` is `number` for a card in play but `null` (damage-tracking disabled,
    // `Damage.ts`'s `assertPropertyEnabledForZone` pattern) for the same class sitting in a deck or hand.
    // The one-shot budget must not be spent on the first *matching-class* object if that particular
    // instance's field value isn't one `corruptLiveField` can actually corrupt - doing so wastes the shot
    // on a setup-time throw instead of ever producing the intended mismatch diagnostic, silently
    // undermining AC14 exactly as the original disclosure described. Checked against the *record's* value
    // (the authoritative recorded type for this field on this instance) before touching any live state or
    // consuming the shot, so an ineligible instance is skipped and a later, eligible instance still gets
    // the injection.
    const recordedValue = record[spec.field];
    if (typeof recordedValue !== 'number' && typeof recordedValue !== 'string' && typeof recordedValue !== 'boolean') {
        return;
    }
    injectionFired = true;

    const self = instance as unknown as { state: IGameObjectBaseState };

    const isolatedBag = { ...dirtyBag };
    self.state = isolatedBag;
    let generatedValue: NormalizedValue;
    try {
        getStateSerializerFor(instance).serializer.deserialize(instance.game, instance, record);
        corruptLiveField(instance, spec.field);
        generatedValue = observeLiveFields(instance, [spec.field])[spec.field];
    } finally {
        // P3PA3-I1-04's fix, applied consistently here: never leave `state` pointing at the isolated
        // (possibly partially-mutated) copy if the injection setup itself throws.
        self.state = dirtyBag;
    }

    self.state = newState;
    copyState(instance, newState);
    const legacyValue = observeLiveFields(instance, [spec.field])[spec.field];

    if (!normalizedEqual(legacyValue, generatedValue)) {
        raiseRestoreMismatch(className, uuid, spec.field, legacyValue, generatedValue);
    }
    // Unreachable for the primitive types corruptLiveField supports — left here defensively so a future
    // supported type that happened to collide is still handled sanely: state is left at `newState` with
    // copyState already applied (a valid legacy restore), so the normal per-mode restore that follows
    // simply re-runs copyState/deserialize on top of it, which is safe since both are idempotent and
    // start-state independent (plan.md §2).
}

// ---------------------------------------------------------------------------------------------
// The per-object comparison seam (§4.2, §4.3)
// ---------------------------------------------------------------------------------------------

function setStateImpl(instance: GameObjectBase, newState: IGameObjectBaseState): void {
    const self = instance as unknown as { state: IGameObjectBaseState; afterSetState(oldState: IGameObjectBaseState): void; constructor: { name: string } };
    const dirtyBag = self.state;
    const uuid = instance.uuid;
    const className = self.constructor.name;

    if (currentRestoreRecords === null) {
        // No retained record set for this rollback. The wrapper (patchedRollbackToSnapshot) already turns
        // this into a loud failure when the harness was armed at module load (R3), so reaching here
        // always means a legitimate pre-install snapshot (R4): the harness was installed by a spec after
        // this snapshot was taken, so it never had a chance to retain records for it.
        skippedPreInstall++;
        originalSetState.call(instance, newState);
        return;
    }

    const record = currentRestoreRecords.get(uuid);
    if (!record) {
        const error = new Error(`[ParityHarness] missing retained generated record for uuid=${uuid} class=${className} during restore; every live object being restored must have a record when the harness is armed.`);
        stashFirstHarnessError(error);
        throw error;
    }

    checkInjection(instance, className, uuid, record, dirtyBag, newState);

    objectsCompared++;

    if (currentRestoreMode() === 'generated') {
        // P3PA3-I3-3 disclosure: `self.state` is installed wholesale *before* `deserialize` runs, so a
        // `@statePrimitive`/`@stateValue` accessor (which reads `this.state[name]` directly) returns the
        // correct value whether or not the generated deserializer actually wrote that field. This mode
        // therefore validates ref-kind restore end-to-end but is blind to a dropped primitive/value field —
        // that gap is covered by compare mode (AC2), where the isolated shallow copy leaves the dirty value
        // in place and a drop shows up as a real mismatch. Owed to `P3-PB2` explicitly (plan.md §4.3/§9).
        self.state = newState;
        try {
            getStateSerializerFor(instance).serializer.deserialize(instance.game, instance, record);
        } catch (error) {
            const wrapped = new Error(`[ParityHarness] generated deserializer threw for uuid=${uuid} class=${className}: ${(error as Error).message}`);
            stashFirstHarnessError(wrapped);
            throw wrapped;
        }
        self.afterSetState(dirtyBag);
        return;
    }

    // Compare mode (§4.2): the generated leg runs first, isolated, from the dirty starting state; the
    // legacy leg then runs production's own `copyState`, which is also the live outcome of this call.
    const fieldNames = new Set<string>([...Object.keys(newState as unknown as Record<string, unknown>), ...Object.keys(record)]);

    const isolatedBag = { ...dirtyBag };
    self.state = isolatedBag;
    let generatedObserved: Record<string, NormalizedValue>;
    try {
        try {
            getStateSerializerFor(instance).serializer.deserialize(instance.game, instance, record);
        } catch (error) {
            const wrapped = new Error(`[ParityHarness] generated deserializer threw for uuid=${uuid} class=${className}: ${(error as Error).message}`);
            stashFirstHarnessError(wrapped);
            throw wrapped;
        }
        generatedObserved = observeLiveFields(instance, fieldNames);
    } finally {
        // P3PA3-I1-04: restore the dirty bag even when the generated leg (or observation) throws, so
        // production's own recovery `setState`/`afterSetState` is never handed a partially-mutated shallow
        // copy as `oldState` — the exact silent divergence §4.2's isolation design exists to prevent.
        self.state = dirtyBag;
    }

    self.state = newState;
    copyState(instance, newState);
    const legacyObserved = observeLiveFields(instance, fieldNames);

    compareRestoreObservations(className, uuid, legacyObserved, generatedObserved, fieldNames);
    fieldsCompared += fieldNames.size;

    self.afterSetState(dirtyBag);
}

// ---------------------------------------------------------------------------------------------
// Zone-membership observation (§4.6)
// ---------------------------------------------------------------------------------------------

function recordZoneViolation(phase: 'pre' | 'post', direction: 'forward' | 'reverse', card: Card, zoneUuid: string, zoneClass: string): void {
    const buffer = phase === 'pre' ? retainedPreRollbackZoneViolations : retainedPostRollbackZoneViolations;
    if (buffer.length < 10) {
        buffer.push({
            phase,
            direction,
            cardUuid: card.uuid,
            // P3PA3-I3-6: `Card` already exposes both as public members; no cast needed.
            cardClass: card.constructor.name,
            cardInternalName: card.internalName,
            zoneUuid,
            zoneClass,
        });
    }
}

/** One forward-pass violation: a card whose `.zone` is non-null but that zone's own `cards` does not
 * include it. Identity-keyed (`P3PA3-I1-06`/`P3PA3-I3-4`) by `cardUuid::zoneUuid` so the wrapper can diff a
 * post-rollback read against a pre-rollback baseline and report only *new* violations, rather than
 * excluding an entire zone class from the net. */
function computeForwardViolations(allObjects: readonly GameObjectBase[]): Map<string, { card: Card; zoneUuid: string; zoneClass: string }> {
    const violations = new Map<string, { card: Card; zoneUuid: string; zoneClass: string }>();
    for (const obj of allObjects) {
        if (obj instanceof Card) {
            const zone = obj.zone;
            if (zone && !(zone.cards as unknown as Card[]).includes(obj)) {
                const zoneUuid = (zone as unknown as { uuid: string }).uuid;
                const zoneClass = (zone as unknown as { constructor: { name: string } }).constructor.name;
                violations.set(`${obj.uuid}::${zoneUuid}`, { card: obj, zoneUuid, zoneClass });
            }
        }
    }
    return violations;
}

/** Runs both zone-membership passes (§4.6) over the live object list.
 *
 * Forward: every card with a non-null zone appears in that zone's own `cards`, computed by
 * `computeForwardViolations` and reported relative to `baselineForwardViolationIds` (`P3PA3-I1-06`/
 * `P3PA3-I3-4`'s fix): pass `null` for a raw, unfiltered read (the pre-rollback calibration pass); pass the
 * pre-rollback pass's own `forwardViolationIds` for a post-rollback read, so only a violation that is *new*
 * relative to that baseline is counted or retained. This replaces the former blanket `DeckZone` forward
 * exclusion — main's pre-existing `underworld-thug`-shaped bookkeeping gap (`SimpleZone`/`DeckZone`'s
 * `addCard`/`removeCard` never touch `card.zone`) still shows up in the *raw* pre-rollback count (disclosed
 * there, unchanged), but `DeckZone` cards now stay in the net for detecting an actual restore-introduced
 * regression, and a genuine Phase-B cutover defect that mis-links a card to the wrong deck is no longer
 * silently excluded.
 *
 * Reverse: every card in a state-backed zone's own raw card storage has `card.zone === thatZone` — reading
 * raw backing fields, never the public `cards` getter, and excluding `AllArenasZone` by explicit negation
 * since it inherits `SimpleZone._cards` but is a pure aggregation artifact (§2, §4.6). No identity-diffing
 * is needed on this side; no exclusion analogous to the forward one was ever measured here.
 *
 * `zonesNotCovered` (a structural tripwire, §4.6 — expected 0, not the width measurement) is only
 * accumulated on the raw (`baselineForwardViolationIds === null`) pass, i.e. once per rollback attempt
 * rather than once per pass (`P3PA3-I1-09`: it was previously double-counted across the pre- and
 * post-rollback calls). */
function runZoneMembershipCheck(manager: GameStateManager, baselineForwardViolationIds: ReadonlySet<string> | null): { forward: number; reverse: number; forwardViolationIds: Set<string> } {
    const allObjects = (manager as unknown as { allGameObjects: GameObjectBase[] }).allGameObjects;
    // `P3PA3-D-05`: `baselineForwardViolationIds === null` is exactly the raw pre-rollback calibration call
    // (§4.6); every other call is a post-rollback read. Threaded through to `recordZoneViolation` so the
    // two phases retain into separate buffers.
    const phase: 'pre' | 'post' = baselineForwardViolationIds === null ? 'pre' : 'post';

    const forwardViolations = computeForwardViolations(allObjects);
    let forward = 0;
    for (const [id, detail] of forwardViolations) {
        if (baselineForwardViolationIds === null || !baselineForwardViolationIds.has(id)) {
            forward++;
            recordZoneViolation(phase, 'forward', detail.card, detail.zoneUuid, detail.zoneClass);
        }
    }

    let reverse = 0;
    for (const obj of allObjects) {
        if (baselineForwardViolationIds === null && obj instanceof ZoneAbstract) {
            const covered = (obj instanceof SimpleZone) || (obj instanceof DeckZone) || (obj instanceof BaseZone);
            if (!covered) {
                zonesNotCovered++;
            }
        }

        if (obj instanceof AllArenasZone) {
            // Excluded by explicit negation, not by an absence that does not exist: it inherits
            // `SimpleZone._cards` and matches the positive `instanceof SimpleZone` test below, but its
            // public `cards` getter aggregates the concrete arenas, so every in-play card would otherwise
            // report a spurious violation here (§2, §4.6).
            continue;
        }

        if (obj instanceof SimpleZone) {
            const cards = (obj as unknown as { _cards: readonly Card[] })._cards;
            for (const card of cards) {
                if (card.zone !== obj) {
                    reverse++;
                    recordZoneViolation(phase, 'reverse', card, obj.uuid, obj.constructor.name);
                }
            }
        } else if (obj instanceof DeckZone) {
            const backing = obj as unknown as { _deck: readonly Card[]; _searchingCards: readonly Card[] };
            for (const card of [...backing._deck, ...backing._searchingCards]) {
                if (card.zone !== obj) {
                    reverse++;
                    recordZoneViolation(phase, 'reverse', card, obj.uuid, obj.constructor.name);
                }
            }
        } else if (obj instanceof BaseZone) {
            const backing = obj as unknown as { _leader: Card | null; _forceToken: Card | null; _credits: readonly Card[]; _upgrades: readonly Card[] };
            const cards = [backing._leader, backing._forceToken, ...backing._credits, ...backing._upgrades].filter((card): card is Card => card !== null);
            for (const card of cards) {
                if (card.zone !== obj) {
                    reverse++;
                    recordZoneViolation(phase, 'reverse', card, obj.uuid, obj.constructor.name);
                }
            }
        }
    }

    return { forward, reverse, forwardViolationIds: new Set(forwardViolations.keys()) };
}

// ---------------------------------------------------------------------------------------------
// The rollback wrapper (§4.4) — binds the retained record set to the rollback that consumes it, and
// makes a harness failure visible even though production's own recovery swallows the raw exception.
// ---------------------------------------------------------------------------------------------

function rollbackToSnapshotImpl(manager: GameStateManager, snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean {
    const records = retainedGeneratedRecords.get(snapshot.states) ?? null;

    if (records === null && moduleLoadArmed) {
        // A missing record set is a loud failure, never a silent skip, when the harness was installed at
        // module load — every snapshot taken since then went through the patched
        // `buildGameStateForSnapshot` and must have retained records (§4.4, R3).
        throw new Error('[ParityHarness] no retained generated record set found for this rollback\'s snapshot; the harness was installed at module load, so every snapshot should have retained records. This is a retention bug, not a restore mismatch.');
    }

    harnessRollbackDepth++;
    const priorRecords = currentRestoreRecords;
    currentRestoreRecords = records;

    if (harnessRollbackDepth === 1) {
        // Pre-rollback calibration (§4.6): read on live pre-rollback state, immediately before the
        // original runs, only at the outermost frame (not the nested recovery replay) so a post-rollback
        // violation can be attributed to restore rather than to a pre-existing engine invariant gap. The
        // baseline identity set (`P3PA3-I1-06`/`P3PA3-I3-4`) is captured here and read — unchanged — by
        // every post-rollback pass within this same outermost attempt, including a nested recovery replay,
        // so a violation already present going into the whole attempt is never double-reported.
        //
        // `P3PA3-D-03` fix: this pass used to run outside any `try`. A throw here (e.g. a future
        // zone-storage getter that raises) left `harnessRollbackDepth` incremented and `currentRestoreRecords`
        // pointed at this attempt's records forever, so the depth-0 re-throw at the bottom of this function
        // would never fire again for the rest of the worker — a permanently-green worker. Wrapped so a throw
        // here restores both before propagating, exactly like the `try` around `originalRollbackToSnapshot`
        // below.
        try {
            const pre = runZoneMembershipCheck(manager, null);
            preRollbackViolationsForward += pre.forward;
            preRollbackViolationsReverse += pre.reverse;
            currentPreForwardViolationIds = pre.forwardViolationIds;
        } catch (error) {
            currentRestoreRecords = priorRecords;
            harnessRollbackDepth--;
            currentPreForwardViolationIds = null;
            throw error;
        }
    }

    let result: boolean;
    try {
        result = originalRollbackToSnapshot.call(manager, snapshot, beforeRollbackSnapshot);
    } catch (error) {
        currentRestoreRecords = priorRecords;
        harnessRollbackDepth--;
        if (harnessRollbackDepth === 0) {
            // The original itself threw uncaught (production defect, or an instance-shadowed `setState`
            // throwing without a `beforeRollbackSnapshot` — GameObjectIdRestore.spec.ts's own precedent):
            // production's error propagates untouched and the harness never substitutes its own (R15).
            //
            // P3PA3-I2-004 (disclosed, not fixed — no committed spec reaches this path): if a *harness*
            // diagnostic raised by the nested recovery frame is what ends up escaping here uncaught (e.g. a
            // class-wide generator defect reproduces again during the recovery replay, on a different
            // object, and that second throw is what is not itself caught by a further recovery layer), this
            // branch still discards the stash in favor of whatever that escaping exception says. R15's rule
            // — a production error is primary — is written for a genuine production defect; it does not
            // distinguish that from a second harness-raised diagnostic escaping the recovery frame. In
            // practice the escaping message is still very likely a `[ParityHarness]`-formatted mismatch
            // naming *a* class/field (just possibly not the first one chronologically stashed), so this is
            // an ordering subtlety worth knowing when triaging a systemic, reproduces-every-time defect, not
            // a masked failure.
            firstHarnessError = null;
            currentPreForwardViolationIds = null;
        }
        throw error;
    }
    currentRestoreRecords = priorRecords;
    harnessRollbackDepth--;

    // P3PA3-I1-03's bookkeeping-gap fix: account the result *before* the depth-0 re-throw check below, not
    // after. Previously, a rollback that returned `false` (production's recovery succeeded) while a harness
    // error was stashed and rethrow was not suppressed would hit the re-throw and never reach the
    // `rollbacksFailed++`/`deliberateRollbackFailures++` line at all — counted in neither counter. Moving
    // the accounting first means every attempt is counted exactly once, regardless of what happens next.
    if (result) {
        rollbacksObserved++;
        // P3PA3-I2-003 (disclosed, not changed — AC7's own spec asserts on this shape): this runs
        // unconditionally on every `true` return, including a nested recovery frame's own successful
        // rollback to `beforeRollbackSnapshot`. The cumulative `rollbacksObserved`/`zoneChecks` on the exit
        // line therefore conflate "reached the requested target snapshot" with "production's recovery
        // successfully unwound a failed attempt" — read `rollbacksFailed`/`deliberateRollbackFailures`
        // alongside `rollbacksObserved` to distinguish the two when auditing a run's evidence.
        const post = runZoneMembershipCheck(manager, currentPreForwardViolationIds);
        zoneChecks++;
        zoneViolationsForward += post.forward;
        zoneViolationsReverse += post.reverse;
    } else if (rethrowSuppressed || harnessErrorExpected) {
        deliberateRollbackFailures++;
    } else {
        rollbacksFailed++;
    }

    if (harnessRollbackDepth === 0) {
        currentPreForwardViolationIds = null;
    }

    if (harnessRollbackDepth === 0 && firstHarnessError !== null && !rethrowSuppressed) {
        // Nothing between here and the spec swallows an exception (§2), so this reaches the spec as a
        // hard failure carrying the original mismatch text, even though production's own recovery has
        // already completed and returned `false` for `result` above (§4.4 R13). Note `harnessErrorExpected`
        // (AC2) deliberately does *not* suppress this — AC2 asserts the rollback call itself throws.
        const error = firstHarnessError;
        firstHarnessError = null;
        throw error;
    }

    return result;
}

// ---------------------------------------------------------------------------------------------
// Install / uninstall, and arming discipline (§4.5)
// ---------------------------------------------------------------------------------------------

export function installParityHarness(): void {
    if (installed) {
        return; // idempotent — defense in depth; no committed spec is expected to need this
    }
    originalBuildGameStateForSnapshot = GameStateManager.prototype.buildGameStateForSnapshot;
    GameStateManager.prototype.buildGameStateForSnapshot = function(this: GameStateManager) {
        const collect = new Map<string, SerializedStateRecord>();
        const buffer = originalBuildGameStateForSnapshot.call(this);
        snapshotsCompared++;
        recordsCompared += compareSnapshotRecords(this, buffer, collect);
        retainedGeneratedRecords.set(buffer, collect);
        return buffer;
    };

    originalSetState = GameObjectBase.prototype.setState;
    GameObjectBase.prototype.setState = function(this: GameObjectBase, newState: IGameObjectBaseState) {
        setStateImpl(this, newState);
    };

    originalRollbackToSnapshot = GameStateManager.prototype.rollbackToSnapshot;
    GameStateManager.prototype.rollbackToSnapshot = function(this: GameStateManager, snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot) {
        return rollbackToSnapshotImpl(this, snapshot, beforeRollbackSnapshot);
    };

    installed = true;

    // A heavy comparison pass (every live object, every field, every snapshot, plus a full restore-leg
    // dual restore per object per rollback) is slower than the unmodified path; raise the per-spec
    // timeout so a legitimately slow comparison is never misattributed to a parity failure.
    priorTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Math.max(jasmine.DEFAULT_TIMEOUT_INTERVAL, 20000);
}

export function uninstallParityHarness(): void {
    if (!installed) {
        return;
    }
    if (moduleLoadArmed) {
        uninstallsWhileModuleLoadArmed++;
    }

    GameStateManager.prototype.buildGameStateForSnapshot = originalBuildGameStateForSnapshot;
    GameObjectBase.prototype.setState = originalSetState;
    GameStateManager.prototype.rollbackToSnapshot = originalRollbackToSnapshot;
    installed = false;

    // Restore the timeout too, so uninstall is a full reversion — this harness is meant to be reused by
    // P3-PA4, and a half-reverting uninstall would be a trap for whoever calls it expecting a clean
    // teardown.
    if (priorTimeout !== null) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = priorTimeout;
        priorTimeout = null;
    }
}

/**
 * Spec-facing install helper (§4.5): saves the prior installed state, installs only if not already
 * installed, and on exit restores that prior state — it never uninstalls a harness it did not install.
 * The natural `install(); try { … } finally { uninstall(); }` idiom would disarm a module-load-armed
 * harness for the rest of that worker; this is the fix. The new spec file uses only this helper and never
 * calls `uninstallParityHarness()` directly.
 */
export function withParityHarnessInstalled<T>(fn: () => T): T {
    const priorInstalled = installed;
    if (!priorInstalled) {
        installParityHarness();
    }
    try {
        return fn();
    } finally {
        if (!priorInstalled) {
            uninstallParityHarness();
        }
    }
}

/**
 * Evidence for the required-check roster (§4.7) — printed unconditionally so it appears in captured
 * stdout for every flag-on run. The `pid=` tag is load-bearing.
 *
 * Uses `process.on('exit', ...)` rather than a `jasmine.getEnv().addReporter(...)` `jasmineDone` hook:
 * jasmine-core refuses `Env#addReporter` outright once `--parallel` is active ("Reporters cannot be added
 * via Env in parallel mode", `node_modules/jasmine-core/lib/jasmine-core/jasmine.js`'s `addReporter`), and
 * every flag-on required check here runs with `--parallel=4`. `afterAll`/`beforeAll` are equally out —
 * jasmine-core restricts them to inside a `describe` block under parallel mode, even from a helper file.
 * `process.on('exit', ...)` sidesteps jasmine's parallel-mode restrictions entirely (it is plain Node, not
 * a jasmine API) and prints exactly once per worker process, with that worker's final cumulative totals.
 *
 * `P3PA3-I1-02`/`P3PA3-I2-001`/`P3PA3-I3-2` fix: `console.log` from a worker's `'exit'` handler was
 * observed lost under `--parallel=4` in every full-suite run — 3 of 4 `pid=` lines printed, and in two
 * runs the missing worker was the one carrying this unit's own specs, so the required checks that read
 * these lines were adjudicated on an incomplete worker set without any signal that a worker was missing.
 * Each worker now *also* writes its line to its own file under a per-primary-process run directory
 * (`fs.writeFileSync`, synchronous, in the same `'exit'` handler — a write started before the primary exits
 * completes independently of whether the primary's own process, or this worker's stdout pipe, is still
 * being drained). `process.ppid` is the primary jasmine process's pid for every worker `cluster.fork`s, so
 * it is a stable, no-extra-plumbing key shared by every worker of one `--parallel` invocation and distinct
 * from any other invocation's primary. The run directory is not cleared automatically — a fresh `npm run
 * jasmine-parity*`/`test-parity*` invocation gets a new primary pid, so a stale file from an unrelated
 * earlier run under the *same* primary pid (a pid reused by the OS) is the only contamination risk, judged
 * acceptable given this project's own rule against running two such commands concurrently. The
 * "line-count == worker-count" precondition the reviewers asked for is applied by reading this directory
 * after a run completes (recorded per-run in the verification evidence) rather than by code in this file,
 * since jasmine's own `--parallel` worker count is not introspectable from inside a worker.
 */
function getReporterRunDir(): string {
    return path.join(os.tmpdir(), 'forceteki-parity-harness-runs', String(process.ppid));
}

if (process.env.ENABLE_PARITY_HARNESS === 'true') {
    installParityHarness();
    moduleLoadArmed = true;
    // `P3PA3-D-01`: a boot-time marker, written here at module load rather than at exit. This settles
    // *why* a worker's exit-time `pid=` line can go missing under `--parallel`, which the exit-time file
    // alone cannot: if `boot files == 4` but `exit files == 3`, the worker existed, loaded the harness, and
    // then lost its `'exit'` handler (an unrelated jasmine/Node lifecycle race, well outside this unit's
    // three-file fence) — the gate's own evidence is not the thing that is incomplete. If `boot files == 3`,
    // only three workers ever loaded the helpers in the first place, and there is no missing-worker gap to
    // explain at all. Module load happens far from any teardown race, so this file's mere existence is the
    // whole signal; no stats are attached.
    try {
        const dir = getReporterRunDir();
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `pid-${process.pid}.boot`), `${new Date().toISOString()}\n`, 'utf8');
    } catch (error) {
        console.error(`[ParityHarness] pid=${process.pid} failed to write boot marker: ${(error as Error).message}`);
    }
    process.on('exit', () => {
        const stats = getParityHarnessStats();
        const line =
            `[ParityHarness] pid=${process.pid} snapshotsCompared=${stats.snapshotsCompared} recordsCompared=${stats.recordsCompared} ` +
            `restoreMode=${stats.restoreMode} rollbacksObserved=${stats.rollbacksObserved} objectsCompared=${stats.objectsCompared} fieldsCompared=${stats.fieldsCompared} ` +
            `rollbacksFailed=${stats.rollbacksFailed} harnessRestoreErrors=${stats.harnessRestoreErrors} ` +
            `deliberateHarnessErrors=${stats.deliberateHarnessErrors} deliberateRollbackFailures=${stats.deliberateRollbackFailures} skippedPreInstall=${stats.skippedPreInstall} ` +
            `zoneChecks=${stats.zoneChecks} zoneViolationsForward=${stats.zoneViolationsForward} zoneViolationsReverse=${stats.zoneViolationsReverse} ` +
            `preRollbackViolationsForward=${stats.preRollbackViolationsForward} preRollbackViolationsReverse=${stats.preRollbackViolationsReverse} ` +
            `zonesNotCovered=${stats.zonesNotCovered} moduleLoadArmed=${stats.moduleLoadArmed} installedAtExit=${stats.installedAtExit} uninstallsWhileModuleLoadArmed=${stats.uninstallsWhileModuleLoadArmed}`;
        console.log(line);
        // The first few retained violations (plan.md §4.6) - printed whenever either counter is nonzero, so
        // a calibration exclusion decision (§4.6's "excludes the most specific class/field that actually
        // produced the pre-rollback violation") has concrete evidence to cite rather than only a count.
        let violationsLine = '';
        if (stats.zoneViolationsForward > 0 || stats.zoneViolationsReverse > 0 || stats.preRollbackViolationsForward > 0 || stats.preRollbackViolationsReverse > 0) {
            violationsLine = `[ParityHarness] pid=${process.pid} retainedZoneViolations=${JSON.stringify(getRetainedZoneViolations())}`;
            console.log(violationsLine);
        }
        try {
            const dir = getReporterRunDir();
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, `pid-${process.pid}.log`), `${line}\n${violationsLine ? violationsLine + '\n' : ''}`, 'utf8');
        } catch (error) {
            // Best-effort: the stdout line above is still the fallback record if the file write itself fails.
            console.error(`[ParityHarness] pid=${process.pid} failed to write reporter file: ${(error as Error).message}`);
        }
    });
}

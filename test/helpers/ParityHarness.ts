import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { Game } from '../../server/game/core/Game';
import { GameObjectBase } from '../../server/game/core/GameObjectBase';
import type { IGameObjectBase } from '../../server/game/core/GameObjectBase';
import { GameStateManager } from '../../server/game/core/snapshot/GameStateManager';
import type { IGameSnapshot } from '../../server/game/core/snapshot/SnapshotInterfaces';
import { getAllGeneratedSerializerEntries, getStateSerializerFor } from '../../server/game/core/StateSerializers';
import { STATE_ENCODING_TAGS } from '../../server/game/core/StateEncoding';
import type { FieldKind, IGeneratedSerializerEntry, IStateSerializer, SerializedStateRecord } from '../../server/game/core/StateEncoding';
import { Card } from '../../server/game/core/card/Card';
import { ZoneAbstract } from '../../server/game/core/zone/ZoneAbstract';
import { SimpleZone } from '../../server/game/core/zone/SimpleZone';
import { DeckZone } from '../../server/game/core/zone/DeckZone';
import { BaseZone } from '../../server/game/core/zone/BaseZone';
import { AllArenasZone } from '../../server/game/core/zone/AllArenasZone';

/**
 * Parity harness. Through Plan 3 Phase A this compared two legs - the state bag + `v8` snapshot path
 * against the generated per-class serializers, on both the serialize (`P3-PA2`) and restore (`P3-PA3`)
 * sides. **`P3-PB2` deleted the bag, so there is no second leg left to compare against.** Rather than
 * shell the harness out (which would make `test-parity*` a duplicate suite run and make the `AC14` escape
 * proof unrunnable), it is repointed onto invariants that are genuine *after* the cutover:
 *
 * 1. **Round-trip self-check.** Each registry entry's `deserialize` is wrapped so that, immediately after
 *    the original returns and *before* `afterSetState` runs, the instance is re-serialized and deep-compared
 *    to the record it was just handed. For every field kind the round trip is identity by construction, so
 *    any divergence is a real defect - a setter that transforms a value, a dropped field, a wrapper that
 *    loses contents. No legacy leg, no allowlist.
 * 2. **Wrapper identity.** A round-trip compare reads *values*, so it is blind by construction to the
 *    failure this cutover most needs to catch: a deserializer that bypassed the setter and left a plain
 *    `Array` where an `UndoArray` belongs encodes to the identical uuid list. The check below therefore also
 *    asserts that each `refMap`/`refSet` field holds an `UndoMap`/`UndoSet` after restore, and that a
 *    `refArray` field that held an `UndoArray` *before* the call still holds one after. The before/after
 *    form is required because `FieldKind` cannot distinguish `@stateRefArray(true)` from `(false)`.
 *    **A green run here is still not evidence for the `_hasRef` latch itself** - that is carried only by the
 *    dedicated specs.
 * 3. **Zone membership**, unchanged from `P3-PA3`, including the exhaustive per-class tally.
 *
 * See `docs/plans/03-codegen-serializers.md`.
 *
 * Opt-in, zero footprint when the flag is off: `installParityHarness()` only ever runs from the
 * `ENABLE_PARITY_HARNESS === 'true'` guard below. This file must never construct a `Game`/`GameObjectBase`
 * or otherwise trigger `Helpers.isDevelopment()`'s first call at module-load time — doing so would make
 * this file's own load-order independence depend on load order relative to
 * `IntegrationHelper.js:33`'s `ENVIRONMENT ??=` line rather than being structurally independent of it.
 */

const RESERVED_TAGS: readonly string[] = STATE_ENCODING_TAGS;

let installed = false;
let priorTimeout: number | null = null;

// ---------------------------------------------------------------------------------------------
// Restore-leg module state
// ---------------------------------------------------------------------------------------------

let originalRollbackToSnapshot: typeof GameStateManager.prototype.rollbackToSnapshot | null = null;

/**
 * Each wrapped registry entry and the `deserialize` the harness wraps. `original` is mutable on purpose:
 * `withDeserializePatchedBeneathHarness` swaps it so a spec's injected failure always sits *inside* the
 * harness's check rather than outside it. Without that, the layering would depend on run mode - with the
 * flag on the harness installs at module load and a spec's later `entry.serializer.deserialize = ...`
 * wraps *it*, so the spec's corruption would land after the check had already passed; with the flag off,
 * `withParityHarnessInstalled` runs later and the order is reversed. Also used to make uninstall exact.
 */
interface IWrappedEntry {
    entry: IGeneratedSerializerEntry;

    /** The `deserialize` that was on the entry before install, restored verbatim by `uninstallParityHarness`. */
    preInstall: IStateSerializer['deserialize'];
    original: IStateSerializer['deserialize'];
}
const wrappedEntries: IWrappedEntry[] = [];

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

let rollbacksObserved = 0;
let objectsCompared = 0;
let fieldsCompared = 0;

/** `PB2R2-W4`: non-vacuity for the wrapper-identity check. A `FieldKind` rename, a model-lookup miss, or a
 * guard that only ever matches `refSet` (which has zero live uses) would leave the check running over an
 * empty enumeration behind a permanently green suite.
 *
 * P3-PB2 fix (`PB2I1-OPR-06` / `PB2I1-AC-08`): this counter is **per instance per rollback**, not per
 * declaration site. The six mutable-wrapper fields this tree declares - three `@stateRefArray(false)` and
 * three `@stateRefMap` - include `GameObject._ongoingEffects`, declared once on the base and instantiated
 * on every card, zone and player, so a real rollback reaches roughly 70 fields, not six. Measured: 143853
 * over 2015 rollbacks on `test-parity-undo`, 6972 over 102 on `test-parity`. The earlier "expect six"
 * reading invited someone to "fix" a correct check; it also meant a regression that silenced 90% of the
 * checks still looked consistent with the comment, which is why `ParityHarness.spec.ts` now asserts a floor
 * against this value rather than leaving it narrated. */
let wrapperFieldsChecked = 0;
let rollbacksFailed = 0;
let harnessRestoreErrors = 0;

/** `P3PA3-I1-03` structural fix: errors/failures raised inside a deliberate-suppression scope
 * (`rethrowSuppressed` for AC7, `harnessErrorExpected` for AC2) are this unit's own negative-testing
 * traffic, counted here instead of in `harnessRestoreErrors`/`rollbacksFailed` so those two stay true
 * absolutes (§4.7: "`harnessRestoreErrors === 0` stays absolute in every case") for every other run. */
let deliberateHarnessErrors = 0;
let deliberateRollbackFailures = 0;
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

/**
 * `P3-PA4` follow-up: an exhaustive `zoneClass -> count` tally, incremented unconditionally alongside the
 * capped identity buffers above (never gated by their 10-item cap). Directly answers `P3PA3-F-03`'s
 * disclosed residual ("10 of 78... a sampled characterization, not an enumeration") by making the
 * class-level breakdown exhaustive, while the per-instance identity buffers stay capped as before (still
 * useful for concrete triage examples).
 */
const zoneViolationClassCounts = new Map<string, number>();

export interface IParityHarnessStats {
    installed: boolean;
    wrappedDeserializers: number;
    rollbacksObserved: number;
    objectsCompared: number;
    fieldsCompared: number;
    wrapperFieldsChecked: number;
    rollbacksFailed: number;
    harnessRestoreErrors: number;
    deliberateHarnessErrors: number;
    deliberateRollbackFailures: number;
    zoneChecks: number;
    zoneViolationsForward: number;
    zoneViolationsReverse: number;
    preRollbackViolationsForward: number;
    preRollbackViolationsReverse: number;
    zonesNotCovered: number;
    installedAtExit: boolean;
}

export function getParityHarnessStats(): IParityHarnessStats {
    return {
        installed,
        wrappedDeserializers: wrappedEntries.length,
        rollbacksObserved,
        objectsCompared,
        fieldsCompared,
        wrapperFieldsChecked,
        rollbacksFailed,
        harnessRestoreErrors,
        deliberateHarnessErrors,
        deliberateRollbackFailures,
        zoneChecks,
        zoneViolationsForward,
        zoneViolationsReverse,
        preRollbackViolationsForward,
        preRollbackViolationsReverse,
        zonesNotCovered,
        installedAtExit: installed,
    };
}

export function getRetainedZoneViolations(): IRetainedZoneViolation[] {
    return [...retainedPreRollbackZoneViolations, ...retainedPostRollbackZoneViolations];
}

/** `P3-PA4` follow-up: exhaustive per-`zoneClass` violation counts, never capped. A plain object (not the
 * backing `Map`) so it round-trips through `JSON.stringify` for the exit-time reporter line without extra
 * marshalling. Consumers reading this in the same process as `ParityHarnessZoneTally.spec.ts` will only
 * ever see that spec's own synthetic `zoneClass` keys during the window before the spec's `afterEach`
 * removes them (see `deleteZoneViolationClassCountForTest`) - real `zoneClass` keys (e.g. `DeckZone`) are
 * never touched by that cleanup, since synthetic keys use a disjoint, uniquely-prefixed name. */
export function getZoneViolationClassCounts(): Record<string, number> {
    return Object.fromEntries(zoneViolationClassCounts);
}

/** `P3-PA4` (PA4-IR-2 fix-pass) test-only isolation hook: removes one `zoneClass` key from the shared
 * exhaustive tally. `ParityHarnessZoneTally.spec.ts` calls this in an `afterEach` for every synthetic
 * `zoneClass` it registers via `recordZoneViolation`, so the tally this task's own unit spec drives never
 * outlives the spec that created it - a real, same-process exhaustive breakdown (e.g. the serial
 * parity+undo run this task's evidence depends on, or a future consumer like P3-PB2) only ever sees
 * genuine zone-membership violations, never this spec's synthetic noise. Not for production use. */
export function deleteZoneViolationClassCountForTest(zoneClass: string): void {
    zoneViolationClassCounts.delete(zoneClass);
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
        `[ParityHarness] round-trip mismatch: ${classLabel} uuid=${uuid} field="${fieldPath}"` +
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

/**
 * Compares two tagged container payloads, walking both in iteration order and never sorting either side.
 *
 * P3-PB2 changed this function's shape: before the cutover, one side was a native `Map`/`Set` read out of
 * the state bag and only the generated side carried a tag. Both sides are encoder output now, so a
 * `$map`/`$set` payload is compared against a `$map`/`$set` payload, and a tag on one side only is itself a
 * mismatch (a `value`-kind field whose re-serialize stopped producing a container, for instance).
 */
function compareTaggedContainer(className: string, serializerClassName: string, uuid: string, fieldPath: string, oldValue: unknown, newValue: unknown, tag: string): void {
    const oldTag = getReservedTag(oldValue);
    if (oldTag !== tag) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `one side is ${tag}-tagged and the other is ${oldTag === null ? 'not tagged' : `${oldTag}-tagged`}`);
    }

    const key = tag as '$map' | '$set';
    const oldMembers = (oldValue as Record<string, unknown>)[key];
    const newMembers = (newValue as Record<string, unknown>)[key];
    if (!Array.isArray(oldMembers) || !Array.isArray(newMembers)) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `a ${tag}-tagged payload's "${tag}" property is not an array`);
    }
    if (oldMembers.length !== newMembers.length) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `${tag} size differs (old=${oldMembers.length}, new=${newMembers.length})`);
    }

    if (tag === '$map') {
        for (let i = 0; i < oldMembers.length; i++) {
            const oldEntry = oldMembers[i] as [string, unknown];
            const newEntry = newMembers[i] as [string, unknown];
            if (!Array.isArray(oldEntry) || !Array.isArray(newEntry) || oldEntry.length !== 2 || newEntry.length !== 2) {
                fail(className, serializerClassName, uuid, `${fieldPath} ($map entry ${i})`, oldEntry, newEntry, '$map entries must be two-element [key, value] pairs');
            }
            if (oldEntry[0] !== newEntry[0]) {
                fail(className, serializerClassName, uuid, `${fieldPath} (Map entry ${i} key, iteration order)`, oldEntry[0], newEntry[0], 'Map key differs at this iteration-order position; keys are never sorted before comparison');
            }
            compareValue(className, serializerClassName, uuid, `${fieldPath} (Map value for key "${String(oldEntry[0])}")`, oldEntry[1], newEntry[1]);
        }
        return;
    }

    for (let i = 0; i < oldMembers.length; i++) {
        compareValue(className, serializerClassName, uuid, `${fieldPath} (Set member, iteration order index ${i})`, oldMembers[i], newMembers[i]);
    }
}

/**
 * Structural comparison of one field's expected value against the value the re-serialize produced.
 *
 * P3-PB2 removed this function's one asymmetry exception (`undefined` on the bag side vs `null` on the
 * encoder side, previously gated by an `isTopLevel` flag): with the bag gone both sides are encoder output,
 * so that shape can no longer legitimately occur and forgiving it would only risk masking a real mismatch.
 */
function compareValue(className: string, serializerClassName: string, uuid: string, fieldPath: string, oldValue: unknown, newValue: unknown): void {
    const tag = getReservedTag(newValue) ?? getReservedTag(oldValue);
    if (tag) {
        if (tag === '$map' || tag === '$set') {
            compareTaggedContainer(className, serializerClassName, uuid, fieldPath, oldValue, newValue, tag);
            return;
        }
        // Any other reserved tag (e.g. "$num") has no comparator branch — throw naming it rather than
        // silently falling through to plain-object recursion (AC9), mirroring decodeStateValue's own
        // refusal of an undecodable reserved tag.
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `a compared value carries reserved tag "${tag}" with no comparator branch`);
    }

    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
        if (!Array.isArray(oldValue) || !Array.isArray(newValue)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'one side is an array and the other is not');
        }
        if (oldValue.length !== newValue.length) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, `array length differs (old=${oldValue.length}, new=${newValue.length})`);
        }
        for (let i = 0; i < oldValue.length; i++) {
            compareValue(className, serializerClassName, uuid, `${fieldPath}[${i}]`, oldValue[i], newValue[i]);
        }
        return;
    }

    if (isPlainObject(oldValue) || isPlainObject(newValue)) {
        if (!isPlainObject(oldValue) || !isPlainObject(newValue)) {
            fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'one side is a plain object and the other is not');
        }
        const keys = new Set<string>([...Object.keys(oldValue), ...Object.keys(newValue)]);
        for (const key of keys) {
            compareValue(className, serializerClassName, uuid, `${fieldPath}.${key}`, oldValue[key], newValue[key]);
        }
        return;
    }

    if (!Object.is(oldValue, newValue)) {
        fail(className, serializerClassName, uuid, fieldPath, oldValue, newValue, 'primitive values differ');
    }
}

/**
 * Pure post-cutover round-trip self-check: re-serializes `instance` and deep-compares the result, field by
 * field, against the `record` it was just restored from. Performs zero prototype patching and touches no
 * module-level counters, so a spec can call it directly on a synthetic record.
 *
 * Reads stored refs via `.uuid` only (through the generated serializers' own encoders - never
 * `getObjectId()`), which is what keeps this side-effect-free. Returns the number of fields compared;
 * throws the standard mismatch diagnostic on the first divergence it finds.
 *
 * There is no `undefined`/`null` leniency here, unlike the retired two-leg comparator: both sides are now
 * encoder output, so the asymmetry the old exception existed for cannot arise, and forgiving it would be an
 * unjustified rule.
 */
export function compareRoundTrip(instance: IGameObjectBase, record: SerializedStateRecord): number {
    const className = (instance as unknown as { constructor: { name: string } }).constructor.name;

    let reserialized: SerializedStateRecord;
    let serializerClassName: string;
    try {
        const entry = getStateSerializerFor(instance);
        serializerClassName = entry.className;
        reserialized = entry.serializer.serialize(instance);
    } catch (error) {
        throw new Error(`[ParityHarness] class=${className}: failed to resolve or run the generated serializer: ${(error as Error).message}`);
    }

    const uuid = String((instance as unknown as { uuid?: unknown }).uuid);
    const keys = new Set<string>([...Object.keys(record), ...Object.keys(reserialized)]);
    for (const key of keys) {
        compareValue(className, serializerClassName, uuid, key, record[key], reserialized[key]);
    }

    return keys.size;
}

// ---------------------------------------------------------------------------------------------
// Restore-leg observation and comparison (§4.6)
// ---------------------------------------------------------------------------------------------

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

/** `P3PA3-I2-007`: every scoped-override helper below restores its state in a synchronous `finally`, so an
 * `async fn` (or any `fn` returning a thenable) would have its scope reverted before the awaited work
 * inside it actually runs — silently mis-scoping. No current call site does this, but the file is
 * documented for reuse by `P3-PA4`, so this is a loud guard rather than a trap for a future caller. */
function assertNotThenable(result: unknown, helperName: string): void {
    if (result !== null && (typeof result === 'object' || typeof result === 'function') && typeof (result as { then?: unknown }).then === 'function') {
        throw new Error(`[ParityHarness] ${helperName}(fn) requires a synchronous fn; fn() returned a thenable, which would revert the scope before any awaited work runs.`);
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
 * One-shot, documented fault injection - the gate's own falsifier (AC14). When
 * `PARITY_INJECT_RESTORE_MISMATCH=<Class>.<field>` is set and this is the first eligible object restored
 * (not already fired, not inside a deliberate-suppression scope), the named live field is corrupted
 * *after* `deserialize` has written it, so the round-trip compare that follows sees a value that disagrees
 * with the record and raises the standard mismatch diagnostic.
 *
 * Eligibility is checked against the *record's* value, not the live one: a field can be a supported
 * primitive on some instances of a class and `null` on others of the same class (`NonLeaderUnitCard._damage`
 * is a `number` in play and `null` in a deck), and spending the one shot on an instance
 * `corruptLiveField` cannot corrupt would waste it on a setup-time throw instead of producing the intended
 * diagnostic.
 */
function checkInjection(instance: GameObjectBase, className: string, record: SerializedStateRecord): void {
    if (injectionFired || rethrowSuppressed || harnessErrorExpected) {
        return;
    }
    const spec = parseInjectionSpec();
    if (!spec || spec.className !== className || !(spec.field in record)) {
        return;
    }
    const recordedValue = record[spec.field];
    if (typeof recordedValue !== 'number' && typeof recordedValue !== 'string' && typeof recordedValue !== 'boolean') {
        return;
    }
    injectionFired = true;

    corruptLiveField(instance, spec.field);
}

// ---------------------------------------------------------------------------------------------
// The per-object restore seam: round-trip self-check + wrapper identity
// ---------------------------------------------------------------------------------------------

/**
 * Snapshots, for one instance, which `refArray` fields currently hold an `UndoArray`. `FieldKind` cannot
 * distinguish `@stateRefArray(true)` (plain array, by design) from `@stateRefArray(false)` (wrapped), so the
 * only decidable form of the check is before/after: a field that was wrapped going in must still be wrapped
 * coming out.
 */
function collectWrappedRefArrayFields(instance: GameObjectBase, fields: readonly { name: string; kind: FieldKind }[]): string[] {
    const wrapped: string[] = [];
    for (const field of fields) {
        if (field.kind !== 'refArray') {
            continue;
        }
        const value = (instance as unknown as Record<string, unknown>)[field.name];
        if (value != null && (value as object).constructor.name === 'UndoArray') {
            wrapped.push(field.name);
        }
    }
    return wrapped;
}

function raiseWrapperIdentityFailure(className: string, uuid: string, fieldName: string, expected: string, actual: string): never {
    const error = new Error(
        `[ParityHarness] wrapper-identity failure: class=${className} uuid=${uuid} field="${fieldName}" ` +
        `expected=${expected} actual=${actual}. A restored ref collection that is not its wrapper type no longer ` +
        'latches _hasRef on later mutation, so its referents are culled at the next snapshot and the rollback ' +
        'after that fails in getFromUuidUnsafe.'
    );
    stashFirstHarnessError(error);
    throw error;
}

/**
 * Runs after the real `deserialize` returns and before `afterSetState` - the hooks legitimately mutate
 * state (`Damage.afterSetState` nulls `_activeAttack`; `OngoingEffectEngine.afterSetAllState` calls
 * `resolveEffects(true)`), so a post-rollback comparison would need a divergence allowlist, which is
 * exactly the "gate that cannot go red" failure this harness exists to avoid.
 */
function checkRestoredInstance(
    entry: IGeneratedSerializerEntry,
    instance: GameObjectBase,
    record: SerializedStateRecord,
    wrappedRefArraysBefore: readonly string[]
): void {
    const className = (instance as unknown as { constructor: { name: string } }).constructor.name;
    const uuid = instance.uuid;

    checkInjection(instance, className, record);

    objectsCompared++;

    for (const field of entry.fields) {
        const value = (instance as unknown as Record<string, unknown>)[field.name];
        if (field.kind === 'refMap') {
            wrapperFieldsChecked++;
            if (value != null && (value as object).constructor.name !== 'UndoMap') {
                raiseWrapperIdentityFailure(className, uuid, field.name, 'UndoMap', (value as object).constructor.name);
            }
        } else if (field.kind === 'refSet') {
            wrapperFieldsChecked++;
            if (value != null && (value as object).constructor.name !== 'UndoSet') {
                raiseWrapperIdentityFailure(className, uuid, field.name, 'UndoSet', (value as object).constructor.name);
            }
        } else if (field.kind === 'refArray' && wrappedRefArraysBefore.includes(field.name)) {
            wrapperFieldsChecked++;
            if (value == null || (value as object).constructor.name !== 'UndoArray') {
                raiseWrapperIdentityFailure(className, uuid, field.name, 'UndoArray', value == null ? String(value) : (value as object).constructor.name);
            }
        }
    }

    try {
        fieldsCompared += compareRoundTrip(instance, record);
    } catch (error) {
        stashFirstHarnessError(error as Error);
        throw error;
    }
}

// ---------------------------------------------------------------------------------------------
// Zone-membership observation (§4.6)
// ---------------------------------------------------------------------------------------------

/** Exported (`P3-PA4`) so a spec can drive a controlled sequence directly, for `getZoneViolationClassCounts`'s
 * own arithmetic proof - mirrors this file's existing pattern of exposing a pure function alongside its
 * module-load side effects (e.g. `compareSnapshotRecords`). Forcing an actual `DeckZone` bookkeeping bug
 * deterministically is impractical (a rare, statistically-observed condition per P3-PA3); direct calls here
 * are a controlled substitute for the tally's own arithmetic, not a claim about detecting a real violation. */
export function recordZoneViolation(phase: 'pre' | 'post', direction: 'forward' | 'reverse', card: Card, zoneUuid: string, zoneClass: string): void {
    // Unconditional, never gated by the identity buffer's 10-item cap below - the whole point is
    // exhaustiveness where the identity buffer is sampled.
    zoneViolationClassCounts.set(zoneClass, (zoneViolationClassCounts.get(zoneClass) ?? 0) + 1);

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
    // P3-PB2: no retained-record bookkeeping is needed any more. `snapshot.states` *is* the record map the
    // production restore reads, and the per-object check runs inside the wrapped `deserialize`, which is
    // handed that record directly.
    harnessRollbackDepth++;

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
            harnessRollbackDepth--;
            currentPreForwardViolationIds = null;
            throw error;
        }
    }

    let result: boolean;
    try {
        result = originalRollbackToSnapshot.call(manager, snapshot, beforeRollbackSnapshot);
    } catch (error) {
        harnessRollbackDepth--;
        if (harnessRollbackDepth === 0) {
            // The original itself threw uncaught (production defect, or an instance-shadowed
            // `afterSetState` throwing without a `beforeRollbackSnapshot` — GameObjectIdRestore.spec.ts's
            // own precedent):
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
    // Wrap every registry entry's `deserialize`. This is the seam `GameStateManager.rollbackToSnapshot`
    // actually calls, so the check sees exactly the record production handed the object, and it runs before
    // `afterSetState` - which is where it has to run (see checkRestoredInstance's comment).
    for (const entry of getAllGeneratedSerializerEntries()) {
        const wrapped: IWrappedEntry = { entry, preInstall: entry.serializer.deserialize, original: entry.serializer.deserialize };
        wrappedEntries.push(wrapped);
        entry.serializer.deserialize = function(game: Game, instance: IGameObjectBase, record: SerializedStateRecord) {
            const go = instance as unknown as GameObjectBase;
            const wrappedRefArraysBefore = collectWrappedRefArrayFields(go, entry.fields);
            try {
                wrapped.original(game, instance, record);
            } catch (error) {
                // A deserializer that throws is a harness-visible restore failure: stash it so the
                // diagnostic survives production's recovery swallowing the exception, then rethrow
                // untouched so production's own recovery still runs.
                // Named `harnessError`, not `wrapped`: the enclosing closure already captures an
                // `IWrappedEntry` called `wrapped`, whose `.original` is the exact seam
                // `withDeserializePatchedBeneathHarness` swaps. Shadowing it here was harmless but put the
                // wrong thing one keystroke away.
                const harnessError = new Error(`[ParityHarness] generated deserializer threw for uuid=${go.uuid} class=${(go as unknown as { constructor: { name: string } }).constructor.name}: ${(error as Error).message}`);
                stashFirstHarnessError(harnessError);
                throw error;
            }
            checkRestoredInstance(entry, go, record, wrappedRefArraysBefore);
        };
    }

    originalRollbackToSnapshot = GameStateManager.prototype.rollbackToSnapshot;
    GameStateManager.prototype.rollbackToSnapshot = function(this: GameStateManager, snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot) {
        return rollbackToSnapshotImpl(this, snapshot, beforeRollbackSnapshot);
    };

    installed = true;

    // A full re-serialize and deep compare of every restored object on every rollback is slower than the
    // unmodified path; raise the per-spec timeout so a legitimately slow comparison is never misattributed
    // to a parity failure.
    priorTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Math.max(jasmine.DEFAULT_TIMEOUT_INTERVAL, 20000);
}

export function uninstallParityHarness(): void {
    if (!installed) {
        return;
    }
    for (const { entry, preInstall } of wrappedEntries) {
        entry.serializer.deserialize = preInstall;
    }
    wrappedEntries.length = 0;
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
 * Installs a `deserialize` patch that is guaranteed to run **inside** the harness's own per-object check,
 * in both flag modes, and removes it again on exit. A spec that assigns `entry.serializer.deserialize`
 * directly gets mode-dependent layering (see `IWrappedEntry`), which silently changes whether the harness
 * can observe the injected failure at all.
 *
 * `makePatch` receives the function the patch replaces and is expected to call it (or deliberately not to,
 * when simulating a throwing deserializer).
 *
 * One residual, documented rather than guarded because no caller does it: this is not safe against the
 * harness being installed or uninstalled *inside* `fn`. It resolves which seam to patch once, on entry, and
 * restores that same seam on exit, so a mode flip in between would restore onto the wrong layer. Nesting
 * two of these calls, and every layering the committed specs use, is fine.
 */
export function withDeserializePatchedBeneathHarness<T>(
    entry: IGeneratedSerializerEntry,
    makePatch: (original: IStateSerializer['deserialize']) => IStateSerializer['deserialize'],
    fn: () => T
): T {
    const wrapped = wrappedEntries.find((candidate) => candidate.entry === entry);
    if (wrapped) {
        const prior = wrapped.original;
        wrapped.original = makePatch(prior);
        try {
            const result = fn();
            assertNotThenable(result, 'withDeserializePatchedBeneathHarness');
            return result;
        } finally {
            wrapped.original = prior;
        }
    }

    // Harness not installed for this entry (flag off and no spec-scoped install yet): patch the property
    // directly, which is the only seam there is.
    const prior = entry.serializer.deserialize;
    entry.serializer.deserialize = makePatch(prior);
    try {
        const result = fn();
        assertNotThenable(result, 'withDeserializePatchedBeneathHarness');
        return result;
    } finally {
        entry.serializer.deserialize = prior;
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
 *
 * `P3-PA4` correction: `process.ppid` should not be assumed stable across *separate* invocations of this
 * repo's scripts - verified empirically during P3-PA4 planning, four separate `node`/`cross-env node`
 * invocations from one shell produced four different `process.ppid` values. The one guarantee that *is*
 * established (P3-PA3's own boot/exit-marker measurement, cited as-is above, not re-derived) is that all
 * workers of a single `--parallel` jasmine invocation share one `process.ppid` (the jasmine primary's).
 * Because per-invocation directory identity cannot be relied on for correlation across separate
 * invocations, hygiene is handled by pruning stale sibling directories (`pruneStaleReporterRunDirectories`
 * below) rather than by any claim about which directory a given invocation will land in.
 */
const REPORTER_RUN_PARENT_DIR = path.join(os.tmpdir(), 'forceteki-parity-harness-runs');
const STALE_REPORTER_RUN_DIR_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours, unchanged rationale from the v1 draft.

function getReporterRunDir(): string {
    return path.join(REPORTER_RUN_PARENT_DIR, String(process.ppid));
}

/**
 * `P3-PA4` follow-up, redesigned from a v1 draft that pruned files *within* the current run's own
 * directory - which can never bound growth, since every invocation (serial or parallel) mints its own
 * fresh, never-revisited `<ppid>` directory (per the correction above), so the directory being pruned was
 * always freshly created and therefore never had anything old in it.
 *
 * Prunes stale *sibling* directories one level up, under the parent path, each representing one prior
 * invocation. A sibling whose newest-contained-file mtime (or its own mtime, if empty) is older than
 * `thresholdMs` is removed entirely (`fs.rmSync`, recursive). Exported as a pure function for direct spec
 * testability, mirroring this file's existing pattern of exposing a pure function alongside a module-load
 * side effect (e.g. `compareSnapshotRecords`). Called once at module load below, **never** inside
 * `process.on('exit', ...)` - that handler is exactly the one P3-PA3 measured as lost in 1 of 4 parallel
 * workers, so adding filesystem work there would make the loss costlier, not just theoretically undesirable.
 */
export function pruneStaleReporterRunDirectories(thresholdMs: number = STALE_REPORTER_RUN_DIR_THRESHOLD_MS): void {
    let siblingNames: string[];
    try {
        siblingNames = fs.readdirSync(REPORTER_RUN_PARENT_DIR);
    } catch {
        // Parent directory does not exist yet - nothing to prune.
        return;
    }

    const now = Date.now();
    for (const siblingName of siblingNames) {
        const siblingDir = path.join(REPORTER_RUN_PARENT_DIR, siblingName);
        let newestMtimeMs: number;
        try {
            const dirStat = fs.statSync(siblingDir);
            newestMtimeMs = dirStat.mtimeMs;
            if (dirStat.isDirectory()) {
                for (const fileName of fs.readdirSync(siblingDir)) {
                    const fileMtimeMs = fs.statSync(path.join(siblingDir, fileName)).mtimeMs;
                    if (fileMtimeMs > newestMtimeMs) {
                        newestMtimeMs = fileMtimeMs;
                    }
                }
            }
        } catch {
            // Removed concurrently by another process/worker between readdir and stat - nothing to prune.
            continue;
        }

        if (now - newestMtimeMs > thresholdMs) {
            try {
                fs.rmSync(siblingDir, { recursive: true, force: true });
            } catch (error) {
                console.error(`[ParityHarness] pid=${process.pid} failed to prune stale reporter run directory "${siblingDir}": ${(error as Error).message}`);
            }
        }
    }
}

if (process.env.ENABLE_PARITY_HARNESS === 'true') {
    // `P3-PA4` follow-up: prune stale sibling run directories before writing this run's own boot marker
    // below, so growth across many invocations stays bounded.
    pruneStaleReporterRunDirectories();

    installParityHarness();
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
            `[ParityHarness] pid=${process.pid} wrappedDeserializers=${stats.wrappedDeserializers} ` +
            `rollbacksObserved=${stats.rollbacksObserved} objectsCompared=${stats.objectsCompared} fieldsCompared=${stats.fieldsCompared} ` +
            `wrapperFieldsChecked=${stats.wrapperFieldsChecked} ` +
            `rollbacksFailed=${stats.rollbacksFailed} harnessRestoreErrors=${stats.harnessRestoreErrors} ` +
            `deliberateHarnessErrors=${stats.deliberateHarnessErrors} deliberateRollbackFailures=${stats.deliberateRollbackFailures} ` +
            `zoneChecks=${stats.zoneChecks} zoneViolationsForward=${stats.zoneViolationsForward} zoneViolationsReverse=${stats.zoneViolationsReverse} ` +
            `preRollbackViolationsForward=${stats.preRollbackViolationsForward} preRollbackViolationsReverse=${stats.preRollbackViolationsReverse} ` +
            `zonesNotCovered=${stats.zonesNotCovered} installedAtExit=${stats.installedAtExit}`;
        console.log(line);
        // The first few retained violations (plan.md §4.6) - printed whenever either counter is nonzero, so
        // a calibration exclusion decision (§4.6's "excludes the most specific class/field that actually
        // produced the pre-rollback violation") has concrete evidence to cite rather than only a count.
        let violationsLine = '';
        if (stats.zoneViolationsForward > 0 || stats.zoneViolationsReverse > 0 || stats.preRollbackViolationsForward > 0 || stats.preRollbackViolationsReverse > 0) {
            violationsLine = `[ParityHarness] pid=${process.pid} retainedZoneViolations=${JSON.stringify(getRetainedZoneViolations())}`;
            console.log(violationsLine);
        }
        // `P3-PA4` follow-up: the exhaustive zoneClass tally, replacing P3-PA3's sampled "10 of 78"
        // characterization - printed unconditionally (like the counters line above) so it appears in every
        // flag-on run's captured stdout, not gated behind the identity-buffer's own nonzero check.
        const zoneClassCountsLine = `[ParityHarness] pid=${process.pid} zoneViolationClassCounts=${JSON.stringify(getZoneViolationClassCounts())}`;
        console.log(zoneClassCountsLine);
        try {
            const dir = getReporterRunDir();
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, `pid-${process.pid}.log`), `${line}\n${violationsLine ? violationsLine + '\n' : ''}${zoneClassCountsLine}\n`, 'utf8');
        } catch (error) {
            // Best-effort: the stdout line above is still the fallback record if the file write itself fails.
            console.error(`[ParityHarness] pid=${process.pid} failed to write reporter file: ${(error as Error).message}`);
        }
    });
}

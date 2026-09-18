import type { IRuntimeStateFieldModelEntry } from './GameObjectUtils';
import { getRuntimeStateFieldModelByClassName, registeredStateClassesByName } from './GameObjectUtils';
import type { FieldKind, IGeneratedSerializerEntry } from './StateEncoding';
import { getAllGeneratedSerializerEntries, getExcludedFragmentClassNames } from './StateSerializers';

/**
 * Coverage/staleness cross-check between the generated serializer model (Plan 3, Phase A step 1) and the
 * runtime decorator metadata (`GameObjectUtils.ts`), Plan 3 Phase A step 5 (`P3-PA4`). One shared function,
 * two call sites (`server/gamenode/index.ts`'s dev-startup boot, and
 * `test/server/core/StateSerializerCoverageCheck.spec.ts`'s force-load spec) - both compare the same two
 * directions, but each supplies a different `runtimeRegisteredClassNames` universe (see that file for why).
 *
 * Forward pass (per generator entry, comparing to the runtime): the acceptance-critical direction. A field
 * present at runtime but missing from the generated model (`missingFromGenerator`) is exactly the scenario
 * this unit exists to hard-fail on - a real field silently excluded from every save/restore this generated
 * artifact will ever back. Aggregates every mismatch across all entries before throwing once, so one real
 * drift can never mask (or be masked by) an unrelated one.
 *
 * Reverse pass (per runtime-registered class name, comparing to the generator): runs only after a clean
 * forward pass. A class registered at runtime but absent from both the generator's entries and its known
 * excluded-fragment list (mixin-fragment classes deliberately excluded by `selectTargets`'s
 * `declaredInFunction` filter) is unambiguously a stale/incomplete generated artifact.
 */

export interface ICoverageCheckOptions {

    /** Injection point for falsifiers; defaults to every entry the generator currently knows about. */
    generatedEntries?: readonly IGeneratedSerializerEntry[];

    /** Injection point for falsifiers; defaults to the generator's own known mixin-fragment exclusions. */
    excludedFragmentClassNames?: readonly string[];

    /** Injection point for falsifiers; defaults to the real runtime field-model reader. */
    runtimeFieldModelLookup?: (className: string) => IRuntimeStateFieldModelEntry[] | undefined;

    /**
     * Injection point for the reverse pass. Defaults to the real, unrestricted, live registry - safe only
     * at the dev-startup call site, since the jasmine test runner never loads `server/gamenode/index.ts`
     * (so a test-declared `@registerState` fixture can never be observed there). A spec-based call site
     * must always pass a restricted, deterministic universe instead (see the force-load spec).
     *
     * `PA4-IR-3` fix-pass: typed `readonly string[]` (not `Iterable<string>`) so a caller can't pass a
     * one-shot iterator (e.g. a bare `Map.keys()` result) that would silently read as empty on any second
     * consumption - the reverse pass below only iterates it once today, but the array type makes that a
     * guaranteed property of the signature rather than an incidental fact about current call sites.
     */
    runtimeRegisteredClassNames?: readonly string[];

    /**
     * Whether a generator entry with no runtime field model (the class's module was never loaded) is
     * tolerated as a skip rather than a hard failure. Defaults to `false` everywhere, including the
     * dev-startup call site, since this repo's current import graph already gives full coverage there and a
     * weaker default would silently mask a future regression in that coincidence.
     */
    treatUnloadedClassAsSkip?: boolean;
}

export interface ICoverageCheckResult {
    checkedClasses: number;
    skippedUnloadedClasses: readonly string[];
}

function describeFieldNames(entries: readonly IRuntimeStateFieldModelEntry[] | readonly { name: string; kind: FieldKind }[]): string {
    return entries.map((entry) => entry.name)
        .join(', ');
}

function compareFieldSets(
    className: string,
    runtimeFields: readonly IRuntimeStateFieldModelEntry[],
    generatedFields: readonly { name: string; kind: FieldKind }[]
): string | null {
    const runtimeByName = new Map(runtimeFields.map((field) => [field.name, field.kind]));
    const generatedByName = new Map(generatedFields.map((field) => [field.name, field.kind]));

    const missingFromGenerator = runtimeFields.filter((field) => !generatedByName.has(field.name));
    const missingFromRuntime = generatedFields.filter((field) => !runtimeByName.has(field.name));
    const kindMismatches: string[] = [];
    for (const [name, runtimeKind] of runtimeByName) {
        const generatedKind = generatedByName.get(name);
        if (generatedKind !== undefined && generatedKind !== runtimeKind) {
            kindMismatches.push(`${name} (runtime=${runtimeKind}, generated=${generatedKind})`);
        }
    }

    if (missingFromGenerator.length === 0 && missingFromRuntime.length === 0 && kindMismatches.length === 0) {
        return null;
    }

    return `class "${className}": missingFromGenerator=[${describeFieldNames(missingFromGenerator)}] missingFromRuntime=[${describeFieldNames(missingFromRuntime)}] kindMismatches=[${kindMismatches.join(', ')}]`;
}

export function checkStateSerializerCoverage(options?: ICoverageCheckOptions): ICoverageCheckResult {
    const generatedEntries = options?.generatedEntries ?? getAllGeneratedSerializerEntries();
    const excludedFragmentClassNames = options?.excludedFragmentClassNames ?? getExcludedFragmentClassNames();
    const runtimeFieldModelLookup = options?.runtimeFieldModelLookup ?? getRuntimeStateFieldModelByClassName;
    const runtimeRegisteredClassNames = options?.runtimeRegisteredClassNames ?? [...registeredStateClassesByName.keys()];
    const treatUnloadedClassAsSkip = options?.treatUnloadedClassAsSkip ?? false;

    // Forward pass: aggregate every problem before throwing, so a real drift on one class can never mask an
    // unrelated one, and so the reverse pass never runs when the forward pass already has something to report.
    const problems: string[] = [];
    const skippedUnloadedClasses: string[] = [];
    let checkedClasses = 0;

    for (const entry of generatedEntries) {
        const runtimeFields = runtimeFieldModelLookup(entry.className);
        if (runtimeFields === undefined) {
            if (treatUnloadedClassAsSkip) {
                skippedUnloadedClasses.push(entry.className);
            } else {
                problems.push(`class "${entry.className}": missing at runtime (module never loaded, renamed, or deleted)`);
            }
            continue;
        }

        const problem = compareFieldSets(entry.className, runtimeFields, entry.fields);
        if (problem) {
            problems.push(problem);
        } else {
            checkedClasses++;
        }
    }

    if (problems.length > 0) {
        throw new Error(`[StateSerializerCoverageCheck] field-model coverage failed for ${problems.length} class(es):\n${problems.join('\n')}`);
    }

    // Reverse pass: only reached once the forward pass found nothing to report.
    const generatedClassNames = new Set(generatedEntries.map((entry) => entry.className));
    const excludedFragmentClassNamesSet = new Set(excludedFragmentClassNames);
    for (const className of runtimeRegisteredClassNames) {
        if (!generatedClassNames.has(className) && !excludedFragmentClassNamesSet.has(className)) {
            throw new Error(`[StateSerializerCoverageCheck] class "${className}" is registered at runtime (@registerState/@registerStateBase) but is absent from both the generated serializer model and the known excluded-fragment list — the generated artifact is likely stale; run npm run generate-serializers.`);
        }
    }

    return { checkedClasses, skippedUnloadedClasses };
}

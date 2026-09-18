import { cards } from '../../../server/game/cards/Index';
import { checkStateSerializerCoverage } from '../../../server/game/core/StateSerializerCoverageCheck';
import { getAllGeneratedSerializerEntries, getExcludedFragmentClassNames } from '../../../server/game/core/StateSerializers';
import type { FieldKind, IGeneratedSerializerEntry } from '../../../server/game/core/StateEncoding';

/**
 * `P3-PA4`: the force-load spec (`AC3`) plus the falsifiers (`AC5`/`AC6`/`AC7`) for `checkStateSerializerCoverage`.
 *
 * `cards` from `server/game/cards/Index` force-loads every module containing a registered class, including
 * card-file-local classes (`FirstLightSmuggleAction` and friends) that no other spec in this file's worker is
 * guaranteed to have already loaded. `AC3` below relies on this having already happened at module-evaluation
 * time (the top-level `expect(cards.size).toBeGreaterThan(0)` inside the `it` proves it was non-vacuous).
 *
 * Every case here passes a restricted, explicit `runtimeRegisteredClassNames` - the generator's own known
 * class names - rather than reading the live `registeredStateClassesByName` registry raw. This is required
 * for determinism under `--parallel` worker scheduling: `GameObjectUtils.spec.ts` and this repo's other
 * `@registerState` test fixtures may legitimately be co-loaded in the same worker process, and those
 * fixtures are expected registry members, not a coverage defect (plan.md §2.7).
 */
describe('checkStateSerializerCoverage', function() {
    it('force-loads every card module (non-vacuousness precondition)', function() {
        expect(cards.size).toBeGreaterThan(0);
    });

    function restrictedRuntimeRegisteredClassNames(): string[] {
        return getAllGeneratedSerializerEntries().map((entry) => entry.className);
    }

    function cloneEntries(): IGeneratedSerializerEntry[] {
        return getAllGeneratedSerializerEntries().map((entry) => ({
            ...entry,
            fields: entry.fields.map((field) => ({ ...field })),
        }));
    }

    it('AC3: passes with full, non-degenerate coverage against the real generated model and real runtime field model', function() {
        const realEntries = getAllGeneratedSerializerEntries();
        expect(realEntries.length).toBeGreaterThan(0);

        const result = checkStateSerializerCoverage({
            runtimeRegisteredClassNames: restrictedRuntimeRegisteredClassNames(),
        });

        expect(result.checkedClasses).toBe(realEntries.length);
        expect(result.skippedUnloadedClasses.length).toBe(0);
    });

    it('AC5: throws, naming the class and field under missingFromGenerator, when a field present at runtime is removed from a cloned generated entry', function() {
        const clonedEntries = cloneEntries();
        const targetEntry = clonedEntries.find((entry) => entry.fields.length > 0);
        expect(targetEntry).toBeDefined();

        const removedField = targetEntry.fields[0];
        // Baseline (non-vacuousness): the field really is present before we remove it.
        expect(getAllGeneratedSerializerEntries()
            .find((entry) => entry.className === targetEntry.className).fields
            .some((field) => field.name === removedField.name)).toBe(true);

        targetEntry.fields = targetEntry.fields.filter((field) => field.name !== removedField.name);

        expect(() => checkStateSerializerCoverage({
            generatedEntries: clonedEntries,
            runtimeRegisteredClassNames: restrictedRuntimeRegisteredClassNames(),
        })).toThrowError(new RegExp(`class "${targetEntry.className}".*missingFromGenerator=\\[[^\\]]*${removedField.name}`));
    });

    it('AC6: throws, naming the class, field, and both kinds under kindMismatches, when a field\'s kind is flipped in a cloned generated entry', function() {
        const clonedEntries = cloneEntries();
        const targetEntry = clonedEntries.find((entry) => entry.fields.length > 0);
        expect(targetEntry).toBeDefined();

        const targetField = targetEntry.fields[0];
        const runtimeKind = getAllGeneratedSerializerEntries()
            .find((entry) => entry.className === targetEntry.className).fields
            .find((field) => field.name === targetField.name).kind;

        const flippedKind: FieldKind = runtimeKind === 'primitive' ? 'value' : 'primitive';
        targetField.kind = flippedKind;

        expect(() => checkStateSerializerCoverage({
            generatedEntries: clonedEntries,
            runtimeRegisteredClassNames: restrictedRuntimeRegisteredClassNames(),
        })).toThrowError(new RegExp(`class "${targetEntry.className}".*kindMismatches=\\[[^\\]]*${targetField.name} \\(runtime=${runtimeKind}, generated=${flippedKind}\\)`));
    });

    it('AC7: reverse pass throws naming a synthetic class name absent from both the generated entries and the excluded-fragment list', function() {
        expect(() => checkStateSerializerCoverage({
            runtimeRegisteredClassNames: [...restrictedRuntimeRegisteredClassNames(), 'SyntheticNewClass'],
        })).toThrowError(/SyntheticNewClass/);
    });

    it('AC7 companion: reverse pass does not throw for a real, known excluded-fragment class name', function() {
        expect(getExcludedFragmentClassNames()).toContain('WithDamage');

        expect(() => checkStateSerializerCoverage({
            runtimeRegisteredClassNames: [...restrictedRuntimeRegisteredClassNames(), 'WithDamage'],
        })).not.toThrow();
    });

    it('B8/B9: a generator entry with no runtime field model is skipped when treatUnloadedClassAsSkip=true, and reported as a missing-class problem when false (the spec default)', function() {
        const syntheticEntry: IGeneratedSerializerEntry = {
            className: 'ClassNeverLoadedAtRuntimeFixture',
            decorator: 'registerState',
            isAbstract: false,
            fields: [],
            serializer: { serialize: () => ({}), deserialize: () => undefined },
        };

        const skippedResult = checkStateSerializerCoverage({
            generatedEntries: [syntheticEntry],
            runtimeRegisteredClassNames: [],
            treatUnloadedClassAsSkip: true,
        });
        expect(skippedResult.skippedUnloadedClasses).toEqual(['ClassNeverLoadedAtRuntimeFixture']);
        expect(skippedResult.checkedClasses).toBe(0);

        expect(() => checkStateSerializerCoverage({
            generatedEntries: [syntheticEntry],
            runtimeRegisteredClassNames: [],
            treatUnloadedClassAsSkip: false,
        })).toThrowError(/ClassNeverLoadedAtRuntimeFixture.*missing at runtime/);
    });
});

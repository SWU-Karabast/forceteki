import { Aspect } from '../../../server/game/core/Constants';
import type { OpponentArchetype } from '../../../server/utils/archetypeFilter';
import { deckMatchesArchetypeFilter } from '../../../server/utils/archetypeFilter';

describe('deckMatchesArchetypeFilter', function() {
    describe('empty filter', function() {
        it('rejects (fail-closed: no active archetypes = no joiner accepted)', function() {
            expect(deckMatchesArchetypeFilter([], 'SOR_001', 'SOR_022', [Aspect.Command])).toBeFalse();
        });

        it('rejects when every archetype is explicitly disabled', function() {
            const filter: OpponentArchetype[] = [{ leaderId: 'SOR_001', enabled: false }];
            expect(deckMatchesArchetypeFilter(filter, 'SOR_001', 'SOR_022', [Aspect.Command])).toBeFalse();
        });
    });

    describe('leader-only archetype', function() {
        it('matches when leader id matches (any base)', function() {
            const filter: OpponentArchetype[] = [{ leaderId: 'SOR_005' }];
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_999', [Aspect.Villainy])).toBeTrue();
        });

        it('rejects when leader id mismatches', function() {
            const filter: OpponentArchetype[] = [{ leaderId: 'SOR_005' }];
            expect(deckMatchesArchetypeFilter(filter, 'SOR_001', 'SOR_022', [Aspect.Command])).toBeFalse();
        });

        it('rejects when joiner has no leader', function() {
            const filter: OpponentArchetype[] = [{ leaderId: 'SOR_005' }];
            expect(deckMatchesArchetypeFilter(filter, undefined, 'SOR_022', [Aspect.Command])).toBeFalse();
        });
    });

    describe('leader + aspect base constraint', function() {
        const filter: OpponentArchetype[] = [{
            leaderId: 'SOR_005',
            baseConstraint: { kind: 'aspect', aspect: Aspect.Command },
        }];

        it('matches when joiner base carries the required aspect', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_022', [Aspect.Command])).toBeTrue();
        });

        it('rejects when joiner base lacks the required aspect', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_022', [Aspect.Vigilance])).toBeFalse();
        });

        it('rejects when joiner base aspects are unknown', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_022', undefined)).toBeFalse();
        });
    });

    describe('leader + specific baseType constraint', function() {
        const filter: OpponentArchetype[] = [{
            leaderId: 'SOR_005',
            baseConstraint: { kind: 'baseType', baseIds: ['SOR_022', 'LOF_023'] },
        }];

        it('matches when joiner base is in the allowlist', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'LOF_023', [Aspect.Vigilance])).toBeTrue();
        });

        it('rejects when joiner base is not in the allowlist', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_999', [Aspect.Vigilance])).toBeFalse();
        });
    });

    describe('multiple archetypes', function() {
        const filter: OpponentArchetype[] = [
            { leaderId: 'SOR_001' },
            { leaderId: 'SOR_005', baseConstraint: { kind: 'aspect', aspect: Aspect.Command } },
        ];

        it('matches when any archetype matches', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_005', 'SOR_022', [Aspect.Command])).toBeTrue();
        });

        it('rejects when no archetype matches', function() {
            expect(deckMatchesArchetypeFilter(filter, 'SOR_999', 'SOR_022', [Aspect.Command])).toBeFalse();
        });

        it('skips disabled archetypes when evaluating', function() {
            const partiallyDisabled: OpponentArchetype[] = [
                { leaderId: 'SOR_001', enabled: false },
                { leaderId: 'SOR_005' },
            ];
            expect(deckMatchesArchetypeFilter(partiallyDisabled, 'SOR_001', 'SOR_022', [Aspect.Command])).toBeFalse();
            expect(deckMatchesArchetypeFilter(partiallyDisabled, 'SOR_005', 'SOR_022', [Aspect.Command])).toBeTrue();
        });
    });
});

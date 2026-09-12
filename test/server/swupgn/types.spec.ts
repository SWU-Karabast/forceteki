import type { AbilityKind, DefeatReason, SwuPgnDocument, GameEvent, ReducedState, Header } from '../../../swupgn/src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('swupgn types', function () {
    it('models a minimal document', function () {
        const header: Header = {
            game: 'SWU-PGN/1.0', gameId: 'g1', date: '2026-06-16T00:00:00Z',
            cardPool: 'LOF', engine: 'forceteki@2.3.1', seed: 'abc',
            perspective: 'P1', p1Id: 'sha256:a', p2Id: 'sha256:b',
            p1: 'Player 1', p2: 'Player 2',
            p1Leader: 'SOR#010', p1Base: 'SOR#028', p2Leader: 'SOR#005', p2Base: 'SOR#020',
            result: 'P1', reason: 'BaseDestroyed', rounds: 4,
        };
        const ev: GameEvent = { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground', cost: 2 };
        const doc: SwuPgnDocument = { header, decks: [], setup: [], events: [ev], annotations: [] };
        const empty: ReducedState = { round: 0, phase: 'setup', initiative: null, players: {} };
        expect(doc.events[0].t).toBe('PLAY');
        expect(empty.round).toBe(0);
    });
});

// A closed vocabulary in this format lives in four places: the TS alias, the JSON Schema enum,
// the spec table and the writer. TypeScript can police the first and the last; nothing policed
// the schema, so a kind added in one place and forgotten in another would ship a file the
// reference validator rejects. These two tests are that missing check.
describe('swupgn closed vocabularies stay in lockstep', function () {
    const schema = JSON.parse(fs.readFileSync(
        path.resolve(__dirname, '../../../../swupgn/schema/event.schema.json'), 'utf8')) as any;

    const enumFor = (t: string, field: string): string[] => {
        const branch = schema.allOf.find((b: any) =>
            b.if?.properties?.t?.const === t ||
            (Array.isArray(b.if?.properties?.t?.enum) && b.if.properties.t.enum.includes(t)));
        return branch?.then?.properties?.[field]?.enum ?? [];
    };

    it('ABILITY_ACTIVATE.kind: the AbilityKind alias equals the schema enum', function () {
        // The compiler enforces this list is exhaustive over AbilityKind: drop a member and
        // the Record below stops type-checking.
        const exhaustive: Record<AbilityKind, true> = {
            action: true, epic: true, triggered: true, keyword: true, replacement: true, constant: true,
        };
        expect(Object.keys(exhaustive).sort()).toEqual(enumFor('ABILITY_ACTIVATE', 'kind').sort());
    });

    it('DEFEAT.reason: the DefeatReason alias equals the schema enum', function () {
        const exhaustive: Record<DefeatReason, true> = {
            attack: true, ability: true, nonCombatDamage: true,
            uniqueRule: true, frameworkEffect: true, unknown: true,
        };
        expect(Object.keys(exhaustive).sort()).toEqual(enumFor('DEFEAT', 'reason').sort());
    });
});

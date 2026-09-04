import { SwuPgnWriter } from '../../../server/game/core/chat/SwuPgnWriter';
import type { Header, DeckRecord, GameEvent, Annotation, SetupInitRecord } from '../../../swupgn/src/types';
import { parse, validate } from '../../../swupgn/src/index';
import * as integrity from '../../../swupgn/src/integrity';
import { logger } from '../../../server/logger';

describe('SwuPgnWriter', function () {
    const header: Header = {
        game: 'SWU-PGN/1.0', gameId: 'g1', date: '2026-06-16T00:00:00Z',
        format: 'Premier', cardPool: 'SOR', engine: 'forceteki@test',
        seed: 'seed-1', perspective: null,
        p1Id: 'sha256:aaaa', p2Id: 'sha256:bbbb', p1: 'Player 1', p2: 'Player 2',
        p1Leader: 'SOR#010', p1Base: 'SOR#028', p2Leader: 'SOR#005', p2Base: 'SOR#020',
        result: 'Incomplete', reason: 'Sample', rounds: 1,
    };
    const decks: DeckRecord[] = [{ p: 1, leader: 'SOR#010', base: 'SOR#028', deck: [['SOR#108', 3]] },
        { p: 2, leader: 'SOR#005', base: 'SOR#020', deck: [['SOR#045', 3]] }];
    const setup: SetupInitRecord[] = [{ seq: 'R1.S.0', t: 'INIT', p1DeckOrder: ['SOR#108'], p2DeckOrder: ['SOR#045'] }];
    const events: GameEvent[] = [
        { seq: 'R1.A.start', t: 'PHASE_START', phase: 'action' },
        { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground', cost: 2 },
    ];
    const annotations: Annotation[] = [];

    it('serializes a document the Plan 1 reader parses and validates', function () {
        const text = new SwuPgnWriter().write({ header, decks, setup, events, annotations });
        const report = validate(text);
        expect(report.valid).toBe(true);
        const doc = parse(text);
        expect(doc.header.game).toBe('SWU-PGN/1.0');
        expect(doc.decks.length).toBe(2);
        expect(doc.events.length).toBe(2);
        expect(doc.setup.length).toBe(1);
    });

    it('emits header tags, %%% banners, and one NDJSON record per line', function () {
        const text = new SwuPgnWriter().write({ header, decks, setup, events, annotations });
        expect(text).toContain('[Game "SWU-PGN/1.0"]');
        expect(text).toContain('%%% DECKS');
        expect(text).toContain('%%% SETUP');
        expect(text).toContain('%%% EVENTS');
        expect(text).toContain('%%% ANNOTATIONS');
        const evLine = text.split('\n').find((l) => l.includes('"t":"PLAY"'));
        expect(evLine).toBeDefined();
        expect(() => JSON.parse(evLine!)).not.toThrow();
    });

    it('escapeTag: collapses newlines to space and preserves escaped double-quotes', function () {
        const dirtyHeader: Header = {
            ...header,
            reason: 'he said "go"\nthen left',
        };
        const text = new SwuPgnWriter().write({ header: dirtyHeader, decks, setup, events, annotations });
        const doc = parse(text);
        expect(doc.header.reason).toBe('he said "go" then left');
    });
    describe('keyframe integrity gate', function () {
        // The gate reports and never blocks: keyframes stay authoritative, so a reader still
        // gets every round boundary, and withholding the file would cost a player the whole
        // replay over a partial-fidelity problem.
        function keyframeEvents(handSize: number): GameEvent[] {
            const seat = (p: 1 | 2) => ({
                seat: p, baseHp: 30, baseMaxHp: 30, handSize, hand: [], resourcesReady: 0,
                resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [],
            });
            return [{
                seq: 'R1.start', t: 'ROUND_START', round: 1,
                keyframe: { round: 1, phase: 'setup', initiative: null, players: { 1: seat(1), 2: seat(2) } },
            } as unknown as GameEvent];
        }

        it('logs the mismatches but still emits the file', function () {
            const errorSpy = spyOn(logger, 'error');

            // A keyframe claiming 9 cards in hand that no MOVE stream accounts for.
            const text = new SwuPgnWriter().write({
                header, decks, setup, events: keyframeEvents(9), annotations,
            });

            expect(text).toEqual(jasmine.any(String));
            expect(text.length).toBeGreaterThan(0);
            expect(errorSpy).toHaveBeenCalled();
            expect(errorSpy.calls.mostRecent().args[0]).toContain('keyframe integrity check failed');
        });

        it('warns but still emits when the gate itself throws', function () {
            const warnSpy = spyOn(logger, 'warn');
            spyOn(integrity, 'checkKeyframes').and.throwError('gate exploded');

            const text = new SwuPgnWriter().write({ header, decks, setup, events, annotations });

            expect(text).toEqual(jasmine.any(String));
            expect(warnSpy).toHaveBeenCalled();
            expect(warnSpy.calls.mostRecent().args[0]).toContain('could not run');
        });
    });
});

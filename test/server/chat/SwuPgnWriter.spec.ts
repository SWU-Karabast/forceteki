import { SwuPgnWriter } from '../../../server/game/core/chat/SwuPgnWriter';
import type { Header, DeckRecord, GameEvent, Annotation, SetupInitRecord } from '../../../swupgn/src/types';
import { parse, validate } from '../../../swupgn/src/index';

describe('SwuPgnWriter', function () {
    const header: Header = {
        game: 'SWU-PGN/1.1', gameId: 'g1', date: '2026-06-16T00:00:00Z',
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
        expect(doc.header.game).toBe('SWU-PGN/1.1');
        expect(doc.decks.length).toBe(2);
        expect(doc.events.length).toBe(2);
        expect(doc.setup.length).toBe(1);
    });

    it('emits header tags, %%% banners, and one NDJSON record per line', function () {
        const text = new SwuPgnWriter().write({ header, decks, setup, events, annotations });
        expect(text).toContain('[Game "SWU-PGN/1.1"]');
        expect(text).toContain('%%% DECKS');
        expect(text).toContain('%%% SETUP');
        expect(text).toContain('%%% EVENTS');
        expect(text).toContain('%%% ANNOTATIONS');
        const evLine = text.split('\n').find((l) => l.includes('"t":"PLAY"'));
        expect(evLine).toBeDefined();
        expect(() => JSON.parse(evLine!)).not.toThrow();
    });
});

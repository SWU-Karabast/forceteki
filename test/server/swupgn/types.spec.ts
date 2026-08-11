import type { SwuPgnDocument, GameEvent, ReducedState, Header } from '../../../swupgn/src/types';

describe('swupgn types', function () {
    it('models a minimal document', function () {
        const header: Header = {
            game: 'SWU-PGN/1.1', gameId: 'g1', date: '2026-06-16T00:00:00Z',
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

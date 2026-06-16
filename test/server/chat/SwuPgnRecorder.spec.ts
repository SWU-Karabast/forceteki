import { buildHeader } from '../../../server/game/core/chat/SwuPgnRecorder';
import { saltedPlayerId } from '../../../server/game/core/chat/swuPgnIdentity';

describe('SwuPgnRecorder.buildHeader', function () {
    const ctx = {
        gameId: 'game-xyz',
        date: '2026-06-16T12:00:00Z',
        format: 'Premier',
        cardPool: 'SOR',
        engineVersion: 'forceteki@test',
        seed: 'seed-1',
        perspective: null as null | 'P1' | 'P2',
        rounds: 4,
        result: 'P1' as const,
        reason: 'BaseDestroyed',
        p1: { username: 'alice', leader: 'SOR#010', base: 'SOR#028' },
        p2: { username: 'bob', leader: 'SOR#005', base: 'SOR#020' },
    };

    it('emits a 1.1 header with provenance and salted ids', function () {
        const h = buildHeader(ctx);
        expect(h.game).toBe('SWU-PGN/1.1');
        expect(h.cardPool).toBe('SOR');
        expect(h.engine).toBe('forceteki@test');
        expect(h.seed).toBe('seed-1');
        expect(h.rounds).toBe(4);
        expect(h.result).toBe('P1');
    });

    it('never leaks real usernames; uses salted ids + anonymized labels', function () {
        const h = buildHeader(ctx);
        expect(h.p1).toBe('Player 1');
        expect(h.p2).toBe('Player 2');
        expect(h.p1Id).toBe(saltedPlayerId('alice', 'game-xyz'));
        expect(h.p2Id).toBe(saltedPlayerId('bob', 'game-xyz'));
        expect(JSON.stringify(h)).not.toContain('alice');
        expect(JSON.stringify(h)).not.toContain('bob');
    });
});

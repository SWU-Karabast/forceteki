import { saltedPlayerId, anonymizePlayerLabel } from '../../../server/game/core/chat/swuPgnIdentity';

describe('swuPgnIdentity', function () {
    it('produces a sha256:-prefixed, non-reversible id', function () {
        const id = saltedPlayerId('alice', 'game-salt');
        expect(id.startsWith('sha256:')).toBe(true);
        expect(id).not.toContain('alice');
        expect(id.length).toBeGreaterThan('sha256:'.length + 16);
    });

    it('is deterministic for the same (username, salt)', function () {
        expect(saltedPlayerId('alice', 's')).toBe(saltedPlayerId('alice', 's'));
    });

    it('differs across salts (per-game unlinkability)', function () {
        expect(saltedPlayerId('alice', 's1')).not.toBe(saltedPlayerId('alice', 's2'));
    });

    it('maps seats to anonymized display labels', function () {
        expect(anonymizePlayerLabel(1)).toBe('Player 1');
        expect(anonymizePlayerLabel(2)).toBe('Player 2');
    });
});

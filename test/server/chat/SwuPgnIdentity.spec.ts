import { saltedPlayerId, anonymizedMatchId, anonymizePlayerLabel } from '../../../server/game/core/chat/swuPgnIdentity';

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

    describe('with SWUPGN_ID_SECRET set', function () {
        // SWUPGN_ID_SECRET switches the scheme to an HMAC: genuinely non-reversible without the
        // key, and STABLE for a player across that server's games, so a consumer can group one
        // player's history without learning who they are. SWUForge cleared this explicitly --
        // the seat comes from the authenticated delivery, never from re-hashing a username, so
        // nothing depends on the per-game salt any more.
        let previous: string | undefined;

        beforeEach(function () {
            previous = process.env.SWUPGN_ID_SECRET;

            process.env.SWUPGN_ID_SECRET = 'server-secret';
        });

        afterEach(function () {
            if (previous === undefined) {
                delete process.env.SWUPGN_ID_SECRET;
            } else {
                process.env.SWUPGN_ID_SECRET = previous;
            }
        });

        it('still looks like every other id, so no reader can tell the schemes apart', function () {
            const id = saltedPlayerId('alice', 'game-salt');
            expect(id.startsWith('sha256:')).toBe(true);
            expect(id).not.toContain('alice');
        });

        it('is the SAME across games -- the salt no longer participates', function () {
            expect(saltedPlayerId('alice', 'game-1')).toBe(saltedPlayerId('alice', 'game-2'));
        });

        it('still separates different players, and differs from the unkeyed scheme', function () {
            expect(saltedPlayerId('alice', 'g')).not.toBe(saltedPlayerId('bob', 'g'));
            process.env.SWUPGN_ID_SECRET = 'another-secret';
            const other = saltedPlayerId('alice', 'g');
            delete process.env.SWUPGN_ID_SECRET;
            expect(other).not.toBe(saltedPlayerId('alice', 'g'));
        });
    });

    // The match id groups the games of one Bo3, so unlike a player id it must NOT vary per game.
    describe('anonymizedMatchId', function () {
        it('is opaque and never carries the lobby id', function () {
            const id = anonymizedMatchId('lobby-abc-123');
            expect(id.startsWith('sha256:')).toBe(true);
            expect(id).not.toContain('lobby-abc-123');
        });

        it('is STABLE for one lobby -- every game of a match shares it', function () {
            expect(anonymizedMatchId('lobby-1')).toBe(anonymizedMatchId('lobby-1'));
        });

        it('separates different lobbies', function () {
            expect(anonymizedMatchId('lobby-1')).not.toBe(anonymizedMatchId('lobby-2'));
        });
    });

    it('maps seats to anonymized display labels', function () {
        expect(anonymizePlayerLabel(1)).toBe('Player 1');
        expect(anonymizePlayerLabel(2)).toBe('Player 2');
    });
});

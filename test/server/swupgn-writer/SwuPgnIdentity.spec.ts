import { anonymizedGameId, anonymizedMatchId, anonymizePlayerLabel, idSecretStartupError, saltedPlayerId } from '../../../server/game/core/swupgn/swuPgnIdentity';

const sha256Id = /^sha256:[0-9a-f]{64}$/;

// Pure functions; the integration() wrapper only puts the spec in the game group with the other writer specs.
describe('SWU-PGN identity', function() {
    integration(function() {
        it('produces a sha256:-prefixed, non-reversible id (W-57)', function () {
            const id = saltedPlayerId('alice', 'game-salt');
            expect(id).toMatch(sha256Id);
            expect(id).not.toContain('alice');
        });

        it('is deterministic for the same account and salt', function () {
            expect(saltedPlayerId('alice', 's')).toBe(saltedPlayerId('alice', 's'));
        });

        it('differs across salts (per-game unlinkability)', function () {
            expect(saltedPlayerId('alice', 's1')).not.toBe(saltedPlayerId('alice', 's2'));
        });

        describe('with SWUPGN_ID_SECRET set', function () {
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
                expect(id).toMatch(sha256Id);
                expect(id).not.toContain('alice');
            });

            it('is the same across games: the salt no longer participates', function () {
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

        // The match id groups the games of one Bo3, so unlike a player id it must not vary per game.
        describe('anonymizedMatchId', function () {
            it('is opaque and never carries the lobby id (W-58)', function () {
                const id = anonymizedMatchId('lobby-abc-123');
                expect(id).toMatch(sha256Id);
                expect(id).not.toContain('lobby-abc-123');
            });

            it('is stable for one lobby: every game of a match shares it', function () {
                expect(anonymizedMatchId('lobby-1')).toBe(anonymizedMatchId('lobby-1'));
            });

            it('separates different lobbies', function () {
                expect(anonymizedMatchId('lobby-1')).not.toBe(anonymizedMatchId('lobby-2'));
            });
        });

        describe('anonymizedGameId', function () {
            it('is opaque, stable, and never the match id of the same string (W-58)', function () {
                const id = anonymizedGameId('game-1');
                expect(id).toMatch(sha256Id);
                expect(id).not.toContain('game-1');
                expect(anonymizedGameId('game-1')).toBe(id);
                expect(anonymizedGameId('game-2')).not.toBe(id);
                expect(anonymizedMatchId('game-1')).not.toBe(id);
            });
        });

        it('maps seats to anonymized display labels', function () {
            expect(anonymizePlayerLabel(1)).toBe('Player 1');
            expect(anonymizePlayerLabel(2)).toBe('Player 2');
        });

        it('reports a missing id secret at startup only in production', function () {
            expect(idSecretStartupError({ ENVIRONMENT: 'production' })).toContain('SWUPGN_ID_SECRET');
            expect(idSecretStartupError({ ENVIRONMENT: 'production', SWUPGN_ID_SECRET: '' })).toContain('SWUPGN_ID_SECRET');
            expect(idSecretStartupError({ ENVIRONMENT: 'production', SWUPGN_ID_SECRET: 'k' })).toBeUndefined();
            expect(idSecretStartupError({ ENVIRONMENT: 'development' })).toBeUndefined();
        });
    });
});

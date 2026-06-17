import { SwuPgn } from '../../../server/game/core/chat/SwuPgn';

describe('SwuPgn', function () {
    // ── formatSetId ──────────────────────────────────────────────────────────
    describe('formatSetId', function () {
        it('zero-pads a single-digit number to 3 digits', function () {
            expect(SwuPgn.formatSetId('sor', 5)).toBe('SOR#005');
        });

        it('zero-pads a two-digit number to 3 digits', function () {
            expect(SwuPgn.formatSetId('sor', 42)).toBe('SOR#042');
        });

        it('does not pad a three-digit number', function () {
            expect(SwuPgn.formatSetId('sor', 123)).toBe('SOR#123');
        });

        it('uppercases the set identifier', function () {
            expect(SwuPgn.formatSetId('shd', 7)).toBe('SHD#007');
        });
    });

    // ── formatCardName ───────────────────────────────────────────────────────
    describe('formatCardName', function () {
        it('returns just the title when no subtitle provided', function () {
            expect(SwuPgn.formatCardName('Luke Skywalker')).toBe('Luke Skywalker');
        });

        it('returns "Title, Subtitle" when subtitle is provided', function () {
            expect(SwuPgn.formatCardName('Luke Skywalker', 'Faithful Friend')).toBe('Luke Skywalker, Faithful Friend');
        });

        it('returns just the title when subtitle is undefined', function () {
            expect(SwuPgn.formatCardName('Chewbacca', undefined)).toBe('Chewbacca');
        });
    });
});

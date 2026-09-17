import { Randomness } from '../../../server/game/core/Randomness';

describe('Randomness seed exposure', function () {
    it('exposes the seed it was constructed with', function () {
        const r = new Randomness('abc-123');
        expect(r.seed).toBe('abc-123');
    });

    it('updates the exposed seed after reseed', function () {
        const r = new Randomness('first');
        r.reseed('second');
        expect(r.seed).toBe('second');
    });

    it('returns undefined when constructed with no seed', function () {
        const r = new Randomness();
        expect(r.seed).toBeUndefined();
    });
});

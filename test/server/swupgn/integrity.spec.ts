import { checkKeyframes } from '../../../swupgn/src/integrity';
import type { GameEvent } from '../../../swupgn/src/types';

describe('checkKeyframes', function () {
    it('passes when the fold matches each keyframe', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'X', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: {
                round: 2, phase: 'setup', initiative: null,
                players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                           2: { seat: 2, baseHp: 28, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } },
        ];
        expect(checkKeyframes(events).ok).toBe(true);
    });

    it('fails when an event delta is missing before a keyframe', function () {
        const events: GameEvent[] = [
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: {
                round: 2, phase: 'setup', initiative: null,
                players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                           2: { seat: 2, baseHp: 28, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } },
        ];
        const r = checkKeyframes(events);
        expect(r.ok).toBe(false);
        expect(r.mismatches[0].seq).toBe('R2.start');
    });
});

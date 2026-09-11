import { linkActionSteps } from '../../../swupgn/src/actionLinks';
import type { GameEvent } from '../../../swupgn/src/types';

/**
 * `for` backfill (spec §9.1). The engine numbers a record when it arrives, so the steps an
 * action performs BEFORE announcing itself carry the previous action's number. The writer files
 * them, so a reader never has to implement §9.1's prose heuristic.
 */
describe('linkActionSteps', function () {
    const forOf = (events: GameEvent[]) =>
        linkActionSteps(events).map((e) => (e as { for?: string }).for);

    it('files a play\'s cost, move, stats and exhaust under the play', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.start', t: 'PHASE_START', phase: 'action' },
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.0c', t: 'STATS', card: 'SOR#095', power: 3, hp: 3 },
            { seq: 'R1.A.0d', t: 'EXHAUST', card: 'SOR#095' },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(forOf(events)).toEqual([
            undefined, 'R1.A.1', 'R1.A.1', 'R1.A.1', 'R1.A.1', undefined,
        ]);
    });

    it('files an attack\'s target choice and attacker exhaust under the attack', function () {
        const events: GameEvent[] = [
            { seq: 'R2.A.5', t: 'PASS', p: 2 },
            { seq: 'R2.A.5a', t: 'CHOICE', p: 1, prompt: 'Death Star Stormtrooper', offered: ['base@2'], chose: 0 },
            { seq: 'R2.A.5b', t: 'EXHAUST', card: 'SOR#128:2' },
            { seq: 'R2.A.6', t: 'ATTACK', p: 1, atk: 'SOR#128:2', def: 'base@2', defenderType: 'base' },
        ];
        expect(forOf(events)).toEqual([undefined, 'R2.A.6', 'R2.A.6', undefined]);
    });

    // The whole reason the recorder cannot do this itself: a previous action's genuine
    // consequences sit in exactly the same place, and a naive "everything immediately before"
    // rule would steal them.
    it('never files a previous action\'s consequences under the next action', function () {
        const events: GameEvent[] = [
            { seq: 'R3.A.13', t: 'ATTACK', p: 1, atk: 'SOR#128:2', def: 'base@2', defenderType: 'base' },
            { seq: 'R3.A.13a', t: 'DAMAGE', src: 'SOR#128:2', tgt: 'base@2', amt: 3, damageType: 'combat', hp: 27 },
            { seq: 'R3.A.14', t: 'PASS', p: 2 },
        ];
        expect(forOf(events)).toEqual([undefined, undefined, undefined]);
    });

    // A run with nothing naming the action's card is just as likely to be the PREVIOUS action's
    // tail, so it is left alone: a wrong link is worse than no link.
    it('leaves an unanchored run alone', function () {
        const events: GameEvent[] = [
            { seq: 'R2.A.3', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
            { seq: 'R2.A.3a', t: 'CHOICE', p: 1, prompt: 'Wampa', offered: ['SOR#128'], chose: 0 },
            { seq: 'R2.A.4', t: 'ATTACK', p: 1, atk: 'LAW#253', def: 'base@2', defenderType: 'base' },
        ];
        expect(forOf(events)).toEqual([undefined, undefined, undefined]);
    });

    // An AMBUSH unit is played and attacks in the same phase, so the play's own MOVE and STATS
    // sit immediately before the ATTACK and name the same card. They belong to the PLAY, which
    // already owns them through its step number; only the target choice and the attacker's
    // exhaust belong to the attack. A shared precursor set filed all four under the attack.
    it('does not steal a play\'s own records when the same card attacks next (Ambush)', function () {
        const events: GameEvent[] = [
            { seq: 'R2.A.3', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
            { seq: 'R2.A.3a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R2.A.3b', t: 'STATS', card: 'SOR#095', power: 3, hp: 3 },
            { seq: 'R2.A.3c', t: 'CHOICE', p: 1, prompt: 'Wampa', offered: ['base@2'], chose: 0 },
            { seq: 'R2.A.3d', t: 'EXHAUST', card: 'SOR#095' },
            { seq: 'R2.A.4', t: 'ATTACK', p: 1, atk: 'SOR#095', def: 'base@2', defenderType: 'base' },
        ];
        expect(forOf(events)).toEqual([
            undefined, undefined, undefined, 'R2.A.4', 'R2.A.4', undefined,
        ]);
    });

    it('does not mutate its input, and is idempotent', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        const once = linkActionSteps(events);
        expect((events[0] as { for?: string }).for).toBeUndefined();
        expect(forOf(once)).toEqual(forOf(events));
    });
});

import { coalesceResourceReadies, isTopLevelActionRecord, linkActionSteps } from '../../../swupgn/src/actionLinks';
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

    // Beast Lair's "When the action phase starts" trigger creates a Beast before the first action,
    // so the Beast's own arrival -- MOVE, STATS, the entering EXHAUST -- sits right in front of the
    // first play's precursors and has the same record types. It is the trigger's, not the play's.
    it('never files another card\'s arrival into play under the next play', function () {
        const events: GameEvent[] = [
            { seq: 'R2.A.0a', t: 'ABILITY_ACTIVATE', p: 1, card: 'base@1', kind: 'triggered', grantedBy: 'HMW#147' },
            { seq: 'R2.A.0e', t: 'CREATE_TOKEN', p: 1, token: 'TOKEN:beast#6445363199', zone: 'ground', kind: 'unit' },
            { seq: 'R2.A.0f', t: 'MOVE', card: 'TOKEN:beast#6445363199', from: 'outsideTheGame', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R2.A.0g', t: 'STATS', card: 'TOKEN:beast#6445363199', power: 3, hp: 3, keywords: [] },
            { seq: 'R2.A.0h', t: 'EXHAUST', card: 'TOKEN:beast#6445363199' },
            { seq: 'R2.A.0i', t: 'CHOICE', p: 1, prompt: 'Landing Pad', offered: ['base@1'], chose: 0 },
            { seq: 'R2.A.0j', t: 'EXHAUST_RESOURCES', p: 1, amount: 3 },
            { seq: 'R2.A.0k', t: 'MOVE', card: 'HMW#271', from: 'hand', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' },
            { seq: 'R2.A.1', t: 'PLAY_UPGRADE', p: 1, card: 'HMW#271', zone: 'base', target: 'base@1', cost: 3 },
        ];
        expect(forOf(events)).toEqual([
            undefined, undefined, undefined, undefined, undefined, 'R2.A.1', 'R2.A.1', 'R2.A.1', undefined,
        ]);
    });

    // The cut is ARRIVALS only: a card leaving for the discard pile as a cost is the play's own.
    it('still files a cost paid by moving another card, such as a discard', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#128', from: 'hand', to: 'discard', p: 1 },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(forOf(events)).toEqual(['R1.A.1', 'R1.A.1', undefined]);
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

    // A resourcing is announced the same way round as a play: the hand->resource MOVE lands
    // first and the RESOURCE summarising it follows, so without this the move stays filed under
    // whatever was numbered before it instead of the RESOURCE that actually describes it.
    it('stamps a hand->resource MOVE with the RESOURCE that follows it', function () {
        const events: GameEvent[] = [
            { seq: 'R1.S.3', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'resource', p: 1 },
            { seq: 'R1.S.4', t: 'RESOURCE', p: 1, card: 'SOR#095' },
        ];
        expect(forOf(events)).toEqual(['R1.S.4', undefined]);
    });

    it('does not overwrite a MOVE that is already linked to something else', function () {
        const events: GameEvent[] = [
            { seq: 'R1.S.3', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'resource', p: 1, for: 'R1.S.2' },
            { seq: 'R1.S.4', t: 'RESOURCE', p: 1, card: 'SOR#095' },
        ];
        expect(forOf(events)).toEqual(['R1.S.2', undefined]);
    });

    it('does not stamp a MOVE for a different card than the RESOURCE names', function () {
        const events: GameEvent[] = [
            { seq: 'R1.S.3', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'resource', p: 1 },
            { seq: 'R1.S.4', t: 'RESOURCE', p: 1, card: 'SOR#128' },
        ];
        expect(forOf(events)).toEqual([undefined, undefined]);
    });
});

/**
 * Folding a run of per-resource READY_RESOURCES into one counted record (spec §10.1). The
 * regroup step readies the row one card at a time; the row's ready state is COUNTED, never
 * named, so the extra records carry nothing an `amount: N` does not.
 */
describe('coalesceResourceReadies', function () {
    it('merges an unbroken run of the same seat into one record', function () {
        const events: GameEvent[] = [
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.2', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ];
        const out = coalesceResourceReadies(events);
        expect(out.length).toBe(1);
        expect((out[0] as { amount: number }).amount).toBe(3);
        expect(out[0].seq).toBe('R1.G.1');
    });

    it('keeps two seats\' runs separate even when interleaved', function () {
        const events: GameEvent[] = [
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.2', t: 'READY_RESOURCES', p: 2, amount: 1 },
            { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ];
        const out = coalesceResourceReadies(events);
        expect(out.map((e) => ({ p: (e as { p: number }).p, amount: (e as { amount: number }).amount })))
            .toEqual([{ p: 1, amount: 1 }, { p: 2, amount: 1 }, { p: 1, amount: 1 }]);
    });

    it('does not merge across an intervening record of another type', function () {
        const events: GameEvent[] = [
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.2', t: 'READY', card: 'SOR#095' },
            { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ];
        const out = coalesceResourceReadies(events);
        expect(out.length).toBe(3);
        expect(out.filter((e) => e.t === 'READY_RESOURCES').map((e) => (e as { amount: number }).amount))
            .toEqual([1, 1]);
    });

    it('leaves a lone READY_RESOURCES and non-matching types alone, and does not mutate its input', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ];
        const out = coalesceResourceReadies(events);
        expect(out).toEqual(events);
        expect(out).not.toBe(events);
    });
});

// Coalescing DELETES the merged-away records' seqs. Anything still pointing at one -- an
// annotation's `ref`, another record's `for` -- would be left citing a position no longer in
// the file, and stateAt() answers an unknown seq with the end of the game (spec §12.3).
describe('coalesceResourceReadies leaves referenced positions alone', function () {
    const run = (referenced?: Set<string>) => coalesceResourceReadies([
        { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
        { seq: 'R1.G.2', t: 'READY_RESOURCES', p: 1, amount: 1 },
        { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
    ] as any, referenced);

    it('merges an unbroken run when nothing points at it', function () {
        const out = run();
        expect(out.length).toBe(1);
        expect((out[0] as any).amount).toBe(3);
    });

    it('keeps a record an annotation references, and merges around it', function () {
        // R1.G.2 is cited, so it survives with its own seq. R1.G.3 is not, so it may still be
        // folded away -- the invariant is "never DELETE a cited seq", not "never merge near one".
        const out = run(new Set(['R1.G.2']));
        expect(out.map((e) => e.seq)).toEqual(['R1.G.1', 'R1.G.2']);
        expect(out.map((e: any) => e.amount)).toEqual([1, 2]);
    });
});

// Value: protects=another card attaching to a base (Fortify) ends a precursor run like an arena arrival; fails_when=the `base` + upgrade arm of the arrival cut is dropped; why_new=only an arena arrival was tested; seam=none; no_claim=engine ordering
describe('linkActionSteps: a base attachment ends a precursor run', function () {
    it('never files another card attaching to a base under the next play', function () {
        const events: GameEvent[] = [
            { seq: 'R2.A.0a', t: 'ABILITY_ACTIVATE', p: 1, card: 'base@1', kind: 'triggered' },
            { seq: 'R2.A.0b', t: 'MOVE', card: 'HMW#126', from: 'deck', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' },
            { seq: 'R2.A.0c', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R2.A.0d', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R2.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([undefined, undefined, 'R2.A.1', 'R2.A.1', undefined]);
    });
});

// Value: protects=a lettered seq is a sub-step whatever its type, an unlettered action type is an action, a non-action ability never is; fails_when=the lettered-seq rule is dropped or applies to unlettered seqs; why_new=only DEPLOY_LEADER engine tests touched it; seam=none; no_claim=writer numbering
describe('isTopLevelActionRecord', function () {
    it('treats a lettered seq as a sub-step, whatever the record type', function () {
        const rows: [GameEvent, boolean][] = [
            [{ seq: 'R1.A.1c', t: 'DEPLOY_LEADER', p: 1, card: 'HMW#004', zone: 'space' }, false],
            [{ seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'HMW#004', zone: 'space' }, true],
            [{ seq: 'R1.A.2b', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground' }, false],
            [{ seq: 'R1.A.2', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground' }, true],
            [{ seq: 'R1.A.3', t: 'ABILITY_ACTIVATE', p: 1, card: 'x', kind: 'triggered' }, false],
            [{ seq: 'R1.A.3', t: 'ABILITY_ACTIVATE', p: 1, card: 'x', kind: 'epic' }, true],
            [{ seq: 'R1.A.4', t: 'PASS', p: 2 }, true],
        ];
        for (const [e, expected] of rows) {
            expect(isTopLevelActionRecord(e)).withContext(`${e.seq} ${e.t}`)
                .toBe(expected);
        }
    });

    it('lets a lettered DEPLOY_LEADER anchor no `for` links', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'HMW#004', kind: 'epic', epic: true },
            { seq: 'R1.A.1a', t: 'MOVE', card: 'HMW#004', from: 'base', to: 'space', p: 1, kind: 'unit' },
            { seq: 'R1.A.1b', t: 'STATS', card: 'HMW#004', power: 2, hp: 12 },
            { seq: 'R1.A.1c', t: 'DEPLOY_LEADER', p: 1, card: 'HMW#004', zone: 'space', epic: true },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([undefined, undefined, undefined, undefined]);
    });
});

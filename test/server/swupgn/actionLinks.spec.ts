import { coalesceResourceReadies, isTopLevelActionRecord, linkActionSteps, markPlaySetup } from '../../../swupgn/src/actionLinks';
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

    // Position alone cannot tell a discard paid as this play's cost from one the previous action
    // forced: both are the actor's card leaving their hand just before the play. Only the writer's
    // mark (see markPlaySetup) says it was a cost, so an unmarked one stays where it is.
    it('does not take another card\'s unmarked discard into the run', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#128', from: 'hand', to: 'discard', p: 1 },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(forOf(events)).toEqual([undefined, 'R1.A.1', undefined]);
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

// Value: protects=a consequence of one action that names another card never joins the next action's run (spec Appendix C); fails_when=the walk files a whole run once anything in it names the action's card; why_new=rev 3 filed a token's stat change under the opponent's next play; seam=none; no_claim=a discard paid as a cost
describe('linkActionSteps: a record naming another card ends the run', function () {
    it('leaves the previous action\'s stat change under its own number', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'ASH#251', zone: 'ground', cost: 2 },
            { seq: 'R1.A.1a', t: 'STATUS_TOKEN', card: 'ASH#251', token: 'advantage', count: 1 },
            { seq: 'R1.A.1b', t: 'STATS', card: 'ASH#251', power: 3, hp: 3 },
            { seq: 'R1.A.1c', t: 'EXHAUST_RESOURCES', p: 2, amount: 1 },
            { seq: 'R1.A.1d', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 2 },
            { seq: 'R1.A.2', t: 'PLAY', p: 2, card: 'SOR#095', zone: 'ground', cost: 1 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for))
            .toEqual([undefined, undefined, undefined, 'R1.A.2', 'R1.A.2', undefined]);
    });

    it('keeps an upgrade\'s host in the run: the play names it as its target', function () {
        const events: GameEvent[] = [
            { seq: 'R3.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R3.A.0b', t: 'MOVE', card: 'LOF#215', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'ASH#251' },
            { seq: 'R3.A.0c', t: 'STATS', card: 'ASH#251', power: 5, hp: 7 },
            { seq: 'R3.A.1', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', zone: 'ground', target: 'ASH#251', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for))
            .toEqual(['R3.A.1', 'R3.A.1', 'R3.A.1', undefined]);
    });

    it('does not take the host\'s earlier stat change, left by the previous action, into an upgrade\'s run', function () {
        const events: GameEvent[] = [
            { seq: 'R4.A.2', t: 'PLAY_EVENT', p: 2, card: 'HMW#100', zone: 'discard', cost: 2 },
            { seq: 'R4.A.2a', t: 'MOVE', card: 'TOKEN:weakness#7816991190', from: 'outsideTheGame', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'ASH#251' },
            { seq: 'R4.A.2b', t: 'STATUS_TOKEN', card: 'ASH#251', token: 'weakness', count: 1 },
            { seq: 'R4.A.2c', t: 'STATS', card: 'ASH#251', power: 2, hp: 2 },
            { seq: 'R4.A.2d', t: 'CHOICE', p: 1, prompt: 'Ascension Cable', offered: ['ASH#251'], chose: 0 },
            { seq: 'R4.A.2e', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R4.A.2f', t: 'MOVE', card: 'LOF#215', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'ASH#251' },
            { seq: 'R4.A.2g', t: 'STATS', card: 'ASH#251', power: 4, hp: 6 },
            { seq: 'R4.A.3', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', zone: 'ground', target: 'ASH#251', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([
            undefined, undefined, undefined, undefined, 'R4.A.3', 'R4.A.3', 'R4.A.3', 'R4.A.3', undefined,
        ]);
    });
});

// Value: protects=the previous action's choices and the card it moved stay under that action when the other seat plays next (spec Appendix C); fails_when=a CHOICE, MODAL_CHOICE or EXHAUST_RESOURCES by the other seat, or an unmarked MOVE of another card, stays in the run; why_new=Cunning's mode choice, target choice and bounce were filed under the opponent's next play; seam=none; no_claim=a cost the writer marked (see the play-setup describe)
describe('linkActionSteps: the other seat\'s records end the run', function () {
    it('leaves Cunning\'s choices and bounce under Cunning when the opponent plays next', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.3', t: 'PLAY_EVENT', p: 1, card: 'SOR#203', zone: 'discard', cost: 1 },
            { seq: 'R1.A.3a', t: 'ABILITY_ACTIVATE', p: 1, card: 'SOR#203', kind: 'event' },
            { seq: 'R1.A.3b', t: 'MODAL_CHOICE', p: 1, offered: ['Return', 'Buff'], chose: 0 },
            { seq: 'R1.A.3c', t: 'CHOICE', p: 1, prompt: 'Cunning', offered: ['SOR#095'], chose: 0 },
            { seq: 'R1.A.3d', t: 'MOVE', card: 'SOR#095', from: 'ground', to: 'hand', p: 2 },
            { seq: 'R1.A.3e', t: 'EXHAUST_RESOURCES', p: 2, amount: 2 },
            { seq: 'R1.A.3f', t: 'MOVE', card: 'SOR#108', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
            { seq: 'R1.A.4', t: 'PLAY', p: 2, card: 'SOR#108', zone: 'ground', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([
            undefined, undefined, undefined, undefined, undefined, 'R1.A.4', 'R1.A.4', undefined,
        ]);
    });

    it('ends the run at a choice the other seat made, even with no card between', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.3', t: 'PLAY_EVENT', p: 1, card: 'SOR#203', zone: 'discard', cost: 1 },
            { seq: 'R1.A.3a', t: 'CHOICE', p: 1, prompt: 'Cunning', offered: ['SOR#095'], chose: 0 },
            { seq: 'R1.A.3b', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.A.3c', t: 'EXHAUST_RESOURCES', p: 2, amount: 2 },
            { seq: 'R1.A.3d', t: 'MOVE', card: 'SOR#108', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
            { seq: 'R1.A.4', t: 'PLAY', p: 2, card: 'SOR#108', zone: 'ground', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([
            undefined, undefined, undefined, 'R1.A.4', 'R1.A.4', undefined,
        ]);
    });

    it('ends the run at any other card the actor moved, unless the writer marked it as this play\'s setup', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.3', t: 'PLAY_EVENT', p: 1, card: 'SOR#203', zone: 'discard', cost: 1 },
            { seq: 'R1.A.3a', t: 'MOVE', card: 'SOR#128', from: 'deck', to: 'hand', p: 1 },
            { seq: 'R1.A.3b', t: 'MOVE', card: 'SOR#200', from: 'resource', to: 'discard', p: 1 },
            { seq: 'R1.A.3c', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.4', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(linkActionSteps(events).map((e) => (e as { for?: string }).for)).toEqual([
            undefined, undefined, undefined, 'R1.A.4', undefined,
        ]);
    });
});

// Value: protects=a play's own setup -- its choices, an Exploit defeat, a discard paid instead of its cost -- is filed under the play, and a discard the previous action forced never is (spec §9.1 belonging, [W-18]); fails_when=the linker guesses costs from position again, or stops honouring the writer's play-setup mark; why_new=Exploit's and Bamboozle's cost records carried no `for`, and an unmarked forced discard could be filed under the next play; seam=markPlaySetup; no_claim=how the recorder decides what to mark (SwuPgnRecorder.spec)
describe('linkActionSteps: records the writer marked as a play\'s setup', function () {
    const forOf = (events: GameEvent[]) =>
        linkActionSteps(events).map((e) => (e as { for?: string }).for);
    const marked = (events: GameEvent[], card: string, seqs: string[]) => {
        for (const e of events) {
            if (seqs.includes(e.seq)) {
                markPlaySetup(e, card);
            }
        }
        return events;
    };

    it('files an Exploit play\'s choices, defeat and the defeated unit\'s move under the play', function () {
        const events = marked([
            { seq: 'R1.A.0a', t: 'PASS', p: 2 },
            { seq: 'R1.A.0b', t: 'MODAL_CHOICE', p: 1, offered: ['Trigger Exploit', 'Cancel'], chose: 0 },
            { seq: 'R1.A.0c', t: 'CHOICE', p: 1, prompt: 'Droideka Security', offered: ['SOR#079'], chose: 0 },
            { seq: 'R1.A.0d', t: 'MOVE', card: 'SOR#079', from: 'ground', to: 'discard', p: 1, kind: 'unit' },
            { seq: 'R1.A.0e', t: 'DEFEAT', card: 'SOR#079', reason: 'ability', defeatedBy: 'TWI#037' },
            { seq: 'R1.A.0f', t: 'EXHAUST_RESOURCES', p: 1, amount: 6 },
            { seq: 'R1.A.0g', t: 'MOVE', card: 'TWI#037', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'TWI#037', zone: 'ground', cost: 6 },
        ], 'TWI#037', ['R1.A.0b', 'R1.A.0c', 'R1.A.0d', 'R1.A.0e', 'R1.A.0f', 'R1.A.0g']);
        expect(forOf(events)).toEqual([
            undefined, 'R1.A.1', 'R1.A.1', 'R1.A.1', 'R1.A.1', 'R1.A.1', 'R1.A.1', undefined,
        ]);
    });

    it('files a discard paid instead of an event\'s cost under the event, across its DISCARD summary', function () {
        const events = marked([
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#207', from: 'hand', to: 'discard', p: 1, kind: 'unit' },
            { seq: 'R1.A.0b', t: 'DISCARD', p: 1, cards: ['SOR#207'] },
            { seq: 'R1.A.0c', t: 'MOVE', card: 'SOR#199', from: 'hand', to: 'discard', p: 1 },
            { seq: 'R1.A.1', t: 'PLAY_EVENT', p: 1, card: 'SOR#199', zone: 'discard', cost: 2 },
        ], 'SOR#199', ['R1.A.0a', 'R1.A.0b', 'R1.A.0c']);
        expect(forOf(events)).toEqual(['R1.A.1', 'R1.A.1', 'R1.A.1', undefined]);
    });

    it('never files a discard the previous action forced under the discarding player\'s next play', function () {
        // Cunning's "an opponent discards a random card" picked last, so nothing of player 1's
        // sits between the discard and player 2's play. Shaped exactly like a cost, and unmarked.
        const events: GameEvent[] = [
            { seq: 'R1.A.3', t: 'PLAY_EVENT', p: 1, card: 'SOR#203', zone: 'discard', cost: 4 },
            { seq: 'R1.A.3a', t: 'MODAL_CHOICE', p: 1, offered: ['Buff', 'Discard'], chose: 1 },
            { seq: 'R1.A.3b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'discard', p: 2, kind: 'unit' },
            { seq: 'R1.A.3c', t: 'EXHAUST_RESOURCES', p: 2, amount: 2 },
            { seq: 'R1.A.3d', t: 'MOVE', card: 'SOR#095:2', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
            { seq: 'R1.A.4', t: 'PLAY', p: 2, card: 'SOR#095:2', zone: 'ground', cost: 2 },
        ];
        expect(forOf(events)).toEqual([undefined, undefined, undefined, 'R1.A.4', 'R1.A.4', undefined]);
    });

    it('does not let a mark for one card pull records into another card\'s play', function () {
        const events = marked([
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#207', from: 'hand', to: 'discard', p: 1 },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1 },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ], 'SOR#199', ['R1.A.0a']);
        expect(forOf(events)).toEqual([undefined, 'R1.A.1', undefined]);
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

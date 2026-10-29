import { parse, render, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { fold, stateAt } from '../../../swupgn/src/fold';
import type { SwuPgnDocument } from '../../../swupgn/src/types';
import { isHarnessCountArtifact } from './swuPgnVectorGate';

/**
 * Lasting and delayed effects written by the reference writer (spec §10.1 EFFECT_START /
 * EFFECT_END, `[W-48]`): one record per effect as the card text states it, its ends, the
 * partial end when a target leaves play, and the keyframes' `effects` agreeing with the fold.
 */

function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

const ofType = (doc: SwuPgnDocument, t: 'EFFECT_START' | 'EFFECT_END'): any[] => doc.events.filter((e) => e.t === t);

const idOf = (doc: SwuPgnDocument, name: string): string => {
    const id = (doc.cards ?? []).find((c) => c.name.startsWith(name))?.id;
    expect(id).withContext(`card id for ${name}`)
        .toBeDefined();
    return id ?? '';
};

const sorted = (xs: string[] | undefined): string[] => [...(xs ?? [])].sort();

/** No effect-record problems: no `effect-end-unknown`, and nothing else the validator objects to. */
function expectCleanEffects(text: string): void {
    const issues = validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch');
    expect(issues).withContext('validate()')
        .toEqual([]);
}

describe('SWU-PGN/1.0 effects (writer)', function () {
    integration(function (contextRef) {
        it('Wolffe writes one effect on both bases for the phase, ended at the phase end', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wolffe#suspicious-veteran'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wolffe);
            const during = writerOutput(context.game).doc;
            const starts = ofType(during, 'EFFECT_START');
            expect(starts.length).withContext('one effect for both bases')
                .toBe(1);
            expect(starts[0]).toEqual(jasmine.objectContaining({
                id: 'fx@1', src: idOf(during, 'Wolffe'), p: 1, duration: 'phase',
            }));
            expect(sorted(starts[0].targets)).toEqual(['base@1', 'base@2']);
            expect(fold(during.events).effects?.map((e) => e.id)).toEqual(['fx@1']);

            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const ends = ofType(doc, 'EFFECT_END');
            expect(ends).toEqual([jasmine.objectContaining({ id: 'fx@1', reason: 'expired' })]);
            expect(ends[0].targets).toBeUndefined();
            // Ended with the action phase, before the regroup phase starts.
            const endAt = doc.events.indexOf(ends[0]);
            const regroupAt = doc.events.findIndex((e: any) => e.t === 'PHASE_START' && e.phase === 'regroup');
            expect(endAt).toBeLessThan(regroupAt);
            expect(fold(doc.events).effects).toEqual([]);
            expectCleanEffects(text);
            expect(render(doc)).toContain('(for this phase)');
        });

        it('an ability that buffs every friendly unit writes one effect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rallying-cry'],
                    groundArena: ['wampa', 'battlefield-marine'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rallyingCry);

            const { text, doc } = writerOutput(context.game);
            const starts = ofType(doc, 'EFFECT_START');
            expect(starts.length).withContext('one record for every unit it applies to')
                .toBe(1);
            expect(starts[0]).toEqual(jasmine.objectContaining({ id: 'fx@1', src: idOf(doc, 'Rallying Cry'), p: 1, duration: 'phase' }));
            expect(sorted(starts[0].targets)).toEqual(sorted([idOf(doc, 'Wampa'), idOf(doc, 'Battlefield Marine')]));
            expect(typeof starts[0].text).toBe('string');
            expectCleanEffects(text);
        });

        it('a target that leaves play is dropped from the effect with a partial EFFECT_END', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rallying-cry'],
                    groundArena: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hand: ['waylay'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rallyingCry);
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('hand');

            const during = writerOutput(context.game);
            const wampa = idOf(during.doc, 'Wampa');
            const marine = idOf(during.doc, 'Battlefield Marine');
            const ends = ofType(during.doc, 'EFFECT_END');
            expect(ends).toEqual([{ seq: jasmine.any(String), t: 'EFFECT_END', id: 'fx@1', reason: 'targetLeft', targets: [wampa] }]);
            expect(fold(during.doc.events).effects).toEqual([
                jasmine.objectContaining({ id: 'fx@1', targets: [marine] }),
            ]);
            expectCleanEffects(during.text);

            // The rest of it still ends with the phase.
            context.moveToNextActionPhase();
            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'EFFECT_END').map((e) => [e.id, e.reason, e.targets])).toEqual([
                ['fx@1', 'targetLeft', [wampa]],
                ['fx@1', 'expired', undefined],
            ]);
            expect(fold(doc.events).effects).toEqual([]);
            expectCleanEffects(text);
        });

        it('a single-target effect whose target leaves play ends with that partial EFFECT_END, and no other', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tactical-advantage'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['waylay'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.tacticalAdvantage);
            context.player1.clickCard(context.wampa);
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.wampa);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const wampa = idOf(doc, 'Wampa');
            expect(ofType(doc, 'EFFECT_START').map((e) => [e.id, e.targets, e.duration])).toEqual([['fx@1', [wampa], 'phase']]);
            expect(ofType(doc, 'EFFECT_END').map((e) => [e.id, e.reason, e.targets])).toEqual([['fx@1', 'targetLeft', [wampa]]]);
            expect(fold(doc.events).effects).toEqual([]);
            expectCleanEffects(text);
        });

        it('an effect on a card outside play does not end when it is written', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['stolen-athauler'],
                },
                player2: {
                    hand: ['power-of-the-dark-side'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.powerOfTheDarkSide);
            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('discard');

            const during = writerOutput(context.game).doc;
            const hauler = idOf(during, 'Stolen AT-Hauler');
            expect(ofType(during, 'EFFECT_START')).toEqual([jasmine.objectContaining({ id: 'fx@1', targets: [hauler], duration: 'phase' })]);
            expect(ofType(during, 'EFFECT_END')).withContext('its target was never in play, so it cannot leave it')
                .toEqual([]);

            context.moveToNextActionPhase();
            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'EFFECT_END').map((e) => [e.id, e.reason])).toEqual([['fx@1', 'expired']]);
            expectCleanEffects(text);
        });

        // Value: protects=a target outside play that changes zone is a new object the effect no longer applies to, so the writer ends it for that target (spec §10.1, CR 8.7, [W-48]); fails_when=the effect stays on a card played from the discard pile until the phase ends; why_new=final review item 17; seam=none; no_claim=a target that changes zone and comes back between two engine events
        it('an effect on a card outside play ends for it when the card changes zone', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['stolen-athauler'],
                },
                player2: {
                    hand: ['power-of-the-dark-side'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.powerOfTheDarkSide);
            context.player1.clickCard(context.stolenAthauler);
            context.player1.passAction();
            context.player2.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player2);

            const during = writerOutput(context.game).doc;
            const hauler = idOf(during, 'Stolen AT-Hauler');
            expect(ofType(during, 'EFFECT_END').map((e) => [e.id, e.reason, e.targets])).toEqual([['fx@1', 'targetLeft', [hauler]]]);

            context.moveToNextActionPhase();
            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'EFFECT_END').length).toBe(1);
            expectCleanEffects(text);
        });

        it('a delayed effect is written when created and ended when it fires', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['change-of-heart'],
                    resources: 10,
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);

            const during = writerOutput(context.game).doc;
            const wampa = idOf(during, 'Wampa');
            expect(ofType(during, 'EFFECT_START')).toEqual([jasmine.objectContaining({
                id: 'fx@1', src: idOf(during, 'Change of Heart'), p: 1, duration: 'delayed', targets: [wampa],
            })]);

            context.moveToRegroupPhase();
            expect(context.wampa).toBeInZone('groundArena', context.player2);

            const { text, doc } = writerOutput(context.game);
            const end = ofType(doc, 'EFFECT_END');
            expect(end.map((e) => [e.id, e.reason, e.targets])).toEqual([['fx@1', 'fired', undefined]]);
            // It ends at the start of the regroup phase, where it fired.
            const regroupAt = doc.events.findIndex((e: any) => e.t === 'PHASE_START' && e.phase === 'regroup');
            expect(doc.events.indexOf(end[0])).toBeGreaterThan(regroupAt);
            expect(fold(doc.events).effects).toEqual([]);
            expectCleanEffects(text);
        });

        it('an until effect carries untilText', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['give-in-to-your-anger'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.giveInToYourAnger);
            context.player1.clickCard(context.wampa);

            const during = writerOutput(context.game).doc;
            const starts = ofType(during, 'EFFECT_START');
            expect(starts.length).toBe(1);
            expect(starts[0]).toEqual(jasmine.objectContaining({ id: 'fx@1', p: 1, duration: 'until', targets: [idOf(during, 'Wampa')] }));
            expect(typeof starts[0].untilText).toBe('string');
            expect(starts[0].untilText.length).toBeGreaterThan(0);
            expect(starts[0].untilText).not.toMatch(/[{}]/);
            expect(render(during)).toContain(`(until ${starts[0].untilText})`);

            // The opponent's next action ends it.
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);

            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'EFFECT_END').map((e) => [e.id, e.reason])).toEqual([['fx@1', 'expired']]);
            expectCleanEffects(text);
        });

        it('keyframes carry the active effects and the fold agrees', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fives#i-have-proof'],
                    groundArena: ['wampa', 'battlefield-marine'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg', 'porg'],
                    resources: 12,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['atst'],
                    spaceArena: ['patrolling-vwing'],
                    resources: 10,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            // Fives copies the V-Wing's When Played "until this unit leaves play" (written
            // whileSourceInPlay, the engine's until-it-leaves-play): a lasting
            // effect that is still active at every later keyframe.
            context.player1.clickCard(context.fives);
            context.player1.clickCard(context.patrollingVwing);
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.battlefieldMarine);
            context.moveToNextActionPhase();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const fives = idOf(doc, 'Fives');
            const keyframes = doc.events.filter((e: any) => (e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) as any[];
            expect(keyframes.length).toBeGreaterThan(2);
            for (const k of keyframes) {
                expect(Array.isArray(k.keyframe.effects)).withContext(`${k.seq} carries effects`)
                    .toBeTrue();
            }
            const fivesEffect = ofType(doc, 'EFFECT_START').find((e) => e.src === fives);
            expect(fivesEffect).toEqual(jasmine.objectContaining({ duration: 'whileSourceInPlay', targets: [fives] }));
            const later = keyframes.filter((k) => doc.events.indexOf(k) > doc.events.indexOf(fivesEffect));
            expect(later.length).toBeGreaterThan(1);
            for (const k of later) {
                expect(k.keyframe.effects.map((e: any) => e.id)).withContext(`${k.seq} holds Fives' effect`)
                    .toContain(fivesEffect.id);
            }
            expect(ofType(doc, 'EFFECT_START').length).toBeGreaterThan(1);
            expect(checkKeyframes(doc.events).mismatches.filter((m) => !isHarnessCountArtifact(m)))
                .withContext('fold reproduces every keyframe')
                .toEqual([]);
            expectCleanEffects(text);
        });

        it('separately stated effects in one ability are separate records', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sword-and-shield-maneuver'],
                    groundArena: ['death-trooper', 'plo-koon#kohtoyah', 'battlefield-marine'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.swordAndShieldManeuver);

            const { text, doc } = writerOutput(context.game);
            const starts = ofType(doc, 'EFFECT_START');
            expect(starts.length).withContext('Raid on the Troopers, Sentinel on the Jedi')
                .toBe(2);
            expect(starts.map((e) => sorted(e.targets))).toEqual(jasmine.arrayWithExactContents([
                sorted([idOf(doc, 'Death Trooper'), idOf(doc, 'Battlefield Marine')]),
                [idOf(doc, 'Plo Koon')],
            ]));
            expect(new Set(starts.map((e) => e.id)).size).toBe(2);
            expectCleanEffects(text);
        });

        it('two effects stated on one unit are two records, each naming it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['guarding-the-way'],
                    groundArena: ['wampa'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.guardingTheWay);
            context.player1.clickCard(context.wampa);

            const { text, doc } = writerOutput(context.game);
            const wampa = idOf(doc, 'Wampa');
            expect(ofType(doc, 'EFFECT_START').map((e) => [e.id, e.targets, e.duration])).toEqual([
                ['fx@1', [wampa], 'phase'],
                ['fx@2', [wampa], 'phase'],
            ]);
            expectCleanEffects(text);
        });

        it('Kazuda\'s extra action ends when it is used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    groundArena: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeActivePlayer();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            const { text, doc } = writerOutput(context.game);
            const extra = ofType(doc, 'EFFECT_START').find((e) => e.seat === 1);
            expect(extra).withContext('the player effect "take another action"')
                .toEqual(jasmine.objectContaining({ p: 1, duration: 'game' }));
            expect(ofType(doc, 'EFFECT_END').filter((e) => e.id === extra.id)
                .map((e) => e.reason)).toEqual(['expired']);
            // Gone from the board; the round-long "lose all abilities" on Wampa is not.
            const active = fold(doc.events).effects ?? [];
            expect(active.map((e) => e.id)).not.toContain(extra.id);
            expect(active).toEqual([jasmine.objectContaining({ duration: 'round', targets: [idOf(doc, 'Wampa')] })]);
            expectCleanEffects(text);
        });
    });
});

describe('SWU-PGN/1.0 effects across undo (writer)', function () {
    undoIntegration(function (contextRef) {
        it('undoing past an effect forgets it and the replay writes it once', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tactical-advantage'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['atst'],
                },
            });
            const { context } = contextRef;
            const game: any = context.game;

            context.player1.clickCard(context.tacticalAdvantage);
            context.player1.clickCard(context.wampa);
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(fold(writerOutput(game).doc.events).effects ?? []).withContext('the undone effect is gone')
                .toEqual([]);

            context.player1.clickCard(context.tacticalAdvantage);
            context.player1.clickCard(context.wampa);

            // Undo the opponent's bounce: its end goes, the effect is active again.
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.wampa);
            expect(ofType(writerOutput(game).doc, 'EFFECT_END').length).toBe(1);
            contextRef.snapshot.quickRollback(context.player2.id);

            const mid = writerOutput(game).doc;
            expect(ofType(mid, 'EFFECT_START').map((e) => e.id)).withContext('written once, numbered from 1')
                .toEqual(['fx@1']);
            expect(ofType(mid, 'EFFECT_END')).toEqual([]);
            expect(fold(mid.events).effects?.map((e) => e.id)).toEqual(['fx@1']);

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(game);
            expect(ofType(doc, 'EFFECT_START').map((e) => e.id)).toEqual(['fx@1']);
            expect(ofType(doc, 'EFFECT_END').map((e) => [e.id, e.reason])).toEqual([['fx@1', 'expired']]);
            expect(stateAt(doc.events, doc.events[doc.events.length - 1].seq).effects).toEqual([]);
            expectCleanEffects(text);
        });
    });
});

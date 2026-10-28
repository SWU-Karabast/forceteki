import { parse, render, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { isHarnessCountArtifact } from './swuPgnVectorGate';
import { fold, stateAt } from '../../../swupgn/src/fold';
import type { GameEvent, SwuPgnDocument } from '../../../swupgn/src/types';

/**
 * The writer contract for a BASE as captor, played through the real engine (spec §10.1, §11).
 * Arrest (SEC#195) says "Your base captures an enemy non-leader unit": the captor is the base,
 * so `CAPTURE.by` is `base@N`, and the captive lives in that seat's `baseCaptured` -- not on any
 * unit, and not nowhere -- until it is rescued at the start of the regroup phase.
 */

function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

// Loosely typed: `Extract` cannot narrow the PLAY-family member, whose `t` is itself a union.
const ofType = (doc: SwuPgnDocument, t: GameEvent['t']): any[] => doc.events.filter((e) => e.t === t);

const keyframes = (doc: SwuPgnDocument) =>
    doc.events.filter((e: any) => (e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) as any[];

describe('SWU-PGN/1.0 base capture (Arrest)', function () {
    integration(function (contextRef) {
        it('a base captor holds the unit in baseCaptured until its rescue at the regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.arrest);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.p1Base);

            // Mid-phase, before the rescue: the fold of what was written so far agrees with the engine.
            const during = writerOutput(context.game).doc;
            const marine = (during.cards ?? []).find((c) => c.name.startsWith('Battlefield Marine'))?.id ?? '';
            expect(marine).not.toBe('');
            const capture = ofType(during, 'CAPTURE').find((e) => e.card === marine);
            expect(capture).toEqual(jasmine.objectContaining({ p: 1, by: 'base@1' }));
            const held = stateAt(during.events, capture.seq);
            expect(held.players[1]?.baseCaptured).toEqual([marine]);
            expect(held.players[2]?.cards.map((c) => c.id)).not.toContain(marine);
            expect(held.players[1]?.cards.some((c) => c.captured.includes(marine))).withContext('no unit holds it')
                .toBeFalse();

            context.moveToNextActionPhase();
            expect(context.p1Base.capturedUnits.length).toBe(0);

            const { text, doc } = writerOutput(context.game);
            // The keyframe gate is checked on its own below, with the harness's setup artifacts set aside;
            // validate() cannot tell those from a real mismatch.
            expect(validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch')).withContext('validate()')
                .toEqual([]);
            expect(checkKeyframes(doc.events).mismatches.filter((m) => !isHarnessCountArtifact(m)))
                .withContext('fold reproduces every keyframe')
                .toEqual([]);

            // Rescued: the MOVE out of `capture` released it, and the next keyframe agrees.
            const exit = ofType(doc, 'MOVE').find((e) => e.card === marine && e.from === 'capture');
            expect(exit).toEqual(jasmine.objectContaining({ to: 'ground', p: 2 }));
            expect(ofType(doc, 'RESCUE').find((e) => e.card === marine)).toEqual(jasmine.objectContaining({ p: 2 }));
            const r2 = keyframes(doc).find((e) => e.seq === 'R2.start');
            expect(r2.keyframe.players[1].baseCaptured).withContext('keyframes always carry the list')
                .toEqual([]);
            const end = fold(doc.events);
            expect(end.players[1]?.baseCaptured).toEqual([]);
            expect(end.players[2]?.cards.map((c) => c.id)).toContain(marine);

            expect(render(doc)).toContain('Player 1 captures Battlefield Marine with');
        });
    });
});

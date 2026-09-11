import { parse, fold, stateAt } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';

// Double-sided leader coverage on a REAL game (SWU-PGN C-01).
//
// Chancellor Palpatine, Playing Both Sides (TWI#017) is the only double-sided leader in the
// pool. It NEVER deploys: its Action flips it in place in the base zone, and the flip changes
// its title, aspects and traits. There is therefore no MOVE, no DEPLOY_LEADER and no zone
// change to infer the face from — before LEADER_FLIP existed, nothing in a .swupgn said the
// leader had changed at all, and a replay showed the starting face for the whole game.
//
// This drives two real flips (Heroism side -> Villainy side -> back) and asserts that the file
// records each one, that folding reproduces the face at any point mid-game, and that every
// keyframe carries `onStartingSide` and agrees with the fold.
describe('SWU-PGN/1.0 generator — double-sided leader (real game)', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chancellor-palpatine#playing-both-sides',
                    base: { card: 'echo-base', damage: 10 },
                    groundArena: ['battlefield-marine'],
                    hand: ['pyke-sentinel'],
                },
                player2: {
                    hand: ['vanquish', 'takedown'],
                },
            });
        });

        it('records a LEADER_FLIP per flip, and every keyframe carries the face', function () {
            const { context } = contextRef;
            const game: any = context.game;

            // Flip 1: a friendly Heroism unit was defeated this phase, so Palpatine's Action
            // flips him to the Villainy (Darth Sidious) side.
            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.chancellorPalpatine);
            expect(context.chancellorPalpatine.onStartingSide).toBe(false);

            context.moveToNextActionPhase();

            // Flip 2: back to the starting side.
            context.player1.clickCard(context.pykeSentinel);
            context.player2.passAction();
            context.player1.clickCard(context.chancellorPalpatine);
            expect(context.chancellorPalpatine.onStartingSide).toBe(true);

            context.moveToNextActionPhase();

            const doc = parse(game.getCachedSwuPgn() as string);
            const flips = doc.events.filter((e: any) => e.t === 'LEADER_FLIP') as any[];

            // One record per flip, each naming the leader, the seat, and the face AFTER it.
            expect(flips.length).toBe(2);
            expect(flips.every((f) => f.p === 1)).toBe(true);
            expect(flips.every((f) => f.card === 'TWI#017')).toBe(true);
            expect(flips.map((f) => f.onStartingSide)).toEqual([false, true]);

            // The face is absolute, not a toggle, so folding to the moment between the two
            // flips lands on the back side and folding the whole game lands back on the front.
            const faceAt = (seq?: string, seat: 1 | 2 = 1) =>
                (seq ? stateAt(doc.events, seq) : fold(doc.events)).players[seat]?.leader?.onStartingSide;
            expect(faceAt(flips[0].seq)).toBe(false);
            expect(faceAt(flips[1].seq)).toBe(true);
            expect(faceAt()).toBe(true);

            // The opponent's leader is not double-sided, so it carries no face at all — the
            // field's presence is itself the "this leader flips" signal.
            expect(faceAt(undefined, 2)).toBeUndefined();

            // Every keyframe states the face, and the fold agrees with each one. `hand` is
            // deferred here for the usual double-setup reason (see SwuPgnKeyframeCompleteness).
            const keyframes = doc.events.filter((e: any) => e.keyframe) as any[];
            expect(keyframes.length).toBeGreaterThan(1);
            expect(keyframes.every((k) => typeof k.keyframe.players[1].leader.onStartingSide === 'boolean')).toBe(true);

            const deferred = ['.handSize', '.resourcesReady', '.deckSize', '.hand'];
            const real = checkKeyframes(doc.events).mismatches
                .filter((m) => !(m.seq !== 'R1.start' && deferred.some((f) => m.path.endsWith(f))));
            expect(real).toEqual([]);
        });
    });
});

import { parse, fold } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';

// Token creation on a REAL game, through the real engine.
//
// This exists because the unit-level CREATE_TOKEN test passed against a STUB token that was
// already in its arena and whose stats were plain numbers. The real engine does neither:
// `Game.generateToken` puts the token in `outsideTheGame` and only a CONTINGENT
// PutIntoPlaySystem moves it to its arena afterwards. So at OnTokensCreated the token reports
// `outsideTheGame`, and `getPower()`/`getHp()` -- computed from `upgrades` -- trip a Contract
// assertion for that zone.
//
// The handler therefore threw for EVERY token unit: the CREATE_TOKEN was dropped and the game
// wrote a non-zero RecorderErrors, which tells a reader the file is under-recorded (spec §5.2).
// It reproduced 378 times across this suite while every existing test stayed green.
describe('SWU-PGN/1.0 generator — token creation (real game)', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['droid-deployment'],      // "Create 2 Battle Droid tokens"
                },
            });
        });

        it('emits a CREATE_TOKEN per token without failing the recorder', function () {
            const { context } = contextRef;
            const game: any = context.game;

            context.player1.clickCard(context.droidDeployment);
            expect(context.player1.findCardsByName('battle-droid').length).toBe(2);

            context.moveToNextActionPhase();

            const doc = parse(game.getCachedSwuPgn() as string);

            // THE REGRESSION: a handler that throws is counted here and its record is lost.
            // A clean game must not advertise itself as under-recorded.
            expect(doc.header.recorderErrors).toBeUndefined();

            const creates = doc.events.filter((e: any) => e.t === 'CREATE_TOKEN') as any[];
            expect(creates.length).toBe(2);
            expect(creates.every((c) => c.p === 1)).toBe(true);
            expect(creates.every((c) => c.kind === 'unit')).toBe(true);
            // The arena the token is ENTERING. `outsideTheGame` -- where it actually sits at this
            // moment -- would fold to a phantom card in `cards[]` that no keyframe agrees with.
            expect(creates.every((c) => c.zone === 'ground')).toBe(true);

            // Both tokens are real arena cards in the folded board, once each, and the live stats
            // arrive from the STATS records that follow their MOVE rather than from creation.
            const arena = fold(doc.events).players[1]?.cards ?? [];
            const droids = arena.filter((c) => creates.some((k) => k.token === c.id));
            expect(droids.length).toBe(2);
            expect(droids.every((c) => c.zone === 'ground')).toBe(true);
            expect(droids.every((c) => typeof c.power === 'number' && typeof c.hp === 'number')).toBe(true);

            // And no phantom: nothing in `cards[]` sits outside an arena.
            expect(arena.every((c) => c.zone === 'ground' || c.zone === 'space')).toBe(true);

            const deferred = ['.handSize', '.resourcesReady', '.deckSize', '.hand'];
            const real = checkKeyframes(doc.events).mismatches
                .filter((m) => !(m.seq !== 'R1.start' && deferred.some((f) => m.path.endsWith(f))));
            expect(real).toEqual([]);
        });
    });
});

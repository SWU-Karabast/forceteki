describe('Shin Hati, Going Somewhere?', function () {
    integration(function (contextRef) {
        it('Shin Hati\'s ability should not give her sentinel if she is not the only friendly non-leader ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shin-hati#going-somewhere'],
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.shinHati);
            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeFalse();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.shinHati, context.yoda, context.grandInquisitor, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
        });

        it('Shin Hati\'s ability should give her sentinel if she is the only friendly non-leader ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shin-hati#going-somewhere'],
                    groundArena: ['partisan-infantry'],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine', 'trayus-acolyte']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.shinHati);
            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeFalse();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.shinHati, context.partisanInfantry, context.grandInquisitor, context.p1Base]);
            context.player2.clickCard(context.partisanInfantry);

            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeTrue();

            expect(context.player1).toBeActivePlayer();
            context.player1.passAction();

            context.player2.clickCard(context.trayusAcolyte);
            expect(context.player2).toBeAbleToSelectExactly([context.shinHati]);
            context.player2.clickCard(context.shinHati);

            expect(context.player1).toBeActivePlayer();
        });

        it('Shin Hati loses sentinel when she is given The Darksaber (Icon of Leadership)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-darksaber#icon-of-leadership', 'secretive-sage'],
                    groundArena: ['shin-hati#going-somewhere']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeTrue();

            // Play the Darksaber on Shin Hati
            context.player1.clickCard(context.theDarksaber);
            context.player1.clickCard(context.shinHati);

            // She loses sentinel because she is no longer a non-leader unit
            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeFalse();
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.shinHati, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            // She does not regain sentinel when P1 plays another non-leader ground unit
            context.player1.clickCard(context.secretiveSage);
            expect(context.shinHati.hasSomeKeyword('sentinel')).toBeFalse();
        });
    });
});
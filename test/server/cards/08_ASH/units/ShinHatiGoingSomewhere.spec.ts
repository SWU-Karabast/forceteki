describe('Shin Hati, going Somewhere', function () {
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
    });
});
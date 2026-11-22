describe('Hijacked AT-ST', function() {
    integration(function(contextRef) {
        it('Hijacked AT-ST does not ready the next regroup phase after being played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hijacked-atst'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hijackedAtst);

            context.moveToNextActionPhase();

            expect(context.hijackedAtst.exhausted).toBeTrue();

            context.moveToNextActionPhase();

            expect(context.hijackedAtst.exhausted).toBeFalse();
        });

        it('Hijacked AT-ST can be readied by ability on action phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hijacked-atst', 'bravado'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hijackedAtst);

            context.player2.passAction();

            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.hijackedAtst);

            context.player2.passAction();

            context.player1.clickCard(context.hijackedAtst);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();
            expect(context.hijackedAtst.exhausted).toBeTrue();
        });
    });
});

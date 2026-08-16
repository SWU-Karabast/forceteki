describe('Carbonite Chamber', function() {
    integration(function(contextRef) {
        it('Carbonite Chamber\'s action ability should defeat this upgrade and prevent a non-Vehicle unit from readying during the next regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['carbonite-chamber'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    hand: ['bravado'],
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();
            context.player1.clickCard(context.carboniteChamber);

            expect(context.player1).toHavePrompt('Choose a non-Vehicle unit. It doesn\'t ready during the next regroup phase');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.carboniteChamber).toBeInZone('discard', context.player1);

            context.player2.clickCard(context.bravado);
            context.player2.clickCard(context.wampa);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.moveToNextActionPhase();

            expect(context.wampa.exhausted).toBeTrue();

            context.moveToNextActionPhase();

            expect(context.wampa.exhausted).toBeFalse();
        });
    });
});

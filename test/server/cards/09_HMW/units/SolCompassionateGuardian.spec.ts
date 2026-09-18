describe('Sol, Compassionate Guardian', function() {
    integration(function(contextRef) {
        it('Sol\'s ability should gain Sentinel for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['sol#compassionate-guardian']
                },
                player2: {
                    groundArena: ['porg', 'wampa'],
                }
            });

            const { context } = contextRef;

            // gains Sentinel for this phase
            context.player1.clickCard(context.sol);
            context.player1.clickCard(context.p2Base);

            // cannot attack base
            context.player2.clickCard(context.porg);
            expect(context.player2).toBeAbleToSelectExactly([context.sol]);
            context.player2.clickCard(context.sol);

            context.moveToNextActionPhase();

            context.player1.passAction();
            context.player2.clickCard(context.wampa);

            // Sol does not have anymore Sentinel
            expect(context.player2).toBeAbleToSelectExactly([context.sol, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});


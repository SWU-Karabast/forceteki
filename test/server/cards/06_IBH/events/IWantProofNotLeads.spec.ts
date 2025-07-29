describe('I Want Proof, Not Leads', function() {
    integration(function(contextRef) {
        it('I Want Proof, Not Leads\'s ability should draw 2 cards and discard one', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-want-proof-not-leads', 'wampa'],
                    deck: ['battlefield-marine', 'gungi#finding-himself', 'yoda#old-master']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.iWantProofNotLeads);
            expect(context.player1.handSize).toBe(3);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.gungi]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.handSize).toBe(2);
            expect(context.wampa).toBeInZone('discard');
        });
    });
});
describe('Bail Organa, Responding to Catastrophe', function() {
    integration(function(contextRef) {
        it('Bail Organa\'s on attack ability should allow discarding a card to create a Spy token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bail-organa#responding-to-catastrophe'],
                    hand: ['takedown'],
                },
            });

            const { context } = contextRef;

            // Attack to trigger the on attack ability
            context.player1.clickCard(context.bailOrganaRespondingToCatastrophe);
            context.player1.clickCard(context.p2Base);

            // Optional ability to discard a card and create a Spy token
            expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand. If you do, create a Spy token');
            context.player1.clickPrompt('Trigger');

            // Discard a card from hand
            expect(context.player1).toBeAbleToSelectExactly([context.takedown]);
            context.player1.clickCard(context.takedown);

            // Verify a Spy token was created
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});

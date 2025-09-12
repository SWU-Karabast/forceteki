describe('Mas Amedda, Accomplice To Power', function () {
    integration(function (contextRef) {
        it('Mas Amedda\'s ability should allow choosing up to 2 other Official units and give them Experience tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mas-amedda#accomplice-to-power'],
                    groundArena: ['aggrieved-parliamentarian', 'disaffected-senator', 'general-veers#blizzard-force-commander', 'wampa']
                },
                player2: {
                    groundArena: ['the-client#dictated-by-discretion']
                }
            });
            const { context } = contextRef;

            // Play Mas Amedda
            context.player1.clickCard(context.masAmeddaAccompliceToPower);

            // Should be able to select the two other Official units (Mas cannot target himself)
            expect(context.player1).toBeAbleToSelectExactly([
                context.aggrievedParliamentarian,
                context.disaffectedSenator,
                context.generalVeers,
                context.theClient,
            ]);

            context.player1.clickCard(context.aggrievedParliamentarian);
            context.player1.clickCard(context.disaffectedSenator);
            context.player1.clickPrompt('Done');

            // Both should now have an Experience token attached
            expect(context.aggrievedParliamentarian.upgrades.length).toBe(1);
            expect(context.aggrievedParliamentarian.upgrades[0].internalName).toBe('experience');
            expect(context.disaffectedSenator.upgrades.length).toBe(1);
            expect(context.disaffectedSenator.upgrades[0].internalName).toBe('experience');
        });

        it('Mas Amedda\'s ability should allow choosing nothing (up to 2) and not give any tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mas-amedda#accomplice-to-power'],
                    groundArena: ['aggrieved-parliamentarian']
                },
                player2: {}
            });
            const { context } = contextRef;

            // Play Mas Amedda
            context.player1.clickCard(context.masAmeddaAccompliceToPower);

            // Up to 2, and can choose no cards
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickPrompt('Choose nothing');

            // No experience tokens should be attached to the existing Official unit
            expect(context.aggrievedParliamentarian.upgrades.length).toBe(0);
        });
    });
});

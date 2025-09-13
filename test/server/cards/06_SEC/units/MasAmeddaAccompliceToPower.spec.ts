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
            expect(context.aggrievedParliamentarian).toHaveExactUpgradeNames(['experience']);
            expect(context.disaffectedSenator).toHaveExactUpgradeNames(['experience']);
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

        it('Mas Amedda can be played using Plot and still grants tokens to up to 2 other Officials', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'admiral-piett#commanding-the-armada',
                    resources: ['mas-amedda#accomplice-to-power', 'wampa', 'wampa', 'wampa', 'wampa', 'atst'],
                    groundArena: ['aggrieved-parliamentarian', 'disaffected-senator']
                },
                player2: {
                    groundArena: ['the-client#dictated-by-discretion']
                }
            });
            const { context } = contextRef;

            // Deploy the leader to open Plot window
            context.player1.clickCard(context.admiralPiett);
            context.player1.clickPrompt('Deploy Admiral Piett');

            // Expect Plot prompt for Mas Amedda
            expect(context.player1).toHavePassAbilityPrompt('Play Mas Amedda using Plot');
            context.player1.clickPrompt('Trigger');

            // Mas Amedda enters play; When Played ability should prompt for targets (cannot target himself)
            expect(context.player1).toBeAbleToSelectExactly([
                context.aggrievedParliamentarian,
                context.disaffectedSenator,
                context.theClient,
                context.admiralPiett
            ]);

            // Choose two Officials and resolve
            context.player1.clickCard(context.aggrievedParliamentarian);
            context.player1.clickCard(context.disaffectedSenator);
            context.player1.clickPrompt('Done');

            // Verify Experience tokens attached
            expect(context.aggrievedParliamentarian).toHaveExactUpgradeNames(['experience']);
            expect(context.disaffectedSenator).toHaveExactUpgradeNames(['experience']);
        });
    });
});

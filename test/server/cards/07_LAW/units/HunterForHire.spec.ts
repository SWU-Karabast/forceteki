describe('Hunter for Hire', function() {
    integration(function(contextRef) {
        it('should allow opponent to take control by defeating a friendly Credit token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    credits: 1,
                    groundArena: ['hunter-for-hire']
                },
                player2: {
                    hasInitiative: true,
                    hasForceToken: true,
                    credits: 1,
                    groundArena: [{ card: 'battle-droid', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            const p1Credit = context.player1.findCardByName('credit');
            const p2Credit = context.player2.findCardByName('credit');

            // Player 2 takes control of Hunter for Hire
            context.player2.clickCard(context.hunterForHire);
            expect(context.player2).toHavePrompt('Defeat a friendly Credit token');
            expect(context.player2).toBeAbleToSelectExactly([
                // No other tokens should be selectable
                p2Credit
            ]);

            context.player2.clickCard(p2Credit);

            // Credit token is defeated and Hunter for Hire is now controlled by Player 2
            expect(p2Credit).toBeInZone('outsideTheGame');
            expect(context.player2.credits).toBe(0);
            expect(context.hunterForHire).toBeInZone('groundArena', context.player2);
            expect(context.getChatLogs(1)).toContain('player2 uses Hunter for Hire, defeating Credit to take control of Hunter for Hire');
        });

        it('should not be selectable by a player with no credits', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hunter-for-hire']
                },
                player2: {
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Player 2 cannot select Hunter for Hire because they have no credits
            expect(context.hunterForHire).not.toHaveAvailableActionWhenClickedBy(context.player2);
        });

        it('should allow controlling player to use the ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    credits: 1,
                    groundArena: ['hunter-for-hire']
                }
            });

            const { context } = contextRef;

            const p1Credit = context.player1.findCardByName('credit');

            // Player 1 uses ability on their own unit
            context.player1.clickCard(context.hunterForHire);
            expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Take control of this unit']);
            context.player1.clickPrompt('Take control of this unit');

            expect(context.player1).toHavePrompt('Defeat a friendly Credit token');
            context.player1.clickCard(p1Credit);

            expect(p1Credit).toBeInZone('outsideTheGame');
            expect(context.player1.credits).toBe(0);
            expect(context.hunterForHire).toBeInZone('groundArena', context.player1);
        });

        it('should allow the unit to be taken back after opponent takes control', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    credits: 1,
                    groundArena: ['hunter-for-hire']
                },
                player2: {
                    hasInitiative: true,
                    credits: 1
                }
            });

            const { context } = contextRef;

            const p1Credit = context.player1.findCardByName('credit');
            const p2Credit = context.player2.findCardByName('credit');

            // Player 2 takes control of Hunter for Hire
            context.player2.clickCard(context.hunterForHire);
            context.player2.clickCard(p2Credit);

            expect(p2Credit).toBeInZone('outsideTheGame');
            expect(context.hunterForHire).toBeInZone('groundArena', context.player2);

            // Player 1 takes control back
            context.player1.clickCard(context.hunterForHire);
            context.player1.clickCard(p1Credit);

            expect(p1Credit).toBeInZone('outsideTheGame');
            expect(context.hunterForHire).toBeInZone('groundArena', context.player1);
        });
    });
});

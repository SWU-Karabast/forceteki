describe('Unlimited Power', function() {
    integration(function(contextRef) {
        it('should deal 4 damage to a unit, 3 damage to a second unit, 2 damage to a third unit, and 1 damage to a fourth unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-turncoat'],
                    hand: ['unlimited-power'],
                },
                player2: {
                    groundArena: ['warzone-lieutenant'],
                    spaceArena: ['squadron-of-vultures'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.unlimitedPower);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.squadronOfVultures, context.cartelTurncoat, context.warzoneLieutenant]);

            // Select unit to deal 4 damage to
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.squadronOfVultures, context.cartelTurncoat, context.warzoneLieutenant]);

            // Select unit to deal 3 damage to
            context.player1.clickCard(context.squadronOfVultures);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat, context.warzoneLieutenant]);

            // Select unit to deal 2 damage to
            context.player1.clickCard(context.cartelTurncoat);
            expect(context.player1).toBeAbleToSelectExactly([context.warzoneLieutenant]);

            // Select unit to deal 1 damage to
            context.player1.clickCard(context.warzoneLieutenant);

            expect(context.wampa.damage).toBe(4);
            expect(context.squadronOfVultures.damage).toBe(3);
            expect(context.cartelTurncoat.damage).toBe(2);
            expect(context.warzoneLieutenant.damage).toBe(1);
        });
    });
});

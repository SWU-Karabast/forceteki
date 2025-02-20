describe('Gentle Giant', function() {
    integration(function(contextRef) {
        describe('Gentle Giant\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'gentle-giant', damage: 1 },
                            { card: 'r2d2#ignoring-protocol', damage: 3 },
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa' }]
                    }
                });
            });

            it('can heal a target unit for the amount of damage it has', function () {
                const { context } = contextRef;

                // CASE 1: Heal a target
                // Attack
                context.player1.clickCard(context.gentleGiant);
                context.player1.clickCard(context.p2Base);

                // Checking the you may part
                expect(context.player1).toHavePassAbilityButton();

                // Actually healing a unit
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.wampa]);
                context.player1.clickCard(context.r2d2);

                // Confirm Results
                expect(context.gentleGiant.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(2);
            });
        });
    });
});

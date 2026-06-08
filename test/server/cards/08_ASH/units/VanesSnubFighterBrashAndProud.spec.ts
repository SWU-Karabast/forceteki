describe('Vane\'s Snub Fighter, Brash and Proud', function() {
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vanes-snub-fighter#brash-and-proud'],
                        groundArena: ['porg', 'atst', 'cloudrider-veteran']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should give an Advantage token to Vane\'s Snub Fighter when it deals combat damage to a base', function() {
                const { context } = contextRef;

                // Vane's Snub Fighter attacks the base, friendly On Attack Ends ability triggers
                context.player1.clickCard(context.vanesSnubFighter);
                context.player1.clickCard(context.p2Base);

                // Vane's Snub Fighter should have 1 Advantage token on it
                expect(context.vanesSnubFighter).toHaveExactUpgradeNames(['advantage']);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Advantage token to Vane\'s Snub Fighter when a friendly unit deals combat damage to a base', function() {
                const { context } = contextRef;

                // Vane's Snub Fighter attacks the base, friendly On Attack Ends ability triggers
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.p2Base);

                // Vane's Snub Fighter should have 1 Advantage token on it
                expect(context.vanesSnubFighter).toHaveExactUpgradeNames(['advantage']);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Advantage token to Vane\'s Snub Fighter when a friendly unit deals combat damage to a base with Overwhelm', function() {
                const { context } = contextRef;

                // Vane's Snub Fighter attacks the base, friendly On Attack Ends ability triggers
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                // Vane's Snub Fighter should have 1 Advantage token on it
                expect(context.vanesSnubFighter).toHaveExactUpgradeNames(['advantage']);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give an Advantage token to Vane\'s Snub Fighter when a friendly unit deals damage to a base with an ability', function() {
                const { context } = contextRef;

                // Cloud Rider Veteran attacks a unit and deals damage to a base using their ability
                context.player1.clickCard(context.cloudriderVeteran);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Vane's Snub Fighter should not have an Advantage token on it
                expect(context.vanesSnubFighter.isUpgraded()).toBeFalse();
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
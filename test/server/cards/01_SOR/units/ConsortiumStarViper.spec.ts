describe('Consortium Star Viper', function () {
    integration(function (contextRef) {
        describe('Consortium Star Viper\'s ability', function () {
            it('should grant restore 2 while you have initiative', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['consortium-starviper'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                // Player1 has initiative - so this hits opponent base, and heals base for 2
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(3);

                // Reset and flip initiative
                context.consortiumStarviper.exhausted = false;
                context.player2.claimInitiative();

                // Player1 no longer has initiative, so this will not heal the base
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(3);
            });
        });
    });
});
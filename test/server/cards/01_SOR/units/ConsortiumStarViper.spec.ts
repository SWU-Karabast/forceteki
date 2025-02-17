describe('Consortium Star Viper', function () {
    integration(function (contextRef) {
        describe('Consortium Star Viper\'s ability', function () {
            it('should grant restore 2 while you have initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['consortium-starviper'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                    },
                    player2: {
                        groundArena: ['atst'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Player1 starts with initiative - so this hits opponent base, and heals base for 2
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(3);

                // Reset and flip initiative
                context.consortiumStarviper.exhausted = false;
                context.player2.claimInitiative();

                // Player1 no longer has initiative, so this will not heal the base
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(3);

                // Now lets test the other direction: regaining initiative
                context.moveToNextActionPhase();
                context.player2.passAction();

                // Player1 starts without the initiative, so this will not heal the base
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(3);

                context.player2.passAction();
                context.player1.claimInitiative();

                // We entered regroup phase, move to next action phase
                context.nextPhase();

                // Player1 has regained initiative, viper should heal again
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.p1Base.damage).toBe(1);
            });
        });
    });
});

describe('Obi-Wan Kenobi, Following Fate', function() {
    integration(function(contextRef) {
        describe('Obi-Wan Kenobi, Following Fate\'s when defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        groundArena: ['obiwan-kenobi#following-fate', 'yoda#old-master', 'consular-security-force']
                    }
                });
            });

            it('should give 2 experience tokens to another friendly unit, and draw the controller a card only if that unit has the "Force" trait', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player2).toBeAbleToSelectExactly([context.yoda, context.consularSecurityForce]);
                const handSizeBeforeTriggerResolves = context.player2.hand.length;
                context.player2.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2.hand.length).toBe(handSizeBeforeTriggerResolves);
            });

            it('should draw the controller a card if the target unit has the "Force" trait', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.obiwanKenobi);

                const handSizeBeforeTriggerResolves = context.player2.hand.length;
                context.player2.clickCard(context.yoda);

                expect(context.yoda).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2.hand.length).toBe(handSizeBeforeTriggerResolves + 1);
            });
        });
        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['obiwan-kenobi#following-fate']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['maul#shadow-collective-visionary'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.obiwanKenobi);
            context.player2.clickCard(context.maul);
            expect(context.maul).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.player2.handSize).toBe(1);

            context.player1.passAction();
        });
    });
});

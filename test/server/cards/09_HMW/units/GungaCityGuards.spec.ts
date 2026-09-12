describe('Gunga City Guards', function() {
    integration(function(contextRef) {
        describe('Gunga City Guards\'s ability', function() {
            it('should have Shielded when you control a Naboo base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['gunga-city-guards', 'the-armorer#secrecy-is-our-survival'],
                        base: 'great-grass-plains'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungaCityGuards);

                expect(context.player2).toBeActivePlayer();
                expect(context.gungaCityGuards).toHaveExactUpgradeNames(['shield']);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Shielded');

                expect(context.player2).toBeActivePlayer();
                expect(context.gungaCityGuards).toHaveExactUpgradeNames(['shield', 'shield']);
            });

            it('should have Shielded when you control another Gungan unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['gunga-city-guards'],
                        groundArena: ['gungan-warrior'],
                        base: 'energy-conversion-lab'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungaCityGuards);

                expect(context.player2).toBeActivePlayer();
                expect(context.gungaCityGuards).toHaveExactUpgradeNames(['shield']);
            });

            it('should not have Shielded when you do not control another Gungan unit and no Naboo base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['gunga-city-guards'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        groundArena: ['gungan-warrior'],
                        base: 'lake-country'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungaCityGuards);

                expect(context.player2).toBeActivePlayer();
                expect(context.gungaCityGuards).toHaveExactUpgradeNames([]);
            });
        });
    });
});

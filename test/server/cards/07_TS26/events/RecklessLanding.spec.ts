describe('Reckless Landing', function () {
    integration(function (contextRef) {
        describe('Reckless Landing\'s ability', function () {
            it('should play Rebel Blockade Runner for free and deal 4 damages to that it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing', 'rebel-blockade-runner'],
                        resources: 2,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelBlockadeRunner]);
                context.player1.clickCard(context.rebelBlockadeRunner);
                expect(context.rebelBlockadeRunner.damage).toBe(4);
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should not bug if there is no legal card to be played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing'],
                        resources: 2,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});


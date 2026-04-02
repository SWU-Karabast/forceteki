describe('Reckless Landing', function () {
    integration(function (contextRef) {
        describe('Reckless Landing\'s ability', function () {
            it('should play Rebel Blockade Runner for free and deal 4 damages to that it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing', 'rebel-blockade-runner', 'beguile', 'sudden-ferocity'],
                        resources: 2,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player1).toHavePrompt('Choose a card');
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

            it('should apply damage before shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing', 'sorcerers-of-tund'],
                        resources: 4,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.sorcerersOfTund);
                expect(context.sorcerersOfTund.damage).toBe(4);
                expect(context.sorcerersOfTund).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should defeat 4 HP units immediately', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing', 'bokatan-kryze#the-lawless'],
                        resources: 2,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.bokatanKryze);
                expect(context.bokatanKryze).toBeInZone('discard');
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should be able to chose nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-landing', 'bokatan-kryze#the-lawless'],
                        resources: 2,
                        leader: 'admiral-ackbar#its-a-trap',
                        base: 'catacombs-of-cadera'
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.recklessLanding);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');
                expect(context.bokatanKryze).toBeInZone('hand');
                expect(context.player1.readyResourceCount).toBe(0);
            });
        });
    });
});


describe('Rookie Rocket-jumper', function() {
    integration(function(contextRef) {
        describe('Rookie Rocket-jumper\'s ability', function() {
            it('should be able to pass on the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rookie-rocketjumper'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rookieRocketjumper);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.rookieRocketjumper).toHaveExactUpgradeNames([]);
            });

            it('should be able to pay 1 resource and give this unit a Shield token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rookie-rocketjumper'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rookieRocketjumper);
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.rookieRocketjumper).toHaveExactUpgradeNames(['shield']);
            });

            it('should be able to pay 1 resource and give this unit a Shield token (die before ability)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rookie-rocketjumper'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['supreme-leader-snoke#shadow-ruler']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rookieRocketjumper);
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.rookieRocketjumper).toBeInZone('discard', context.player1);
                expect(context.supremeLeaderSnoke).toHaveExactUpgradeNames([]);
            });
        });
    });
});

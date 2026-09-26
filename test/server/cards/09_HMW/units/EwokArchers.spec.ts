describe('Ewok Archers', function() {
    integration(function(contextRef) {
        it('should not have Ambush when not controlling a unit which costs 3 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ewok-archers', 'wampa'],
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.ewokArchers);

            expect(context.player2).toBeActivePlayer();
        });

        it('should have Ambush when controlling a unit which costs 3 or less (cost 2 - ground)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ewok-archers'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.ewokArchers);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
        });

        it('should have Ambush when controlling a unit which costs 3 or less (cost 3 - space)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ewok-archers'],
                    spaceArena: ['stolen-athauler'],
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.ewokArchers);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
        });
    });
});

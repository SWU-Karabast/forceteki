describe('Wartime Profiteer', function () {
    integration(function (contextRef) {
        it('Wartime Profiteer\'s ability should allow opponent to choose to ready a resource when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    leader: 'chewbacca#walking-carpet',
                    resources: 4
                },
                player2: {
                    groundArena: ['wartime-profiteer'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.wartimeProfiteer);

            expect(context.player1).toHavePassAbilityPrompt('Ready a resource');
            context.player1.clickPrompt('Trigger');
            expect(context.player1.readyResourceCount).toBe(1);
        });

        it('Wartime Profiteer\'s ability should allow player to choose to ready a resource when defeated (defeat by No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                },
                player2: {
                    groundArena: ['wartime-profiteer'],
                }
            });
            const { context } = contextRef;

            context.player2.exhaustResources(context.player2.resources.length);

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.wartimeProfiteer);

            expect(context.player2).toHavePassAbilityPrompt('Ready a resource');
            context.player2.clickPrompt('Trigger');
            expect(context.player2.readyResourceCount).toBe(1);
        });

        it('Wartime Profiteer\'s ability should not trigger if there no resource to ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['wartime-profiteer'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.wartimeProfiteer);

            expect(context.player1).not.toHavePassAbilityPrompt('Ready a resource');
            expect(context.player2).toBeActivePlayer();
            expect(context.wartimeProfiteer).toBeInZone('discard', context.player2);
        });
    });
});
describe('Lifetree Caravan', function() {
    integration(function(contextRef) {
        it('should resource the top card of deck if we control 3 units or more', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lifetree-caravan'],
                    groundArena: ['battlefield-marine'],
                    deck: ['porg', 'wampa'],
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.lifetreeCaravan);
            expect(context.player1).toHavePassAbilityPrompt('Resource the top card of your deck');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount + 1);
            expect(context.porg).toBeInZone('resource', context.player1);
            expect(context.wampa).toBeInZone('deck', context.player1);
        });

        it('should be skipped as deck is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lifetree-caravan'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.lifetreeCaravan);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount);
        });

        it('should be skipped by controller', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lifetree-caravan'],
                    groundArena: ['battlefield-marine'],
                    deck: ['porg', 'wampa'],
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.lifetreeCaravan);
            expect(context.player1).toHavePassAbilityPrompt('Resource the top card of your deck');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount);
            expect(context.porg).toBeInZone('deck', context.player1);
            expect(context.wampa).toBeInZone('deck', context.player1);
        });

        it('should not trigger when we control less than 3 units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lifetree-caravan'],
                    deck: ['porg', 'wampa'],
                    spaceArena: ['awing']
                }, player2: {
                    groundArena: ['battlefield-marine', 'atst', 'yoda#old-master']
                }
            });

            const { context } = contextRef;

            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.lifetreeCaravan);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount);
            expect(context.porg).toBeInZone('deck', context.player1);
        });
    });
});

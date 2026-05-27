describe('Emperor\'s Messenger', function() {
    integration(function(contextRef) {
        it('Emperor\'s Messenger\'s ability should ready a resource when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['emperors-messenger'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;

            context.player2.passAction();

            context.player1.clickCard(context.emperorsMessenger);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount - 1);
        });

        it('Emperor\'s Messenger\'s support ability should ready a resource', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emperors-messenger'],
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.emperorsMessenger);
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount - 1);
        });
    });
});

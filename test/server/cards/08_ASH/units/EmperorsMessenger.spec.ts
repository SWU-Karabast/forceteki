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

            expect(context.player1).toHavePrompt('Choose a player to target for ability \'Ready a resource\'');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount - 1);
        });

        it('Emperor\'s Messenger\'s ability should ready a resource when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['emperors-messenger'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['wampa'],
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            const exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.clickCard(context.emperorsMessenger);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Opponent');

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount - 1);
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
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount - 1);
        });
    });
});

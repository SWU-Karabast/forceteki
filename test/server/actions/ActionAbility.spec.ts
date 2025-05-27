describe('An action ability', function() {
    integration(function(contextRef) {
        it('prompts the user to tell them that is has no effect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-inquisitor#hunting-the-jedi',
                    resources: 4
                },
                player2: {
                    groundArena: ['battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandInquisitor);
            expect(context.player1).toHavePrompt('The ability "Deal 2 damage to a friendly unit with 3 or less power and ready it" will have no effect. Are you sure you want to use it?');
            expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);

            context.player1.clickPrompt('Cancel');
            expect(context.grandInquisitor.exhausted).toBeFalse();
            expect(context.player1).toBeActivePlayer();
            expect(context.getChatLogs(1)).not.toContain('player1 attempted to use Grand Inquisitor, but there are insufficient legal targets');

            context.player1.clickCard(context.grandInquisitor);
            expect(context.player1).toHavePrompt('The ability "Deal 2 damage to a friendly unit with 3 or less power and ready it" will have no effect. Are you sure you want to use it?');
            expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);

            context.player1.clickPrompt('Use it anyway');
            expect(context.grandInquisitor.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs(1)).toContain('player1 attempted to use Grand Inquisitor, but there are insufficient legal targets');
        });
    });
});
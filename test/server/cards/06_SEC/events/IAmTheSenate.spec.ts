describe('I Am The Senate', function() {
    integration(function(contextRef) {
        it('I Am The Senate\'s ability should create 5 Spy tokens when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-am-the-senate']
                },
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iAmTheSenate);

            // Verify 5 Spy tokens were created
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(5);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
            expect(context.getChatLogs(1)).toEqual(['player1 plays I Am the Senate to create 5 Spys']);
        });
    });
});
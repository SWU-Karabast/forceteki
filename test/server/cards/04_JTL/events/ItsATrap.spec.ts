describe('It\'s a Trap', function() {
    integration(function(contextRef) {
        it('It\'s a Trap\'s ability should ready all space units controlled the player', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['its-a-trap'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                    groundArena: ['battlefield-marine', 'wampa', 'yoda#old-master']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'tieln-fighter', exhausted: true }, { card: 'tie-advanced', exhausted: true }, { card: 'imperial-interceptor', exhausted: true }]
                }
            });

            const { context } = contextRef;

            // Play the event
            expect(context.greenSquadronAwing.exhausted).toBe(true);
            context.player1.clickCard(context.itsATrap);

            // Ability should ignore opponent has more ground units and only consider the player's space units
            expect(context.greenSquadronAwing.exhausted).toBe(false);
            expect(context.tielnFighter.exhausted).toBe(true);
            expect(context.tieAdvanced.exhausted).toBe(true);
            expect(context.imperialInterceptor.exhausted).toBe(true);
        });

        it('It\'s a Trap\'s ability Should not ready any space unit as the player has fewer units than the opponent', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['its-a-trap'],
                    spaceArena: [{ card: 'tieln-fighter', exhausted: true }, { card: 'tie-advanced', exhausted: true }, { card: 'imperial-interceptor', exhausted: true }],
                    groundArena: ['battlefield-marine', 'wampa', 'yoda#old-master']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            // Play the event
            expect(context.greenSquadronAwing.exhausted).toBe(true);
            context.player1.clickCard(context.itsATrap);
            context.player1.clickPrompt('Play anyway');

            // Player controls more space units than the opponent so no units should be readied
            expect(context.greenSquadronAwing.exhausted).toBe(true);
            expect(context.tielnFighter.exhausted).toBe(true);
            expect(context.tieAdvanced.exhausted).toBe(true);
            expect(context.imperialInterceptor.exhausted).toBe(true);
        });
    });
});

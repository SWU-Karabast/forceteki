describe('Local Support', function() {
    integration(function(contextRef) {
        it('should draw the top card of the deck if it matches a trait in play for the player', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['local-support'],
                    groundArena: ['criminal-muscle'],
                    deck: ['ma-klounkee']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.localSupport);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.maKlounkee]);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.maKlounkee).toBeInZone('hand', context.player1);
        });

        it('should not draw the top card of the deck if it matches a trait in play for the opponent', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['local-support'],
                    groundArena: ['wampa'],
                    deck: ['ma-klounkee']
                },
                player2: {
                    groundArena: ['criminal-muscle']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.localSupport);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.maKlounkee]);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.maKlounkee).toBeInZone('deck', context.player1);
        });

        it('should not break if the deck is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['local-support'],
                    groundArena: ['criminal-muscle'],
                    deck: []
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.localSupport);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(0);
        });
    });
});
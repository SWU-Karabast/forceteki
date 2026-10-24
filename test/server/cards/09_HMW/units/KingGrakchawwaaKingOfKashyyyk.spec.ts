describe('King Grakchawwaa, King of Kashyyyk', function() {
    integration(function(contextRef) {
        it('should resource the top cards of deck for each other friendly Wookiee unit and ready them', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    hand: ['king-grakchawwaa#king-of-kashyyyk'],
                    groundArena: ['wookiee-rangers', 'wookiee-warrior'],
                    deck: ['porg', 'wampa', 'atst'],
                    resources: 8
                }
            });

            const { context } = contextRef;
            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.kingGrakchawwaa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount + 2);
            expect(context.porg).toBeInZone('resource', context.player1);
            expect(context.wampa).toBeInZone('resource', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
            expect(context.porg.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
        });

        it('should not resource any cards when no other friendly Wookiee unit is in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    hand: ['king-grakchawwaa#king-of-kashyyyk'],
                    deck: ['porg', 'wampa'],
                    resources: 8
                }
            });

            const { context } = contextRef;
            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.kingGrakchawwaa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount);
            expect(context.porg).toBeInZone('deck', context.player1);
            expect(context.wampa).toBeInZone('deck', context.player1);
        });

        it('should not resource more cards than are in the deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    hand: ['king-grakchawwaa#king-of-kashyyyk'],
                    groundArena: ['wookiee-rangers', 'wookiee-warrior'],
                    deck: ['porg'],
                    resources: 8
                }
            });

            const { context } = contextRef;
            const resourceCount = context.player1.resources.length;

            context.player1.clickCard(context.kingGrakchawwaa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(resourceCount + 1);
            expect(context.porg).toBeInZone('resource', context.player1);
            expect(context.porg.exhausted).toBeFalse();
        });
    });
});

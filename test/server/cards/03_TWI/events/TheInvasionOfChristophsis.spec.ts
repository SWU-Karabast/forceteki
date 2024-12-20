describe('The Invasion Of Christophsis', function() {
    integration(function(contextRef) {
        it('should defeat all opponents units', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    hand: ['the-invasion-of-christophsis']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['alliance-xwing'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theInvasionOfChristophsis);
            expect(context.player2.getCardsInZone('groundArena').length).toBe(0);
            expect(context.player2.getCardsInZone('spaceArena').length).toBe(0);
            expect(context.player1.getCardsInZone('groundArena').length).toBe(1);
        });
    });
});

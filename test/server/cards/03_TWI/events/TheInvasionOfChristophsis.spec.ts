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
            expect(context.wampa).toBeInZone('discard');
            expect(context.allianceXwing).toBeInZone('discard');
            expect(context.lukeSkywalker).toBeInZone('base');
            expect(context.battlefieldMarine).toBeInZone('groundArena');
        });
    });
});

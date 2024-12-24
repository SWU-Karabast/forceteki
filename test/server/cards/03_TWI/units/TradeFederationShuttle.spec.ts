describe('Trade Federation Shuttle', function() {
    integration(function(contextRef) {
        it('should create a Battle droid if there is a damaged friendly unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['trade-federation-shuttle'],
                    groundArena: [{ card: '332nd-stalwart', damage: 1 }]
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                }
            });

            const { context } = contextRef;
            // battledroid created as damaged unit in play
            context.player1.clickCard(context.tradeFederationShuttle);
            const battleDroid = context.player1.findCardsByName('battle-droid');
            expect(battleDroid.length).toBe(1);
            expect(battleDroid[0]).toBeInZone('groundArena');

            // prep for next test
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.tradeFederationShuttle);
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context._332ndStalwart);

            // No battle droid created - 1 unit in space and 1 unit on ground
            context.player1.clickCard(context.tradeFederationShuttle);
            expect(context.player1.getCardsInZone('groundArena').length).toBe(1);
            expect(context.player1.getCardsInZone('spaceArena').length).toBe(1);
        });
    });
});

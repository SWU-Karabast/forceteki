describe('Hold For Questioning', function() {
    integration(function(contextRef) {
        describe('Hold For Questioning\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-for-questioning'],
                        groundArena: ['rebel-pathfinder']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should exhaust an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdForQuestioning);
                
                // Should be able to target enemy units
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                
                context.player1.clickCard(context.battlefieldMarine);
                
                // Unit should be exhausted
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                
                // Since opponent has no cards in hand, should just end turn
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

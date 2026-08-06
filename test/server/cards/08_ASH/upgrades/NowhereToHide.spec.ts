describe('Nowhere to Hide', function() {
    integration(function(contextRef) {
        describe('Nowehere to Hide\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'snowspeeder', upgrades: ['nowhere-to-hide'] }]
                    },
                });
            });

            it('should be sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.snowspeeder]);
                context.player1.clickCard(context.snowspeeder);
                expect(context.player2).toBeActivePlayer();
                expect(context.snowspeeder.damage).toBe(3);
                // make sure upgrade shrink is working
                expect(context.battlefieldMarine.damage).toBe(1);
            });
        });
    });
});
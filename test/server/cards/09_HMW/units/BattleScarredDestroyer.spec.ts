describe('Battle-Scarred Destroyer', function() {
    integration(function(contextRef) {
        describe('Battle-Scarred Destroyer\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlescarred-destroyer'],
                        groundArena: ['greedo#slow-on-the-draw'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should deal 4 damage to a friendly unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.battlescarredDestroyer);
                // must select a friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlescarredDestroyer, context.greedo, context.greenSquadronAwing]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // choose to deal to yourself
                context.player1.clickCard(context.battlescarredDestroyer);
                expect(context.battlescarredDestroyer.damage).toBe(4);
                expect(context.greedo.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
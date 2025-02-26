describe('Devastator', function () {
    integration(function (contextRef) {
        describe('Devastator\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#inescapable'],
                        groundArena: ['seasoned-shoretrooper'],
                        // 14 resources
                        resources: 14
                    },
                    player2: {
                        groundArena: [{
                            // should be 15 hp
                            card: 'rugged-survivors', upgrades: ['entrenched', 'entrenched', 'entrenched', 'experience']
                        }]
                    }
                });
            });

            it('should buff him with 6 or more resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.devastator);
                expect(context.player1).toBeAbleToSelectExactly([context.devastator, context.seasonedShoretrooper, context.ruggedSurvivors]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.ruggedSurvivors);
                expect(context.ruggedSurvivors.damage).toBe(14);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

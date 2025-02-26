describe('Ruthless Assassin', function() {
    integration(function(contextRef) {
        describe('Ruthless Assassin\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ruthless-assassin'],
                        groundArena: ['greedo#slow-on-the-draw'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should deal 2 damage to a friendly unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ruthlessAssassin);
                // must select a friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.ruthlessAssassin, context.greedo, context.greenSquadronAwing]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // choose to deal to yourself
                context.player1.clickCard(context.ruthlessAssassin);
                expect(context.ruthlessAssassin.damage).toBe(2);
                expect(context.greedo.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

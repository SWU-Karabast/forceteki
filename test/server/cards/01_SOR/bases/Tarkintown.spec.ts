describe('Tarkintown', function() {
    integration(function(contextRef) {
        describe('Tarkintown\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'tarkintown',
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', damage: 1 },
                            'wampa'
                        ],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 1 }
                    }
                });
            });

            it('should deal 3 damage to a damaged enemy non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tarkintown);

                // should resolve automatically since there's only one target
                expect(context.frontierAtrt.damage).toBe(4);
                expect(context.tarkintown.epicActionSpent).toBe(true);

                // confirm that the ability cannot be used again
                context.player2.passAction();
                expect(context.tarkintown).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();
                expect(context.tarkintown).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});

describe('Tarkintown', function() {
    integration(function(contextRef) {
        describe('Tarkintown\'s ability', function() {
            it('should deal 3 damage to a damaged enemy non-leader unit', async function () {
                await contextRef.setupTestAsync({
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
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tarkintown);
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt]);
                context.player1.clickCard(context.frontierAtrt);

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

            it('can be used even if there is no valid target', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'tarkintown',
                    },
                    player2: {
                        groundArena: [
                            'wampa'
                        ],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 1 }
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tarkintown);
                context.player1.clickPrompt('Use it anyway');

                expect(context.wampa.damage).toBe(0);
                expect(context.bobaFett.damage).toBe(1);
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

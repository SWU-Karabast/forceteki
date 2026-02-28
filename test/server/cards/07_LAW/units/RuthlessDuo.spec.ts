describe('Ruthless Duo', function() {
    integration(function(contextRef) {
        describe('Ruthless Duo\'s ability', function() {
            it('should deal 2 damage to a ground unit if Villainy aspect is in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ruthless-duo'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ruthlessDuo);
                expect(context.player1).toBeAbleToSelectExactly([context.ruthlessDuo, context.battlefieldMarine, context.atst]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should not trigger the ability if there is not Villainy friendly unit in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ruthless-duo'],
                        groundArena: [{ card: 'wampa', upgrades: ['battle-fury'] }]
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ruthlessDuo);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
            });
        });
    });
});

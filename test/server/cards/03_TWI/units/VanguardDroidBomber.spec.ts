describe('Vanguard Droid Bomber', function () {
    integration(function (contextRef) {
        describe('Vanguard Droid Bomber\'s ability', function () {
            it('should deal 2 damage to the opponent base because there is another friendly separatist unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanguard-droid-bomber'],
                        groundArena: ['specforce-soldier', 'warrior-drone'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanguardDroidBomber);
                expect(context.player2.base.damage).toBe(2);
                expect(context.wampa.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.warriorDrone.damage).toBe(0);
            });

            it('should not deal 2 damage to the opponent base because there is not another friendly separatist unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanguard-droid-bomber'],
                        groundArena: ['specforce-soldier'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanguardDroidBomber);
                expect(context.player2.base.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
            });
        });
    });
});

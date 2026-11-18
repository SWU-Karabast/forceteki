describe('Chewbacca, Cool Backpack', function() {
    integration(function(contextRef) {
        describe('its constant ability', function() {
            it('gets +4/+0 while damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'chewbacca#cool-backpack', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                expect(context.chewbacca.getPower()).toBe(8);
                expect(context.chewbacca.getHp()).toBe(6);
                expect(context.chewbacca.remainingHp).toBe(4);
            });

            it('has printed stats while undamaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chewbacca#cool-backpack']
                    }
                });

                const { context } = contextRef;

                expect(context.chewbacca.getPower()).toBe(4);
                expect(context.chewbacca.getHp()).toBe(6);
            });

            it('loses the bonus when its damage is fully healed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        groundArena: [{ card: 'chewbacca#cool-backpack', damage: 2 }],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                expect(context.chewbacca.getPower()).toBe(8);

                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca.damage).toBe(0);
                expect(context.chewbacca.getPower()).toBe(4);
            });
        });
    });
});

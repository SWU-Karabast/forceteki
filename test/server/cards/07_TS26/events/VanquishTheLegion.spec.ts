describe('Vanquish the Legion', function() {
    integration(function(contextRef) {
        it('Vanquish the Legion\'s ability should give enemy ground unit -2/-2 for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish-the-legion'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    hand: ['yoda#old-master'],
                    groundArena: ['atst', 'porg'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.vanquishTheLegion);

            expect(context.player2).toBeActivePlayer();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(context.atst.getPower()).toBe(4);
            expect(context.atst.getHp()).toBe(5);

            expect(context.awing.getPower()).toBe(1);
            expect(context.awing.getHp()).toBe(2);

            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.porg).toBeInZone('discard', context.player2);

            context.player2.clickCard(context.yoda);

            expect(context.player1).toBeActivePlayer();
            expect(context.yoda.getPower()).toBe(2);
            expect(context.yoda.getHp()).toBe(4);

            context.moveToNextActionPhase();

            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(context.awing.getPower()).toBe(1);
            expect(context.awing.getHp()).toBe(2);

            expect(context.greenSquadronAwing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getHp()).toBe(3);

            expect(context.yoda.getPower()).toBe(2);
            expect(context.yoda.getHp()).toBe(4);
        });
    });
});

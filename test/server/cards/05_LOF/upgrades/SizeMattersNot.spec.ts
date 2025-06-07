describe('Size Matters Not', function () {
    integration(function (contextRef) {
        it('Size Matters Not\'s ability should change printed stats to 5/5', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'dagobah-swamp',
                    hand: ['size-matters-not'],
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['experience'] }]
                }
            });

            const { context } = contextRef;

            expect(context.moistureFarmer.getPrintedPower()).toBe(0);
            expect(context.moistureFarmer.getPower()).toBe(1);
            expect(context.moistureFarmer.getPrintedHp()).toBe(4);
            expect(context.moistureFarmer.getHp()).toBe(5);

            context.player1.clickCard(context.sizeMattersNot);
            context.player1.clickCard(context.moistureFarmer);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.moistureFarmer.getPrintedPower()).toBe(5);
            expect(context.moistureFarmer.getPower()).toBe(6);
            expect(context.moistureFarmer.getPrintedHp()).toBe(5);
            expect(context.moistureFarmer.getHp()).toBe(6);
        });

        it('Size Matters Not\'s ability should cost one less if you control a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'dagobah-swamp',
                    hand: ['size-matters-not'],
                    groundArena: ['yoda#old-master', 'moisture-farmer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sizeMattersNot);
            context.player1.clickCard(context.moistureFarmer);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
describe('Curious Flock', function () {
    integration(function (contextRef) {
        it('Curious Flock\'s ability should allow paying up to 6 resources and gain experience', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['curious-flock'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.curiousFlock);
            expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 7 }, (_x, i) => `${i}`));
            context.player1.chooseListOption('3');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.curiousFlock).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
        });

        it('Curious Flock\'s ability should allow paying up to 6 resources (but max is 3) and gain experience', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['curious-flock'],
                    resources: 3
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.curiousFlock);
            expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 3 }, (_x, i) => `${i}`));
            context.player1.chooseListOption('1');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.curiousFlock).toHaveExactUpgradeNames(['experience']);
        });
    });
});
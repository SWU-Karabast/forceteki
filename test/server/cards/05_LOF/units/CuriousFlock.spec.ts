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
            expect(context.getChatLogs(3)).toEqual([
                'player1 plays Curious Flock',
                'player1 names 3 using Curious Flock',
                'player1 uses Curious Flock to pay 3 resources and then to give 3 Experience tokens to Curious Flock',
            ]);
        });

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
            context.player1.chooseListOption('0');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.curiousFlock).toHaveExactUpgradeNames([]);
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
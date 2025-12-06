describe('Renewed Friendship', function () {
    integration(function (contextRef) {
        it('Renewed Friendship\'s ability should return a unit from discard to hand and create two spy tokens for the controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['renewed-friendship'],
                    discard: ['power-of-the-dark-side', 'death-star-stormtrooper']
                },
                player2: {
                    discard: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.renewedFriendship);
            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.deathStarStormtrooper).toBeInZone('hand');

            const spy = context.player1.findCardsByName('spy');
            expect(spy.length).toBe(2);
            expect(spy[0]).toBeInZone('groundArena');
            expect(spy[0].exhausted).toBeTrue();
        });

        it('Renewed Friendship\'s ability should create two spy tokens for the controller even if no unit is returned', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['renewed-friendship'],
                    discard: ['power-of-the-dark-side']
                },
                player2: {
                    discard: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.renewedFriendship);

            const spy = context.player1.findCardsByName('spy');
            expect(spy.length).toBe(2);
            expect(spy[0]).toBeInZone('groundArena');
            expect(spy[0].exhausted).toBeTrue();

            expect(context.powerOfTheDarkSide).toBeInZone('discard');
        });
    });
});
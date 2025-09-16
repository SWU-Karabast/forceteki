describe('Bo-Katan Kryze, Alone', function () {
    integration(function (contextRef) {
        it('Bo-Katan Kryze\'s ability should give all enemy units -3/-3', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: false },
                    hand: ['bokatan-kryze#alone'],
                    groundArena: ['porg'],
                },
                player2: {
                    groundArena: ['wampa', 'rampaging-wampa'],
                }
            });

            const { context } = contextRef;

            // play Bo-Katan Kryze, Alone
            context.player1.clickCard(context.bokatanKryze);

            // select friendly unit to give experience token to (porg)
            expect(context.player1).toBeAbleToSelectExactly([context.bokatanKryze, context.porg]);
            context.player1.clickCard(context.porg);

            // verify enemy units are -3/-3
            expect(context.wampa.getPower()).toBe(1);
            expect(context.wampa.getHp()).toBe(2);
            expect(context.rampagingWampa).toBeInZone('discard');

            // check the porg got the experience token
            expect(context.porg.getPower()).toBe(2);
            expect(context.porg.getHp()).toBe(2);

            // pass phase, ensure -3/-3 is gone
            context.moveToNextActionPhase();
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});

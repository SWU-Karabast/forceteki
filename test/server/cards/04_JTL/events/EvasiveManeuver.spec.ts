describe('Evasive Maneuver', function () {
    integration(function (contextRef) {
        it('Evasive Maneuver\'s ability should exhaust a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['evasive-maneuver'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['inferno-four#unforgetting'],
                    leader: { card: 'admiral-piett#commanding-the-armada', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.evasiveManeuver);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.infernoFour, context.admiralPiett]);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
        });
    });
});

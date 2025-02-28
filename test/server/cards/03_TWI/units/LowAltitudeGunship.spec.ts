describe('Low Altitude Gunship', function () {
    integration(function (contextRef) {
        it('Low Altitude Gunship\'s ability should deal damage to a enemy unit equal to the number of republic friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-gunship'],
                    spaceArena: ['republic-defense-carrier']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lowAltitudeGunship);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(2);
        });
    });
});

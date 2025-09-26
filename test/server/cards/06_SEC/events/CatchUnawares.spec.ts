describe('Catch Unawares', function () {
    integration(function (contextRef) {
        it('should initiate an attack and give the defender -4/-0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['catch-unawares'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['atst']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.catchUnawares);

            // Choose attacker: Battlefield Marine, defender: AT-ST
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);

            // The defender (AT-ST, 6 power) gets -4/-0 for this attack, so it deals 2 counter damage.
            expect(context.battlefieldMarine.damage).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });
    });
});

describe('Dedra Meero, With Verifiable Data', function () {
    integration(function (contextRef) {
        it('Dedra Meero\'s on attack ability should create a Spy token when she attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dedra-meero#with-verifiable-data']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                },
            });

            const { context } = contextRef;

            // Attack an enemy unit to trigger On Attack
            context.player1.clickCard(context.dedraMeeroWithVerifiableData);
            context.player1.clickCard(context.battlefieldMarine);

            // Verify a Spy token was created under player1's control
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            // Turn should pass to player2
            expect(context.player2).toBeActivePlayer();
        });
    });
});

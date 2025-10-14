describe('Renowned Dignitaries', function() {
    integration(function(contextRef) {
        it('Renowned Dignitaries\'s when played ability should heal 2 damage to controller\'s base per Official friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['beloved-orator', 'renowned-dignitaries'],
                    spaceArena: ['leia-organa#extraordinary'],
                    base: { card: 'echo-base', damage: 10 },
                },
                player2: {
                    groundArena: ['the-client#dictated-by-discretion'],
                    base: { card: 'echo-base', damage: 10 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.belovedOrator);
            context.player2.passAction();
            context.player1.clickCard(context.renownedDignitaries);

            expect(context.player2).toBeActivePlayer();
            // beloved orator, spy token, renowned dignitaries, leia organa
            expect(context.p1Base.damage).toBe(2);
        });
    });
});

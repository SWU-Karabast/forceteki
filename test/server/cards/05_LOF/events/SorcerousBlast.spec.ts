describe('Sorcerous Blast', function() {
    integration(function(contextRef) {
        it('should use the Force and deal 3 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sorcerous-blast'],
                    groundArena: ['pyke-sentinel', 'academy-defense-walker'],
                    spaceArena: ['cartel-spacer'],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sorcerousBlast);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.academyDefenseWalker, context.wampa, context.imperialInterceptor, context.grandMoffTarkin]);

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
        });

        it('should bounce unit if only one available and nothing happens after that', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sorcerous-blast'],
                    groundArena: ['pyke-sentinel'],
                    hasForceToken: false,
                },
                player2: {
                    hasForceToken: true,
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sorcerousBlast);
            context.player1.clickPrompt('Play anyway');
            expect(context.sorcerousBlast).toBeInZone('discard', context.player1);
        });
    });
});

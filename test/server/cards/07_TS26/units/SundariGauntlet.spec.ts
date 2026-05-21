describe('Sundari Gauntlet', function() {
    integration(function(contextRef) {
        it('Sundari Gauntlet\'s on defense ability must deal 1 damage to controller base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['sundari-gauntlet'],
                },
                player2: {
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.awing);
            context.player2.clickCard(context.sundariGauntlet);

            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(1);
            expect(context.sundariGauntlet.damage).toBe(2);
            expect(context.awing).toBeInZone('discard', context.player2);
        });
    });
});

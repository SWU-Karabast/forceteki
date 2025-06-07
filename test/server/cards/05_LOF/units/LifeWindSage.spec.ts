describe('Life Wind Sage', () => {
    integration(function (contextRef) {
        it('Life Wind Sage does not gains Raid 2 while no enemy unit are exhausted', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['life-wind-sage', { card: 'wampa', exhausted: true }]
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.lifeWindSage);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });

        it('Life Wind Sage gains Raid 2 while an enemy unit is exhausted', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['life-wind-sage']
                },
                player2: {
                    groundArena: [{ card: 'consular-security-force', exhausted: true }]
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.lifeWindSage);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
        });
    });
});
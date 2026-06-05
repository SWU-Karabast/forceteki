describe('Grav Charge', function() {
    integration(function(contextRef) {
        it('Grav Charge\'s ability should deal 4 damage to attached unit and defeat itself when attack ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['grav-charge'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.gravCharge).toBeInZone('discard');
        });

        it('Grav Charge\'s ability should deal damage to attached unit\'s shield and defeat itself when attack ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield', 'grav-charge'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.gravCharge).toBeInZone('discard');
        });
    });
});

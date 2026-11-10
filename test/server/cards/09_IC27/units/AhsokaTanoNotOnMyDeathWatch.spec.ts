describe('Ahsoka Tano, Not On My Death Watch', function () {
    integration(function (contextRef) {
        it('Ahsoka Tano\'s ability should defeat a unit that costs 3 or less when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ahsoka-tano#not-on-my-death-watch'],
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: ['specforce-soldier', 'battlefield-marine', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);

            // Only units costing 3 or less are selectable: Consular Security Force (4) and Wampa (4) are excluded
            expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.battlefieldMarine, context.cartelSpacer]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.specforceSoldier);

            expect(context.specforceSoldier).toBeInZone('discard');
            expect(context.ahsokaTano).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});

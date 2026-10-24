describe('Radiant VII, Negotiating for Naboo', function() {
    integration(function(contextRef) {
        it('Radiant VII\'s ability should deal to damge to itself and give a Shield token to itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['radiant-vii#negotiating-for-naboo'],
                    groundArena: ['501st-liberator', 'clone-dive-trooper'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.radiantVii);
            expect(context.player1).toHavePassAbilityPrompt('Deal 3 damage to this unit. If you do, give a Shield token to it');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.radiantVii.damage).toBe(3);
            expect(context.radiantVii).toHaveExactUpgradeNames(['shield']);
            expect(context._501stLiberator.damage).toBe(0);
            expect(context._501stLiberator).toHaveExactUpgradeNames([]);
            expect(context.cloneDiveTrooper.damage).toBe(0);
            expect(context.cloneDiveTrooper).toHaveExactUpgradeNames([]);
        });

        it('Radiant VII\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['radiant-vii#negotiating-for-naboo'],
                    groundArena: ['501st-liberator', 'clone-dive-trooper'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.radiantVii);
            expect(context.player1).toHavePassAbilityPrompt('Deal 3 damage to this unit. If you do, give a Shield token to it');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.radiantVii.damage).toBe(0);
            expect(context.radiantVii).toHaveExactUpgradeNames([]);
            expect(context._501stLiberator.damage).toBe(0);
            expect(context._501stLiberator).toHaveExactUpgradeNames([]);
            expect(context.cloneDiveTrooper.damage).toBe(0);
            expect(context.cloneDiveTrooper).toHaveExactUpgradeNames([]);
        });
    });
});
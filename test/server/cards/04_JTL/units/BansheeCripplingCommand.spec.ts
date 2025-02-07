describe('Banshee, Crippling Command', function() {
    integration(function(contextRef) {
        it('Banshee, Crippling Command\'s ability should deal damage to a unit equal to the amount of damage on this unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'banshee#crippling-command', damage: 2 }],
                    groundArena: ['wampa'],
                    hand: ['repair'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['restored-arc170']
                }
            });

            const { context } = contextRef;

            // Trigger the defeat ability
            context.player1.clickCard(context.banshee);
            context.player1.clickCard(context.p2Base);

            // Assert ability Deal damage to a unit equal to the amount of damage on this unit
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toHavePrompt('Choose a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.restoredArc170, context.banshee]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(2);

            // Repair the Banshee
            context.player2.passAction();
            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.banshee);
            context.moveToNextActionPhase();

            // Attack with Banshee as it has no damage ability should not trigger
            context.player1.clickCard(context.banshee);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
        });
    });
});

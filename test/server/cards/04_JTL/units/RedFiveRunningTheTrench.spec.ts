describe('Red Five, Running The Trench', function() {
    integration(function(contextRef) {
        it('Red Five, Running The Trench\'s ability should deal damage to a damaged unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['red-five#running-the-trench'],
                    groundArena: [{ card: 'wampa', damage: 1 }]
                },
                player2: {
                    groundArena: [{ card: 'atst', damage: 1 }, 'battlefield-marine'],
                    spaceArena: ['restored-arc170']
                }
            });

            const { context } = contextRef;

            // Attack with Red Five, Running The Trench and check if the damaged unit is dealt 2 damage
            context.player1.clickCard(context.redFive);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt('Choose a unit');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(3);

            // Attack with Red Five, Running The Trench but no unit is damaged so ability is not triggered

            // Reset board state
            context.setDamage(context.atst, 0);
            context.setDamage(context.wampa, 0);
            context.moveToNextActionPhase();

            context.player1.clickCard(context.redFive);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
        });
    });
});

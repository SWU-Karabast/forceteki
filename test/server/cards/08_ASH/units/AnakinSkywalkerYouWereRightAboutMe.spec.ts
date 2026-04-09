describe('Anakin Skywalker, You Were Right About Me', function() {
    integration(function(contextRef) {
        it('should give a Shield token to another friendly unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#you-were-right-about-me'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play Ani
            context.player1.clickCard(context.anakinSkywalker);

            // Should be able to select another friendly unit (not Ani Himself)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            // Select Battlefield Marine
            context.player1.clickCard(context.battlefieldMarine);

            // Battlefield Marine should have a Shield token
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.anakinSkywalker).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });
    });
});
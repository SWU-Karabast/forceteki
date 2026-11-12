describe('Val, It\'s Been a Ride, Babe', function() {
    integration(function(contextRef) {
        it('should give a Shield token to another friendly unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['val#its-been-a-ride-babe'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play Val
            context.player1.clickCard(context.valItsBeenARideBabe);

            // Should be able to select another friendly unit (not Val herself)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            // Select Battlefield Marine
            context.player1.clickCard(context.battlefieldMarine);

            // Battlefield Marine should have a Shield token
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.valItsBeenARideBabe).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });

        it('should give a Shield token to an enemy unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['val#its-been-a-ride-babe', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Attack Val with Wampa to defeat her
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.valItsBeenARideBabe);

            // Should be able to select an enemy unit for the shield
            expect(context.player1).toHavePrompt('Give a Shield token to an enemy unit');
            expect(context.player2).toHavePrompt('Waiting for opponent to select a unit for Val\'s ability');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rebelPathfinder, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            // Select Wampa
            context.player1.clickCard(context.wampa);

            // Wampa should have a Shield token
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.rebelPathfinder).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
        });

        it('should give a Shield token to a unit that is enemy to the player who controlled her when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['val#its-been-a-ride-babe', 'battlefield-marine', 'pyke-sentinel']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.valItsBeenARideBabe);

            // player2 controlled Val when she was defeated, so player2 chooses one of player1's units
            expect(context.player2).toHavePrompt('Give a Shield token to an enemy unit');
            expect(context.player1).toHavePrompt('Waiting for opponent to select a unit for Val\'s ability');
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.pykeSentinel]);
            expect(context.player2).not.toHavePassAbilityButton();
            expect(context.player2).not.toHaveChooseNothingButton();
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.pykeSentinel).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.valItsBeenARideBabe).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});

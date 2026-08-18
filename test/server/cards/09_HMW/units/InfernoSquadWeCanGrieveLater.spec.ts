describe('Inferno Squad, We Can Grieve Later', function() {
    integration(function(contextRef) {
        describe('Inferno Squad\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['system-patrol-craft'],
                        hand: ['inferno-squad#we-can-grieve-later']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                        hand: ['vanquish', 'no-glory-only-results']
                    }
                });
            });

            it('should optionally deal 1 damage to a unit on play and defeat', function () {
                const { context } = contextRef;

                // Play Inferno Squad from hand
                context.player1.clickCard(context.infernoSquadWeCanGrieveLater);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.infernoSquadWeCanGrieveLater, context.wampa, context.lurkingTiePhantom]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['weakness']);

                // Defeat Inferno Squad
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.infernoSquadWeCanGrieveLater);

                // Can Pass on Damage and Weakness
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.wampa, context.lurkingTiePhantom]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeActivePlayer();
            });

            it('should only give Weakness to LTP', function () {
                const { context } = contextRef;

                // Play Inferno Squad from hand
                context.player1.clickCard(context.infernoSquadWeCanGrieveLater);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.infernoSquadWeCanGrieveLater, context.wampa, context.lurkingTiePhantom]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['weakness']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should work with NGOR', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.infernoSquadWeCanGrieveLater);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.infernoSquadWeCanGrieveLater, context.wampa, context.lurkingTiePhantom]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['weakness']);

                context.player2.clickCard(context.noGloryOnlyResults);

                context.player2.clickCard(context.infernoSquad);

                expect(context.player2).toBeAbleToSelectExactly([context.systemPatrolCraft, context.wampa, context.lurkingTiePhantom]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['weakness']);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
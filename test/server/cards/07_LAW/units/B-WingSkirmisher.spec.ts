describe('B-Wing Skirmisher\'s Aggressor', function () {
    integration(function (contextRef) {
        describe('B-Wing Skirmisher\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bwing-skirmisher'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should deal 1 damage to each of up to 2 space units', function () {
                const { context } = contextRef;

                // Play B-Wing Skirmisher
                context.player1.clickCard(context.bwingSkirmisher);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.tieAdvanced, context.bwingSkirmisher]);
                context.player1.clickCard(context.tieAdvanced);
                context.player1.clickCard(context.bwingSkirmisher);
                context.player1.clickDone();

                // Assert the damage
                expect(context.tieAdvanced.damage).toBe(1);
                expect(context.bwingSkirmisher.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose less than 2 space units', function () {
                const { context } = contextRef;

                // Play B-Wing Skirmisher
                context.player1.clickCard(context.bwingSkirmisher);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.tieAdvanced, context.bwingSkirmisher]);
                context.player1.clickCard(context.tieAdvanced);
                context.player1.clickDone();

                // Assert the damage
                expect(context.tieAdvanced.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose nothing', function () {
                const { context } = contextRef;

                // Play B-Wing Skirmisher
                context.player1.clickCard(context.bwingSkirmisher);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.tieAdvanced, context.bwingSkirmisher]);
                context.player1.clickPrompt('Choose nothing');

                // Assert the damage
                expect(context.tieAdvanced.damage).toBe(0);
                expect(context.bwingSkirmisher.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

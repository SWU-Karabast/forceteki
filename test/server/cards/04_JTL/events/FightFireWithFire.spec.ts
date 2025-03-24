describe('Fight Fire With Fire', function() {
    integration(function(contextRef) {
        describe('Fight Fire With Fire\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fight-fire-with-fire', 'vanquish', 'superlaser-blast'],
                        groundArena: ['wampa'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: ['cargo-juggernaut'],
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });
            });

            it('should let player to choose a friendly space unit and an enemy space unit and deal 3 damage to each of them', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fightFireWithFire);

                // Choose a friendly unit space
                expect(context.player1).toHavePrompt('Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.');
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.ruthlessRaider]);
                context.player1.clickCard(context.ruthlessRaider);

                // Choose an enemy unit in the same arena
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.brightHope]);
                context.player1.clickCard(context.brightHope);

                // Deal 3 damage to each of them
                expect(context.ruthlessRaider.damage).toBe(3);
                expect(context.brightHope.damage).toBe(3);
            });

            it('should let player to choose a friendly ground unit and an enemy ground unit and deal 3 damage to each of them', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fightFireWithFire);

                // Choose a friendly unit ground
                expect(context.player1).toHavePrompt('Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.');
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.ruthlessRaider]);
                context.player1.clickCard(context.wampa);

                // Choose an enemy unit in the same arena
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.cargoJuggernaut]);
                context.player1.clickCard(context.cargoJuggernaut);

                // Deal 3 damage to each of them
                expect(context.wampa.damage).toBe(3);
                expect(context.cargoJuggernaut.damage).toBe(3);
            });

            it('should let player select a friendly space unit and an space unit and deal 3 damage to each of them', function () {
                const { context } = contextRef;

                // Play Vanquish to defeat the enemy unit
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.cargoJuggernaut);

                context.player2.passAction();

                // Play Fight Fire With Fire, if there's at least one friendly space unit and one enemy space unit it should let player to choose them
                context.player1.clickCard(context.fightFireWithFire);

                // Choose a friendly unit ground
                expect(context.player1).toHavePrompt('Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.');
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.ruthlessRaider]);
                context.player1.clickCard(context.ruthlessRaider);

                // Choose an enemy unit in the same arena
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.brightHope]);
                context.player1.clickCard(context.brightHope);

                // Deal 3 damage to each of them
                expect(context.ruthlessRaider.damage).toBe(3);
                expect(context.brightHope.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

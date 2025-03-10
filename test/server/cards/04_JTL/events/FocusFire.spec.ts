describe('Focus Fire', function() {
    integration(function(contextRef) {
        describe('Focus Fire\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['focus-fire', 'vanquish'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['reinforcement-walker'],
                        spaceArena: ['red-three#unstoppable']
                    }
                });
            });

            it('should select a space unit and deal damage equal to the number of friendly Vehicle units in that arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.focusFire);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker, context.redThree, context.wampa, context.allianceXwing, context.atst]);

                // Select a unit
                context.player1.clickCard(context.redThree);

                // Assert damage dealt
                expect(context.redThree.damage).toBe(2);
                expect(context.allianceXwing.exhausted).toBe(false);
            });

            it('should select a ground unit and deal damage equal to the number of friendly Vehicle units in that arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.focusFire);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker, context.redThree, context.wampa, context.allianceXwing, context.atst]);

                // Select a unit
                context.player1.clickCard(context.reinforcementWalker);

                // Assert damage dealt
                expect(context.reinforcementWalker.damage).toBe(6);
            });

            it('should select aunit and do not deal damage as there is no friendly Vehicle units in that arena', function () {
                const { context } = contextRef;


                // Remove friendly vehicle units
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.atst);

                // Play Focus Fire
                context.player2.passAction();
                context.player1.clickCard(context.focusFire);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker, context.redThree, context.wampa, context.allianceXwing]);

                // Select a unit
                context.player1.clickCard(context.reinforcementWalker);

                // Assert damage dealt
                expect(context.reinforcementWalker.damage).toBe(0);
            });
        });
    });
});

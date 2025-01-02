describe('Pyrrhic Assault', function () {
    integration(function (contextRef) {
        describe('Pyrrhic Assault\'s ability', function () {
            it('should give each friendly unit, "When Defeated: Deal 2 damage to an enemy unit."', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pyrrhic-assault'],
                        groundArena: ['ryloth-militia'],
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['b2-legionnaires'],
                        spaceArena: ['gladiator-star-destroyer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.pyrrhicAssault);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.gladiatorStarDestroyer);
                context.player2.clickCard(context.republicArc170);
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.b2Legionnaires, context.gladiatorStarDestroyer]);
                expect(context.republicArc170).toBeInZone('discard');

                context.player1.clickCard(context.b2Legionnaires);
                expect(context.b2Legionnaires.damage).toBe(2);

                context.player1.clickCard(context.rylothMilitia);
                context.player1.clickCard(context.b2Legionnaires);
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gladiatorStarDestroyer]);
                expect(context.rylothMilitia).toBeInZone('discard');

                // Expect the Gladiator Star Destroyer to have a total of 5 damage, 3 from attack and 2 from the trigger
                context.player1.clickCard(context.gladiatorStarDestroyer);
                expect(context.gladiatorStarDestroyer.damage).toBe(5);
            });
        });
    });
});
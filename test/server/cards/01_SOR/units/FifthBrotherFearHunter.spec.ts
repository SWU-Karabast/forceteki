describe('Fifth Brother, Fear Hunter', function() {
    integration(function(contextRef) {
        const prompt = 'Deal 1 damage to this unit and 1 damage to another ground unit';

        describe('Fifth Brother\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fifth-brother#fear-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should deal 1 damage to this unit and 1 damage to another ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fifthBrother);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.fifthBrother.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not complete attack if defeated by on attack ability', function() {
                const { context } = contextRef;

                context.setDamage(context.fifthBrother, 3);

                context.player1.clickCard(context.fifthBrother);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.fifthBrother).toBeInZone('discard');
                expect(context.wampa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fifth Brother\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fifth-brother#fear-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should not deal extra damage if he is not damaged', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fifthBrother);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                expect(context.fifthBrother.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);

                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should have raid equal to current damage', function () {
                const { context } = contextRef;

                context.setDamage(context.fifthBrother, 2);

                context.player1.clickCard(context.fifthBrother);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should increase raid amount if on-attack ability is activated', function () {
                const { context } = contextRef;

                context.setDamage(context.fifthBrother, 2);

                context.player1.clickCard(context.fifthBrother);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

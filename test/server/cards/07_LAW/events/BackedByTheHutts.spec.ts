describe('Backed By The Hutts', function() {
    integration(function(contextRef) {
        describe('Backed By The Hutts\'s ability', function() {
            it('should create a Credit token and optionally deal damage to a unit equal to friendly Credit count', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['backed-by-the-hutts'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Initially no credits
                expect(context.player1.credits).toBe(0);

                context.player1.clickCard(context.backedByTheHutts);

                // Should have created a Credit token
                expect(context.player1.credits).toBe(1);

                // Should prompt to optionally deal damage
                expect(context.player1).toHavePrompt('Trigger the ability \'Deal damage to a unit equal to the number of friendly Credit tokens\' or pass');
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);

                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);

                context.player1.clickCard(context.pykeSentinel);

                // Pyke sentinel (3 HP) takes 1 damage (from 1 credit)
                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to the number of Credit tokens (multiple credits)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['backed-by-the-hutts'],
                        groundArena: ['wampa'],
                        credits: 3
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.backedByTheHutts);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                expect(context.player1.credits).toBe(4);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
            });

            it('should allow passing on the optional damage ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['backed-by-the-hutts']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.backedByTheHutts);

                expect(context.player1.credits).toBe(1);

                // Pass on dealing damage
                context.player1.clickPrompt('Pass');

                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

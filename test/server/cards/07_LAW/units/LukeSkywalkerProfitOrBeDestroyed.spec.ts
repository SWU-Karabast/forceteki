describe('Luke Skywalker, Profit Or Be Destroyed', function() {
    integration(function(contextRef) {
        describe('Luke Skywalker\'s when played ability', function() {
            it('should let opponent choose to give player a Credit token and ready Luke', async function () {
                pending('TODO: Enable this test when Luke Skywalker is no longer flagged as unimplemented');
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#profit-or-be-destroyed'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.credits).toBe(0);

                context.player1.clickCard(context.lukeSkywalker);

                // Luke should be exhausted after being played
                expect(context.lukeSkywalker.exhausted).toBe(true);

                // Opponent should be prompted to choose
                expect(context.player2).toHaveExactPromptButtons([
                    `${context.player1.name} create a Credit token and ready this unit`,
                    `${context.player1.name} may deal 5 damage to a unit`
                ]);

                // Opponent chooses to give credit and ready
                context.player2.clickPrompt(`${context.player1.name} create a Credit token and ready this unit`);

                // Player 1 should have a credit token and Luke should be ready
                expect(context.player1.credits).toBe(1);
                expect(context.lukeSkywalker.exhausted).toBe(false);

                // No damage was dealt
                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should let opponent choose to allow player to deal 5 damage to a unit', async function () {
                pending('TODO: Enable this test when Luke Skywalker is no longer flagged as unimplemented');
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#profit-or-be-destroyed'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);

                // Opponent chooses to let player deal damage
                context.player2.clickPrompt(`${context.player1.name} may deal 5 damage to a unit`);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.pykeSentinel, context.lukeSkywalker]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);

                // No credit was created, Luke remains exhausted
                expect(context.player1.credits).toBe(0);
                expect(context.lukeSkywalker.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow player to pass on dealing damage when opponent chooses that option', async function () {
                pending('TODO: Enable this test when Luke Skywalker is no longer flagged as unimplemented');
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#profit-or-be-destroyed'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);

                // Opponent chooses to let player deal damage
                context.player2.clickPrompt(`${context.player1.name} may deal 5 damage to a unit`);

                // Player 1 passes on dealing damage
                context.player1.clickPrompt('Choose nothing');

                // No damage was dealt
                expect(context.atst.damage).toBe(0);
                expect(context.lukeSkywalker.damage).toBe(0);

                // No credit, Luke stays exhausted
                expect(context.player1.credits).toBe(0);
                expect(context.lukeSkywalker.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

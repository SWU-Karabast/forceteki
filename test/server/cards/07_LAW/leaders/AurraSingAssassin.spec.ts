describe('Aurra Sing, Assassin', function() {
    integration(function(contextRef) {
        describe('Aurra\'s leader undeployed ability', function() {
            it('does nothing if no units have 1HP or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['han-solo#has-his-moments', 'wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);
                context.player1.clickPrompt('Use it anyway');
                expect(context.aurraSing.exhausted).toBeTrue();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.hanSolo).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('defeats an enemy non-leader unit with 1HP or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 3,
                        groundArena: [{ card: 'han-solo#has-his-moments', damage: 4 }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);

                expect(context.player1).toBeAbleToSelectExactly([context.hanSolo, context.wampa]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.aurraSing.exhausted).toBeTrue();
                expect(context.wampa).toBeInZone('discard');
                expect(context.hanSolo).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a friendly non-leader unit with 1HP or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 3,
                        groundArena: [{ card: 'han-solo#has-his-moments', damage: 4 }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);

                expect(context.player1).toBeAbleToSelectExactly([context.hanSolo, context.wampa]);
                context.player1.clickCard(context.hanSolo);

                expect(context.aurraSing.exhausted).toBeTrue();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.hanSolo).toBeInZone('discard');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Aurra\'s leader deployed ability', function() {
            it('does nothing if no non-leader units with 5HP or less exist', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 7,
                        groundArena: ['atst'],
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);
                context.player1.clickPrompt('Deploy Aurra Sing');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.kraytDragon).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 7,
                        groundArena: [{ card: 'atst', damage: 5 }],
                    },
                    player2: {
                        groundArena: [{ card: 'krayt-dragon', damage: 5 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);
                context.player1.clickPrompt('Deploy Aurra Sing');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.kraytDragon]);
                context.player1.clickPrompt('Pass');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.kraytDragon).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy non-leader unit when deployed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 7,
                        groundArena: [{ card: 'atst', damage: 5 }],
                    },
                    player2: {
                        groundArena: [{ card: 'krayt-dragon', damage: 5 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);
                context.player1.clickPrompt('Deploy Aurra Sing');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.kraytDragon]);
                context.player1.clickCard(context.kraytDragon);

                expect(context.atst).toBeInZone('groundArena');
                expect(context.kraytDragon).toBeInZone('discard');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a friendly non-leader unit when deployed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'aurra-sing#assassin',
                        resources: 7,
                        groundArena: [{ card: 'atst', damage: 5 }],
                    },
                    player2: {
                        groundArena: [{ card: 'krayt-dragon', damage: 5 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aurraSing);
                context.player1.clickPrompt('Deploy Aurra Sing');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.kraytDragon]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard');
                expect(context.kraytDragon).toBeInZone('groundArena');
                expect(context.grandInquisitor).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

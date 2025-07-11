describe('The Will of the Force ability', function () {
    integration(function (contextRef) {
        describe('when targeting a unit owned by the opponent', function () {
            it('returns a unit to the hand of its owner controller and then you may use the Force to make that player discard a random card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force', 'battlefield-marine'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.game.setRandomSeed('12345');

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force');

                context.player1.clickPrompt('Trigger');
                expect(context.cartelSpacer).toBeInZone('hand', context.player2);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player2.handSize).toBe(1);
                expect(context.getChatLogs(4)).toContain('player1 plays The Will of the Force to choose a target for The Will of the Force and to choose if they want to use the Force');
                expect(context.getChatLogs(4)).toContain('player1 uses The Will of the Force to return Cartel Spacer to player2\'s hand');
                expect(context.getChatLogs(4)).toContain('player1 uses The Will of the Force to use the Force');
                expect(context.getChatLogs(4)).toContain('player2 discards Wampa');
            });

            it('returns a unit to the hand of its owner controller and does nothing else if you do not use the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force', 'battlefield-marine'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force');

                context.player1.clickPrompt('Pass');
                expect(context.cartelSpacer).toBeInZone('hand', context.player2);
                expect(context.player2.handSize).toBe(2);
            });
        });

        describe('when targeting a unit owned by the player', function () {
            it('returns a unit to the hand of its owner controller and then you may use the Force to make that player discard a random card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force', 'battlefield-marine'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.game.setRandomSeed('12345');

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force');

                context.player1.clickPrompt('Trigger');
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.handSize).toBe(1);
                expect(context.getChatLogs(3)).toContain('player1 uses The Will of the Force to return AT-ST to their hand');
            });

            it('returns a unit to the hand of its owner controller and does nothing else if you do not have the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force', 'battlefield-marine'],
                        groundArena: ['atst'],
                        hasForceToken: false,
                    },
                    player2: {
                        hand: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('works correctly with units that are stolen', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force', 'battlefield-marine'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['change-of-heart', 'wampa'],
                        spaceArena: ['cartel-spacer'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.game.setRandomSeed('54321');

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force');

                context.player1.clickPrompt('Trigger');
                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });
        });

        describe('on an empty board', function () {
            it('can be used to use the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force'],
                        hasForceToken: true,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theWillOfTheForce);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force');

                context.player1.clickPrompt('Trigger');
                expect(context.player1.hasTheForce).toBeFalse();
            });

            it('can be used to do nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-will-of-the-force'],
                        hasForceToken: false,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theWillOfTheForce);
                context.player1.clickPrompt('Play anyway');

                expect(context.theWillOfTheForce).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
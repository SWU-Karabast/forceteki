describe('Therm Scissorpunch, Boastful Gambler', function() {
    integration(function(contextRef) {
        describe('its "when the action phase starts" reveal ability', function() {
            it('should give this unit -4/-4 for the phase when both revealed cards cost 3 or more', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: ['underworld-thug', 'underworld-thug', 'wampa']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'desperado-freighter']
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase, triggering the reveal ability
                context.moveToNextActionPhase();

                // Both revealed cards cost 3 or more, so the debuff applies twice (-2/-2 each)
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, context.desperadoFreighter]);
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(1);
                expect(context.thermScissorpunch.getHp()).toBe(1);
            });

            it('should not change this unit\'s stats when both revealed cards cost 2 or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: ['underworld-thug', 'underworld-thug', 'porg']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase, triggering the reveal ability
                context.moveToNextActionPhase();

                // Both revealed cards cost 2 or less, so no debuff applies
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.porg, context.battlefieldMarine]);
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
            });

            it('should give this unit -2/-2 for the phase when only one revealed card costs 3 or more', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: ['underworld-thug', 'underworld-thug', 'porg']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase, triggering the reveal ability
                context.moveToNextActionPhase();

                // Only one revealed card costs 3 or more, so the debuff applies once
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.porg, context.wampa]);
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(3);
                expect(context.thermScissorpunch.getHp()).toBe(3);
            });

            it('should still reveal the opponent\'s card and apply the debuff when its own deck is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: []
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase, triggering the reveal ability
                context.moveToNextActionPhase();

                // Only the opponent's card is revealed since the controller's deck is empty
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa]);
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(3);
                expect(context.thermScissorpunch.getHp()).toBe(3);
            });

            it('should not trigger when both decks are empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: []
                    },
                    player2: {
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase; there are no cards left to reveal
                context.moveToNextActionPhase();

                // The ability does not trigger at all, so play proceeds normally
                expect(context.player1).toBeActivePlayer();
                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
            });

            it('should return this unit to full power and HP once the phase ends', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        deck: ['underworld-thug', 'underworld-thug', 'wampa']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'desperado-freighter']
                    }
                });

                const { context } = contextRef;

                // Advance to the next action phase, triggering the reveal ability and applying the debuff
                context.moveToNextActionPhase();
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(1);
                expect(context.thermScissorpunch.getHp()).toBe(1);

                // The "for this phase" effect expires once the action phase ends
                context.moveToRegroupPhase();

                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
            });

            it('should not trigger for this unit when it enters play after the phase-start trigger has already resolved', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['therm-scissorpunch#boastful-gambler'],
                        deck: ['underworld-thug', 'underworld-thug', 'wampa']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'desperado-freighter']
                    }
                });

                const { context } = contextRef;

                // Play Therm mid-phase
                context.player1.clickCard(context.thermScissorpunch);

                // Therm is in the ground arena with full stats
                expect(context.thermScissorpunch).toBeInZone('groundArena');
                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

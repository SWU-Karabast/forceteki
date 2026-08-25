describe('Therm Scissorpunch, Boastful Gambler', function() {
    integration(function(contextRef) {
        describe('its "when the action phase starts" reveal ability', function() {
            // Test harness quirks worth knowing:
            // 1. The initial board setup below happens after the very first action phase has already started,
            //    so that phase's trigger window never fires for Therm (see the last test in this block, which
            //    plays Therm mid-phase after a trigger window has passed, for explicit coverage of that same
            //    rule). Every test that needs the ability to fire for real therefore calls
            //    context.moveToNextActionPhase() to reach a fresh trigger window.
            // 2. The regroup phase between action phases draws 2 cards per player, so each deck below is
            //    padded with 2 filler cards ('underworld-thug') ahead of the card intended to be on top when
            //    the next action phase starts.

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

                // Advance to a round where the phase-start trigger fires while Therm is still in hand (not in
                // play). Both decks have qualifying (cost 3+) cards on top, so if a bug caused a retroactive
                // trigger below, this setup would surface it as a visible debuff.
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();

                // Now play Therm mid-phase; the phase-start window for this round has already resolved
                context.player1.clickCard(context.thermScissorpunch);

                // No retroactive trigger fires: turn passes normally to the opponent, and Therm keeps its full stats
                expect(context.thermScissorpunch).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
            });

            it('should apply a fresh, independent debuff each round without carrying over from the prior round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['therm-scissorpunch#boastful-gambler'],
                        // After 2 fillers are drawn away by the first regroup, wampa becomes the round 2 top
                        // card; after 2 more fillers are drawn away by the second regroup, the next filler
                        // becomes the round 3 top card
                        deck: ['underworld-thug', 'underworld-thug', 'wampa', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        deck: ['underworld-thug', 'underworld-thug', 'desperado-freighter', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Round 2: 2 qualifying cards revealed, -4/-4 applied
                context.moveToNextActionPhase();
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(1);
                expect(context.thermScissorpunch.getHp()).toBe(1);

                // Round 3: The top cards are now both cost-2 Underworld Thugs, so the fresh, independent trigger
                // applies no debuff at all. If round 2's debuff had carried over, this would still show 1/1.
                context.moveToNextActionPhase();
                context.player1.clickDone();

                expect(context.thermScissorpunch.getPower()).toBe(5);
                expect(context.thermScissorpunch.getHp()).toBe(5);
            });
        });
    });
});

describe('Rex No Other Option', function() {
    integration(function(contextRef) {
        describe('Undeployed leader action ability', function() {
            it('exhausts Rex and readies an exhausted enemy unit to reduce the cost of the next event by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        base: 'chopper-base', // Cunning aspect
                        resources: 5, // To avoid deploy prompt
                        hand: ['shoot-first'],
                        groundArena: [
                            'liberated-slaves',
                            { card: 'clone-trooper', exhausted: true }
                        ]
                    },
                    player2: {
                        leader: {
                            card: 'luke-skywalker#faithful-friend',
                            deployed: true,
                            exhausted: true
                        },
                        groundArena: [
                            'battlefield-marine',
                            { card: 'battle-droid', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 uses leader action ability
                context.player1.clickCard(context.rex);
                expect(context.player1).toHavePrompt('Choose an exhausted enemy unit to ready');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only exhausted enemy units can be targeted
                    context.battleDroid,
                    context.lukeSkywalker // Can target leaders
                ]);
                context.player1.clickCard(context.battleDroid);

                expect(context.rex.exhausted).toBe(true);
                expect(context.battleDroid.exhausted).toBe(false);
                expect(context.getChatLog()).toEqual('player1 uses Rex, exhausting Rex and readying Battle Droid to discount the next event they play for this phase');

                context.player2.passAction();

                // P1 plays Shoot First with discount
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.battlefieldMarine);

                // Event resolved, no resources were spent
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.liberatedSlaves.damage).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('cannot be used if there are no exhausted enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine'] // Not exhausted
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.rex);
            });

            it('can only be used to discount one event per phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        base: 'chopper-base',
                        resources: 5,
                        hand: ['shoot-first', 'open-fire'],
                        groundArena: ['liberated-slaves']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // Play first event with discount
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // Play second event without discount
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('the effect only lasts for the current phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        base: 'chopper-base',
                        resources: 5,
                        hand: ['shoot-first'],
                        groundArena: ['liberated-slaves']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.battlefieldMarine);

                // Move to next action phase without using the discount
                context.moveToNextActionPhase();

                // Play event - should cost full price
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not reduce the cost of non-event cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        base: 'echo-base',
                        resources: 5,
                        hand: ['battlefield-marine', 'rexs-dc17s#this-ship-is-going-down']
                    },
                    player2: {
                        groundArena: [{ card: 'battle-droid', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.battleDroid);

                context.player2.passAction();

                // Play unit - should cost full price
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                // Play upgrade - should cost full price (Rex's DC-17s costs 3)
                context.player1.clickCard(context.rexsDc17s);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });
        });

        describe('Deployed leader unit On Attack ability', function() {
            it('readies an exhausted enemy unit to reduce the cost of the next event by 2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true },
                        base: 'chopper-base',
                        resources: 5,
                        hand: ['open-fire'],
                        groundArena: [{ card: 'clone-trooper', exhausted: true }]
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Rex to trigger his On Attack ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);

                // Verify optional ability prompt
                expect(context.player1).toHavePrompt('Ready an exhausted enemy unit');
                expect(context.player1).toHavePassAbilityButton();

                // Choose enemy unit to ready - only exhausted enemy units, not friendly
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Rex to ready Battlefield Marine',
                    'player1 uses Rex to discount the next event they play for this phase'
                ]);

                context.player2.passAction();

                // Play Open Fire with discount (3-2=1)
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('can be passed without triggering the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true },
                        base: 'chopper-base',
                        resources: 5,
                        hand: ['open-fire']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Rex
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);

                // Pass on the ability
                context.player1.clickPrompt('Pass');

                // Enemy unit stays exhausted
                expect(context.battlefieldMarine.exhausted).toBe(true);

                context.player2.passAction();

                // Play Open Fire at full cost (3)
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('does not trigger if there are no exhausted enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'] // Not exhausted
                    }
                });

                const { context } = contextRef;

                // Attack with Rex - no ability prompt since no valid targets
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('can only be used to discount one event per phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true },
                        base: 'chopper-base',
                        resources: 10,
                        hand: ['open-fire', 'surprise-strike'],
                        groundArena: ['liberated-slaves']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Rex and trigger ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // Play first event with discount (Open Fire 3-2=1)
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // Play second event without discount (Surprise Strike costs 2)
                context.player1.clickCard(context.surpriseStrike);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('the effect only lasts for the current phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true },
                        base: 'chopper-base',
                        resources: 5,
                        hand: ['open-fire']
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Rex and trigger ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                // Move to next action phase without using discount
                context.moveToNextActionPhase();

                // Play event at full cost (Open Fire costs 3)
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('does not reduce the cost of non-event cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rex#no-other-option', deployed: true },
                        base: 'echo-base',
                        resources: 5,
                        hand: ['battlefield-marine', 'rexs-dc17s#this-ship-is-going-down']
                    },
                    player2: {
                        groundArena: [{ card: 'battle-droid', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Attack with Rex and trigger ability
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battleDroid);

                context.player2.passAction();

                // Play unit - should cost full price (Battlefield Marine costs 2)
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                // Play upgrade - should cost full price (Rex's DC-17s costs 3)
                context.player1.clickCard(context.rexsDc17s);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });
        });
    });
});

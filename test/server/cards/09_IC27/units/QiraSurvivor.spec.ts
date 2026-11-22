describe('Qi\'ra, Survivor', function() {
    integration(function(contextRef) {
        describe('Qi\'ra\'s When Played ability', function() {
            it('should give 2 Experience tokens to herself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['qira#survivor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Qi'ra
                context.player1.clickCard(context.qira);

                // Qi'ra has 2 Experience tokens, no other unit gained any
                expect(context.qira).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.qira.getPower()).toBe(3);
                expect(context.qira.getHp()).toBe(3);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Qi\'ra\'s When Defeated ability', function() {
            it('should give a friendly unit the 2 Experience tokens she gained when played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['qira#survivor'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Qi'ra and gain 2 Experience tokens
                context.player1.clickCard(context.qira);
                expect(context.qira).toHaveExactUpgradeNames(['experience', 'experience']);

                // Player 2 defeats Qi'ra with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.qira);

                // Any unit in play can be chosen, including leader units and enemy units
                expect(context.qira).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.greenSquadronAwing,
                    context.hanSolo,
                    context.wampa
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Give the Experience tokens to Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.player1).toBeActivePlayer();
            });

            describe('when Qi\'ra with 2 Experience tokens is defeated by Vanquish', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [
                                { card: 'qira#survivor', upgrades: ['experience', 'experience'] },
                                'battlefield-marine'
                            ]
                        },
                        player2: {
                            hand: ['vanquish'],
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });
                });

                it('should be able to give the Experience tokens to an enemy unit', function() {
                    const { context } = contextRef;

                    // Player 2 defeats Qi'ra with Vanquish
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.qira);

                    // Choose Wampa as the target
                    expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
                    expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                    expect(context.player1).toBeActivePlayer();
                });

                it('should allow the player to give no Experience tokens', function() {
                    const { context } = contextRef;

                    // Player 2 defeats Qi'ra with Vanquish
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.qira);

                    // Pass on giving Experience tokens
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickPrompt('Pass');

                    expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                    expect(context.wampa).toHaveExactUpgradeNames([]);
                    expect(context.player1).toBeActivePlayer();
                });
            });

            it('should count only the Experience tokens on her and not her other upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'qira#survivor', upgrades: ['experience', 'experience', 'experience', 'shield', 'academy-training'] },
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Qi'ra with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.qira);

                // Give Battlefield Marine 3 Experience tokens, matching only her Experience tokens
                expect(context.academyTraining).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
                expect(context.player1).toBeActivePlayer();
            });

            it('should use the Experience tokens on her when she is defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'qira#survivor', upgrades: ['experience'] },
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Qi'ra (2/2 with 1 Experience) attacks Wampa and is defeated by its 4 power
                context.player1.clickCard(context.qira);
                context.player1.clickCard(context.wampa);

                // Give Battlefield Marine the Experience token
                expect(context.qira).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if she had no Experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'qira#survivor', upgrades: ['shield'] },
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Qi'ra with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.qira);

                // Ability has nothing to give, no prompt appears
                expect(context.qira).toBeInZone('discard');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be resolved by the opponent if they defeat her with No Glory, Only Results', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'qira#survivor', upgrades: ['experience', 'experience'] },
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 takes control of Qi'ra and defeats her, so player 2 uses her When Defeated ability
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.qira);

                // Player 2 chooses a unit to give the Experience tokens to
                expect(context.qira).toBeInZone('discard', context.player1);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});

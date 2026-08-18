describe('Nuvo Vindi, Blue Shadow Perfected', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nuvo-vindi#blue-shadow-perfected'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });
            });

            it('should give a Weakness token to a chosen enemy unit', function() {
                const { context } = contextRef;

                // Play Nuvo Vindi and give Wampa a Weakness token
                context.player1.clickCard(context.nuvoVindi);
                context.player1.clickCard(context.wampa);

                // Wampa has Weakness and its stats are reduced
                expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
                expect(context.wampa.getPower()).toBe(3);
                expect(context.wampa.getHp()).toBe(4);
                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Nuvo Vindi',
                    'player1 uses Nuvo Vindi to give a Weakness token to Wampa',
                ]);
            });

            it('should be able to target any unit in play, including itself and both leader units', function() {
                const { context } = contextRef;

                // Play Nuvo Vindi
                context.player1.clickCard(context.nuvoVindi);

                // Every unit in play, including Nuvo Vindi itself and both deployed leaders, is a valid target
                expect(context.player1).toBeAbleToSelectExactly([
                    context.nuvoVindi,
                    context.battlefieldMarine,
                    context.lukeSkywalker,
                    context.wampa,
                    context.cartelSpacer,
                    context.grandInquisitor
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
            });

            it('should be able to target itself', function() {
                const { context } = contextRef;

                // Play Nuvo Vindi and target itself
                context.player1.clickCard(context.nuvoVindi);
                context.player1.clickCard(context.nuvoVindi);

                // Nuvo Vindi has Weakness and its stats are reduced
                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness']);
                expect(context.nuvoVindi.getPower()).toBe(0);
                expect(context.nuvoVindi.getHp()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline giving a Weakness token', function() {
                const { context } = contextRef;

                // Play Nuvo Vindi and decline to give a Weakness token
                context.player1.clickCard(context.nuvoVindi);
                context.player1.clickPrompt('Pass');

                // No unit in play received a Weakness token
                expect(context.nuvoVindi).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('its defeat-trigger ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nuvo-vindi#blue-shadow-perfected', 'atst'],
                        hand: ['takedown', 'confiscate']
                    },
                    player2: {
                        groundArena: [
                            { card: 'wampa', upgrades: ['weakness'] },
                            { card: 'battlefield-marine', upgrades: ['weakness'] }
                        ]
                    }
                });
            });

            it('should give a Weakness token to a unit when an enemy unit with Weakness is defeated in combat', function() {
                const { context } = contextRef;

                // AT-ST attacks and defeats Wampa, which has Weakness
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.wampa);

                // Nuvo Vindi's ability triggers, offering any unit as a target
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                // Give the Weakness token to Nuvo Vindi
                context.player1.clickCard(context.nuvoVindi);

                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a Weakness token to a unit when an enemy unit with Weakness is defeated by an ability', function() {
                const { context } = contextRef;

                // Takedown defeats Wampa, which has Weakness
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                // Nuvo Vindi's ability triggers
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst, context.battlefieldMarine]);

                // Give Battlefield Marine a second Weakness token
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.battlefieldMarine.getPower()).toBe(1);
                expect(context.battlefieldMarine.getHp()).toBe(1);
                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Takedown to defeat Wampa',
                    'player1 uses Nuvo Vindi to give a Weakness token to Battlefield Marine',
                ]);
            });

            it('should not trigger a second time in the same round', function() {
                const { context } = contextRef;

                // First qualifying defeat this round
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst, context.battlefieldMarine]);
                context.player1.clickCard(context.nuvoVindi);

                expect(context.player2).toBeActivePlayer();

                // Second qualifying defeat this round - the once-per-round limit is already used, so there's no prompt
                context.player2.passAction();
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness']);
            });

            it('should reset the once-per-round limit at the start of the next round', function() {
                const { context } = contextRef;

                // Round 1: consume the once-per-round limit
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst, context.battlefieldMarine]);
                context.player1.clickCard(context.nuvoVindi);

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                expect(context.player1).toBeActivePlayer();

                // Round 2: the limit has reset, so the ability triggers again
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst]);
                context.player1.clickCard(context.nuvoVindi);

                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not consume the once-per-round limit when the player declines to resolve it', function() {
                const { context } = contextRef;

                // First qualifying defeat, decline to resolve
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();

                // Second qualifying defeat - the ability can still trigger since it was declined, not used, the first time
                context.player2.passAction();
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst]);
                context.player1.clickCard(context.nuvoVindi);

                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if the weakness token was removed before defeat', function() {
                const { context } = contextRef;

                // Confiscate removes Wampa's Weakness token
                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.wampa.upgrades[0]);

                expect(context.wampa).toHaveExactUpgradeNames([]);

                // Wampa no longer has Weakness, so defeating it does not satisfy Nuvo Vindi's trigger condition
                context.player2.passAction();
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('trigger condition edge cases', function() {
            describe('when the defeated enemy unit does not meet the trigger condition', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['nuvo-vindi#blue-shadow-perfected'],
                            hand: ['takedown', 'waylay', 'no-glory-only-results']
                        },
                        player2: {
                            groundArena: [{ card: 'wampa', upgrades: ['weakness'] }, 'battlefield-marine']
                        }
                    });
                });

                it('should not trigger when an enemy unit without a Weakness token is defeated', function() {
                    const { context } = contextRef;

                    // Takedown defeats Battlefield Marine, which does not have Weakness
                    context.player1.clickCard(context.takedown);
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not trigger when an enemy unit with a Weakness token is returned to hand instead of defeated', function() {
                    const { context } = contextRef;

                    // Waylay returns Wampa to hand instead of defeating it
                    context.player1.clickCard(context.waylay);
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa).toBeInZone('hand', context.player2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not trigger when an enemy unit is defeated after briefly becoming friendly via a take-control effect (No Glory, Only Results)', function() {
                    const { context } = contextRef;

                    // No Glory, Only Results takes control of Wampa, then defeats it
                    context.player1.clickCard(context.noGloryOnlyResults);
                    context.player1.clickCard(context.wampa);

                    // Wampa is friendly at the moment of defeat, so Nuvo Vindi's trigger condition is not met
                    expect(context.wampa).toBeInZone('discard', context.player2);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should trigger even if the enemy unit is defeated by its own controller', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nuvo-vindi#blue-shadow-perfected']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['weakness'] }, 'atst'],
                        hand: ['selfdestruct']
                    }
                });

                const { context } = contextRef;

                // P2 uses Self-Destruct to defeat their own Wampa, which has Weakness
                context.player1.passAction();
                context.player2.clickCard(context.selfdestruct);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.atst);

                // Nuvo Vindi's ability still triggers, since the enemy unit was still enemy-controlled when defeated
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.nuvoVindi, context.atst]);

                context.player1.clickCard(context.nuvoVindi);

                expect(context.nuvoVindi).toHaveExactUpgradeNames(['weakness']);
            });

            it('should not trigger when a friendly unit with a Weakness token is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nuvo-vindi#blue-shadow-perfected', { card: 'wampa', upgrades: ['weakness'] }],
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // Takedown defeats the friendly Wampa, which has Weakness
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                // Nuvo Vindi's trigger condition requires an enemy unit, so it does not trigger
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger if Nuvo Vindi and the enemy Weakness-bearing unit are defeated simultaneously in combat', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nuvo-vindi#blue-shadow-perfected', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['weakness'] }]
                    }
                });

                const { context } = contextRef;

                context.setDamage(context.nuvoVindi, 3);
                context.setDamage(context.wampa, 3);

                // Nuvo Vindi attacks Wampa, and both are defeated simultaneously by combat damage
                context.player1.clickCard(context.nuvoVindi);
                context.player1.clickCard(context.wampa);

                expect(context.nuvoVindi).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');

                // Nuvo Vindi's ability still triggers even though it was defeated in the same event
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

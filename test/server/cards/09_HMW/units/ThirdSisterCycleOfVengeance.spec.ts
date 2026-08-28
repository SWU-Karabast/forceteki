describe('Third Sister, Cycle of Vengeance', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            const abilityPrompt = (amount: number) => `Deal ${amount} damage to a unit`;

            describe('on a standard board', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['third-sister#cycle-of-vengeance'],
                            groundArena: ['battlefield-marine', 'wampa']
                        },
                        player2: {
                            groundArena: ['atst', 'consular-security-force']
                        }
                    });
                });

                it('should deal no damage anywhere if the controller declines the initial damage', function() {
                    const { context } = contextRef;

                    // Play Third Sister and decline the initial damage
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    expect(context.player1).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickPrompt('Pass');

                    // No damage dealt anywhere, it is P2's action
                    expect(context.thirdSister.damage).toBe(0);
                    expect(context.battlefieldMarine.damage).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                    expect(context.atst.damage).toBe(0);
                    expect(context.consularSecurityForce.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should stop the chain if the damaged unit\'s controller declines to continue', function() {
                    const { context } = contextRef;

                    // Step 1: P1 deals 2 damage to P2's AT-ST
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.atst);
                    expect(context.atst.damage).toBe(2);

                    // Step 2: AT-ST's controller (P2) is offered the chance to deal 3 damage, and declines
                    expect(context.player2).toHavePrompt(abilityPrompt(3));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    expect(context.player2).toHavePassAbilityButton();
                    context.player2.clickPrompt('Pass');

                    // Only the step 1 damage occurred
                    expect(context.atst.damage).toBe(2);
                    expect(context.battlefieldMarine.damage).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                    expect(context.consularSecurityForce.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should carry the full chain through all three steps, with each enemy-controlled unit\'s controller choosing', function() {
                    const { context } = contextRef;

                    // Step 1: P1 deals 2 damage to P2's AT-ST
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.atst);
                    expect(context.atst.damage).toBe(2);

                    // Step 2: AT-ST's controller (P2) chooses to deal 3 damage to another P2 unit
                    expect(context.player2).toHavePrompt(abilityPrompt(3));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    context.player2.clickCard(context.consularSecurityForce);
                    expect(context.consularSecurityForce.damage).toBe(3);

                    // Step 3: Consular Security Force's controller (still P2) chooses to deal 4 damage to a P1 unit
                    expect(context.player2).toHavePrompt(abilityPrompt(4));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    context.player2.clickCard(context.wampa);
                    expect(context.wampa.damage).toBe(4);

                    // All three damage instances landed as expected
                    expect(context.atst.damage).toBe(2);
                    expect(context.consularSecurityForce.damage).toBe(3);
                    expect(context.wampa.damage).toBe(4);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should offer step 2 to the same player when step 1 targets their own unit', function() {
                    const { context } = contextRef;

                    // Step 1: P1 deals 2 damage to their own Battlefield Marine
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.battlefieldMarine.damage).toBe(2);

                    // Step 2: Battlefield Marine's controller (still P1) is the one offered the choice, not P2
                    expect(context.player1).toHavePrompt(abilityPrompt(3));
                    expect(context.player1).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickPrompt('Pass');

                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should flip the choosing player back and forth as the chain crosses control', function() {
                    const { context } = contextRef;

                    // Step 1: P1 deals 2 damage to P2's AT-ST
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.atst);
                    expect(context.atst.damage).toBe(2);

                    // Step 2: AT-ST's controller (P2) chooses to deal 3 damage to P1's Wampa
                    expect(context.player2).toHavePrompt(abilityPrompt(3));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    context.player2.clickCard(context.wampa);
                    expect(context.wampa.damage).toBe(3);

                    // Step 3: Wampa's controller (back to P1) is the one offered the choice now
                    expect(context.player1).toHavePrompt(abilityPrompt(4));
                    expect(context.player1).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    context.player1.clickCard(context.consularSecurityForce);
                    expect(context.consularSecurityForce.damage).toBe(4);

                    expect(context.atst.damage).toBe(2);
                    expect(context.wampa.damage).toBe(3);
                    expect(context.consularSecurityForce.damage).toBe(4);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when one of the targets has a Shield token', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['third-sister#cycle-of-vengeance'],
                            groundArena: ['battlefield-marine', 'wampa']
                        },
                        player2: {
                            groundArena: [{ card: 'atst', upgrades: ['shield'] }, 'consular-security-force']
                        }
                    });
                });

                it('should prevent the damage but still offer step 2 to that unit\'s controller', function() {
                    const { context } = contextRef;

                    // Step 1: damage to AT-ST is prevented by its Shield token
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.atst);
                    expect(context.atst.damage).toBe(0);
                    expect(context.atst.isUpgraded()).toBeFalse();

                    // Step 2 is still offered to AT-ST's controller (P2) despite the prevented damage
                    expect(context.player2).toHavePrompt(abilityPrompt(3));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    expect(context.player2).toHavePassAbilityButton();
                    context.player2.clickPrompt('Pass');

                    expect(context.atst.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when one of the damage targets is defeated', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['third-sister#cycle-of-vengeance'],
                            groundArena: ['battlefield-marine', 'wampa']
                        },
                        player2: {
                            groundArena: [
                                {
                                    card: 'warzone-lieutenant',
                                    owner: 'player1'
                                },
                                'consular-security-force'
                            ]
                        }
                    });
                });

                it('should still offer the next damage to the defeated unit\'s controller via Last Known Information', function() {
                    const { context } = contextRef;

                    // Step 1: 2 damage defeats Warzone Lieutenant (2 HP)
                    context.player1.clickCard(context.thirdSister);
                    expect(context.player1).toHavePrompt(abilityPrompt(2));
                    context.player1.clickCard(context.warzoneLieutenant);
                    expect(context.warzoneLieutenant).toBeInZone('discard', context.player1); // Goes to P1's discard because they own it

                    // Step 2 is still offered to Warzone Lieutenant's controller (P2), even though it's no longer in play and is owned by P1
                    expect(context.player2).toHavePrompt(abilityPrompt(3));
                    expect(context.player2).toBeAbleToSelectExactly(context.game.getArenaUnits());
                    expect(context.player2).toHavePassAbilityButton();
                    context.player2.clickPrompt('Pass');

                    expect(context.battlefieldMarine.damage).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                    expect(context.consularSecurityForce.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});

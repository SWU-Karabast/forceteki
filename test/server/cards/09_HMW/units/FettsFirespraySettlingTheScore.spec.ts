describe('Fett\'s Firespray: Settling the Score', function() {
    integration(function(contextRef) {
        describe('its constant ability that lets friendly units attack bases while using Ambush', function() {
            describe('when a friendly Ambush unit has both an enemy unit and the enemy base available to attack', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['fetts-firespray#settling-the-score'],
                            hand: ['banking-clan-warship']
                        },
                        player2: {
                            spaceArena: ['cartel-spacer']
                        }
                    });
                });

                it('allows the ambushing unit to attack the enemy base', function() {
                    const { context } = contextRef;

                    // P1 plays Banking Clan Warship, triggering its Ambush ability
                    context.player1.clickCard(context.bankingClanWarship);
                    expect(context.player1).toHavePassAbilityPrompt('Ambush');
                    context.player1.clickPrompt('Trigger');

                    // Both the enemy unit and the enemy base are legal attack targets
                    expect(context.player1).toHavePrompt('Choose a target for attack');
                    expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.cartelSpacer]);
                    context.player1.clickCard(context.p2Base);

                    // The base takes damage, and the enemy unit is untouched
                    expect(context.p2Base.damage).toBe(6);
                    expect(context.bankingClanWarship.exhausted).toBeTrue();
                    expect(context.bankingClanWarship.damage).toBe(0);
                    expect(context.cartelSpacer.damage).toBe(0);
                });

                it('still allows the ambushing unit to attack an enemy unit instead of the base', function() {
                    const { context } = contextRef;

                    // P1 plays Banking Clan Warship, triggering its Ambush ability
                    context.player1.clickCard(context.bankingClanWarship);
                    context.player1.clickPrompt('Trigger');

                    // Choose to attack the enemy unit instead of the base
                    expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.cartelSpacer]);
                    context.player1.clickCard(context.cartelSpacer);

                    // The enemy unit is defeated, and the base is untouched
                    expect(context.cartelSpacer).toBeInZone('discard');
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.bankingClanWarship.exhausted).toBeTrue();
                    expect(context.bankingClanWarship.damage).toBe(2);
                });
            });

            it('triggers Ambush against the enemy base even when no enemy units are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['fetts-firespray#settling-the-score'],
                        hand: ['banking-clan-warship']
                    }
                });

                const { context } = contextRef;

                // P1 plays Banking Clan Warship, triggering its Ambush ability
                context.player1.clickCard(context.bankingClanWarship);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                // The enemy base is the only legal attack target
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // The base takes damage
                expect(context.p2Base.damage).toBe(6);
                expect(context.bankingClanWarship.exhausted).toBeTrue();
            });

            it('does not grant any attack to a friendly unit that does not have Ambush', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['fetts-firespray#settling-the-score'],
                        hand: ['desperado-freighter']
                    }
                });

                const { context } = contextRef;

                // P1 plays Desperado Freighter, which has no Ambush keyword
                context.player1.clickCard(context.desperadoFreighter);

                // No Ambush keyword means no attack is triggered, so the action simply ends
                expect(context.desperadoFreighter).toBeInZone('spaceArena');
                expect(context.desperadoFreighter.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('applies to Fett\'s Firespray itself when it gains Ambush from another effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wedge-antilles#star-of-the-rebellion'],
                        hand: ['fetts-firespray#settling-the-score']
                    }
                });

                const { context } = contextRef;

                // Wedge Antilles grants +1/+1 and Ambush to friendly Vehicle units, including Fett's Firespray
                context.player1.clickCard(context.fettsFirespray);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                // The enemy base is the only legal attack target
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Fett's Firespray attacks the base with its boosted power
                expect(context.fettsFirespray.getPower()).toBe(7);
                expect(context.p2Base.damage).toBe(7);
                expect(context.fettsFirespray.exhausted).toBeTrue();
            });

            it('is overridden by an enemy Sentinel unit, which forces the Ambush attack away from the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['fetts-firespray#settling-the-score'],
                        hand: ['banking-clan-warship']
                    },
                    player2: {
                        spaceArena: ['alkenzi-patroller', 'outland-protector']
                    }
                });

                const { context } = contextRef;

                // P1 plays Banking Clan Warship, triggering its Ambush ability
                context.player1.clickCard(context.bankingClanWarship);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                // Restrictions override permissions: Sentinel forces the attack onto a Sentinel unit,
                // excluding both the base and the non-Sentinel option
                expect(context.player1).toBeAbleToSelectExactly([context.alkenziPatroller, context.outlandProtector]);
                context.player1.clickCard(context.alkenziPatroller);

                // The Sentinel unit is defeated, and neither the base nor the other unit is damaged
                expect(context.alkenziPatroller).toBeInZone('discard');
                expect(context.outlandProtector.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.bankingClanWarship.exhausted).toBeTrue();
            });

            it('stops applying once Fett\'s Firespray leaves play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['fetts-firespray#settling-the-score'],
                        hand: ['banking-clan-warship']
                    },
                    player2: {
                        hand: ['direct-hit']
                    }
                });

                const { context } = contextRef;

                // P1 passes, then P2 defeats Fett's Firespray with Direct Hit
                context.player1.passAction();
                context.player2.clickCard(context.directHit);
                expect(context.player2).toBeAbleToSelectExactly([context.fettsFirespray]);
                context.player2.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();

                // Fett's Firespray is gone, so its effect no longer applies. With no enemy units in play and
                // bases no longer attackable, Ambush has no legal target and fizzles without a prompt.
                context.player1.clickCard(context.bankingClanWarship);

                // The unit simply enters play exhausted, and the action ends
                expect(context.bankingClanWarship).toBeInZone('spaceArena');
                expect(context.bankingClanWarship.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('applies to a friendly ground unit\'s Ambush even though Fett\'s Firespray is a space unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['fetts-firespray#settling-the-score'],
                        hand: ['x34-landspeeder']
                    }
                });

                const { context } = contextRef;

                // P1 plays X-34 Landspeeder, a ground unit, triggering its Ambush ability
                context.player1.clickCard(context.x34Landspeeder);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                // The enemy base is the only legal attack target
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // The base takes damage
                expect(context.p2Base.damage).toBe(2);
                expect(context.x34Landspeeder.exhausted).toBeTrue();
            });
        });
    });
});

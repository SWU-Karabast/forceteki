describe('Padme Amidala, Follow My Lead', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side action ability', function() {
            const abilityText = 'Attack with a friendly unit that entered play this phase even if it\'s exhausted. It can\'t attack bases for this attack';

            it('attacks with a unit that entered play this phase, and cannot attack the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['atst', 'restored-arc170'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['consular-security-force'],
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Play two units (interleaved with opponent)
                context.player1.clickCard(context.atst);
                context.player2.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.restoredArc170);
                context.player2.passAction();

                // Use Padmé's leader ability — can select either unit that entered play this phase
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt(abilityText);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.restoredArc170]);
                context.player1.clickCard(context.atst);

                // AT-ST can attack enemy units but not the enemy base
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('discard', context.player2);
            });

            it('attacks with a token unit that entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Play Veteran Fleet Officer — its When Played creates an X-Wing token (2 units enter play)
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Use Padmé's leader ability — can select Veteran Fleet Officer or the X-Wing token
                context.player1.clickCard(context.padmeAmidala);
                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('does not attack when only 1 unit has entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['awing'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                // Play one unit
                context.player1.clickCard(context.awing);
                context.player2.passAction();

                // Use Padmé's leader ability — condition not met, no attack is granted
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('attacks with the surviving unit when 2 units entered play but one was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['lothwolf', 'porg'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play two units; opponent defeats Lothwolf
                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.porg);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Use Padmé's leader ability — condition is met (2 units entered under friendly control);
                // only the surviving Porg is a valid attacker
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.padmeAmidala.exhausted).toBeTrue();
                expect(context.porg).toBeInZone('discard', context.player1);
            });

            it('has no effect when 2 units entered play but both were defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['lothwolf', 'porg'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        resources: 10,
                        hand: ['vanquish', 'vanquish']
                    }
                });

                const { context } = contextRef;
                const vanquishes = context.player2.findCardsByName('vanquish');

                // Play two units; opponent vanquishes each immediately
                context.player1.clickCard(context.lothwolf);
                context.player2.clickCard(vanquishes[0]);
                context.player2.clickCard(context.lothwolf);
                context.player1.clickCard(context.porg);
                context.player2.clickCard(vanquishes[1]);
                context.player2.clickCard(context.porg);

                // Use Padmé's leader ability — condition is met (2 entered under friendly control)
                // but no valid attackers remain (both defeated)
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('has no effect when no units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use Padmé's leader ability — condition not met, no attack is granted
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('counts a unit that entered play under friendly control even if it is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        base: 'chopper-base',
                        resources: 4,
                        hand: ['galen-erso#destroying-his-creation', 'porg'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Galen Erso and give control to opponent (count = 1 under friendly control)
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Play Porg (count = 2 under friendly control)
                context.player1.clickCard(context.porg);
                context.player2.passAction();

                // Use Padmé's leader ability — condition is met (2 units entered under friendly control);
                // only Porg is a valid attacker (Galen is now controlled by opponent)
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.wampa);

                expect(context.padmeAmidala.exhausted).toBeTrue();
                expect(context.porg).toBeInZone('discard', context.player1);
            });

            it('does not count a unit that entered play under enemy control even if it is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['populist-advisor'],
                        groundArena: ['battlefield-marine'],
                        resources: 5 // So we dont get deploy prompt
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['yoda#old-master']
                    }
                });

                const { context } = contextRef;

                // Play Populist Advisor (count = 1 under friendly control)
                context.player1.clickCard(context.populistAdvisor);

                // Opponent plays Galen Erso and transfers control to P1
                // (Galen entered under enemy control so it does not count)
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Use Padmé's leader ability — condition NOT met (only 1 unit entered under friendly control).
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.padmeAmidala.exhausted).toBeTrue();
                expect(context.galenErso.damage).toBe(0);
            });
        });

        describe('Deployed unit-side On Attack ability', function() {
            it('attacks with a friendly unit that entered play this phase, and cannot attack the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['yoda#old-master'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                // Play a unit
                context.player1.clickCard(context.yoda);
                context.player2.passAction();

                // Deploy Padmé
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt('Deploy Padmé Amidala');
                context.player2.passAction();

                // Attack with Padmé — ability targets Yoda; Yoda attacks Porg (cannot attack base)
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.yoda.damage).toBe(1);
            });

            it('attacks with a token unit that entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Play Veteran Fleet Officer — its When Played creates an X-Wing token
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Attack with Padmé — can target Veteran Fleet Officer or the X-Wing token
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);
                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);
                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(xwing.damage).toBe(1);
            });

            it('is skipped when no other friendly units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Attack with Padmé — ability fizzles, no prompt shown
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('is skipped when the only unit that entered play was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['lothwolf'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Play a unit, opponent defeats it immediately
                context.player1.clickCard(context.lothwolf);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Attack with Padmé — ability fizzles (no valid targets), no prompt shown
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('does not count a unit that entered play under friendly control but is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Galen Erso and give control to opponent — no other units entered play
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Attack with Padmé — ability fizzles (no currently friendly units that entered play), no prompt shown
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('counts a unit that entered play under enemy control but is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        groundArena: ['yoda#old-master'],
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Opponent plays Galen Erso and transfers control to P1
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Attack with Padmé — Galen is now friendly, so it is a valid attacker
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.galenErso]);
                context.player1.clickCard(context.galenErso);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.galenErso.damage).toBe(2);
            });
        });
    });
});

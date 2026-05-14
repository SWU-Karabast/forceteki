describe('Padmé Amidala, Follow My Lead', function() {
    integration(function(contextRef) {
        describe('Padmé Amidala\'s undeployed ability', function() {
            const abilityText = 'Attack with a friendly unit that entered play this phase even if it\'s exhausted. It can\'t attack bases for this attack';

            it('attacks with an exhausted friendly unit when 2 or more friendly units entered play this phase', async function() {
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

                // Play AT-ST and Restored ARC-170
                context.player1.clickCard(context.atst);
                context.player2.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.restoredArc170);
                context.player2.passAction();

                // Use Padmé's leader ability (explicitly choose it, as enough resources to deploy remain)
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt(abilityText);

                // Can only target units that entered play this phase; selected attacker can't attack bases
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.restoredArc170]);
                context.player1.clickCard(context.atst);
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

                // Play Veteran Fleet Officer, which creates an X-Wing token
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Use Padmé's leader ability — Veteran Fleet Officer and X-Wing token are both valid
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
                        hand: ['awing']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('attacks when 2 units entered play even if one was defeated', async function() {
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

                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.porg);

                // Opponent defeats Lothwolf — Lothwolf still counts as having entered play this phase
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // 2 friendly units entered play this phase, so Padmé can attack with the surviving Porg
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.padmeAmidala.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(1);
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

                // Play Galen Erso (entered under P1 control), give control to opponent
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Play Porg (entered under P1 control)
                context.player1.clickCard(context.porg);
                context.player2.passAction();

                // 2 units entered play under P1 control this phase (even though Galen is now enemy),
                // so Padmé can attack with the surviving friendly Porg
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.galenErso]);
                context.player1.clickCard(context.wampa);

                expect(context.padmeAmidala.exhausted).toBeTrue();
                // Galen Erso is now controlled by P2, granting Raid 1 to P1's units; Porg (1 power) hits Wampa for 2
                expect(context.wampa.damage).toBe(2);
            });

            it('does not count a unit that entered play under enemy control even if it is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['populist-advisor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                // Play Populist Advisor (1 unit entered under P1 control)
                context.player1.clickCard(context.populistAdvisor);

                // Opponent plays Galen Erso and gives control to P1
                // Galen entered under P2 control, so it does not count toward the 2+ condition
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Use Padmé's leader ability — only 1 unit entered play under friendly control
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.padmeAmidala.exhausted).toBeTrue();
            });
        });

        describe('Padmé Amidala\'s deployed ability', function() {
            it('attacks with an exhausted friendly unit that entered play this phase', async function() {
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

                // Play Yoda
                context.player1.clickCard(context.yoda);
                context.player2.passAction();

                // Deploy Padmé
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt('Deploy Padmé Amidala');
                context.player2.passAction();

                // Attack with Padmé — Yoda entered play this phase and can attack even while exhausted
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                // Can only target Yoda (Battlefield Marine didn't enter this phase); Yoda can't attack bases
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

                // Play Veteran Fleet Officer, which creates an X-Wing token
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Attack with Padmé — Veteran Fleet Officer and X-Wing token are both valid attackers
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
                    }
                });

                const { context } = contextRef;

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

                context.player1.clickCard(context.lothwolf);

                // Opponent defeats Lothwolf — Lothwolf still entered play this phase but is no longer in play to attack
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('can attack with a surviving entered-play unit when another entered-play unit was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['lothwolf', 'yoda#old-master'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.yoda);

                // Opponent defeats Lothwolf — Lothwolf still counts as having entered play this phase
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Attack with Padmé - the surviving Yoda (which entered play this phase) is a valid attacker
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.porg).toBeInZone('discard', context.player2);
            });

            it('cannot attack with a unit that entered play under friendly control but is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['battlefield-marine']
                    },
                });

                const { context } = contextRef;

                // Play Galen Erso and give control to opponent
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Attack with Padmé — Galen is no longer friendly; no other friendly unit entered play, so ability has no valid attackers
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('does not count a unit that entered play under enemy control even if it is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Opponent plays Galen Erso and gives control to P1 — Galen entered under P2 control
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Attack with Padmé — no unit entered play under friendly control this phase
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.galenErso.damage).toBe(0);
            });
        });
    });
});

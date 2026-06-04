describe('The Darksaber, Icon of Leadership', function() {
    integration(function(contextRef) {
        describe('its attachment restriction', function() {
            it('should be able to attach to a unique non-Vehicle ground unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        groundArena: ['bokatan-kryze#for-all-of-mandalore'],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.bokatanKryze]);
                context.player1.clickCard(context.bokatanKryze);

                expect(context.bokatanKryze).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should be able to attach to a unique non-Vehicle space unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should not be able to attach to a non-unique unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        groundArena: ['wampa'],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // No valid unique non-Vehicle targets; Darksaber cannot be played
                expect(context.player1).not.toBeAbleToSelect(context.theDarksaber);
            });

            it('should not be able to attach to a unique Vehicle unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // The only unit in play is a Vehicle; Darksaber cannot be played
                expect(context.player1).not.toBeAbleToSelect(context.theDarksaber);
            });

            it('should be able to attach to a deployed unique non-Vehicle leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        base: 'kestro-city',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFett]);
                context.player1.clickCard(context.bobaFett);

                expect(context.bobaFett).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should not be playable when no eligible unit is in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        groundArena: ['battlefield-marine'],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Only non-unique units are in play; Darksaber cannot be played
                expect(context.player1).not.toBeAbleToSelect(context.theDarksaber);
            });
        });
    });

    integration(function(contextRef) {
        describe('its leader unit and Mandalorian trait grant', function() {
            describe('when attached to a unit that already has the Mandalorian trait', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                            leader: 'boba-fett#daimyo',
                            base: 'kestro-city'
                        }
                    });
                });

                it('should make the attached unit a leader unit', function() {
                    const { context } = contextRef;
                    expect(context.bokatanKryze.isLeader()).toBeTrue();
                });

                it('should retain the Mandalorian trait without error', function() {
                    const { context } = contextRef;
                    expect(context.bokatanKryze.hasSomeTrait('mandalorian')).toBeTrue();
                });
            });

            it('should grant the Mandalorian trait to a non-Mandalorian unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city'
                    }
                });

                const { context } = contextRef;

                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeTrue();
            });

            it('should prevent the attached unit from being targeted by Change of Heart', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] },
                            'wampa'
                        ],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city'
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);

                // The Darksaber-bearing unit is a leader unit; Change of Heart can only target non-leader units
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player2.clickPrompt('Cancel');
            });

            it('should remove leader unit status and Mandalorian trait when the Darksaber is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city'
                    },
                    player2: {
                        hand: ['confiscate']
                    }
                });

                const { context } = contextRef;

                // Verify initial state with Darksaber attached
                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeTrue();
                expect(context.ladyProxima.isLeader()).toBeTrue();

                // Player 2 defeats the Darksaber with Confiscate
                context.player1.passAction();
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.theDarksaber);

                // Both effects are removed when the Darksaber leaves play
                expect(context.theDarksaber).toBeInZone('discard');
                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeFalse();
                expect(context.ladyProxima.isLeader()).toBeFalse();
            });

            it('should allow Change of Heart to target the unit after the Darksaber is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city'
                    },
                    player2: {
                        hand: ['confiscate', 'change-of-heart']
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats the Darksaber with Confiscate
                context.player1.passAction();
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.theDarksaber);

                expect(context.theDarksaber).toBeInZone('discard');
                expect(context.ladyProxima.isLeader()).toBeFalse();

                // Now that Lady Proxima is no longer a leader unit, Change of Heart can target her
                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                expect(context.player2).toBeAbleToSelect(context.ladyProxima);
                context.player2.clickCard(context.ladyProxima);

                expect(context.ladyProxima).toBeInZone('groundArena', context.player2);
            });
        });
    });

    integration(function(contextRef) {
        describe('its aspect provision ability', function() {
            // Setup for all aspect tests:
            //   Leader: boba-fett#collecting-the-bounty (Cunning + Villainy)
            //   Base:   kestro-city (Aggression)
            //   Deck provides: Cunning, Villainy, Aggression — NOT Command or Heroism
            //
            // The attached unit, bokatan-kryze#for-all-of-mandalore, has Command + Heroism aspects.
            // With the Darksaber attached, those aspects become available during cost payment.

            it('should cover one unmatched aspect, allowing a Heroism card to be played at printed cost', async function() {
                // rebel-pathfinder: Heroism, cost 2 — normally costs 4 (printed cost + 2 penalty)
                // With Darksaber on Bokatan (Command+Heroism): Heroism is covered, costs 2
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-pathfinder'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // With exactly 2 resources, rebel-pathfinder should be playable because Bokatan covers Heroism
                expect(context.player1).toBeAbleToSelect(context.rebelPathfinder);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should cover two unmatched aspects, allowing a Command+Heroism card to be played at printed cost', async function() {
                // bail-organa#rebel-councilor: Command + Heroism, cost 1
                // Without Darksaber: costs 1 + 4 = 5 (neither aspect is covered by leader/base)
                // With Darksaber on Bokatan (Command+Heroism): both aspects covered, costs 1
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bail-organa#rebel-councilor'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        resources: 1
                    }
                });

                const { context } = contextRef;

                // With exactly 1 resource, Bail Organa (Command+Heroism, cost 1) should be playable
                expect(context.player1).toBeAbleToSelect(context.bailOrgana);
                context.player1.clickCard(context.bailOrgana);

                expect(context.bailOrgana).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not reduce cost below printed cost when the aspect is already covered by the leader or base', async function() {
                // Leader: boba-fett#daimyo (Command + Heroism) already provides Heroism
                // Darksaber on Bokatan also provides Heroism — this should not double-discount
                // phase-i-clone-trooper: Heroism, cost 2 — should still cost exactly 2
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['phase-i-clone-trooper'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // Heroism is already covered by the leader; Darksaber adds no additional discount
                expect(context.player1).toBeAbleToSelect(context.phaseICloneTrooper);
                context.player1.clickCard(context.phaseICloneTrooper);

                expect(context.phaseICloneTrooper).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            describe('when attached to a neutral unit (no aspects)', function() {
                // lady-proxima#white-worm-matriarch has no aspect icons, so Darksaber provides nothing
                // rebel-pathfinder: Heroism, cost 2 — the Heroism penalty still applies (total cost 4)

                it('should not cover the unmatched aspect, so the card cannot be played with only 3 resources', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['rebel-pathfinder'],
                            groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                            leader: 'boba-fett#collecting-the-bounty',
                            base: 'kestro-city',
                            resources: 3
                        }
                    });

                    const { context } = contextRef;

                    // 3 resources is not enough to pay the Heroism penalty (cost 2 + 2 penalty = 4)
                    expect(context.player1).not.toBeAbleToSelect(context.rebelPathfinder);
                });

                it('should confirm that 4 resources are needed to cover the unmitigated aspect penalty', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['rebel-pathfinder'],
                            groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                            leader: 'boba-fett#collecting-the-bounty',
                            base: 'kestro-city',
                            resources: 4
                        }
                    });

                    const { context } = contextRef;

                    // 4 resources is exactly enough to pay cost 2 + 2 Heroism penalty
                    expect(context.player1).toBeAbleToSelect(context.rebelPathfinder);
                    context.player1.clickCard(context.rebelPathfinder);

                    expect(context.rebelPathfinder).toBeInZone('groundArena');
                    expect(context.player1.exhaustedResourceCount).toBe(4);
                });
            });

            it('should stop providing aspects after the Darksaber is defeated', async function() {
                // With Darksaber on Bokatan (Command+Heroism): rebel-pathfinder costs 2
                // After Confiscate defeats the Darksaber, the Heroism coverage ends
                // rebel-pathfinder then costs 4 (printed cost 2 + 2 Heroism penalty)
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-pathfinder'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        resources: 3
                    },
                    player2: {
                        hand: ['confiscate']
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats the Darksaber with Confiscate
                context.player1.passAction();
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.theDarksaber);

                expect(context.theDarksaber).toBeInZone('discard');

                // With only 3 resources and the Darksaber gone, rebel-pathfinder (cost 2 + 2 penalty = 4) is no longer affordable
                expect(context.player1).not.toBeAbleToSelect(context.rebelPathfinder);
            });
        });
    });
});

describe('The Darksaber, Icon of Leadership', function() {
    integration(function(contextRef) {
        describe('its attachment restriction', function() {
            it('should be able to attach to a unique non-Vehicle ground unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        groundArena: [
                            'bokatan-kryze#for-all-of-mandalore',
                            'battlefield-marine',
                            'anakins-podracer#so-wizard'
                        ],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Cannot target the non-unique non-Vehicle or the unique Vehicle units
                    context.bokatanKryze
                ]);
                context.player1.clickCard(context.bokatanKryze);

                expect(context.bokatanKryze).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);
            });

            it('should be able to attach to a unique non-Vehicle space unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#icon-of-leadership'],
                        spaceArena: [
                            'leia-organa#extraordinary',
                            'graceful-purrgil',
                            'blue-leader#scarif-air-support'
                        ],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Cannot target the non-unique non-Vehicle or the unique Vehicle units
                    context.leiaOrgana
                ]);
                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership']);
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
                            groundArena: [{
                                card: 'bokatan-kryze#for-all-of-mandalore',
                                upgrades: ['the-darksaber#icon-of-leadership']
                            }],
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
                        hand: ['the-armorer#survival-is-strength'],
                        groundArena: [{
                            card: 'lady-proxima#white-worm-matriarch',
                            upgrades: ['the-darksaber#icon-of-leadership']
                        }]
                    }
                });

                const { context } = contextRef;

                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeTrue();

                // Play The Armorer - confirm Lady Proxima is targetable as a Mandalorian for The Armorer's ability
                context.player1.clickCard(context.theArmorer);
                expect(context.player1).toBeAbleToSelectExactly([context.ladyProxima, context.theArmorer]);
                context.player1.clickCard(context.ladyProxima);
                context.player1.clickCard(context.theArmorer);
                context.player1.clickDone();

                // Lady Proxima is given the shield from The Armorer's ability, confirming she is treated as a Mandalorian
                expect(context.ladyProxima).toHaveExactUpgradeNames(['the-darksaber#icon-of-leadership', 'shield']);
            });

            it('should prevent the attached unit from being targeted by effects that target non-leader units (Change of Heart)', async function() {
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

            it('should allow the unit to be targeted by effects that target non-leader units after the Darksaber is defeated (Change of Heart)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city'
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['confiscate', 'change-of-heart']
                    }
                });

                const { context } = contextRef;

                // Verify initial state with Darksaber attached
                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeTrue();
                expect(context.ladyProxima.isLeader()).toBeTrue();

                // Player 2 defeats the Darksaber with Confiscate
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.theDarksaber);

                expect(context.theDarksaber).toBeInZone('discard');
                expect(context.ladyProxima.hasSomeTrait('mandalorian')).toBeFalse();
                expect(context.ladyProxima.isLeader()).toBeFalse();

                // Now that Lady Proxima is no longer a leader unit, Change of Heart can target her
                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                expect(context.player2).toBeAbleToSelect(context.ladyProxima);
                context.player2.clickCard(context.ladyProxima);

                expect(context.ladyProxima).toBeInZone('groundArena', context.player2);
            });

            it('should defeat the Darksaber-bearing unit instead of returning control when the Change of Heart delayed effect fires', async function() {
                // CR 3.4.6: if an ability would cause a Leader Unit to change control, it is defeated instead.
                // Change of Heart (cost 6, Cunning) creates a delayed effect that returns control at
                // the start of the regroup phase. If the stolen unit became a leader unit (via Darksaber)
                // before then, it is defeated instead of returning control.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart', 'the-darksaber#icon-of-leadership'],
                        hasInitiative: true,
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['bokatan-kryze#for-all-of-mandalore']
                    }
                });

                const { context } = contextRef;

                // P1 takes control of Bo-Katan with Change of Heart
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.bokatanKryze);
                expect(context.bokatanKryze).toBeInZone('groundArena', context.player1);

                context.player2.passAction();

                // P1 attaches the Darksaber to Bo-Katan, making her a leader unit
                context.player1.clickCard(context.theDarksaber);
                context.player1.clickCard(context.bokatanKryze);
                expect(context.bokatanKryze.isLeader()).toBeTrue();

                // Move to regroup phase — the Change of Heart delayed effect fires, but since Bo-Katan is
                // now a leader unit, she is defeated instead of returning control (CR 3.4.6)
                context.moveToRegroupPhase();

                expect(context.bokatanKryze).toBeInZone('discard', context.player2);
                // The Darksaber is defeated when its attached unit leaves play
                expect(context.theDarksaber).toBeInZone('discard', context.player1);
            });

            it('should blank the Darksaber-bearing unit\'s own abilities when Brain Invaders is in play', async function() {
                // Brain Invaders blanks all leader abilities (except epic actions).
                // A unit bearing the Darksaber is a leader unit, so its own abilities are blanked.
                // Bo-Katan's "While you control another Mandalorian unit, gains Raid 2" is her own ability,
                // so it is blanked while Brain Invaders is in play.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] },
                            'mandalorian'  // provides the "another Mandalorian unit" condition for Bo-Katan's Raid 2
                        ]
                    },
                    player2: {
                        hand: ['brain-invaders']
                    }
                });

                const { context } = contextRef;

                // Before Brain Invaders: Bo-Katan attacks with Raid 2 active
                // Power = 2 (base) + 4 (Darksaber) + 2 (Raid 2 while attacking) = 8
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8);

                context.player2.clickCard(context.brainInvaders);

                context.moveToNextActionPhase();

                // After Brain Invaders: Bo-Katan is a leader unit, so her Raid 2 ability is blanked.
                // Power = 2 (base) + 4 (Darksaber) = 6
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8 + 6);
            });

            it('should count the Darksaber-bearing unit as a friendly leader unit for Executioner\'s Arena\'s Epic Action', async function() {
                // Executioner's Arena: "For each friendly leader unit, you may deal 2 damage to a unit."
                // With a deployed leader + Lady Proxima (Darksaber), there are 2 friendly leader units,
                // so the epic action should produce 2 simultaneous 2-damage instances.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        groundArena: [
                            { card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }
                        ]
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use the Executioner's Arena epic action
                context.player1.clickCard(context.executionersArena);

                // Click non-checking because prompt state appears unchanged with multiple instances of the same prompt
                context.player1.clickCardNonChecking(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // Each unit received 2 damage
                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });

            it('should count the Darksaber-bearing unit as a friendly leader unit for Take Action\'s cost reduction', async function() {
                // Take Action: costs 1 less per friendly leader unit. With 2 friendly leader units, costs 1.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-action'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        base: 'kestro-city',
                        groundArena: [
                            { card: 'lady-proxima#white-worm-matriarch', upgrades: ['the-darksaber#icon-of-leadership'] }
                        ],
                        // Take Action costs 3, minus 2 (one per leader unit) = 1 resource needed
                        resources: 1
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // With only 1 resource, Take Action should be playable because there are 2 friendly leader units
                context.player1.clickCard(context.takeAction);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });
    });

    integration(function(contextRef) {
        describe('its aspect provision ability', function() {
            it('should cover one unmatched aspect, allowing a Heroism card to be played at printed cost', async function() {
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

                // With exactly 2 resources, rebel-pathfinder should be playable because Bo-Katan covers Heroism
                expect(context.player1).toBeAbleToSelect(context.rebelPathfinder);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should cover two unmatched aspects, allowing a Command+Heroism card to be played at printed cost', async function() {
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

            it('should work for double-aspect cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zuckuss#the-findsman'], // 5 cost with Cunning+Cunning aspects
                        groundArena: [{
                            card: 'bodhi-rook#imperial-defector', // Cunning+Cunning
                            upgrades: ['the-darksaber#icon-of-leadership']
                        }],
                        leader: 'boba-fett#daimyo', // Command+Heroism
                        base: 'kestro-city', // Aggression
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // With exactly 5 resources, Zuckuss should be playable because Bodhi with Darksaber covers both Cunning aspects
                expect(context.player1).toBeAbleToSelect(context.zuckuss);
                context.player1.clickCard(context.zuckuss);

                expect(context.zuckuss).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should not reduce cost below printed cost when the aspect is already covered by the leader or base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#daimyo',
                        base: 'kestro-city',
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // Command, Heroism are already covered by the leader; Darksaber adds no additional discount
                expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            describe('when attached to a neutral unit (no aspects)', function() {
                it('aspect penalties are applied as expected', async function() {
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

            it('does not provide aspectes for the opposing player', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Battlefield Marine
                context.player2.clickCard(context.battlefieldMarine);

                // Player 2 should not gain any aspect discount from Player 1's Darksaber
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player2.exhaustedResourceCount).toBe(6); // 2-cost + 4 penalty
            });

            it('should provide attached units aspects for Smuggle costs', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        // Freetown Backup has a Smuggle cost of 4 with Command, Heroism aspects
                        resources: ['freetown-backup', 'atst', 'atst', 'atst']
                    }
                });

                const { context } = contextRef;

                // Click the Freetown Backup resource to trigger Smuggle
                context.player1.clickCard(context.freetownBackup);

                // Freetown Backup enters play in the ground arena
                expect(context.freetownBackup).toBeInZone('groundArena');

                // Exactly 4 resources were exhausted (including freetown-backup itself)
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should provide attached units aspects for Piloting costs', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Luke has a Piloting cost of 3 with Command, Heroism aspects
                        hand: ['luke-skywalker#you-still-with-me'],
                        groundArena: [{ card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        spaceArena: ['n1-starfighter'],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // Play Luke via Piloting onto the N-1 Starfighter
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Play Luke Skywalker with Piloting');
                context.player1.clickCard(context.n1Starfighter);

                // Luke is attached as a Pilot upgrade on the N-1 Starfighter
                expect(context.n1Starfighter).toHaveExactUpgradeNames(['luke-skywalker#you-still-with-me']);

                // Exactly 3 resources were exhausted (the Piloting cost with aspects covered by Bo-Katan)
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });
    });
});

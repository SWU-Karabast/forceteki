describe('Fives, I Have Proof!', function() {
    integration(function(contextRef) {
        const copyPrompt = 'Choose a unit to copy "When Played" abilities from';

        describe('Pre-enter play ability', function() {
            describe('when a unit with a When Played ability is in play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                            base: 'dagobah-swamp',
                            hand: ['fives#i-have-proof'],
                            groundArena: ['battlefield-marine'],
                        },
                        player2: {
                            spaceArena: ['patrolling-vwing'],
                        }
                    });
                });

                it('should copy When Played ability from the selected unit and trigger it on enter play', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.fives);
                    expect(context.player1).toHavePrompt(copyPrompt);
                    expect(context.player1).toHavePassAbilityButton();

                    // Only units with When Played abilities should be selectable
                    expect(context.player1).toBeAbleToSelectExactly([context.patrollingVwing]);

                    // Select V-Wing to copy its "Draw a card" When Played ability
                    context.player1.clickCard(context.patrollingVwing);

                    // Fives enters play and the copied When Played triggers, drawing a card
                    expect(context.fives).toBeInZone('groundArena');
                    expect(context.player1.handSize).toBe(1); // Fives left hand (0), drew 1 card
                    expect(context.player1.exhaustedResourceCount).toBe(6);

                    expect(context.getChatLogs(2)).toEqual([
                        'player1 uses Fives to copy the "When Played" abilities of Patrolling V-Wing',
                        'player1 uses Fives to draw a card',
                    ]);
                });

                it('can be declined', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.fives);
                    expect(context.player1).toHavePrompt(copyPrompt);

                    // Pass on the ability
                    context.player1.clickPrompt('Pass');

                    // Fives enters play without the copied ability, no draw
                    expect(context.fives).toBeInZone('groundArena');
                    expect(context.player1.handSize).toBe(0); // Fives left hand, no draw
                });
            });

            it('should only copy When Played abilities, not other ability types', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                    },
                    player2: {
                        groundArena: ['darth-vader#twilight-of-the-apprentice'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copy Vader's When Played ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.darthVader);

                // When Played triggers: player1 selects friendly and enemy units for shields
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.darthVader);

                expect(context.fives).toHaveExactUpgradeNames(['shield']);
                expect(context.darthVader).toHaveExactUpgradeNames(['shield']);

                // Fives keeps his own stats, not Vader's
                expect(context.fives.getPower()).toBe(6);
                expect(context.fives.getHp()).toBe(6);

                // Move to next action phase so Fives readies
                context.moveToNextActionPhase();

                // Attack with Fives - should NOT trigger Vader's On Attack ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.p2Base);

                // No On Attack prompt to defeat an enemy unit with a shield
                expect(context.player2).toBeActivePlayer();
            });

            it('should not show prompt when no units have When Played abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Play Fives - no units have When Played abilities, so ability auto-skips
                context.player1.clickCard(context.fives);

                // Fives enters play without any copied ability
                expect(context.fives).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should copy multiple When Played abilities from the selected unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        discard: ['youre-my-only-hope', 'galactic-ambition'],
                    },
                    player2: {
                        groundArena: ['anakin-skywalker#champion-of-mortis', 'guerilla-attack-pod'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copying Anakin's two When Played abilities
                context.player1.clickCard(context.fives);
                expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.guerillaAttackPod]);
                context.player1.clickCard(context.anakinSkywalker);

                // Both When Played abilities trigger simultaneously - choose order
                context.player1.clickPrompt('If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase');

                // First: Heroism condition
                context.player1.clickCard(context.guerillaAttackPod);

                // Second: Villainy condition
                context.player1.clickCard(context.guerillaAttackPod);

                // Combined -6/-6 defeats the 6HP unit
                expect(context.guerillaAttackPod).toBeInZone('discard', context.player2);
            });

            it('should copy the When Played trigger but not the On Attack trigger from a combined ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        groundArena: ['general-draven#doing-what-must-be-done'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copying Draven's combined When Played/On Attack ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.generalDraven);

                // When Played triggers: creates an X-Wing token
                expect(context.fives).toBeInZone('groundArena');
                const xwing = context.player1.findCardByName('xwing');
                expect(xwing).toBeInZone('spaceArena', context.player1);

                // Move to next action phase so Fives readies
                context.moveToNextActionPhase();

                // Attack with Fives - should NOT trigger On Attack (no second X-Wing creation)
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.findCardsByName('xwing').length).toBe(1);
            });

            it('should copy a When Played using Smuggle ability and trigger it when played via Smuggle', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        groundArena: ['tech#source-of-insight'],
                        resources: [
                            'fives#i-have-proof',
                            'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                            'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        ],
                    },
                    player2: {
                        groundArena: ['cassian-andor#rebellions-are-built-on-hope'],
                    }
                });

                const { context } = contextRef;

                // Smuggle Fives from the resource zone (Tech grants Smuggle to all friendly resources)
                context.player1.clickCard(context.fives);

                // Pre-enter play ability triggers - select Cassian to copy "When Played using Smuggle: Ready this unit"
                context.player1.clickCard(context.cassianAndor);

                // Fives enters play via Smuggle, copied ability fires and readies him
                expect(context.fives).toBeInZone('groundArena');
                expect(context.fives.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(8); // Smuggle cost: 6 + 2 = 8
            });

            it('should copy a "When played as a unit" ability but not piloting abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                    },
                    player2: {
                        groundArena: ['the-mandalorian#weathered-pilot', 'wampa'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copying Mandalorian's "When played as a unit: Exhaust up to 2 ground units"
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.theMandalorian);

                // When Played triggers: exhaust up to 2 ground units
                expect(context.player1).toBeAbleToSelectExactly([context.fives, context.theMandalorian, context.wampa]);
                context.player1.clickCard(context.theMandalorian);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                expect(context.theMandalorian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to target a unit whose abilities have been blanked', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        groundArena: ['emissaries-from-ryloth'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Use Kazuda's ability to blank Emissaries (removes all abilities for this round)
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                context.player1.clickCard(context.emissariesFromRyloth);

                // With the extra action from Kazuda, play Fives
                // Emissaries is blanked so it has no When Played abilities - no valid targets
                context.player1.clickCard(context.fives);

                // Fives enters play without copying anything (ability auto-skips)
                expect(context.fives).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should retain a copied "for this phase" lasting effect even after Fives is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['emissaries-from-ryloth', 'wampa'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copying Emissaries' "When Played: Give a unit -3/-0 for this phase"
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.emissariesFromRyloth);

                // When Played triggers: give Wampa -3/-0
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(1); // 4 - 3 = 1
                expect(context.wampa.getHp()).toBe(5);

                // Player 2 defeats Fives with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.fives);

                expect(context.fives).toBeInZone('discard');

                // The -3/-0 effect persists for this phase even though Fives was defeated
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(5);

                // Move to next action phase to verify the effect ends as normal
                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should end a copied "while this unit is in play" lasting effect when Fives is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['huyang#enduring-instructor'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copying Huyang's "When Played: Choose another friendly unit. While this unit is in play, the chosen unit gets +2/+2."
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.huyang);

                // When Played triggers: choose Battlefield Marine for +2/+2
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(5); // 3 + 2 = 5
                expect(context.battlefieldMarine.getHp()).toBe(5);   // 3 + 2 = 5

                // Player 2 defeats Fives with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.fives);

                expect(context.fives).toBeInZone('discard');

                // The +2/+2 effect ends because Fives (the source) left play
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should allow Fives to copy Corvus\'s WP and attach a Pilot unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fives#i-have-proof'],
                        groundArena: ['sullustan-spacer'],
                        spaceArena: ['corvus#inferno-squadron-raider'],
                    }
                });

                const { context } = contextRef;

                // Play Fives to copy Corvus's When Played ability
                context.player1.clickCard(context.fives);
                expect(context.player1).toHavePrompt(copyPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.corvus]);
                context.player1.clickCard(context.corvus);

                // Sullustan Spacer (Pilot unit) is the only valid attach target
                expect(context.player1).toHavePrompt('Attach a friendly pilot unit or upgrade to Fives');
                expect(context.player1).toBeAbleToSelectExactly([context.sullustanSpacer]);
                context.player1.clickCard(context.sullustanSpacer);

                // Sullustan Spacer is now attached to Fives as an upgrade
                expect(context.fives).toHaveExactUpgradeNames(['sullustan-spacer']);
                expect(context.sullustanSpacer).toBeInZone('groundArena');

                // Fives gets the stat buff from the pilot's stat modifiers
                expect(context.fives.getPower()).toBe(7); // 6 + 1 = 7
                expect(context.fives.getHp()).toBe(7);   // 6 + 1 = 7
            });

            it('should allow Fives to copy Sidon Ithano\'s WP and attach himself as an upgrade to an enemy Vehicle', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fives#i-have-proof', 'confiscate'],
                        groundArena: ['sidon-ithano#the-crimson-corsair'],
                    },
                    player2: {
                        hand: ['sullustan-spacer'],
                        spaceArena: ['omicron-strike-craft'],
                    }
                });

                const { context } = contextRef;

                // Play Fives to copy Sidon's When Played ability
                context.player1.clickCard(context.fives);
                expect(context.player1).toHavePrompt(copyPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.sidonIthano]);
                context.player1.clickCard(context.sidonIthano);

                // Only the enemy Vehicle in space arena is eligible
                expect(context.player1).toHavePrompt('Attach Fives as an upgrade to an enemy Vehicle unit without a Pilot on it');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft]);
                context.player1.clickCard(context.omicronStrikeCraft);

                // Fives is now attached to the enemy Vehicle as an upgrade
                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['fives#i-have-proof']);

                // Fives contributes no stat modifiers as an upgrade
                expect(context.omicronStrikeCraft.getPower()).toBe(2);
                expect(context.omicronStrikeCraft.getHp()).toBe(3);

                // The opponent can still play a Pilot upgrade on the Vehicle because Fives himself doesn't have the Pilot trait
                context.player2.clickCard(context.sullustanSpacer);
                context.player2.clickPrompt('Play Sullustan Spacer with Piloting');
                context.player2.clickCard(context.omicronStrikeCraft);

                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['fives#i-have-proof', 'sullustan-spacer']);
                expect(context.omicronStrikeCraft.getPower()).toBe(3);
                expect(context.omicronStrikeCraft.getHp()).toBe(4);

                // Fives can be targeted as an upgrade (e.g. by Confiscate)
                context.player1.clickCard(context.confiscate);
                expect(context.player1).toBeAbleToSelectExactly([context.fives, context.sullustanSpacer]);
                context.player1.clickCard(context.fives);

                expect(context.fives).toBeInZone('discard');
                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['sullustan-spacer']);
            });

            it('should allow Fives to copy Pantoran Starship Thief\'s WP and attach himself as an upgrade to an enemy Fighter/Transport and take control of it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fives#i-have-proof'],
                        groundArena: ['pantoran-starship-thief'],
                    },
                    player2: {
                        hand: ['confiscate'],
                        spaceArena: ['desperado-freighter']
                    }
                });

                const { context } = contextRef;

                // Play Fives to copy Pantoran Starship Thief's When Played ability
                context.player1.clickCard(context.fives);
                expect(context.player1).toHavePrompt(copyPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.pantoranStarshipThief]);
                context.player1.clickCard(context.pantoranStarshipThief);

                // Ability triggers to allow Fives to attach to the enemy Desperado Freighter and take control of it
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources to attach Fives as an upgrade to a Fighter or Transport unit without a Pilot on it. Take control of that unit');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.desperadoFreighter]);
                context.player1.clickCard(context.desperadoFreighter);

                // Fives is now attached to the enemy unit as an upgrade, and player 1 has control of it
                expect(context.desperadoFreighter).toHaveExactUpgradeNames(['fives#i-have-proof']);
                expect(context.desperadoFreighter).toBeInZone('spaceArena', context.player1);

                // Fives contributes no stat modifiers as an upgrade
                expect(context.desperadoFreighter.getPower()).toBe(5);
                expect(context.desperadoFreighter.getHp()).toBe(6);

                // Opponent defeats Fives, but they do not regain control of the Transport because Fives did not
                // gain the Pantoran's other triggered ability to return control
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.fives);

                // Fives is defated; Player 1 keeps control of the Desperado Freighter
                expect(context.fives).toBeInZone('discard');
                expect(context.desperadoFreighter).toHaveExactUpgradeNames([]);
                expect(context.desperadoFreighter).toBeInZone('spaceArena', context.player1);
            });
        });
    });
});

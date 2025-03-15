describe('Grand Admiral Thrawn, How Unfortunate', function() {
    integration(function(contextRef) {
        describe('Grand Admiral Thrawn, How Unfortunate\'s undeployed ability', function() {
            it('should do nothing when an enemy When Defeated is used', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        hand: ['rivals-fall']
                    },
                    player2: {
                        spaceArena: ['ruthless-raider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.ruthlessRaider);
                expect(context.p1Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow a When Defeated ability to be used a second time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ruthlessRaider);

                // Ruthless Raider resolves, prompting Thrawn
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.grandAdmiralThrawn.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player1).toBeActivePlayer();
            });

            it('should resolve at the same time as abilities triggered during the resolution of the triggering When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        spaceArena: ['rhokai-gunship']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ruthlessRaider);

                // Ruthless Raider resolves, prompting Thrawn
                expect(context.player1).toBeAbleToSelectExactly([context.rhokaiGunship]);
                context.player1.clickCard(context.rhokaiGunship);
                expect(context.p2Base.damage).toBe(2);

                // P2 uses their Rhokai Gunship first
                expect(context.player2).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player2.clickPrompt('You');
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.p2Base.damage).toBe(4);

                expect(context.player1).toBeActivePlayer();
            });

            it('should resolve at the same time as abilities triggered during the resolution of the triggering When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        spaceArena: ['rhokai-gunship']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ruthlessRaider);

                // Ruthless Raider resolves, prompting Thrawn
                expect(context.player1).toBeAbleToSelectExactly([context.rhokaiGunship]);
                context.player1.clickCard(context.rhokaiGunship);
                expect(context.p2Base.damage).toBe(2);

                // P2 uses their Rhokai Gunship first
                expect(context.player2).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player2.clickPrompt('You');
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.p2Base.damage).toBe(4);

                expect(context.player1).toBeActivePlayer();
            });

            // TODO: Should this behave the same as the Chimaera test?
            it('should not be able to activate a When Defeated that would not change game state', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['hevy#staunch-martyr']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['battle-droid']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.hevy);
                expect(context.battleDroid).toBeInZone('outsideTheGame');

                expect(context.player1).toBeActivePlayer();
            });

            it('should work with a When Defeated ability gained from an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: [{ card: 'wampa', upgrades: ['droid-cohort'] }]
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.findCardsByName('battle-droid').length).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1.findCardsByName('battle-droid').length).toBe(2);
            });

            it('should work with a When Defeated ability gained from another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['general-krell#heartless-tactician', 'battlefield-marine'],
                        deck: ['wampa', 'moisture-farmer']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Trigger');
                expect(context.wampa).toBeInZone('hand');

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.moistureFarmer).toBeInZone('hand');
            });

            it('should work with a When Defeated ability gained from an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        hand: ['in-defense-of-kamino'],
                        spaceArena: ['padawan-starfighter']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inDefenseOfKamino);
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.padawanStarfighter);

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(2);
            });

            it('should give the option to use each When Defeated as they are resolved', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: [{ card: 'rhokai-gunship', upgrades: ['droid-cohort'] }]
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.rhokaiGunship);

                // Choose between the two abilities
                expect(context.player1).toHaveExactPromptButtons(['Deal 1 damage to a unit or base', 'Create a Battle Droid token.']);
                context.player1.clickPrompt('Create a Battle Droid token.');
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);

                // Now, we should be prompted to use the ability again
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');

                // Use the other When Defeated - will then prompt Thrawn
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, battleDroid[0]]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toBeActivePlayer();
            });

            it('should interact correctly with Superlaser Technician', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                const readyResources = context.player1.readyResourceCount;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.superlaserTechnician);
                context.player1.clickPrompt('Trigger');

                expect(context.superlaserTechnician).toBeInZone('resource');
                expect(context.superlaserTechnician.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(readyResources + 1);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.superlaserTechnician).toBeInZone('resource');
                expect(context.superlaserTechnician.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(readyResources + 1);
            });

            // TODO: This test is failing on the last line, as the Lackeys are being registered for the repeat effect as they were before the defeat (i.e. readied) - need to talk to Veld
            it('should interact correctly with Enterprising Lackeys', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['enterprising-lackeys'],
                        resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.enterprisingLackeys);

                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);
                context.player1.clickCard(context.devotion);
                expect(context.devotion).toBeInZone('discard');
                expect(context.enterprisingLackeys).toBeInZone('resource');
                expect(context.enterprisingLackeys.exhausted).toBe(true);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.enterprisingLackeys, context.restoredArc170]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.enterprisingLackeys).toBeInZone('resource');
                expect(context.enterprisingLackeys.exhausted).toBe(true);
            });

            it('should interact correctly with Shuttle ST-149', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['shuttle-st149#under-krennics-authority']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['experience', 'shield'] }],
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.shuttleSt149);

                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.experience]);
                context.player1.clickCard(context.shield);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.shield).toBeAttachedTo(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.experience]);
                context.player1.clickCard(context.experience);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.experience).toBeAttachedTo(context.battlefieldMarine);
                expect(context.player1).toBeActivePlayer();
            });

            // TODO: This is finding an undefined Raddus for the second trigger
            it('should interact correctly with a When Defeated referencing the stats of the selected unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: [{ card: 'raddus#holdos-final-command', upgrades: ['experience'] }]
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: [{ card: 'krayt-dragon', upgrades: ['imprisoned'] }],
                        spaceArena: ['annihilator#tagges-flagship']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.raddusHoldosFinalCommand);

                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon, context.annihilator]);
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon.damage).toBe(9);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon, context.annihilator]);
                context.player1.clickCard(context.annihilator);
                expect(context.annihilator.damage).toBe(9);
            });

            it('should interact correctly with a When Defeated that makes the opponent do something', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        spaceArena: ['zygerrian-starhopper']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.zygerrianStarhopper);

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                expect(context.player2).not.toHaveChooseNoTargetButton();
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                    [context.p2Base, 1]
                ]));

                expect(context.wampa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                expect(context.player2).not.toHaveChooseNoTargetButton();
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                    [context.p2Base, 1]
                ]));

                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toBeActivePlayer();
            });

            // TODO: this one isnt working
            it('should work proerly with a When Defeated on an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: [{ card: 'wampa', upgrades: ['roger-roger'] }, 'battle-droid', 'battle-droid']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                const roger = battleDroids[0];
                const otherRoger = battleDroids[1];

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([roger, otherRoger]);
                context.player1.clickCard(roger);
                expect(context.rogerRoger).toBeAttachedTo(roger);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([roger, otherRoger]);
                context.player1.clickCard(otherRoger);
                expect(context.rogerRoger).toBeAttachedTo(otherRoger);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger a bounty on a unit with a When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: ['val#loyal-to-the-end', 'wampa']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.val);

                // Use your abilities first
                context.player2.clickPrompt('Opponent');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);
                context.player2.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be activated by Chimaera', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['wampa'],
                        spaceArena: ['rhokai-gunship']
                    }
                });

                const { context } = contextRef;

                // Activate Rhokai
                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.rhokaiGunship);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                // Use it again
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.wampa);
                expect(context.grandAdmiralThrawn.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });

        // describe('Grand Admiral Thrawn, How Unfortunate\'s deployed ability', function() {
        //     it('should heal a Vehicle unit', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //                 leader: { card: 'grand-admiral-thrawn#how-unfortunate', deployed: true }
        //             }
        //         });

        //         const { context } = contextRef;

        //         expect(context.player2).toBeActivePlayer();
        //     });
        // });
    });
});
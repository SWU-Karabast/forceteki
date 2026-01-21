describe('Jabba the Hutt, Crime Boss', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side action ability', function() {
            it('pays 1, exhausts, and returns an Underworld unit to hand to create a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                        groundArena: ['crafty-smuggler', 'isb-agent'],
                        spaceArena: ['elite-p38-starfighter', 'stolen-athauler'],
                        discard: ['criminal-muscle']
                    },
                    player2: {
                        groundArena: ['nihil-marauder']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);

                // Choose a friendly Underworld unit to return to hand
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only friendly Underworld units in play are selectable
                    context.craftySmuggler,
                    context.stolenAthauler
                ]);
                context.player1.clickCard(context.craftySmuggler);

                // Verify state after ability resolution
                expect(context.craftySmuggler).toBeInZone('hand', context.player1);
                expect(context.jabbaTheHutt.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player1.credits).toBe(1);
            });

            it('cost can be paid with a stolen Underworld unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                    },
                    player2: {
                        spaceArena: ['mercenary-gunship']
                    }
                });

                const { context } = contextRef;

                // Use Mercenary Gunship's ability to take control of it
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);

                context.player2.passAction();

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryGunship]);
                context.player1.clickCard(context.mercenaryGunship);

                // Verify state after ability resolution
                expect(context.mercenaryGunship).toBeInZone('hand', context.player2); // Returned to its owner's hand
                expect(context.jabbaTheHutt.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(5); // 4 for Mercenary Gunship, 1 for Jabba's ability
                expect(context.player1.credits).toBe(1);
            });

            it('works with units that have gained the Underworld trait', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                        groundArena: [
                            {
                                card: 'outer-rim-constable',
                                upgrades: ['leias-disguise']
                            }
                        ]
                    }
                });

                const { context } = contextRef;

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                expect(context.player1).toBeAbleToSelectExactly([context.outerRimConstable]);
                context.player1.clickCard(context.outerRimConstable);

                // Verify state after ability resolution
                expect(context.outerRimConstable).toBeInZone('hand', context.player1);
                expect(context.jabbaTheHutt.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player1.credits).toBe(1);
            });

            it('cannot be used if there are no friendly Underworld units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                        groundArena: ['isb-agent'],
                        spaceArena: ['elite-p38-starfighter'],
                        discard: ['criminal-muscle']
                    },
                    player2: {
                        groundArena: ['nihil-marauder']
                    }
                });

                const { context } = contextRef;

                // Verify that Jabba's action ability is not available
                expect(context.player1).not.toBeAbleToSelect(context.jabbaTheHutt);
            });

            it('can be canceled at the card targeting step', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                        groundArena: ['crafty-smuggler']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);

                // Cancel at the card targeting step
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                expect(context.player1).toHaveExactPromptButtons(['Cancel']);
                context.player1.clickPrompt('Cancel');

                // Verify state after canceling
                expect(context.craftySmuggler).toBeInZone('groundArena', context.player1);
                expect(context.jabbaTheHutt.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.credits).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('can be paid with a credit token, for a net gain of zero credits', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: 5,
                        credits: 1,
                        groundArena: ['crafty-smuggler']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);

                // Choose a friendly Underworld unit to return to hand
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                context.player1.clickCard(context.craftySmuggler);

                // Pay resource cost with a credit token
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Jabba the Hutt\'s ability');
                expect(context.player1).toHaveExactPromptButtons(['Use 1 Credit', 'Pay costs without Credit tokens']);
                context.player1.clickPrompt('Use 1 Credit');

                // Verify state after ability resolution
                expect(context.craftySmuggler).toBeInZone('hand', context.player1);
                expect(context.jabbaTheHutt.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.credits).toBe(1); // Spent 1 credit, gained 1 credit
            });

            it('can be paid with credit tokens when zero resources are available', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        resources: {
                            exhaustedCount: 5,
                            readyCount: 0
                        },
                        credits: 1,
                        groundArena: ['crafty-smuggler']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's action ability
                context.player1.clickCard(context.jabbaTheHutt);

                // Choose a friendly Underworld unit to return to hand
                expect(context.player1).toHavePrompt('Return a friendly Underworld unit to hand');
                context.player1.clickCard(context.craftySmuggler);

                // Pay resource cost with a credit token
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Jabba the Hutt\'s ability');
                expect(context.player1).toHaveExactPromptButtons(['Use 1 Credit']);
                context.player1.clickPrompt('Use 1 Credit');

                // Verify state after ability resolution
                expect(context.craftySmuggler).toBeInZone('hand', context.player1);
                expect(context.jabbaTheHutt.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(5); // They started exhausted and remain so
                expect(context.player1.credits).toBe(1); // Spent 1 credit, gained 1 credit
            });
        });

        describe('Deployed unit-side action ability', function() {
            it('plays an Underworld unit from hand, granting Ambush if a Credit token was used to pay for it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        credits: 1,
                        hand: ['nihil-marauder', 'isb-agent', 'ma-klounkee']
                    },
                    player2: {
                        groundArena: ['village-protectors']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's unit-side action ability
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toHavePrompt('Choose an ability:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Play an Underworld unit unit from your hand',
                    'Attack',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');

                // Choose an Underworld unit to play from hand
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).not.toHaveChooseNothingButton(); // No Choose Nothing button because action must change game state
                expect(context.player1).toHaveExactPromptButtons(['Cancel']);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only Underworld units in hand are selectable
                    context.nihilMarauder
                ]);
                context.player1.clickCard(context.nihilMarauder);

                // Pay its cost with a credit token
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Nihil Marauder');
                expect(context.player1).toHaveExactPromptButtons(['Use 1 Credit', 'Pay costs without Credit tokens']);
                context.player1.clickPrompt('Use 1 Credit');

                // Resolve Ambush
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.villageProtectors);

                // Verify state after ability resolution
                expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                expect(context.nihilMarauder.exhausted).toBeTrue();
                expect(context.nihilMarauder.damage).toBe(2);
                expect(context.villageProtectors).toBeInZone('discard', context.player2);
                expect(context.player1.credits).toBe(0);
            });

            it('does not grant Ambush if no Credit token was used to pay for it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        hand: ['nihil-marauder', 'isb-agent', 'ma-klounkee']
                    },
                    player2: {
                        groundArena: ['village-protectors']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's unit-side action ability
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');

                // Choose an Underworld unit to play from hand
                context.player1.clickCard(context.nihilMarauder);

                // No credit tokens, so it is played normally and does not gain Ambush
                expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                expect(context.nihilMarauder.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('the unit does not keep Ambush if it is bounced and replayed later that phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        credits: 3,
                        hand: ['nihil-marauder', 'waylay']
                    },
                    player2: {
                        groundArena: ['village-protectors', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's unit-side action ability to play Nihil Marauder with Ambush
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickPrompt('Select amount');
                context.player1.chooseListOption('2');

                // Resolve Ambush
                expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.villageProtectors);
                expect(context.villageProtectors).toBeInZone('discard', context.player2);

                context.player2.passAction();

                // Play Waylay to return Nihil Marauder to hand
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickPrompt('Pay costs without Credit tokens');
                expect(context.nihilMarauder).toBeInZone('hand', context.player1);

                context.player2.passAction();

                // Play Nihil Marauder from hand again
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickPrompt('Use 1 Credit');

                // Verify that it was played without Ambush this time
                expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                expect(context.player1).not.toHavePassAbilityPrompt('Ambush');
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used multiple times in a phase, even if Jabba is exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true, exhausted: true },
                        hand: ['nihil-marauder', 'stolen-athauler'],
                        credits: 2
                    },
                    player2: {
                        groundArena: ['village-protectors'],
                        spaceArena: ['wing-leader']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's unit-side action ability to play Nihil Marauder with Ambush
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickPrompt('Select amount');
                context.player1.chooseListOption('1');

                // Resolve Ambush
                expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.villageProtectors);
                expect(context.villageProtectors).toBeInZone('discard', context.player2);

                context.player2.passAction();

                // Use Jabba's unit-side action ability again to play Stolen Athauler with Ambush
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.stolenAthauler);
                context.player1.clickPrompt('Use 1 Credit');

                // Resolve Ambush
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeInZone('discard', context.player2);
            });

            it('cannot be used if there are no Underworld units in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        hand: ['isb-agent', 'ma-klounkee']
                    }
                });

                const { context } = contextRef;

                // Jabba's only available action is to attack
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);
            });

            it('can be canceled at the unit targeting step', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        hand: ['nihil-marauder']
                    }
                });

                const { context } = contextRef;

                // Use Jabba's unit-side action ability
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');

                // Cancel at the unit targeting step
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toHaveExactPromptButtons(['Cancel']);
                context.player1.clickPrompt('Cancel');

                // Verify state after canceling
                expect(context.nihilMarauder).toBeInZone('hand', context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
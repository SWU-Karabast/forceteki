describe('The Chieftain, Here Since The Oceans Dried', function() {
    integration(function(contextRef) {
        describe('its Raid-granting ability', function() {
            it('should not gain Raid with zero other friendly Tusken units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried']
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // No other friendly Tusken units, so no Raid is granted
                expect(context.p2Base.damage).toBe(2);
            });

            it('should gain Raid 1 with one other friendly Tusken unit in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'the-chieftain#here-since-the-oceans-dried',
                            'stormchaser'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // Raid 1 from stormchaser adds +1 power while attacking: 2 + 1 = 3 damage
                expect(context.p2Base.damage).toBe(3);
            });

            it('should gain Raid 2 with two other friendly Tusken units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'the-chieftain#here-since-the-oceans-dried',
                            'stormchaser',
                            'tusken-tracker'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // Raid 2 from stormchaser and Tusken Tracker adds +2 power while attacking: 2 + 2 = 4 damage
                expect(context.p2Base.damage).toBe(4);
            });

            it('should not count a non-Tusken friendly unit towards its Raid total', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'the-chieftain#here-since-the-oceans-dried',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine is not a Tusken unit, so it does not contribute to Raid
                expect(context.p2Base.damage).toBe(2);
            });

            it('should not count an enemy Tusken unit towards its Raid total', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried']
                    },
                    player2: {
                        groundArena: ['stormchaser']
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // stormchaser belongs to the opponent, so it does not contribute to Raid
                expect(context.p2Base.damage).toBe(2);
            });

            it('should update its Raid total live as other friendly Tusken units enter and leave play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried'],
                        hand: ['stormchaser']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play a second friendly Tusken unit, granting the Chieftain Raid 1
                context.player1.clickCard(context.stormchaser);
                context.player2.passAction();

                // Attack the base with the Chieftain
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // Defeat the other friendly Tusken unit, removing the Raid bonus
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.stormchaser);
                expect(context.stormchaser).toBeInZone('discard');

                // Attack the base again with the Chieftain in the next action phase
                context.moveToNextActionPhase();
                context.player1.clickCard(context.theChieftain);
                context.player1.clickCard(context.p2Base);

                // Raid bonus no longer applies: only 2 damage dealt this time (3 + 2 = 5 total)
                expect(context.p2Base.damage).toBe(5);
            });
        });

        describe('its defending Tusken bonus ability', function() {
            it('should give a friendly Tusken unit with Raid 1 +1/+0 while defending', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'stormchaser']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack the Chieftain with Consular Security Force
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.theChieftain);

                // Chieftain has Raid 1 (from stormchaser) and gets +1/+0 while defending: 2 + 1 = 3 power
                expect(context.consularSecurityForce.damage).toBe(3);
            });

            it('should give a friendly Tusken unit with Raid 2 +2/+0 while defending', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'tusken-tracker']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack the Tusken Tracker with Consular Security Force
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.tuskenTracker);

                // Tusken Tracker has Raid 2 (printed) and gets +2/+0 while defending: 2 + 2 = 4 power
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.tuskenTracker.damage).toBe(3);
            });

            it('should not give a friendly Tusken unit with no Raid any bonus while defending', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'stormchaser']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack the Stormchaser with Consular Security Force
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.stormchaser);

                // Stormchaser has no Raid, so it defends at its unmodified base power of 3
                expect(context.consularSecurityForce.damage).toBe(3);
            });

            it('should not apply its bonus to a friendly Tusken unit while it is attacking', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'the-chieftain#here-since-the-oceans-dried',
                            'tusken-tracker'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack the base with the Tusken Tracker
                context.player1.clickCard(context.tuskenTracker);
                context.player1.clickCard(context.p2Base);

                // Tusken Tracker's own Raid 2 keyword gives +2/+0 while attacking (2 + 2 = 4 damage to base);
                // the Chieftain's defending-only bonus does not additionally apply here
                expect(context.p2Base.damage).toBe(4);
            });

            it('should give the Chieftain itself a bonus while defending based on its own dynamically-granted Raid', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'stormchaser', 'tusken-tracker']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack the Chieftain with Consular Security Force
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.theChieftain);

                // Chieftain has Raid 2 (from stormchaser and Tusken Tracker) and gets +2/+0 while defending (4 power)
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.theChieftain.damage).toBe(3);
            });

            it('should not give a non-Tusken friendly unit any bonus while defending, regardless of its Raid', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'partisan-insurgent', 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['trench-defender']
                    }
                });

                const { context } = contextRef;

                // Attack the Partisan Insurgent with Trench Defender
                context.player2.clickCard(context.trenchDefender);
                context.player2.clickCard(context.partisanInsurgent);

                // Partisan Insurgent has Raid 2 (from controlling Wampa, an Aggression unit) but is not a Tusken
                // unit, so it defends at its unmodified base power of 1 (proven by Trench Defender only
                // taking 1 damage instead of the 3 it would take if the Raid 2 bonus were incorrectly applied)
                expect(context.trenchDefender.damage).toBe(1);
                expect(context.trenchDefender).toBeInZone('groundArena', context.player2);
            });

            it('should not give an enemy Tusken unit any bonus while defending', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-chieftain#here-since-the-oceans-dried', 'trench-defender']
                    },
                    player2: {
                        groundArena: ['tusken-tracker']
                    }
                });

                const { context } = contextRef;

                // Attack the enemy Tusken Tracker with Trench Defender
                context.player1.clickCard(context.trenchDefender);
                context.player1.clickCard(context.tuskenTracker);

                // Tusken Tracker is an enemy Tusken unit relative to the Chieftain, so it defends at its
                // unmodified base power of 2 despite having Raid 2 (proven by Trench Defender surviving with
                // only 2 damage instead of being defeated by a boosted power of 4)
                expect(context.trenchDefender.damage).toBe(2);
                expect(context.trenchDefender).toBeInZone('groundArena', context.player1);
            });
        });
    });
});

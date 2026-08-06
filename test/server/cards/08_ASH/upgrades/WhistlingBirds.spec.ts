describe('Whistling Birds', function() {
    integration(function(contextRef) {
        describe('its attach restriction', function() {
            it('should only be attachable to non-Vehicle units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['whistling-birds'],
                        groundArena: ['battlefield-marine', 'snowspeeder'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Whistling Birds — Vehicle units are not valid targets
                context.player1.clickCard(context.whistlingBirds);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['whistling-birds']);
            });
        });

        describe('its When Attack Ends ability', function() {
            it('calls out the specific arena in its context title', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['whistling-birds', 'advantage'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks p2Base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat Advantage token',
                    // Ground arena is called out specifically in the title
                    'Deal 2 damage to each unit that opponent controls in the ground arena'
                ]);
                context.player1.clickPrompt('Deal 2 damage to each unit that opponent controls in the ground arena');

                expect(context.wampa.damage).toBe(2);
            });

            it('should deal 2 damage to each enemy unit in the attacker\'s arena when the attached unit attacks a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['whistling-birds'] },
                            'warrior-of-clan-ordo'
                        ]
                    },
                    player2: {
                        groundArena: ['wampa', 'mandalorian-warrior'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (3/3 + 2/2 from Whistling Birds = 5/5) attacks p2Base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Marine dealt 5 combat damage to the base
                expect(context.p2Base.damage).toBe(5);

                // Whistling Birds triggers — each enemy ground unit takes 2 damage
                expect(context.wampa.damage).toBe(2);
                expect(context.mandalorianWarrior.damage).toBe(2);

                // Enemy space unit is unaffected (different arena)
                expect(context.cartelSpacer.damage).toBe(0);

                // Does not damage itself or friendly units
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.warriorOfClanOrdo.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the attached unit attacks an enemy unit and deals no combat damage to the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks SpecForce Soldier — unit combat, no Overwhelm, no base damage
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.specforceSoldier).toBeInZone('discard');

                // Whistling Birds did not trigger — no extra damage to the remaining unit or base
                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger when Overwhelm excess combat damage is dealt to the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Wampa: 4/5 with Overwhelm; with Whistling Birds: 6/7
                        groundArena: [{ card: 'wampa', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'mandalorian-warrior']
                    }
                });

                const { context } = contextRef;

                // Wampa (6 power, Overwhelm) attacks SpecForce Soldier (2 HP)
                // — SpecForce is defeated, 4 excess damage hits p2Base via Overwhelm
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(4);

                // Whistling Birds triggers — remaining enemy ground unit takes 2 damage
                expect(context.mandalorianWarrior.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should consume a shield token on a shielded enemy unit and deal 2 damage to unshielded units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'crafty-smuggler', upgrades: ['shield'] }, 'wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks p2Base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);

                // Whistling Birds' 2 damage is absorbed by Crafty Smuggler's shield — shield consumed, no damage taken
                expect(context.craftySmuggler).toHaveExactUpgradeNames([]);
                expect(context.craftySmuggler.damage).toBe(0);

                // Wampa is unshielded and takes the full 2 damage
                expect(context.wampa.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat enemy units in the arena that have 2 or fewer remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        // SpecForce Soldier has exactly 2 HP — Whistling Birds deals exactly lethal damage
                        groundArena: ['specforce-soldier', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks p2Base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);

                // SpecForce Soldier (2 HP) is defeated by the 2 damage from Whistling Birds
                expect(context.specforceSoldier).toBeInZone('discard');

                // Wampa (5 HP) survives with 2 damage
                expect(context.wampa.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger even when the attached unit is defeated by combat damage in the same attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Wampa: 4/5 with Overwhelm; with Whistling Birds: 6/7
                        groundArena: [{ card: 'wampa', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        // Ravenous Rathtar: 8/5 — defeats Wampa (8 dmg vs 7 HP); Wampa kills Rathtar
                        // and overflows 1 damage to base via Overwhelm
                        groundArena: ['ravenous-rathtar', 'mandalorian-warrior']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.ravenousRathtar);

                expect(context.wampa).toBeInZone('discard');
                expect(context.ravenousRathtar).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(1);
                expect(context.mandalorianWarrior.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when only ability damage (not combat damage) is dealt to the base during the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Cloud-Rider Veteran: 1/4 with "On Attack: Deal 2 damage to a base"; with Whistling Birds: 3/6
                        groundArena: [{ card: 'cloudrider-veteran', upgrades: ['whistling-birds'] }]
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Cloud-Rider Veteran attacks SpecForce Soldier — unit combat, no base combat damage
                context.player1.clickCard(context.cloudriderVeteran);
                context.player1.clickCard(context.specforceSoldier);

                // On Attack: deal 2 ability damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Base took 2 ability damage; SpecForce defeated by combat damage
                expect(context.p2Base.damage).toBe(2);
                expect(context.specforceSoldier).toBeInZone('discard');

                // Whistling Birds did not trigger — base damage was ability damage, not combat damage
                expect(context.wampa.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

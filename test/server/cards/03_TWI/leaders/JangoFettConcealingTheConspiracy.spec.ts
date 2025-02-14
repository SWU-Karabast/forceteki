describe('Jango Fett, Concealing the Conspiracy', function () {
    integration(function(contextRef) {
        describe('Jango Fett\'s undeployed leader ability', function() {
            it('should exhaust an enemy unit when a friendly unit deals damage to it', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'elite-p38-starfighter',
                            'strike-true',
                            'overwhelming-barrage',
                            'sneak-attack',
                            'ruthless-raider',
                            'change-of-heart',
                        ],
                        groundArena: [
                            'crafty-smuggler',
                            'battle-droid',
                            { card: 'isb-agent', upgrades: ['vambrace-flamethrower'] }
                        ],
                        leader: 'jango-fett#concealing-the-conspiracy',
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'mandalorian-warrior',
                            'fleet-lieutenant',
                            'volunteer-soldier',
                            'consular-security-force',
                        ],
                    },
                });

                const { context } = contextRef;

                const reset = () => {
                    context.battlefieldMarine.damage = 0;
                    context.mandalorianWarrior.damage = 0;
                    context.fleetLieutenant.damage = 0;
                    context.volunteerSoldier.damage = 0;
                };

                // CASE 1: Trigger Jango's ability from combat damage

                context.player1.clickCard(context.craftySmuggler);
                context.player1.clickCard(context.mandalorianWarrior);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                context.player1.clickPrompt('Exhaust this leader');

                expect(context.mandalorianWarrior.exhausted).toBeTrue();

                // CASE 2: Trigger Jango's ability from unit card ability

                context.moveToNextActionPhase();
                reset();

                context.player1.clickCard(context.eliteP38Starfighter);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                context.player1.clickPrompt('Exhaust this leader');

                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // CASE 3: Trigger Jango's ability from event card ability (direct damage)

                context.moveToNextActionPhase();
                reset();

                context.player1.clickCard(context.strikeTrue);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.fleetLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                context.player1.clickPrompt('Exhaust this leader');

                expect(context.fleetLieutenant.exhausted).toBeTrue();

                // CASE 4: Trigger Jango's ability from event card ability (distributed damage)

                context.moveToNextActionPhase();
                reset();

                // Play Overwhelming Barrage, dealing 1 damage each to
                //   Fleet Lieutenant, Volunteer Soldier, and Battlefield Marine
                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.battleDroid);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 1],
                    [context.fleetLieutenant, 1],
                    [context.volunteerSoldier, 1]
                ]));

                // Choose resolution order
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Exhaust this leader',
                    'Exhaust this leader',
                    'Exhaust this leader'
                ]);

                // Pass for Volunteer Soldier
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');
                expect(context.jangoFett.exhausted).toBeFalse();

                // Resolve for Fleet Lieutenant
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.fleetLieutenant.exhausted).toBeTrue();
                expect(context.jangoFett.exhausted).toBeTrue();

                // CASE 5: Trigger Jango's ability from an upgrade's granted ability

                context.moveToNextActionPhase();
                reset();

                // Attack and distribute damage with Vambrace Flamethrower

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.volunteerSoldier);
                context.player1.clickPrompt('Deal 3 damage divided as you choose among enemy ground units');
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 2],
                    [context.fleetLieutenant, 1],
                ]));

                // Choose resolution order
                // TODO: Determine which trigger corresponds to which damaged unit: https://github.com/SWU-Karabast/forceteki/issues/540
                context.player1.clickPrompt('Exhaust this leader');

                // Pass for Fleet Lieutenant
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');

                // Resolve for Battlefield Marine
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // CASE 6: Trigger Jango's ability when a unit is defeated at the end of the phase

                context.moveToNextActionPhase();
                reset();

                // Play Sneak Attack to bring out Ruthless Raider for the phase
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.ruthlessRaider);

                // Deal "When Played" damage to Battlefield Marine and decline Jango's ability
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');

                // End the phase
                context.player2.passAction();
                context.player1.claimInitiative();

                // Resolve Ruthless Raider's "When Defeated" ability
                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                // Use Jango's ability to exhaust Mandalorian Warrior
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.mandalorianWarrior.exhausted).toBeTrue();

                // CASE 7: Trigger Jango's ability when a stolen unit attacks

                context.nextPhase();
                reset();

                // Play Change of Heart to steal Mandalorian Warrior
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.mandalorianWarrior);

                context.player2.passAction();

                // Attack with Mandalorian Warrior
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.consularSecurityForce);

                // Use Jango's ability to exhaust Consular Security Force
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.consularSecurityForce.exhausted).toBeTrue();
            });

            it('should not trigger for specific scenarios', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'open-fire',
                            'vaders-lightsaber',
                            'sneak-attack',
                            'ruthless-raider'
                        ],
                        groundArena: [
                            'grogu#irresistible',
                            'darth-vader#commanding-the-first-legion',
                            'doctor-pershing#experimenting-with-life',
                        ],
                        leader: 'jango-fett#concealing-the-conspiracy',
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                            'atst',
                            'liberated-slaves',
                            'battlefield-marine'
                        ],
                    },
                });

                const { context } = contextRef;

                // CASE 8: Damage dealt by an event does not trigger Jango's ability

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.atst);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.atst.damage).toBe(4);

                // CASE 9: Damage dealt by an upgrade does not trigger Jango's ability

                context.moveToNextActionPhase();

                context.player1.clickCard(context.vadersLightsaber);
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.liberatedSlaves);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.liberatedSlaves.damage).toBe(4);

                // CASE 10: Attacks that deal 0 damage do not trigger Jango's ability

                context.moveToNextActionPhase();

                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.consularSecurityForce.damage).toBe(0);

                // CASE 11: Jango should still be exhausted and unable to trigger his ability when the phase ends

                context.moveToNextActionPhase();

                // Play Sneak Attack to bring out Ruthless Raider for the phase
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.ruthlessRaider);

                // Use Jango's ability to exhaust Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.jangoFett.exhausted).toBeTrue();

                // End the phase
                context.player2.passAction();
                context.player1.claimInitiative();

                // Deal Ruthless Raider's "When Defeated" damage to Consular Security Force
                context.player1.clickCard(context.consularSecurityForce);

                // Jango is still exhausted and his ability is unavailable
                expect(context.jangoFett.exhausted).toBeTrue();
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');

                // CASE 12: A friendly unit dealing damage to another friendly unit does not trigger Jango's ability

                context.nextPhase();
                context.grogu.damage = 0;

                // Use Pershing's ability
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');

                // Deal damage to grogu
                context.player1.clickCard(context.grogu);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.jangoFett.exhausted).toBeFalse();
                expect(context.grogu.exhausted).toBeFalse();
                expect(context.grogu.damage).toBe(1);
            });
        });

        describe('Jango Fett\'s deployed leader ability', function() {
            it('should exhaust an enemy unit when a friendly unit deals damage to it', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'elite-p38-starfighter',
                            'overwhelming-barrage',
                            'strike-true',
                            'change-of-heart',
                        ],
                        groundArena: [
                            'crafty-smuggler',
                            'battle-droid',
                            { card: 'isb-agent', upgrades: ['vambrace-flamethrower'] }
                        ],
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true },
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'mandalorian-warrior',
                            'fleet-lieutenant',
                            'volunteer-soldier',
                            'consular-security-force',
                        ],
                    },
                });

                const { context } = contextRef;

                const reset = () => {
                    context.battlefieldMarine.damage = 0;
                    context.mandalorianWarrior.damage = 0;
                    context.fleetLieutenant.damage = 0;
                    context.volunteerSoldier.damage = 0;
                    context.jangoFett.damage = 0;
                };

                // CASE 1: Trigger Jango's ability from combat damage

                context.player1.clickCard(context.craftySmuggler);
                context.player1.clickCard(context.mandalorianWarrior);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');

                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                expect(context.mandalorianWarrior.exhausted).toBeTrue();

                // CASE 2: Trigger Jango's ability from unit card ability

                context.moveToNextActionPhase();
                reset();

                context.player1.clickCard(context.eliteP38Starfighter);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');

                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // CASE 3: Trigger Jango's ability from event card ability (direct damage)

                context.moveToNextActionPhase();
                reset();

                context.player1.clickCard(context.strikeTrue);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.fleetLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                expect(context.fleetLieutenant.exhausted).toBeTrue();

                // CASE 4: Trigger Jango's ability from event card ability (distributed damage)

                context.moveToNextActionPhase();
                reset();

                // Play Overwhelming Barrage, dealing 1 damage each to
                //   Fleet Lieutenant, Volunteer Soldier, and Battlefield Marine
                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.battleDroid);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 1],
                    [context.fleetLieutenant, 1],
                    [context.volunteerSoldier, 1]
                ]));

                // Choose resolution order
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Exhaust the damaged enemy unit',
                    'Exhaust the damaged enemy unit',
                    'Exhaust the damaged enemy unit'
                ]);

                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                // Exhaust Volunteer Soldier
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');
                expect(context.volunteerSoldier.exhausted).toBeTrue();

                // Choose resolution order again
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Exhaust the damaged enemy unit',
                    'Exhaust the damaged enemy unit'
                ]);

                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                // Exhaust Fleet Lieutenant
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');
                expect(context.fleetLieutenant.exhausted).toBeTrue();

                // Exhaust Battlefield Marine
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // CASE 5: Trigger Jango's ability from an upgrade's granted ability

                context.moveToNextActionPhase();
                reset();

                // Attack and distribute damage with Vambrace Flamethrower
                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.volunteerSoldier);
                context.player1.clickPrompt('Deal 3 damage divided as you choose among enemy ground units');
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 2],
                    [context.fleetLieutenant, 1],
                ]));

                // Choose resolution order
                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                // Exhaust Fleet Lieutenant
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                // Exhaust for Battlefield Marine
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                // Exhaust Volunteer Soldier
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');

                expect(context.fleetLieutenant.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.volunteerSoldier.exhausted).toBeTrue();

                // CASE 6: Trigger Jango's ability when a stolen unit attacks

                context.moveToNextActionPhase();
                reset();

                // Play Change of Heart to steal Mandalorian Warrior
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.mandalorianWarrior);

                context.player2.passAction();

                // Attack with Mandalorian Warrior
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.consularSecurityForce);

                // Use Jango's ability to exhaust Consular Security Force
                expect(context.player1).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                context.player1.clickPrompt('Exhaust the damaged enemy unit');
                expect(context.consularSecurityForce.exhausted).toBeTrue();
            });
        });

        describe('Jango Fett\'s deployed leader ability', function() {
            it('should not trigger from damage that is not dealt by a friendly unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'open-fire',
                            'vaders-lightsaber'
                        ],
                        groundArena: [
                            'grogu#irresistible',
                            'darth-vader#commanding-the-first-legion',
                            'doctor-pershing#experimenting-with-life',
                        ],
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true },
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                            'atst',
                            'liberated-slaves'
                        ],
                    },
                });

                const { context } = contextRef;

                // CASE 7: Damage dealt by an event does not trigger Jango's ability

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.atst);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                expect(context.atst.damage).toBe(4);

                // CASE 8: Damage dealt by an upgrade does not trigger Jango's ability

                context.moveToNextActionPhase();

                context.player1.clickCard(context.vadersLightsaber);
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.liberatedSlaves);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                expect(context.liberatedSlaves.damage).toBe(4);

                // CASE 9: Attacks that deal 0 damage do not trigger Jango's ability

                context.moveToNextActionPhase();

                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                expect(context.consularSecurityForce.damage).toBe(0);

                // CASE 10: A friendly unit dealing damage to another friendly unit does not trigger Jango's ability

                context.moveToNextActionPhase();
                context.grogu.damage = 0;

                // Use Pershing's ability
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');

                // Deal damage to grogu
                context.player1.clickCard(context.grogu);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
                expect(context.grogu.exhausted).toBeFalse();
                expect(context.grogu.damage).toBe(1);
            });
        });
    });
});
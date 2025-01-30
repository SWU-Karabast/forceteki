describe('Jango Fett, Concealing the Conspiracy', function () {
    integration(function(contextRef) {
        describe('Jango Fett\'s undeployed leader ability', function() {
            it('should exhaust an enemy unit when a friendly unit deals damage to it', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'elite-p38-starfighter',
                            'strike-true'
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
                            'volunteer-soldier'
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

                // CASE 3: Trigger Jango's ability from event card ability

                context.moveToNextActionPhase();
                reset();

                context.player1.clickCard(context.strikeTrue);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.fleetLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                context.player1.clickPrompt('Exhaust this leader');

                expect(context.fleetLieutenant.exhausted).toBeTrue();

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
                context.player1.clickPrompt('Exhaust this leader');

                // Pass for Fleet Lieutenant
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');

                // Resolve for Battlefield Marine
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });

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
                            'darth-vader#commanding-the-first-legion'
                        ],
                        leader: 'jango-fett#concealing-the-conspiracy',
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

                // CASE 1: Deal damage directly with an event

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.atst);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.atst.damage).toBe(4);

                // CASE 2: Deal damage directly from an upgrade

                context.moveToNextActionPhase();

                context.player1.clickCard(context.vadersLightsaber);
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.liberatedSlaves);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.liberatedSlaves.damage).toBe(4);

                // CASE 3: Attack with a unit that deals 0 damage

                context.moveToNextActionPhase();

                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.consularSecurityForce.damage).toBe(0);
            });
        });
    });
});
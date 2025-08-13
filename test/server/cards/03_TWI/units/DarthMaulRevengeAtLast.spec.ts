describe('Darth Maul, Revenge At Last', function() {
    integration(function(contextRef) {
        it('should not be prompted to select multiple targets when there are no enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
        });

        it('should not be prompted to select multiple targets when there is only one enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            expect(context.darthMaul.damage).toBe(4);
            expect(context.wampa).toBeInZone('discard');
            expect(context.getChatLogs(2)).toContain('player1 attacks Wampa with Darth Maul');
        });

        it('should not be prompted to select multiple targets when there is only one enemy ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-turncoat']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            expect(context.darthMaul.damage).toBe(4);
            expect(context.wampa).toBeInZone('discard');
        });

        it('should not be prompted to select multiple targets when there is only one targetable enemy ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.darthMaul.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('should be able to attack a single unit when multiple can be attacked', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.p2Base]);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
        });

        it('should be able to attack multiple units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.p2Base]);
            context.player1.clickCard(context.moistureFarmer);

            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa]);
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
        });

        it('should be able to attack two of many units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa', 'cantina-braggart', 'guerilla-soldier']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.p2Base, context.cantinaBraggart, context.guerillaSoldier]);
            context.player1.clickCard(context.moistureFarmer);

            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.cantinaBraggart, context.guerillaSoldier]);
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
            expect(context.getChatLogs(3)).toContain('player1 attacks Moisture Farmer and Wampa with Darth Maul');
            expect(context.getChatLogs(3)).toContain('player2\'s Moisture Farmer is defeated by player1 due to having no remaining HP');
            expect(context.getChatLogs(3)).toContain('player2\'s Wampa is defeated by player1 due to having no remaining HP');
        });

        it('should be able to attack two of many units when played with Ambush', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['timely-intervention', 'darth-maul#revenge-at-last']
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa', 'cantina-braggart', 'guerilla-soldier']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Trigger');

            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.cantinaBraggart, context.guerillaSoldier]);
            context.player1.clickCard(context.moistureFarmer);

            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.cantinaBraggart, context.guerillaSoldier]);
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
        });

        it('should simultaneously trigger when defeated abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['battle-droid-escort', 'vanguard-infantry']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.battleDroidEscort);
            context.player1.clickCard(context.vanguardInfantry);
            context.player1.clickDone();

            expect(context.player2).toHaveExactPromptButtons(['Create a Battle Droid token.', 'Give an Experience token to a unit']);
            context.player2.clickPrompt('Create a Battle Droid token.');
            const droids = context.player2.findCardsByName('battle-droid');
            expect(droids.length).toBe(1);
            context.player2.clickCard(droids[0]);
            expect(droids[0].getPower()).toBe(2);
        });

        it('should not be able to select an untargetable enemy unit when using multi-select', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine', 'moisture-farmer'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer, context.p2Base]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.moistureFarmer).toBeInZone('discard');
        });

        it('can only attack one target if there is a single Sentinel', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa', 'pyke-sentinel']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
            context.player1.clickCard(context.pykeSentinel);

            expect(context.darthMaul.damage).toBe(2);
            expect(context.pykeSentinel).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('can attack two targets if there are two Sentinels', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa', 'pyke-sentinel', 'village-protectors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.villageProtectors]);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.villageProtectors]);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.villageProtectors);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.pykeSentinel).toBeInZone('discard');
            expect(context.villageProtectors).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('can attack two targets if there are 3+ Sentinels', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['protector'] }, 'wampa', 'pyke-sentinel', 'village-protectors', 'academy-graduate']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.villageProtectors, context.moistureFarmer, context.academyGraduate]);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.villageProtectors, context.moistureFarmer, context.academyGraduate]);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.villageProtectors);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.pykeSentinel).toBeInZone('discard');
            expect(context.villageProtectors).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('should not be able to attack a unit and a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.p2Base.damage).toBe(5);
        });

        it('an attacker debuff should affect both targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['experience'] }, { card: 'wampa', upgrades: ['electrostaff'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul).toBeInZone('discard');
            expect(context.wampa.damage).toBe(4); // Damage reduced by 1 from electrostaff
            expect(context.moistureFarmer.damage).toBe(4); // Damage reduced by 1 from electrostaff
        });

        it('should take no damage if Maul has a Shield even if both defenders have 1 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['shield'] }],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['experience'] }, 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.shield).not.toBeAttachedTo(context.darthMaul);
        });

        it('should interact correctly with a defender with a shield', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['shield'] }, 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer.damage).toBe(0);
            expect(context.wampa).toBeInZone('discard');
            expect(context.shield).not.toBeAttachedTo(context.moistureFarmer);
        });

        it('should interact correctly with two defenders with a shield', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', upgrades: ['shield'] }, { card: 'wampa', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            context.player2.clickPrompt('Defeat shield to prevent attached unit from taking damage');

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer.damage).toBe(0);
            expect(context.moistureFarmer.upgrades.length).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.wampa.upgrades.length).toBe(0);
        });

        it('should not cause both defenders to have damaged reduced when only one should', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }, 'moisture-farmer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.bobaFett);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(5);
            expect(context.moistureFarmer).toBeInZone('discard'); // If damage were reduced, this would survive
            expect(context.bobaFett.damage).toBe(3); // Damage reduced by 2
        });

        it('should trigger Ruthlessness twice when defeating two units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['ruthlessness'] }],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'cantina-braggart']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.player1).toHaveEnabledPromptButtons(['Deal 2 damage to the defending player’s base: Cantina Braggart', 'Deal 2 damage to the defending player’s base: Moisture Farmer']);
            context.player1.clickPrompt('Deal 2 damage to the defending player’s base: Cantina Braggart');
            expect(context.p2Base.damage).toBe(4);
        });

        it('should get one buff for two damaged targets with Corner the Prey', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['corner-the-prey'],
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['vambrace-flamethrower'] }],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', damage: 1, upgrades: ['resilient', 'resilient', 'resilient', 'resilient', 'resilient'] }, { card: 'cantina-braggart', damage: 1 }],
                }
            });

            const { context } = contextRef;

            expect(context.moistureFarmer.damage).toBe(1);
            context.player1.clickCard(context.cornerThePrey);
            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickCard(context.moistureFarmer);
            expect(context.darthMaul.getPower()).toBe(6);
            context.player1.clickDone();

            // Gain +2 damage for 1 damage on each target
            expect(context.darthMaul.getPower()).toBe(8);

            // Use Vambrace Flamethrower to spread 3 damage, but this shouldn't be added to Maul's power
            context.player1.clickPrompt('Trigger');
            context.player1.setDistributeDamagePromptState(new Map([
                [context.moistureFarmer, 2],
                [context.cantinaBraggart, 1],
            ]));

            // Moisture Farmer should have taken 10 new damage - 2 from the Flamethrower, 8 from the attack
            expect(context.moistureFarmer.damage).toBe(11);
        });

        it('should work properly with a Shoot-First attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shoot-first'],
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa', 'cantina-braggart']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shootFirst);
            context.player1.clickCard(context.darthMaul);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.wampa).toBeInZone('discard');
            expect(context.cantinaBraggart).toBeInZone('discard');
        });

        it('should work properly with a Shoot-First attack where a unit dies in the on-attack step', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shoot-first'],
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['fallen-lightsaber'] }],
                },
                player2: {
                    groundArena: ['wampa', { card: 'cantina-braggart', damage: 2 }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shootFirst);
            context.player1.clickCard(context.darthMaul);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.wampa).toBeInZone('discard');
            expect(context.cantinaBraggart).toBeInZone('discard');
        });

        it('should deal Overwhelm damage from both targets if attacking with Overwhelm', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'maul#a-rival-in-darkness',
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'cantina-braggart'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.maulARivalInDarkness);
            context.player1.clickPrompt('Attack with a unit. It gains Overwhelm for this attack');

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.cantinaBraggart).toBeInZone('discard');

            // Maul should have dealt 1 Overwhelm from Moisture Farmer and 2 Overwhelm from Cantina Braggart
            expect(context.p2Base.damage).toBe(3);
        });

        it('should deal Overwhelm damage from both targets if both died in the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'maul#a-rival-in-darkness',
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['fallen-lightsaber'] }],
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', damage: 3 }, { card: 'cantina-braggart', damage: 2 }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.maulARivalInDarkness);
            context.player1.clickPrompt('Attack with a unit. It gains Overwhelm for this attack');

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.cantinaBraggart).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(16); // 8 from full Overwhelm damage on each target
        });

        it('should work properly with Overwhelm and a Shoot-First attack where a unit dies in the on-attack step', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'maul#a-rival-in-darkness', deployed: true },
                    hand: ['shoot-first'],
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['fallen-lightsaber'] }],
                },
                player2: {
                    groundArena: ['wampa', { card: 'cantina-braggart', damage: 2 }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shootFirst);
            context.player1.clickCard(context.darthMaul);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.cantinaBraggart).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(14); // 5 from Wampa Overwhelm and 9 from Cantina Overwhelm
        });

        it('should work properly with Overwhelm and a Shoot-First attack where both units dies in the on-attack step', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'maul#a-rival-in-darkness', deployed: true },
                    hand: ['shoot-first'],
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['fallen-lightsaber'] }],
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }, { card: 'cantina-braggart', damage: 2 }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shootFirst);
            context.player1.clickCard(context.darthMaul);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(0);
            expect(context.cantinaBraggart).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(18);
        });

        it('works correctly with Clone', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['clone', 'timely-intervention'],
                    groundArena: ['darth-maul#revenge-at-last'],
                    base: 'echo-base',
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Trigger');
            expect(context.clone).toBeCloneOf(context.darthMaul);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa]);

            context.player1.clickCard(context.moistureFarmer);
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa]);

            context.player1.clickCard(context.wampa);
            context.player1.clickDone();
            expect(context.clone.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
        });
    });
});

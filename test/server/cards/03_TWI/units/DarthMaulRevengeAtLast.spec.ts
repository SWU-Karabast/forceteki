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
            context.player1.clickPrompt('Done');

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
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

            expect(context.player1).toBeAbleToSelectNoneOf([context.moistureFarmer, context.wampa]);
            context.player1.clickPrompt('Done');

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
            context.player1.clickPrompt('Done');

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
            context.player1.clickPrompt('Done');

            expect(context.darthMaul.damage).toBe(0);
            expect(context.shield).not.toBeAttachedTo(context.darthMaul);
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
            context.player1.clickPrompt('Done');

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
            context.player1.clickPrompt('Done');

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
    });
});

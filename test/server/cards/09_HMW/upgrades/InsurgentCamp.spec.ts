describe('Insurgent Camp', function() {
    integration(function(contextRef) {
        const abilityPrompt = (cardName: string) => `Defeat this upgrade to ready ${cardName}`;

        it('Insurgent Camp should defeat itself to ready a friendly unit played with 3 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt(abilityPrompt('Battlefield Marine'));
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.insurgentCamp).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt(abilityPrompt('Battlefield Marine'));
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.insurgentCamp).not.toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp should trigger even if the unit is not in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'maul#old-master',
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['tusken-raider'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            // Use Maul's ability to play and immediately defeat Tusken Raider
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.tuskenRaider);

            // Insurgent Camp triggers, but the ready effect does nothing because the unit is not in play
            expect(context.player1).toHavePassAbilityPrompt(abilityPrompt('Tusken Raider'));
            context.player1.clickPrompt('Trigger');

            // Upgrade is defeated, but the rest of the ability fizzles
            expect(context.insurgentCamp).toBeInZone('discard');
            expect(context.tuskenRaider).toBeInZone('discard');
        });

        it('Insurgent Camp should trigger for a unit with greater than 3 printed power if it has 3 or less when it enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['desperado-freighter'], // Printed 5/6
                },
                player2: {
                    groundArena: [
                        'supreme-leader-snoke#shadow-ruler'
                    ]
                }
            });

            const { context } = contextRef;

            // Play Desperado Freighter
            context.player1.clickCard(context.desperadoFreighter);

            // Due to Snoke's passive -2/-2 effect, Desperado Freighter's power is reduced to 3, triggering Insurgent Camp
            expect(context.player1).toHavePassAbilityPrompt(abilityPrompt('Desperado Freighter'));
            context.player1.clickPrompt('Trigger');

            // Upgrade is defeated, and the unit is ready
            expect(context.insurgentCamp).toBeInZone('discard');
            expect(context.desperadoFreighter.exhausted).toBeFalse();
        });

        it('Insurgent Camp should not trigger for a unit with 3 or less printed power if it has greater than 3 power when it enters play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['clone-combat-squadron'], // Printed 3/3
                    spaceArena: [
                        'tie-fighter',
                        'xwing'
                    ]
                }
            });

            const { context } = contextRef;

            // Play Clone Combat Squadron
            context.player1.clickCard(context.cloneCombatSquadron);

            // Because CCS gets +1/+1 for each other friendly space unit, it has 5 power when it enters play, so Insurgent Camp should not trigger
            expect(context.player1).not.toHavePassAbilityPrompt(abilityPrompt('Clone Combat Squadron'));
            expect(context.cloneCombatSquadron.exhausted).toBeTrue();
            expect(context.insurgentCamp).toBeAttachedTo(context.p1Base);
            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp should not offer a defeat if the unit has more than 3 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);

            expect(context.wampa.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp should not offer a defeat if the unit is played by the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: {
                        card: 'origin-tree',
                        upgrades: ['insurgent-camp']
                    },
                    hand: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rebelPathfinder);

            expect(context.rebelPathfinder.exhausted).toBeTrue();
            expect(context.player1).toBeActivePlayer();
        });
    });
});
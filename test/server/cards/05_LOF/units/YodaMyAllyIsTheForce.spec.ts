describe('Yoda, My Ally is the Force', function() {
    integration(function(contextRef) {
        describe('Yoda\'s When Played ability', function() {
            it('should allow using the Force to heal 5 damage from a base and then deal damage to a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['yoda#my-ally-is-the-force'],
                        base: { card: 'echo-base', damage: 7 }
                    },
                    player2: {
                        base: { card: 'capital-city', damage: 5 },
                        spaceArena: [{ card: 'hyperspace-wayfarer' }]
                    }
                });
                const { context } = contextRef;

                // Play Yoda
                context.player1.clickCard(context.yodaMyAllyIsTheForce);

                // Should be prompted to use the Force
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force to heal 5 damage from a base\' or pass');
                context.player1.clickPrompt('Trigger');

                // Should be prompted to choose a base to heal first
                expect(context.player1).toHavePrompt('Heal 5 damage from a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);

                // Choose own base to heal
                context.player1.clickCard(context.p1Base);

                // Check that damage was healed
                expect(context.p1Base.damage).toBe(2);

                // Now that the healing has triggered, Yoda's when you use the Force ability should be triggered
                context.player1.clickCard(context.hyperspaceWayfarer);

                // Check that damage was dealt
                expect(context.hyperspaceWayfarer.damage).toBe(2);
            });

            it('should allow skipping using the Force', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['yoda#my-ally-is-the-force'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
                const { context } = contextRef;

                // Play Yoda
                context.player1.clickCard(context.yodaMyAllyIsTheForce);

                // Should be prompted to use the Force
                expect(context.player1).toHavePrompt('Trigger the ability \'Use the Force to heal 5 damage from a base\' or pass');
                context.player1.clickPrompt('Pass');

                // Check that no healing occurred
                expect(context.p1Base.damage).toBe(5);

                // It is now player2's turn
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Yoda\'s When You Use the Force ability', function() {
            it('should deal damage equal to twice the number of units you control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force', 'battlefield-marine', 'clone-trooper'],
                        spaceArena: ['green-squadron-awing'],
                        hand: ['yodas-lightsaber'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        spaceArena: [{ card: 'hyperspace-wayfarer' }]
                    }
                });
                const { context } = contextRef;

                // Use the Force with a card
                context.player1.clickCard(context.yodasLightsaber);
                context.player1.clickCard(context.yodaMyAllyIsTheForce);

                // Should be prompted to use the Force
                expect(context.player1).toHavePrompt('Trigger the ability \'You may use the Force. If you do, heal 3 damage from a base\' or pass');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Should be prompted for Yoda's ability -- and then can select the wayfarer
                context.player1.clickCard(context.hyperspaceWayfarer);

                // Hyperspace wayfarer should take 8 damage (2 × 4 units controlled)
                expect(context.hyperspaceWayfarer.damage).toBe(8);
            });

            it('should allow skipping the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force', 'battlefield-marine'],
                        hand: ['yodas-lightsaber'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: [{ card: 'sith-trooper', damage: 0 }]
                    }
                });

                const { context } = contextRef;

                // Use the Force with yodas lightsaber
                context.player1.clickCard(context.yodasLightsaber);
                context.player1.clickCard(context.yodaMyAllyIsTheForce);

                // Should be prompted to use the Force
                expect(context.player1).toHavePrompt('Trigger the ability \'You may use the Force. If you do, heal 3 damage from a base\' or pass');
                context.player1.clickPrompt('Trigger');

                // Use the first one to heal the base 3 damage
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Should be prompted for Yoda's ability -- this time cancel
                context.player1.clickPrompt('Pass');

                // Player 1 turn should be over now
                expect(context.player2).toBeActivePlayer();
            });

            it('should still count a unit that we have taken control of', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force', 'battlefield-marine'],
                        hand: ['yodas-lightsaber', 'traitorous'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['sith-trooper'],
                        spaceArena: ['hyperspace-wayfarer']
                    }
                });

                const { context } = contextRef;

                // First use Traitorous to take control of the enemy unit
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.sithTrooper);

                // Verify control was taken
                expect(context.sithTrooper).toBeInZone('groundArena', context.player1);

                context.player2.passAction();

                // Now use the Force with Yoda's lightsaber
                context.player1.clickCard(context.yodasLightsaber);
                context.player1.clickCard(context.yodaMyAllyIsTheForce);

                // Should be prompted to use the Force
                expect(context.player1).toHavePrompt('Trigger the ability \'You may use the Force. If you do, heal 3 damage from a base\' or pass');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Should be prompted for Yoda's ability
                context.player1.clickCard(context.hyperspaceWayfarer);

                // Hyperspace wayfarer should take 6 damage (2 × 3 units controlled including the stolen Sith Trooper)
                expect(context.hyperspaceWayfarer.damage).toBe(6);
            });

            it('should trigger correctly if Yoda is bounced while using the Force', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force', 'battlefield-marine', 'clone-trooper'],
                        hand: ['wampa'],
                        base: { card: 'echo-base', damage: 5 },
                        resources: 5
                    },
                    player2: {
                        spaceArena: [{ card: 'hyperspace-wayfarer' }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.yoda);

                expect(context.yoda).toBeInZone('hand');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.hasTheForce).toBe(false);

                // Deal Yoda damage - should be 6 (2 × 3 units controlled)
                expect(context.player1).toBeAbleToSelectExactly([context.hyperspaceWayfarer, context.battlefieldMarine, context.cloneTrooper, context.wampa]);
                context.player1.clickCard(context.hyperspaceWayfarer);
                expect(context.hyperspaceWayfarer.damage).toBe(6);
            });

            it('should trigger correctly if Yoda is bounced while using the Force and no card is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        groundArena: ['yoda#my-ally-is-the-force', 'battlefield-marine', 'clone-trooper'],
                        base: { card: 'echo-base', damage: 5 },
                        resources: 5
                    },
                    player2: {
                        spaceArena: [{ card: 'hyperspace-wayfarer' }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.yoda);

                expect(context.yoda).toBeInZone('hand');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.hasTheForce).toBe(false);

                // Deal Yoda damage - should be 4 (2 × 2 units controlled)
                expect(context.player1).toBeAbleToSelectExactly([context.hyperspaceWayfarer, context.battlefieldMarine, context.cloneTrooper]);
                context.player1.clickCard(context.hyperspaceWayfarer);
                expect(context.hyperspaceWayfarer.damage).toBe(4);
            });
        });
    });
});

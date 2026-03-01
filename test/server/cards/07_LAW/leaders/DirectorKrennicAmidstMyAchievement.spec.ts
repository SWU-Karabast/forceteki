describe('Director Krennic, Amidst My Achievement', function() {
    integration(function(contextRef) {
        describe('Leader side action ability', function() {
            it('exhausts Krennic and defeats a friendly unit to create a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement',
                        resources: 5, // To avoid deploy prompt
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['wing-leader']
                    }
                });

                const { context } = contextRef;

                // Activate Krennic's ability
                context.player1.clickCard(context.directorKrennic);
                expect(context.player1).toHavePrompt('Defeat a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.deathStarStormtrooper,
                    context.tielnFighter
                ]);

                context.player1.clickCard(context.deathStarStormtrooper);

                // Verify the state
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.directorKrennic.exhausted).toBeTrue();
                expect(context.player1.credits).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be used if there are no friendly units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement',
                        resources: 5 // To avoid deploy prompt
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['wing-leader']
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.directorKrennic);
            });

            it('cannot target friendly pilot upgrades for defeat cost', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement',
                        spaceArena: [{ card: 'tie-advanced', upgrades: ['dagger-squadron-pilot', 'craving-power'] }],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Activate Krennic's ability
                context.player1.clickCard(context.directorKrennic);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Friendly units only, no pilot or standard upgrades
                    context.tieAdvanced
                ]);
                context.player1.clickCard(context.tieAdvanced);

                expect(context.tieAdvanced).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Leader unit side When Deployed ability', function() {
            it('another friendly unit deals damage equal to its power to an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement',
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['wing-leader']
                    }
                });

                const { context } = contextRef;

                // Deploy Krennic
                context.player1.clickCard(context.directorKrennic);
                context.player1.clickPrompt('Deploy Director Krennic');

                // Ability triggers
                expect(context.player1).toHavePrompt('Select a friendly unit');
                expect(context.player1).not.toHavePassAbilityButton(); // Non-optional ability
                expect(context.player1).toBeAbleToSelectExactly([
                    // Krennic himself is not selectable
                    context.deathStarStormtrooper,
                    context.tielnFighter
                ]);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.player1).toHavePrompt('Deal 3 damage to an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.consularSecurityForce,
                    context.wingLeader
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                // Verify the state
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if there are no other friendly units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement'
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['wing-leader']
                    }
                });

                const { context } = contextRef;

                // Deploy Krennic
                context.player1.clickCard(context.directorKrennic);
                context.player1.clickPrompt('Deploy Director Krennic');

                // Ability does not trigger, it is P2's turn
                expect(context.player1).not.toHavePrompt('Select a friendly unit');
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if there are no enemy units in play to target', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#amidst-my-achievement',
                        groundArena: ['death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                // Deploy Krennic
                context.player1.clickCard(context.directorKrennic);
                context.player1.clickPrompt('Deploy Director Krennic');

                // Ability does not trigger, it is P2's turn
                expect(context.player1).not.toHavePrompt('Select a friendly unit');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
describe('Hotshot Maneuver', function() {
    integration(function(contextRef) {
        describe('Hotshot Maneuver\'s ability', function() {
            it('should allow to attack with a friendly unit if the opponent controls no units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['atst'],
                        spaceArena: ['fetts-firespray#feared-silhouette'],
                    },
                    player2: {
                        groundArena: [],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.fettsFirespray);

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                // Trigger On Attack ability
                context.player1.clickPrompt('Deal indirect damage to opponent');

                expect(context.p2Base.damage).toBe(5);
            });

            it('should allow to attack with a unit that has no on attack abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['atst'],
                        spaceArena: ['fetts-firespray#feared-silhouette'],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.atst);

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                expect(context.liberatedSlaves.damage).toBe(0);
                expect(context.p2Base.damage).toBe(6);
            });

            it('should allow to target a unit that cannot attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: [{ card: 'fetts-firespray#feared-silhouette', exhausted: true }],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.fettsFirespray);

                // Trigger damage from Hotshot Maneuver
                expect(context.player1).toHavePrompt('Choose an enemy unit to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves]);
                context.player1.clickCard(context.liberatedSlaves);

                expect(context.liberatedSlaves.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should allow to deal damge to an enemy unit when the friendly unit has one on attack ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['atst'],
                        spaceArena: ['fetts-firespray#feared-silhouette'],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.fettsFirespray);

                // Trigger damage from Hotshot Maneuver
                expect(context.player1).toHavePrompt('Choose an enemy unit to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves]);
                context.player1.clickCard(context.liberatedSlaves);
                expect(context.liberatedSlaves.damage).toBe(2);

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                // Trigger On Attack ability
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 1],
                ]));

                expect(context.p2Base.damage).toBe(5);
            });

            it('should allow to deal damge to two enemy units when the friendly unit has two on attack ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'fetts-firespray#feared-silhouette', upgrades: ['bossk#hunt-by-instinct'] }],
                    },
                    player2: {
                        groundArena: ['liberated-slaves', 'pyke-sentinel'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.fettsFirespray);

                // Trigger damage from Hotshot Maneuver
                expect(context.player1).toHavePrompt('Choose 2 enemy units to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves, context.pykeSentinel]);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                // Trigger On Attack ability
                context.player1.clickPrompt('Deal 1 indirect damage to a player. If you control Boba Fett, deal 2 indirect damage instead');
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 1],
                ]));

                expect(context.liberatedSlaves.damage).toBe(2);
                expect(context.pykeSentinel.damage).toBe(2);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should not deal damage to the same enemy unit more than once', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'fetts-firespray#feared-silhouette', upgrades: ['bossk#hunt-by-instinct'] }],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.fettsFirespray]);
                context.player1.clickCard(context.fettsFirespray);

                // Trigger damage from Hotshot Maneuver
                expect(context.player1).toHavePrompt('Choose an enemy unit to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves]);
                context.player1.clickCard(context.liberatedSlaves);

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                // Trigger On Attack ability
                context.player1.clickPrompt('Deal 1 indirect damage to a player. If you control Boba Fett, deal 2 indirect damage instead');
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 1],
                ]));

                expect(context.liberatedSlaves.damage).toBe(2);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should do no damage if the friednly unit does not meet the conditions to gain their on attack abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: [{ card: 'padme-amidala#pursuing-peace', upgrades: ['jedi-lightsaber'] }],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.padmeAmidala]);
                context.player1.clickCard(context.padmeAmidala);

                // Trigger attack
                context.player1.clickCard(context.p2Base);

                expect(context.liberatedSlaves.damage).toBe(0);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should count gained on attack abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                        groundArena: ['padme-amidala#pursuing-peace', { card: 'aayla-secura#master-of-the-blade', upgrades: ['jedi-lightsaber'] }],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['liberated-slaves', 'crafty-smuggler'],
                        spaceArena: ['fetts-firespray#feared-silhouette'],
                    }
                });

                const { context } = contextRef;

                // Play Hotshot Maneuver
                context.player1.clickCard(context.hotshotManeuver);
                expect(context.player1).toBeAbleToSelectExactly([context.padmeAmidala, context.aaylaSecura, context.cartelSpacer]);
                context.player1.clickCard(context.aaylaSecura);

                // Trigger damage from Hotshot Maneuver
                expect(context.player1).toHavePrompt('Choose 2 enemy units to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.liberatedSlaves, context.craftySmuggler, context.fettsFirespray]);
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickPrompt('Done');

                // Trigger attack
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('(No effect) Give the defender -2/-2 for this phase');

                expect(context.liberatedSlaves.damage).toBe(2);
                expect(context.fettsFirespray.damage).toBe(2);
                expect(context.craftySmuggler.damage).toBe(0);
                expect(context.p2Base.damage).toBe(9);
            });

            it('can be played without a valid target', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hotshot-maneuver'],
                    },
                    player2: {
                        leader: { card: 'grand-admiral-thrawn#how-unfortunate', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hotshotManeuver);
                context.player1.clickPrompt('Play anyway');

                expect(context.hotshotManeuver).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

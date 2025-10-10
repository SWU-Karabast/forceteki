describe('Lando Calrissian, Trust Me', function() {
    integration(function(contextRef) {
        describe('Lando\'s When Played ability', function() {
            const enemyUnitPrompt = 'Choose an enemy unit. It will capture another friendly non-leader unit.';
            const friendlyUnitPrompt = 'Choose a friendly non-leader unit to be captured.';

            it('chooses an enemy unit and another friendly unit, enemy captures friendly unit and base is healed by 6', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'dj#need-a-lift', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me'],
                        spaceArena: ['awing'],
                        groundArena: ['cantina-bouncer']
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        spaceArena: ['tie-bomber'],
                        groundArena: ['oomseries-officer']
                    }
                });

                const { context } = contextRef;

                // P1 plays Lando
                context.player1.clickCard(context.landoCalrissian);

                // Choose enemy unit to do the capturing (should include enemy leader)
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.tieBomber,
                    context.oomseriesOfficer,
                    context.sabineWren // enemy leader should be selectable
                ]);
                context.player1.clickCard(context.tieBomber);

                // Choose other friendly non-leader unit to be captured
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only non-leader non-Lando units
                    context.awing,
                    context.cantinaBouncer
                ]);
                context.player1.clickCard(context.awing);

                // Verify A-Wing is captured by Tie Bomber and base is healed
                expect(context.awing).toBeCapturedBy(context.tieBomber);
                expect(context.tieBomber.capturedUnits.length).toBe(1);
                expect(context.player1.base.damage).toBe(4);
            });

            it('is optional - player can choose to pass', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        spaceArena: ['tie-bomber']
                    }
                });

                const { context } = contextRef;

                // P1 plays Lando
                context.player1.clickCard(context.landoCalrissian);

                // Should have pass button since the ability is optional
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // Nothing should change - no capture, no healing
                expect(context.awing).toBeInZone('spaceArena', context.player1);
                expect(context.tieBomber.capturedUnits.length).toBe(0);
                expect(context.player1.base.damage).toBe(10);

                // Should be P2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('is automatically skipped if there are no enemy units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // P1 plays Lando
                context.player1.clickCard(context.landoCalrissian);

                // Ability should be skipped automatically since no enemy units exist
                expect(context.landoCalrissian).toBeInZone('groundArena', context.player1);
                expect(context.awing).toBeInZone('spaceArena', context.player1);
                expect(context.player1.base.damage).toBe(10); // No healing occurs

                // Should be P2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('is automatically skipped if Lando is the only friendly unit in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me']
                        // No other friendly units
                    },
                    player2: {
                        spaceArena: ['tie-bomber']
                    }
                });

                const { context } = contextRef;

                // P1 plays Lando
                context.player1.clickCard(context.landoCalrissian);

                // Ability should be skipped since there are no other friendly units to capture
                expect(context.landoCalrissian).toBeInZone('groundArena', context.player1);
                expect(context.tieBomber.capturedUnits.length).toBe(0);
                expect(context.player1.base.damage).toBe(10); // No healing occurs

                // Should be P2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('can rescue himself when played via DJ leader ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me'],
                        spaceArena: ['awing'],
                        resources: 6 // Enough to play Lando with DJ's discount
                    },
                    player2: {
                        spaceArena: ['tie-bomber']
                    }
                });

                const { context } = contextRef;

                // P1 uses DJ's ability to play Lando and have A-Wing capture him
                context.player1.clickCard(context.dj);
                context.player1.clickPrompt('Choose a friendly unit to capture a unit you play from your hand');
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.landoCalrissian);

                // Verify Lando is captured by A-Wing after being played
                expect(context.landoCalrissian).toBeCapturedBy(context.awing);
                expect(context.awing.capturedUnits.length).toBe(1);

                // Lando's When Played ability should trigger
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                context.player1.clickCard(context.tieBomber); // Choose enemy unit to capture friendly unit

                // Choose A-Wing to be captured by Tie Bomber (rescuing Lando)
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                // Verify final state: A-Wing is now captured by Tie Bomber, Lando is free in ground arena
                expect(context.awing).toBeCapturedBy(context.tieBomber);
                expect(context.tieBomber.capturedUnits.length).toBe(1);
                expect(context.landoCalrissian).toBeInZone('groundArena', context.player1);
                expect(context.player1.base.damage).toBe(4);
            });

            it('works correctly with capture replacement effects like IG-11', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['lando-calrissian#trust-me'],
                        groundArena: ['ig11#i-cannot-be-captured']
                    },
                    player2: {
                        spaceArena: ['tie-bomber'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Lando
                context.player1.clickCard(context.landoCalrissian);

                // Choose enemy unit to do the capturing
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.tieBomber]);
                context.player1.clickCard(context.tieBomber);

                // Choose other friendly non-leader unit to be captured (IG-11 should be selectable)
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.ig11]);
                context.player1.clickCard(context.ig11);

                // IG-11 is defeated instead of being captured
                expect(context.ig11).toBeInZone('discard', context.player1);
                expect(context.tieBomber.capturedUnits.length).toBe(0);

                // Healing still occured since IG-11's effect replaced the original condition
                expect(context.player1.base.damage).toBe(4);
            });
        });
    });
});
describe('Libertine, Under New Ownership', function() {
    integration(function(contextRef) {
        describe('Libertine\'s constant ability', function() {
            it('gets +1 power for each captured unit it\'s guarding', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dismantle-the-conspiracy'],
                        spaceArena: ['libertine#under-new-ownership'],
                        groundArena: [{
                            card: 'cantina-bouncer',
                            capturedUnits: [
                                'reckless-gunslinger'
                            ]
                        }]
                    },
                    player2: {
                        hand: ['unexpected-escape'],
                        spaceArena: ['tie-bomber'],
                        groundArena: [
                            'oomseries-officer',
                            'death-star-stormtrooper',
                            'first-order-stormtrooper'
                        ],
                    }
                });

                const { context } = contextRef;

                // Sanity check: Libertine is a 3/7 with no captured units
                expect(context.libertine.getPower()).toBe(3);
                expect(context.libertine.getHp()).toBe(7);
                expect(context.libertine.capturedUnits.length).toBe(0);

                // P1 plays Dismantle the Conspiracy to capture 4 units
                context.player1.clickCard(context.dismantleTheConspiracy);
                context.player1.clickCard(context.libertine);
                context.player1.clickCard(context.tieBomber);
                context.player1.clickCard(context.oomseriesOfficer);
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickDone();

                // Libertine should now be a 7/7 with 4 captured units
                expect(context.libertine.getPower()).toBe(7);
                expect(context.libertine.getHp()).toBe(7);
                expect(context.libertine.capturedUnits.length).toBe(4);

                // P2 plays Unexpected Escape to free 1 unit from capture
                context.player2.clickCard(context.unexpectedEscape);
                context.player2.clickCard(context.libertine);
                context.player2.clickCard(context.tieBomber);

                // Libertine should now be a 6/7 with 3 captured units
                expect(context.libertine.getPower()).toBe(6);
                expect(context.libertine.getHp()).toBe(7);
                expect(context.libertine.capturedUnits.length).toBe(3);
            });
        });

        describe('Libertine\'s When Played ability', function() {
            const enemyUnitPrompt = 'Choose an enemy unit. It will capture a friendly non-leader unit.';
            const friendlyUnitPrompt = 'Choose a friendly non-leader unit to be captured.';

            it('chooses an enemy unit and a friendly non-leader unit. The enemy unit captures the friendly unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'dj#need-a-lift', deployed: true },
                        hand: ['libertine#under-new-ownership'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        hand: ['unexpected-escape'],
                        spaceArena: ['tie-bomber', 'ruthless-raider'],
                        groundArena: ['oomseries-officer'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Libertine
                context.player1.clickCard(context.libertine);

                // Choose enemy unit
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Can only target enemy units
                    context.tieBomber,
                    context.ruthlessRaider,
                    context.sabineWren, // including leader units
                    context.oomseriesOfficer
                ]);
                context.player1.clickCard(context.tieBomber);

                // Choose friendly unit
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Can only target friendly non-leader units
                    context.libertine,
                    context.awing
                ]);
                context.player1.clickCard(context.awing);

                // A-Wing should now be captured by Tie Bomber
                expect(context.awing).toBeCapturedBy(context.tieBomber);
                expect(context.tieBomber.capturedUnits.length).toBe(1);
            });

            it('can free itself from capture if it was played via DJ\'s leader ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dj#need-a-lift',
                        resources: 5,
                        hand: ['libertine#under-new-ownership'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        spaceArena: ['tie-bomber']
                    }
                });

                const { context } = contextRef;

                // P1 uses DJ's ability to play Libertine from hand and capture it with A-Wing
                context.player1.clickCard(context.dj);
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.libertine);
                expect(context.libertine).toBeCapturedBy(context.awing);

                // Libertine's When Played ability should trigger
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                context.player1.clickCard(context.tieBomber);
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                context.player1.clickCard(context.awing);

                // A-Wing is now captured by Tie Bomber, rescueing Libertine
                expect(context.awing).toBeCapturedBy(context.tieBomber);
                expect(context.tieBomber.capturedUnits.length).toBe(1);
                expect(context.libertine).toBeInZone('spaceArena', context.player1);
            });

            it('gets captured if it is the only friendly unit in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['libertine#under-new-ownership']
                    },
                    player2: {
                        spaceArena: ['tie-bomber'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Libertine
                context.player1.clickCard(context.libertine);

                // Choose enemy unit
                expect(context.player1).toHavePrompt(enemyUnitPrompt);
                context.player1.clickCard(context.tieBomber);

                // Choose friendly unit (only option is Libertine)
                expect(context.player1).toHavePrompt(friendlyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.libertine]);
                context.player1.clickCard(context.libertine);

                // Libertine should now be captured by Tie Bomber
                expect(context.libertine).toBeCapturedBy(context.tieBomber);
                expect(context.tieBomber.capturedUnits.length).toBe(1);
            });

            it('has no effect if there are no enemy units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['libertine#under-new-ownership'],
                        spaceArena: ['awing'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Libertine
                context.player1.clickCard(context.libertine);

                // Nothing happens, it's now P2's turn
                expect(context.libertine).toBeInZone('spaceArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
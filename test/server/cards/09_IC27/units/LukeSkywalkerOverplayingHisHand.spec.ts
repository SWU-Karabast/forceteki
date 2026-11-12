describe('Luke Skywalker, Overplaying His Hand', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            it('puts an enemy non-leader unit on the bottom of its owner\'s deck and its owner draws 2 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#overplaying-his-hand']
                    },
                    player2: {
                        hand: ['resupply'],
                        deck: ['takedown', 'open-fire', 'survivors-gauntlet', 'regional-sympathizers'],
                        groundArena: ['wampa', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                expect(context.battlefieldMarine).toBeInZone('groundArena');

                // Wampa's owner draws 2 cards — Wampa stays at the bottom of the deck
                expect(context.player2.hand.length).toBe(3);
                expect(context.wampa).toBeInBottomOfDeck(context.player2, 1);
                expect(context.player2).toBeActivePlayer();
            });

            it('puts a stolen unit on the bottom of its owner\'s deck and its owner draws 2 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#overplaying-his-hand'],
                        deck: ['takedown', 'open-fire', 'survivors-gauntlet']
                    },
                    player2: {
                        hand: ['resupply'],

                        // Wampa is controlled by player2 but owned by player1
                        groundArena: [{ card: 'wampa', owner: 'player1' }, 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                // Wampa goes to the bottom of its owner's (player1's) deck and player1 draws 2 cards
                expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing when declined', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#overplaying-his-hand']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot target an enemy leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#overplaying-his-hand']
                    },
                    player2: {
                        leader: { card: 'darth-maul#mechanism-of-menace', deployed: true },
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);

                // Only the non-leader unit can be selected
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('deck');
                expect(context.darthMaul).toBeInZone('groundArena');
            });
        });
    });
});

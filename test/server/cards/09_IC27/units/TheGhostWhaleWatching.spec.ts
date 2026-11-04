describe('The Ghost, Whale Watching', function () {
    integration(function (contextRef) {
        describe('The Ghost, Whale Watching passive ability should let the player draw a card if he has 7 or fewer cards in hand', function () {
            it('should trigger if a friendly unit deals damage to an enemy base', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#whale-watching'],
                    }
                });

                const { context } = contextRef;

                const startingHandSize = context.player1.hand.length;

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                // Player 1 should draw a card since he has fewer than 7 cards in hand
                expect(context.player1.hand.length).toBe(startingHandSize + 1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger if a friendly unit attacks and overwhelms a sentinel', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst'],
                        groundArena: ['outer-rim-garrison'],
                        spaceArena: ['the-ghost#whale-watching'],
                    },
                    player2: {
                        groundArena: ['bith-brute'],
                    }
                });

                const { context } = contextRef;

                const startingHandSize = context.player1.hand.length;

                expect(context.outerRimGarrison).toBeInZone('groundArena');
                context.player1.clickCard(context.outerRimGarrison);
                context.player1.clickCard(context.bithBrute);
                context.player1.clickPrompt('Trigger');

                // Player 1 should draw a card since he has fewer than 7 cards in hand
                expect(context.player1.hand.length).toBe(startingHandSize + 1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('shouldn\'t trigger if a friendly unit deals damage to an enemy unit', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#whale-watching'],
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle'],
                    }
                });

                const { context } = contextRef;

                const startingHandSize = context.player1.hand.length;

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.dinosaurTurtle);

                // Player 1 shouldn't draw a card since he's attacking a unit
                expect(context.player1.hand.length).toBe(startingHandSize);
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('shouldn\'t trigger if an enemy unit deals damage to friendly base', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#whale-watching'],
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                const startingHandSizeP1 = context.player1.hand.length;
                const startingHandSizeP2 = context.player2.hand.length;

                expect(context.dinosaurTurtle).toBeInZone('groundArena');
                context.player2.clickCard(context.dinosaurTurtle);
                context.player2.clickCard(context.p1Base);

                // Player 1 shouldn't draw a card since it the turn of Player 2
                expect(context.player1.hand.length).toBe(startingHandSizeP1);
                expect(context.player2.hand.length).toBe(startingHandSizeP2);
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('shouldn\'t trigger if a enemy unit deals damage to an friendly unit', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#whale-watching'],
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                const startingHandSizeP1 = context.player1.hand.length;
                const startingHandSizeP2 = context.player2.hand.length;

                expect(context.dinosaurTurtle).toBeInZone('groundArena');
                context.player2.clickCard(context.dinosaurTurtle);
                context.player2.clickCard(context.battlefieldMarine);

                // Player 1 shouldn't draw a card since it the turn of Player 2
                expect(context.player1.hand.length).toBe(startingHandSizeP1);
                expect(context.player2.hand.length).toBe(startingHandSizeP2);
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('shouldn\'t trigger if owner has 8 or more cards in his hand', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        hand: ['atst', 'yoda#old-master', 'greedo#slow-on-the-draw', 'dinosaur-turtle', 'tieln-fighter', 'vanquish', 'green-squadron-awing', 'broken-horn#vizagos-pride'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#whale-watching'],
                    }
                });

                const { context } = contextRef;

                const startingHandSize = context.player1.hand.length;

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Player 1 shouldn't draw a card since he has 8 cards in hand
                expect(context.player1.hand.length).toBe(startingHandSize);
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
describe('Rogue One, At Any Cost', function() {
    integration(function(contextRef) {
        describe('Rogue One, At Any Cost\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['rogue-one#at-any-cost', 'contracted-jumpmaster'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        spaceArena: ['tie-advanced'],
                        hasInitiative: true,
                    }
                });
            });

            it('when a friendly unit is defeated, it lets you look at the top 2 cards of the deck and decide whether to put either them on the bottom or top of deck in any order.', function () {
                const { context } = contextRef;
                let preSwapDeck = context.player1.deck.concat();

                // Case 1 on play move the first top card to top and second card to bottom.
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.contractedJumpmaster);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling, context.pykeSentinel]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player1.deck).toEqualArray(preSwapDeck);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');
                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses Rogue One to look at the top 2 cards of their deck and they put any number of them on the bottom of their deck and the rest on top in any order',
                    'player1 chooses to move a card to the top of their deck',
                    'player1 chooses to move a card to the bottom of their deck',
                ]);

                // check board state
                expect(context.player1.deck.length).toBe(5);

                // preswap deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa']
                // expected after deck: ['atst', 'cartel-spacer', 'wampa', 'pyke-sentinel', 'foundling']
                expect(context.player1.deck[0]).toBe(preSwapDeck[1]);
                expect(context.player1.deck[1]).toBe(preSwapDeck[2]);
                expect(context.player1.deck[4]).toBe(preSwapDeck[0]);
                expect(context.player1).toBeActivePlayer();

                // record new state.
                preSwapDeck = context.player1.deck.concat();

                // Case 2 on self defeat move both cards to the top of the deck
                context.player1.clickCard(context.rogueOne);
                context.player1.clickCard(context.tieAdvanced);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.pykeSentinel, context.atst]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player1.deck).toEqualArray(preSwapDeck);
                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');

                // Check board state
                // preswap deck deck: ['pyke-sentinel', 'atst', 'cartel-spacer', 'wampa', 'foundling']
                // expected after deck: ['atst', 'pyke-sentinel', 'cartel-spacer', 'wampa', 'foundling']
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toBe(preSwapDeck[1]);
                expect(context.player1.deck[1]).toBe(preSwapDeck[0]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Rogue One\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rogue-one#at-any-cost'],
                        spaceArena: ['rogue-one#at-any-cost', 'cartel-spacer'],
                        deck: ['foundling'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        hasInitiative: true,
                    }
                });
            });

            it('when friendly unit is defeated, should only show card and put it back on top of deck since the deck size is 1', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.foundling]);
                context.player1.clickDone();
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['rogue-one#at-any-cost']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.rogueOne);
            expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.sabineWren, context.battlefieldMarine]);
            expect(context.player2).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
            context.player2.clickDisplayCardPromptButton(context.sabineWren.uuid, 'top');
            context.player2.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'bottom');

            expect(context.rogueOne).toBeInZone('discard');
            expect(context.rogueOne).toBeInZone('discard', context.player1);

            context.player1.passAction();
        });

        it('should work if a friendly leader unit dies', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['rogue-one#at-any-cost'],
                    leader: { card: 'cal-kestis#i-cant-keep-hiding', deployed: true },
                    deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: [{ card: 'atst', exhausted: true }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.calKestis);
            context.player1.clickCard(context.atst);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.sabineWren, context.battlefieldMarine]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
            context.player1.clickDisplayCardPromptButton(context.sabineWren.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'bottom');
        });

        it('should not trigger off of a pilot being defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'rogue-one#at-any-cost', upgrades: ['clone-pilot'] }],
                    leader: { card: 'cal-kestis#i-cant-keep-hiding', deployed: true },
                    deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay'],
                },
                player2: {
                    hand: ['confiscate'],
                    groundArena: [{ card: 'atst', exhausted: true }],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.confiscate);
            context.player2.clickCard(context.clonePilot);
            expect(context.player1).not.toHaveExactSelectableDisplayPromptCards([context.sabineWren, context.battlefieldMarine]);
            expect(context.player1).not.toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
            expect(context.player1).toBeAbleToSelectExactly([context.rogueOne, context.calKestis]);
        });
    });
});
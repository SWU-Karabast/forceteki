describe('Watchful', function() {
    integration(function(contextRef) {
        describe('Watchful\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['watchful'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-interceptor'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        groundArena: ['imperial-dark-trooper'],
                        deck: ['daring-raid', 'open-fire', 'overwhelming-barrage', 'takedown', 'superlaser-blast']
                    }
                });
            });

            it('Attacking lets you look at the top card of the deck and decide whether to put it on the bottom or top of deck, choosing bottom', function () {
                const { context } = contextRef;

                // Play Watchful
                context.player1.clickCard(context.watchful);

                // All units are valid targets
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // Attack with battlefield marine to trigger Watchful's ability
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Ability Prompt
                expect(context.player1).toHavePrompt('Look at the top card of a deck');
                expect(context.player1).toHaveEnabledPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Your deck');

                // Player sees Foundling, chooses bottom
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

                // Foundling is now on the bottom of the deck
                expect(context.foundling).toBeInBottomOfDeck(context.player1, 1);
                expect(context.player2).toBeActivePlayer();
            });

            it('Attacking lets you look at the top card of the deck and decide whether to put it on the bottom or top of deck choosing top', function () {
                const { context } = contextRef;
                const preSwapDeck = context.player1.deck.concat();

                context.player1.clickCard(context.watchful);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveEnabledPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Your deck');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'top');

                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck).toEqualArray(preSwapDeck); // Deck is unchanged
                expect(context.player2).toBeActivePlayer();
            });

            it('Attacking lets you look at the top card of the opponents deck and decide whether to put it on the bottom or top of deck, choosing top', function () {
                const { context } = contextRef;
                const preSwapDeck = context.player2.deck.concat();

                context.player1.clickCard(context.watchful);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveEnabledPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Opponent\'s deck');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.daringRaid]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.daringRaid.uuid, 'top');

                expect(context.player2.deck.length).toBe(5);
                expect(context.player2.deck).toEqualArray(preSwapDeck); // Deck is unchanged
                expect(context.player2).toBeActivePlayer();
            });

            it('Attacking lets you look at the top card of the opponent deck and decide whether to put it on the bottom or top of deck, choosing bottom', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.watchful);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveEnabledPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Opponent\'s deck');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.daringRaid]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.daringRaid.uuid, 'bottom');

                expect(context.daringRaid).toBeInBottomOfDeck(context.player2, 1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Watchful\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'imperial-dark-trooper', upgrades: ['watchful'] }],
                        deck: [],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        deck: [],
                    }
                });
            });

            it('has no effect when the decks are empty', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.imperialDarkTrooper);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Your deck');

                // No card prompts should be shown since there are no cards in either deck
                expect(context.player1).not.toHavePrompt('Look at the top card of a deck');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
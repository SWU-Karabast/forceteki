describe('Hired Slicer', function() {
    integration(function(contextRef) {
        describe('Hired Slicer\'s On Attack ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hired-slicer', 'wampa'],
                        deck: ['battlefield-marine', 'pyke-sentinel', 'cartel-spacer', 'atst', 'vanquish']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper', 'enfys-nest#marauder'],
                        deck: ['tieln-fighter', 'imperial-interceptor', 'snowspeeder', 'cell-block-guard', 'daring-raid']
                    }
                });
            });

            it('should allow revealing top 2 cards of own deck, exhausting a unit sharing a trait, and putting cards on bottom in random order', function () {
                const { context } = contextRef;

                // Attack with Hired Slicer
                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                // Attack declared, now On Attack ability triggers
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Your deck');

                // Top 2 cards are Battlefield Marine (Trooper) and Pyke Sentinel (Underworld)
                expect(context.getChatLogs(2)).toContain('player1 uses Hired Slicer to reveal Battlefield Marine and Pyke Sentinel');

                // Can exhaust units that share traits with revealed cards
                // Wampa has Creature trait, Death Star Stormtrooper has Trooper, Enfys Nest has Underworld
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.enfysNestMarauder]);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper.exhausted).toBe(true);

                // Check that cards were put on bottom of deck
                expect(context.player1.deck.length).toBe(5);
                const bottomTwoCards = context.player1.deck.slice(-2);
                expect(bottomTwoCards).toContain(context.battlefieldMarine);
                expect(bottomTwoCards).toContain(context.pykeSentinel);
            });

            it('should allow revealing top 2 cards of opponent\'s deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Select one');
                context.player1.clickPrompt('Opponent\'s deck');

                // Top 2 cards are TIE/LN Fighter (Imperial, Vehicle) and Imperial Interceptor (Imperial, Vehicle)
                // Note: Chat log uses lowercase 'ln', not 'LN'
                expect(context.getChatLogs(2)).toContain('player1 uses Hired Slicer to reveal TIE/ln Fighter and Imperial Interceptor');

                // Death Star Stormtrooper has Imperial trait, so it CAN be exhausted!
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper.exhausted).toBe(true);

                // Check that cards were put on bottom of opponent's deck (in random order)
                expect(context.player2.deck.length).toBe(5);
                expect(context.tielnFighter).toBeInBottomOfDeck(context.player2, 2);
                expect(context.imperialInterceptor).toBeInBottomOfDeck(context.player2, 2);
            });

            it('should be optional and do nothing if declined', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No cards revealed, no exhaust, decks unchanged
                expect(context.getChatLogs(2)).not.toContain('reveal');
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toBe(context.battlefieldMarine);
            });

            it('should allow declining to exhaust a unit even if valid targets exist', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Your deck');

                // Can exhaust but choose not to
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.enfysNestMarauder]);
                context.player1.clickPrompt('Pass');

                // No units exhausted
                expect(context.deathStarStormtrooper.exhausted).toBe(false);
                expect(context.enfysNestMarauder.exhausted).toBe(false);

                // Cards NOT moved since we didn't exhaust (then clause only triggers after exhaust)
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toBe(context.battlefieldMarine);
                expect(context.player1.deck[1]).toBe(context.pykeSentinel);
            });

            // TODO: Once engine is updated to validate exact card count for ifYouDo,
            // this test should expect ifYouDo NOT to trigger with only 1 card
            it('should currently trigger ifYouDo even when deck has fewer than 2 cards', function () {
                const { context } = contextRef;

                // Move all but one card from deck to discard
                context.player1.moveCard(context.pykeSentinel, 'discard');
                context.player1.moveCard(context.cartelSpacer, 'discard');
                context.player1.moveCard(context.atst, 'discard');
                context.player1.moveCard(context.vanquish, 'discard');

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Your deck');

                // Only 1 card revealed
                expect(context.getChatLogs(2)).toContain('player1 uses Hired Slicer to reveal Battlefield Marine');

                // Currently, ifYouDo still triggers even with only 1 card
                // Battlefield Marine has Trooper trait
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
                context.player1.clickPrompt('Pass');

                // Card should be moved to bottom of deck
                expect(context.player1.deck.length).toBe(1);
                expect(context.player1.deck[0]).toBe(context.battlefieldMarine);
            });

            // TODO: Once engine is updated, this may also need to be adjusted
            it('should currently trigger ifYouDo even when deck is empty', function () {
                const { context } = contextRef;

                // Clear the deck by moving all cards to discard
                context.player1.moveCard(context.battlefieldMarine, 'discard');
                context.player1.moveCard(context.pykeSentinel, 'discard');
                context.player1.moveCard(context.cartelSpacer, 'discard');
                context.player1.moveCard(context.atst, 'discard');
                context.player1.moveCard(context.vanquish, 'discard');

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Your deck');

                // No cards revealed
                expect(context.getChatLogs(2)).not.toContain('reveal');

                // Currently, ifYouDo still triggers even with 0 cards (no traits to match)
                // But since there are no traits, no units should be valid targets
                expect(context.player1).toHavePrompt('Exhaust a unit that shares a trait with one of those cards');
                context.player1.clickPrompt('Pass');
            });
        });
    });
});
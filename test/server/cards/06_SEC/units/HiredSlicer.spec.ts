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
                context.player1.clickPrompt('Choose nothing');

                expect(context.player1).toHavePrompt('Waiting for opponent to take an action or pass');

                // Check that cards were put on bottom of opponent's deck
                expect(context.player2.deck.length).toBe(5);
                const bottomTwoCards = context.player2.deck.slice(-2);
                expect(bottomTwoCards).toContain(context.tielnFighter);
                expect(bottomTwoCards).toContain(context.imperialInterceptor);
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
                context.player1.clickPrompt('Choose nothing');

                // No units exhausted
                expect(context.deathStarStormtrooper.exhausted).toBe(false);
                expect(context.enfysNestMarauder.exhausted).toBe(false);

                // Cards still put on bottom
                const bottomTwoCards = context.player1.deck.slice(-2);
                expect(bottomTwoCards).toContain(context.battlefieldMarine);
                expect(bottomTwoCards).toContain(context.pykeSentinel);
            });

            it('should work when deck has fewer than 2 cards', function () {
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

                // Can still exhaust unit with shared trait
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper.exhausted).toBe(true);
                expect(context.player1.deck.length).toBe(1);
                expect(context.player1.deck[0]).toBe(context.battlefieldMarine);
            });

            it('should handle empty deck gracefully', function () {
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

                // No cards to reveal or put back, but empty deck still has valid exhaust targets
                expect(context.getChatLogs(2)).not.toContain('reveal');

                // The ability will still prompt for exhaust targets even with no revealed cards
                // so we need to pass on that
                expect(context.player1).toHavePrompt('Exhaust a unit that shares a trait with one of those cards');
                context.player1.clickPrompt('Choose nothing');

                expect(context.player1).toHavePrompt('Waiting for opponent to take an action or pass');
            });

            it('should only allow exhausting units that share a trait with revealed cards', function () {
                const { context } = contextRef;

                // Player 1 deck: Battlefield Marine (Trooper), Pyke Sentinel (Underworld)
                // Wampa has Creature trait, Sundari Peacekeeper has Trooper, Clone Deserter has Trooper

                context.player1.clickCard(context.hiredSlicer);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Your deck');

                // Should be able to select units with shared traits
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.enfysNestMarauder]);
                expect(context.player1).not.toBeAbleToSelect(context.wampa);

                // Clean up by choosing nothing
                context.player1.clickPrompt('Choose nothing');
            });
        });
    });
});
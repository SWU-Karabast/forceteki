describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function(contextRef) {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant'],
                    }
                });
            });

            it('should prompt to choose a Rebel from the top 5 cards, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveDisabledPromptButtons([context.cartelSpacer.title, context.cellBlockGuard.title, context.pykeSentinel.title, context.volunteerSoldier.title]);
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine.title, 'Take nothing']);

                // Choose Battlefield Marine
                context.player1.clickPrompt(context.battlefieldMarine.title);
                expect(context.getChatLogs(2)).toContain('player1 takes Battlefield Marine');
                expect(context.battlefieldMarine).toBeInLocation('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);
                context.player1.clickPrompt('Take nothing');

                // Ensure that cards have moved to bottom of deck
                expect([context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]).toAllBeInBottomOfDeck(context.player1, 5);
            });

            it('should allow selection when deck has less than five cards', function() {
                const { context } = contextRef;

                context.player1.setDeck([context.battlefieldMarine, context.cellBlockGuard, context.cartelSpacer]);
                context.player1.clickCard(context.monMothma);
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.cartelSpacer.title, context.cellBlockGuard.title]);
                context.player1.clickPrompt(context.battlefieldMarine.title);

                // Ensure that cards have moved to bottom of deck
                expect(context.player1.deck.length).toBe(2);
                expect([context.cartelSpacer, context.cellBlockGuard]).toAllBeInBottomOfDeck(context.player1, 2);
            });

            it('when the deck is empty', function() {
                const { context } = contextRef;

                context.player1.setDeck([]);
                expect(context.player1.deck.length).toBe(0);

                // Check results
                context.player1.clickCard(context.monMothma);
                expect(context.monMothma).toBeInLocation('ground arena');
                expect(context.player1.deck.length).toBe(0);

                // Player 2 now active
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'academy-defense-walker', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant']
                    }
                });
            });

            it('no cards matching criteria', function() {
                const { context } = contextRef;

                // No valid targets, all should be disabled
                context.player1.clickCard(context.monMothma);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveDisabledPromptButtons([context.academyDefenseWalker.title, context.cartelSpacer.title, context.cellBlockGuard.title, context.pykeSentinel.title, context.volunteerSoldier.title]);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                // Ensure that cards have moved to bottom of deck
                expect([context.academyDefenseWalker, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]).toAllBeInBottomOfDeck(context.player1, 5);
            });
        });
    });
});

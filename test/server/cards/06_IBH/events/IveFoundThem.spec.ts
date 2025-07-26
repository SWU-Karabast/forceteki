describe('I\'ve Found Them', function() {
    integration(function(contextRef) {
        describe('I\'ve Found Them\'s ability', function() {
            it('should reveal the top 3 cards of the deck, draw a unit, and discard the rest', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ive-found-them'],
                        deck: ['pyke-sentinel', 'wampa', 'battlefield-marine', 'yoda#old-master']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iveFoundThem);

                // Verify cards are revealed
                expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                expect(context.getChatLogs(1)[0]).toContain(context.battlefieldMarine.title);

                context.player1.clickPrompt('Done');

                // Player should be prompted to select a unit
                expect(context.player1).toHavePrompt('Choose a unit to draw');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.pykeSentinel, context.wampa, context.battlefieldMarine],
                });

                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                // Verify the selected unit is drawn and others are discarded
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.pykeSentinel).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            });

            it('should discard all cards if no units are revealed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ive-found-them'],
                        deck: ['aggression', 'a-precarious-predicament', 'its-worse']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iveFoundThem);

                // Verify cards are revealed
                expect(context.getChatLogs(1)[0]).toContain(context.aggression.title);
                expect(context.getChatLogs(1)[0]).toContain(context.aPrecariousPredicament.title);
                expect(context.getChatLogs(1)[0]).toContain(context.itsWorse.title);

                context.player1.clickPrompt('Done');

                // All cards should be discarded since none are units
                expect(context.aggression).toBeInZone('discard', context.player1);
                expect(context.aPrecariousPredicament).toBeInZone('discard', context.player1);
                expect(context.itsWorse).toBeInZone('discard', context.player1);
            });

            it('should work with fewer than 3 cards in deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ive-found-them'],
                        deck: ['pyke-sentinel', 'aggression']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iveFoundThem);

                // Verify cards are revealed
                expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
                expect(context.getChatLogs(1)[0]).toContain(context.aggression.title);

                context.player1.clickPrompt('Done');

                // Player should be prompted to select a unit
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.pykeSentinel],
                    invalid: [context.aggression]
                });

                context.player1.clickCardInDisplayCardPrompt(context.pykeSentinel);

                // Verify the selected unit is drawn and others are discarded
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.aggression).toBeInZone('discard', context.player1);
            });

            it('should work with an empty deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ive-found-them'],
                        deck: []
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iveFoundThem);
                context.player1.clickPrompt('Play anyway');

                // Nothing should happen with an empty deck
                expect(context.player1.handSize).toBe(0);
                expect(context.player1.discard.length).toBe(1); // Just the event card
            });
        });
    });
});
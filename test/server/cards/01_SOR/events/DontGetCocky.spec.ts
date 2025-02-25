describe('Don\'t Get Cocky', function() {
    integration(function(contextRef) {
        describe('Don\'t Get Cocky\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dont-get-cocky'],
                        groundArena: ['pyke-sentinel'],
                        deck: ['alliance-dispatcher', 'medal-ceremony', 'wilderness-fighter', 'consortium-starviper', 'entrenched', 'karabast', 'ruthless-raider', 'swoop-racer']
                        // costs: 1, 0, 3, 3, 2, 2, 6, 3
                    },
                    player2: {
                        groundArena: ['atat-suppressor'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should have the controller first choose any unit, then sequentially reveal cards from the top of their deck, and finally deal damage to the chosen unit equal to the combined cost of the cards revealed if it is 7 or less, while also moving the revealed cards to the bottom of the deck in a random order', function () {
                const { context } = contextRef;

                // reveal 1 card, do 1 damage
                context.player1.clickCard(context.dontGetCocky);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.atatSuppressor,
                    context.tielnFighter]
                );

                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.allianceDispatcher]);
                expect(context.getChatLogs(1)[0]).toContain(context.allianceDispatcher.title);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Current total cost: 1\nSelect one:');
                expect(context.player1).toHaveEnabledPromptButtons(['Reveal another card', 'Stop revealing cards']);

                context.player1.clickPrompt('Stop revealing cards');
                expect(context.atatSuppressor.damage).toBe(1);
                expect([context.allianceDispatcher]).toAllBeInBottomOfDeck(context.player1, 1);
                expect(context.player1Object.getTopCardOfDeck()).toBe(context.medalCeremony);
            });

            it('deals 7 damage if the reveald cards total cost is 7', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.dontGetCocky);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.allianceDispatcher]);
                expect(context.getChatLogs(1)[0]).toContain(context.allianceDispatcher.title);
                context.player1.clickPrompt('Done');

                context.player1.clickPrompt('Reveal another card');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.medalCeremony]);
                expect(context.getChatLogs(1)[0]).toContain(context.medalCeremony.title);
                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Current total cost: 1\nSelect one:');
                expect(context.player1).toHaveEnabledPromptButtons(['Reveal another card', 'Stop revealing cards']);

                context.player1.clickPrompt('Reveal another card');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wildernessFighter]);
                expect(context.getChatLogs(1)[0]).toContain(context.wildernessFighter.title);
                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Current total cost: 4\nSelect one:');
                expect(context.player1).toHaveEnabledPromptButtons(['Reveal another card', 'Stop revealing cards']);

                context.player1.clickPrompt('Reveal another card');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.consortiumStarviper]);
                expect(context.getChatLogs(1)[0]).toContain(context.consortiumStarviper.title);
                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Current total cost: 7\nSelect one:');
                expect(context.player1).toHaveEnabledPromptButtons(['Reveal another card', 'Stop revealing cards']);

                context.player1.clickPrompt('Stop revealing cards');
                expect(context.atatSuppressor.damage).toBe(7);
                expect([context.allianceDispatcher, context.medalCeremony, context.wildernessFighter, context.consortiumStarviper]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.player1Object.getTopCardOfDeck()).toBe(context.entrenched);
            });

            it('deals no damage if the reveald cards total cost exceed 7', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.dontGetCocky);
                context.player1.clickCard(context.atatSuppressor);

                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Current total cost: 9\nSelect one:');
                context.player1.clickPrompt('Stop revealing cards');
                expect(context.atatSuppressor.damage).toBe(0);
                expect([context.allianceDispatcher, context.medalCeremony, context.wildernessFighter, context.consortiumStarviper, context.entrenched]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.player1Object.getTopCardOfDeck()).toBe(context.karabast);
            });

            it('should allow the controller to reveal seven cards, regardless of total cost', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.dontGetCocky);
                context.player1.clickCard(context.atatSuppressor);

                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Current total cost: 11\nSelect one:');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                // 7 cards revealed, no choices left
                expect(context.player2).toBeActivePlayer();
                expect(context.atatSuppressor.damage).toBe(0);
                expect(context.player1Object.getTopCardOfDeck()).toBe(context.swoopRacer);
            });

            it('ends automatically after revealing cards if the controller has revealed all remaining cards in their deck', function() {
                const { context } = contextRef;

                context.player1.setDeck([context.medalCeremony, context.consortiumStarviper, context.entrenched]);

                context.player1.clickCard(context.dontGetCocky);
                context.player1.clickCard(context.atatSuppressor);

                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Reveal another card');
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.atatSuppressor.damage).toBe(5);
                expect([context.medalCeremony, context.consortiumStarviper, context.entrenched]).toAllBeInBottomOfDeck(context.player1, 3);
            });

            it('does nothing if the controller has no cards in their deck', function() {
                const { context } = contextRef;
                context.player1.setDeck([]);

                context.player1.clickCard(context.dontGetCocky);
                context.player1.clickCard(context.atatSuppressor);

                expect(context.player2).toBeActivePlayer();
                expect(context.atatSuppressor.damage).toBe(0);
            });
        });
    });
});

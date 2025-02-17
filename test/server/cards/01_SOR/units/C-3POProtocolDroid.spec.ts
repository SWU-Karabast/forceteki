describe('C-3PO, Protocol Droid', function() {
    integration(function(contextRef) {
        describe('C-3PO\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#protocol-droid'],
                        deck: ['wampa', 'battlefield-marine', 'atst', 'atst'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should prompt to choose a number, allowing the controller to reveal and draw the top card of their deck if its cost matches the number', function () {
                const { context } = contextRef;

                // CASE 1: threepio is played, we guess the number right and draw the card
                context.player1.clickCard(context.c3po);

                // should have prompt options from 0 to 20
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');

                // P1 sees the top card of their deck
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Reveal and Draw', 'Leave on Top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.wampa.title);  // confirm that there is no chat message for the cards

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'reveal-draw');

                // P1 draws the card and it is revealed to P2
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title); // confirm that there is a chat message for the card

                expect(context.wampa).toBeInZone('hand');

                // CASE 2: threepio attacks, we guess the number wrong
                context.c3po.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.c3po);

                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('0');

                // P1 sees the top card of their deck
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);

                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('deck');

                // CASE 3: threepio is played, we guess the number right and leave the card on top
                context.c3po.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.c3po);

                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');

                // P1 sees the top card of their deck
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Reveal and Draw', 'Leave on Top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);

                context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'leave');

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('deck');
            });
        });

        describe('C-3PO\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#protocol-droid'],
                        deck: [],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should do nothing if the player\'s deck is empty', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

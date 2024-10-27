describe('Regroup phase', function() {
    integration(function(contextRef) {
        describe('Regroup phase', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst'],
                        deck: ['foundling', 'atst', 'cartel-spacer', 'atst'],
                        hand: ['moment-of-peace', 'wroshyr-tree-tender'],
                        groundArena: ['ardent-sympathizer', 'baze-malbus#temple-guardian'],
                        spaceArena: ['alliance-xwing'],
                    },
                    player2: {
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst'],
                        deck: ['pyke-sentinel', 'cartel-spacer', 'atst'],
                        hand: ['scout-bike-pursuer'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    }
                });
            });

            it('should let both players choose what to put into resources and trigger any regroup phase abilities.', function () {
                const { context } = contextRef;

                // old hand & deck setup
                const oldHandPlayer1 = [];
                const oldHandPlayer2 = [];
                const oldDeckPlayer1 = [];
                const oldDeckPlayer2 = [];
                context.player1.hand.forEach((val) => oldHandPlayer1.push(val));
                context.player2.hand.forEach((val) => oldHandPlayer2.push(val));
                context.player1.deck.forEach((val) => oldDeckPlayer1.push(val));
                context.player2.deck.forEach((val) => oldDeckPlayer2.push(val));

                // Setup for Case 1
                context.allianceXwing.exhausted = true;
                context.wampa.exhausted = true;
                context.tielnFighter.exhausted = true;

                // Case 1 check if regroup phase flows correctly
                context.player1.passAction();
                context.player2.claimInitiative();

                // Regroup phase is divided into 3 steps draw cards, resource a card and ready cards.
                // Draw cards
                expect(context.player1.hand.length).toBe(4);
                expect(context.player2.hand.length).toBe(3);

                // Combine the old hands to see if the cards are correct in hands
                oldHandPlayer1.push(oldDeckPlayer1[0], oldDeckPlayer1[1]);
                oldHandPlayer2.push(oldDeckPlayer2[0], oldDeckPlayer2[1]);
                expect(context.player1.hand).toEqual(oldHandPlayer1);
                expect(context.player2.hand).toEqual(oldHandPlayer2);

                // exhausted units need to be exhausted until the ready card phase
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.tielnFighter.exhausted).toBe(true);

                // Resource a Card
                // Player 1 Resources a card and Player 2 doesn't
                context.player1.clickAnyOfSelectableCards(1);
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');
                expect(context.player2.hand).toEqual(oldHandPlayer2);

                // ready card phase
                expect(context.allianceXwing.exhausted).toBe(false);
                expect(context.wampa.exhausted).toBe(false);
                expect(context.tielnFighter.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

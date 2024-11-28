describe('Lothal Insurgent', function() {
    integration(function(contextRef) {
        describe('Lothal Insurgent\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lothal-insurgent', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['wampa', 'atst'],
                        deck: ['cartel-spacer']
                    }
                });
            });

            it('causes the opponent to draw a card and randomly discard from hand if another friendly card was played this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.lothalInsurgent);

                expect(context.player2.deck.length).toBe(0);
                expect(context.player2.discard.length).toBe(1);
                expect(context.player2.hand.length).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

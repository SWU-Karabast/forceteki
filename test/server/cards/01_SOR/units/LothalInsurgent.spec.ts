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

                const handAndDiscard = context.player2.hand.concat(context.player2.discard);
                expect(handAndDiscard).toContain(context.wampa);
                expect(handAndDiscard).toContain(context.atst);
                expect(handAndDiscard).toContain(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if another friendly card was not played this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lothalInsurgent);

                expect(context.player2.deck.length).toBe(1);
                expect(context.player2.discard.length).toBe(0);
                expect(context.player2.hand.length).toBe(2);

                expect(context.wampa).toBeInZone('hand');
                expect(context.atst).toBeInZone('hand');
                expect(context.cartelSpacer).toBeInZone('deck');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Lothal Insurgent\'s ability causes the opponent to draw and discard the drawn card if another friendly card was played this phase and the opponent\'s hand is empty', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['lothal-insurgent', 'battlefield-marine'],
                },
                player2: {
                    deck: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player2.passAction();
            context.player1.clickCard(context.lothalInsurgent);

            expect(context.player2.deck.length).toBe(0);
            expect(context.player2.discard.length).toBe(1);
            expect(context.player2.hand.length).toBe(0);

            expect(context.atst).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
